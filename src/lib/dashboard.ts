import type { DashboardDataset } from "@/domain/types";
import { round } from "@/lib/deterministic";

export function getDashboardSummary(data: DashboardDataset) {
  const latestMetrics = data.posts.map((post) => ({ post, metric: post.metrics.at(-1)! }));
  const totalImpressions = latestMetrics.reduce((sum, item) => sum + item.metric.impressions, 0);
  const totalReach = latestMetrics.reduce((sum, item) => sum + item.metric.reach, 0);
  const totalEngagement = data.reactions.length + data.comments.length +
    data.posts.reduce((sum, post) => sum + post.publicReposts, 0);
  const scoreByPerson = new Map(data.icpScores.map((score) => [score.personId, score]));
  const personById = new Map(data.people.map((person) => [person.id, person]));
  const companyById = new Map(data.companies.map((company) => [company.id, company]));
  const engagedPersonIds = new Set([
    ...data.reactions.map((reaction) => reaction.personId),
    ...data.comments.map((comment) => comment.personId),
  ]);
  const qualifiedPersonIds = new Set(
    [...engagedPersonIds].filter((personId) => (scoreByPerson.get(personId)?.score ?? 0) >= 55),
  );
  const targetCompanyIds = new Set(
    [...engagedPersonIds]
      .map((personId) => personById.get(personId)?.companyId)
      .filter((companyId): companyId is string => Boolean(companyId))
      .filter((companyId) => companyById.get(companyId)?.targetAccount),
  );
  const seededCompanyIds = new Set(data.ideaSeeds.map((seed) => seed.companyId));
  const influencedOpportunityIds = new Set(data.attribution.map((link) => link.opportunityId));
  const influencedPipeline = data.opportunities
    .filter((opportunity) => influencedOpportunityIds.has(opportunity.id))
    .reduce((sum, opportunity) => sum + opportunity.amount, 0);

  return {
    totalImpressions,
    totalReach,
    totalEngagement,
    engagementRate: round((totalEngagement / totalImpressions) * 100, 2),
    engagedPeople: engagedPersonIds.size,
    qualifiedPeople: qualifiedPersonIds.size,
    qualifiedShare: round((qualifiedPersonIds.size / Math.max(1, engagedPersonIds.size)) * 100),
    targetAccounts: targetCompanyIds.size,
    seededAccounts: seededCompanyIds.size,
    influencedOpportunities: influencedOpportunityIds.size,
    influencedPipeline,
  };
}

export function aggregatePerformance(
  data: DashboardDataset,
  key: "topic" | "format" | "hookType",
) {
  const groups = new Map<string, { impressions: number; engagements: number; posts: number }>();
  for (const post of data.posts) {
    const label =
      key === "topic"
        ? post.analysis.topic
        : key === "format"
          ? post.analysis.format
          : post.analysis.hookType;
    const metric = post.metrics.at(-1)!;
    const group = groups.get(label) ?? { impressions: 0, engagements: 0, posts: 0 };
    group.impressions += metric.impressions;
    group.engagements += post.publicReactions + post.publicComments + post.publicReposts;
    group.posts += 1;
    groups.set(label, group);
  }

  return [...groups.entries()]
    .map(([label, value]) => ({
      label,
      ...value,
      engagementRate: round((value.engagements / value.impressions) * 100, 2),
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate);
}

export function getDailySeries(data: DashboardDataset) {
  return [...data.posts]
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    .map((post) => ({
      date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(post.publishedAt),
      ),
      impressions: post.metrics.at(-1)!.impressions,
      icp: data.reactions
        .filter((reaction) => reaction.postId === post.id)
        .reduce(
          (sum, reaction) =>
            sum + ((data.icpScores.find((score) => score.personId === reaction.personId)?.score ?? 0) >= 55 ? 1 : 0),
          0,
        ),
    }));
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
