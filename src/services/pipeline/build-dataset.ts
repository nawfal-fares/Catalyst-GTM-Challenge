import type {
  CanonicalPost,
  DashboardDataset,
  Person,
  RawApifyRecord,
} from "@/domain/types";
import { uniqueBy } from "@/lib/deterministic";
import { SeededZernioAdapter } from "@/services/analytics/zernio";
import { DeterministicContentAnalyzer } from "@/services/analysis/content-analyzer";
import { buildAttribution, SeededCrmConnector } from "@/services/crm/connectors";
import { SeededApolloResolver } from "@/services/enrichment/apollo-resolver";
import { importApifyRecords } from "@/services/ingestion/apify-importer";
import { buildCommentOpportunities, enrichComments } from "@/services/intelligence/comments";
import { buildIdeaSeeds } from "@/services/intelligence/idea-seeding";
import { buildRecommendations } from "@/services/intelligence/recommendations";
import { IcpScoringService } from "@/services/scoring/icp-engine";

const GENERATED_AT = "2026-06-21T13:00:00.000Z";

function classifyPost(post: CanonicalPost): Pick<CanonicalPost, "status" | "velocityLabel"> {
  const latest = post.metrics.at(-1)!;
  const previous = post.metrics.at(-2)!;
  const growth = (latest.impressions - previous.impressions) / Math.max(previous.impressions, 1);
  const ageDays =
    (new Date(GENERATED_AT).getTime() - new Date(post.publishedAt).getTime()) / 86_400_000;
  if (post.publicComments >= 18 && latest.engagementRate >= 1.55) {
    return { status: "taking-off", velocityLabel: `+${Math.round(growth * 100)}% since prior snapshot` };
  }
  if (latest.engagementRate < 1.75 || (ageDays > 9 && post.publicComments < 5)) {
    return { status: "slowing", velocityLabel: `${Math.round(growth * 100)}% late-stage growth` };
  }
  return { status: "steady", velocityLabel: `${Math.round(growth * 100)}% sustained growth` };
}

export async function buildDashboardDataset(records: RawApifyRecord[]): Promise<DashboardDataset> {
  const imported = importApifyRecords(records);
  const analyzer = new DeterministicContentAnalyzer();
  const analytics = new SeededZernioAdapter();
  const apollo = new SeededApolloResolver();
  const scoring = new IcpScoringService();

  const enriched = await Promise.all(
    imported.people.map((person) =>
      apollo.resolve({
        linkedinId: person.linkedinId,
        linkedinUrl: person.linkedinUrl,
        name: person.name,
        headline: person.headline,
      }),
    ),
  );

  const companies = uniqueBy(
    enriched.flatMap((result) => (result.company ? [result.company] : [])),
    (company) => company.id,
  );
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const people: Person[] = enriched.map((result) => ({ ...result.person, sourceMode: "seeded" }));
  const icpScores = people.map((person) =>
    scoring.score(person, person.companyId ? companyById.get(person.companyId) ?? null : null),
  );
  const comments = enrichComments(imported.comments);

  const posts: CanonicalPost[] = await Promise.all(
    imported.posts.map(async (post) => {
      const analysis = await analyzer.analyze(post.content, post.mediaCount);
      const metrics = await analytics.snapshotsFor({
        postId: post.id,
        linkedinUrl: post.linkedinUrl,
        publishedAt: post.publishedAt,
        reactions: post.publicReactions,
        comments: post.publicComments,
        reposts: post.publicReposts,
      });
      const provisional: CanonicalPost = {
        ...post,
        analysis,
        metrics,
        status: "steady",
        velocityLabel: "",
      };
      return { ...provisional, ...classifyPost(provisional) };
    }),
  );

  const engagementPostIdsByPerson = new Map<string, Set<string>>();
  for (const event of [...imported.reactions, ...comments]) {
    const current = engagementPostIdsByPerson.get(event.personId) ?? new Set<string>();
    current.add(event.postId);
    engagementPostIdsByPerson.set(event.personId, current);
  }

  const opportunities = await new SeededCrmConnector("HubSpot").listOpportunities(companies);
  const attribution = buildAttribution(
    opportunities,
    posts,
    people,
    icpScores,
    engagementPostIdsByPerson,
  );
  const ideaSeeds = buildIdeaSeeds(
    posts,
    people,
    companies,
    imported.reactions,
    comments,
  );
  const recommendations = buildRecommendations(
    posts,
    imported.reactions,
    comments,
    icpScores,
    attribution,
  );
  const commentOpportunities = buildCommentOpportunities(
    comments,
    people,
    companies,
    icpScores,
  );

  return {
    generatedAt: GENERATED_AT,
    client: {
      name: "Catalyst",
      contentAccount: "Will Leatherman",
      attributionDisclaimer:
        "Pipeline figures are seeded for this technical demo. Engagement identity is observed from Apify; reach, enrichment, CRM opportunities, and attribution are modeled and labeled.",
    },
    ingestion: {
      rawRecords: imported.rawCount,
      posts: posts.length,
      reactions: imported.reactions.length,
      comments: comments.length,
      people: people.length,
      companies: companies.length,
      duplicateRecordsMerged: imported.duplicateRecordsMerged,
      mode: "demo",
    },
    posts: posts.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    ),
    people,
    companies,
    reactions: imported.reactions,
    comments,
    icpScores,
    ideaSeeds,
    opportunities,
    attribution,
    recommendations,
    commentOpportunities,
  };
}
