import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DashboardDataset } from "@/domain/types";

function chunks<T>(items: T[], size = 500): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}

async function upsertChunks(
  client: SupabaseClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) {
  for (const batch of chunks(rows)) {
    if (!batch.length) continue;
    const { error } = await client.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
  }
}

/**
 * Service-role persistence adapter. Public pages never receive this key.
 * The demo does not call it because only publishable Supabase credentials were
 * supplied; with a service role key, cron uses idempotent natural-key upserts.
 */
export class SupabaseWarehouse {
  private readonly client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async persist(data: DashboardDataset) {
    const { data: clientRow, error: clientError } = await this.client
      .from("clients")
      .upsert({ name: data.client.name, slug: "catalyst" }, { onConflict: "slug" })
      .select("id")
      .single();
    if (clientError) throw clientError;
    const clientId = clientRow.id as string;

    const { data: accountRow, error: accountError } = await this.client
      .from("content_accounts")
      .upsert(
        {
          client_id: clientId,
          platform: "linkedin",
          platform_account_id: "willleatherman",
          display_name: data.client.contentAccount,
          profile_url: "https://www.linkedin.com/in/willleatherman",
          connector_mode: "seeded",
        },
        { onConflict: "platform,platform_account_id" },
      )
      .select("id")
      .single();
    if (accountError) throw accountError;
    const accountId = accountRow.id as string;

    const { data: analysisRunRow, error: analysisRunError } = await this.client
      .from("analysis_runs")
      .insert({
        client_id: clientId,
        status: "succeeded",
        provider: "deterministic",
        model: "local-rules-v1",
        taxonomy_version: "catalyst-demo-2026-06",
        stats: { posts: data.posts.length, recommendations: data.recommendations.length },
        started_at: data.generatedAt,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (analysisRunError) throw analysisRunError;
    const analysisRunId = analysisRunRow.id as string;

    await upsertChunks(
      this.client,
      "companies",
      data.companies.map((company) => ({
        client_id: clientId,
        external_id: company.id,
        name: company.name,
        domain: company.domain,
        size_band: company.sizeBand,
        industry: company.industry,
        geography: company.geography,
        company_stage: company.stage,
        target_account: company.targetAccount,
        enrichment_mode: company.sourceMode,
      })),
      "client_id,external_id",
    );

    const { data: companyRows, error: companyError } = await this.client
      .from("companies")
      .select("id,external_id")
      .eq("client_id", clientId);
    if (companyError) throw companyError;
    const companyIds = new Map(companyRows.map((row) => [row.external_id as string, row.id as string]));

    await upsertChunks(
      this.client,
      "people",
      data.people.map((person) => ({
        client_id: clientId,
        company_id: person.companyId ? companyIds.get(person.companyId) ?? null : null,
        linkedin_id: person.linkedinId,
        linkedin_url: person.linkedinUrl,
        name: person.name,
        headline: person.headline,
        role: person.role,
        seniority: person.seniority,
        department: person.department,
        enrichment_mode: person.sourceMode,
      })),
      "client_id,linkedin_id",
    );

    const { data: personRows, error: personError } = await this.client
      .from("people")
      .select("id,linkedin_id")
      .eq("client_id", clientId);
    if (personError) throw personError;
    const personIds = new Map(personRows.map((row) => [`person_${row.linkedin_id}`, row.id as string]));

    await upsertChunks(
      this.client,
      "posts",
      data.posts.map((post) => ({
        client_id: clientId,
        content_account_id: accountId,
        platform: "linkedin",
        platform_post_id: post.id.replace(/^post_/, ""),
        canonical_url: post.linkedinUrl,
        author_name: post.authorName,
        content: post.content,
        content_hash: post.id,
        published_at: post.publishedAt,
        observed_reactions: post.publicReactions,
        observed_comments: post.publicComments,
        observed_reposts: post.publicReposts,
        latest_analysis: post.analysis,
        latest_analysis_run_id: analysisRunId,
      })),
      "platform,platform_post_id",
    );

    const { data: postRows, error: postError } = await this.client
      .from("posts")
      .select("id,platform_post_id")
      .eq("client_id", clientId);
    if (postError) throw postError;
    const postIds = new Map(postRows.map((row) => [`post_${row.platform_post_id}`, row.id as string]));

    await upsertChunks(
      this.client,
      "post_source_aliases",
      data.posts.flatMap((post) =>
        post.sourceIds.map((sourceId) => ({
          post_id: postIds.get(post.id),
          source_record_id: sourceId,
          source_url: post.linkedinUrl,
          last_seen_at: data.generatedAt,
        })),
      ),
      "post_id,source_record_id",
    );
    await upsertChunks(
      this.client,
      "post_media",
      data.posts
        .filter((post) => post.mediaUrl)
        .map((post) => ({
          post_id: postIds.get(post.id),
          media_type: post.analysis.mediaType,
          source_url: post.mediaUrl,
          position: 0,
          metadata: { observed_count: post.mediaCount },
        })),
      "post_id,position",
    );
    await upsertChunks(
      this.client,
      "metric_snapshots",
      data.posts.flatMap((post) =>
        post.metrics.map((metric) => ({
          client_id: clientId,
          post_id: postIds.get(post.id),
          captured_at: metric.capturedAt,
          impressions: metric.impressions,
          reach: metric.reach,
          clicks: metric.clicks,
          views: metric.views,
          saves: metric.saves,
          reactions: metric.reactions,
          comments: metric.comments,
          reposts: metric.reposts,
          engagement_rate: metric.engagementRate,
          source: metric.source,
          connector_mode: metric.sourceMode,
        })),
      ),
      "post_id,captured_at,source",
    );
    await upsertChunks(
      this.client,
      "reactions",
      data.reactions.map((reaction) => ({
        client_id: clientId,
        post_id: postIds.get(reaction.postId),
        person_id: personIds.get(reaction.personId),
        platform_reaction_id: reaction.id,
        reaction_type: reaction.reactionType,
        observed_at: data.generatedAt,
      })),
      "client_id,platform_reaction_id",
    );
    await upsertChunks(
      this.client,
      "comments",
      data.comments.map((comment) => ({
        client_id: clientId,
        post_id: postIds.get(comment.postId),
        person_id: personIds.get(comment.personId),
        platform_comment_id: comment.id,
        commentary: comment.text,
        commented_at: comment.createdAt,
        likes: comment.likes,
        quality_score: comment.qualityScore,
        response_priority: comment.responsePriority,
      })),
      "client_id,platform_comment_id",
    );

    const { data: modelRow, error: modelError } = await this.client
      .from("icp_models")
      .upsert(
        {
          client_id: clientId,
          name: "Will / Catalyst ICP",
          version: "will-catalyst-icp-v1",
          weights: {
            role: 12,
            seniority: 20,
            department: 18,
            company: 20,
            targetAccount: 22,
            buyingTrigger: 8,
          },
          thresholds: { A: 75, B: 55, C: 30 },
          is_active: true,
        },
        { onConflict: "client_id,version" },
      )
      .select("id")
      .single();
    if (modelError) throw modelError;
    const modelId = modelRow.id as string;

    await upsertChunks(
      this.client,
      "icp_scores",
      data.icpScores.map((score) => ({
        client_id: clientId,
        icp_model_id: modelId,
        person_id: personIds.get(score.personId),
        company_id: score.companyId ? companyIds.get(score.companyId) ?? null : null,
        score: score.score,
        confidence: score.confidence,
        tier: score.tier,
        reasons: score.reasons,
        missing_data: score.missingData,
        scored_at: data.generatedAt,
      })),
      "icp_model_id,person_id,company_id,scored_at",
    );

    const uniqueIdeas = [...new Set(data.posts.map((post) => post.analysis.coreIdea))];
    await upsertChunks(
      this.client,
      "ideas",
      uniqueIdeas.map((idea) => ({
        client_id: clientId,
        canonical_text: idea,
        taxonomy_version: "catalyst-demo-2026-06",
      })),
      "client_id,canonical_text",
    );
    const { data: ideaRows, error: ideaError } = await this.client
      .from("ideas")
      .select("id,canonical_text")
      .eq("client_id", clientId);
    if (ideaError) throw ideaError;
    const ideaIds = new Map(ideaRows.map((row) => [row.canonical_text as string, row.id as string]));

    await upsertChunks(
      this.client,
      "idea_seeding",
      data.ideaSeeds.map((seed) => ({
        client_id: clientId,
        idea_id: ideaIds.get(seed.idea),
        post_id: postIds.get(seed.postId),
        person_id: null,
        company_id: companyIds.get(seed.companyId),
        event_type: "aggregate_account_touch",
        occurred_at: seed.latestTouchAt,
        strength: seed.touchCount + seed.peopleCount * 2,
      })),
      "idea_id,post_id,person_id,company_id,event_type,occurred_at",
    );

    await upsertChunks(
      this.client,
      "opportunities",
      data.opportunities.map((opportunity) => ({
        client_id: clientId,
        company_id: companyIds.get(opportunity.companyId),
        crm_provider: opportunity.crm,
        crm_opportunity_id: opportunity.id,
        name: opportunity.name,
        stage: opportunity.stage,
        amount: opportunity.amount,
        close_date: opportunity.closeDate.slice(0, 10),
        connector_mode: opportunity.sourceMode,
      })),
      "client_id,crm_provider,crm_opportunity_id",
    );
    const { data: opportunityRows, error: opportunityError } = await this.client
      .from("opportunities")
      .select("id,crm_opportunity_id")
      .eq("client_id", clientId);
    if (opportunityError) throw opportunityError;
    const opportunityIds = new Map(
      opportunityRows.map((row) => [row.crm_opportunity_id as string, row.id as string]),
    );

    await upsertChunks(
      this.client,
      "attribution_links",
      data.attribution.map((link) => ({
        client_id: clientId,
        opportunity_id: opportunityIds.get(link.opportunityId),
        post_id: postIds.get(link.postId),
        person_id: personIds.get(link.personId),
        model: link.model,
        confidence: link.confidence,
        explanation: link.explanation,
        occurred_at: data.generatedAt,
        connector_mode: link.sourceMode,
      })),
      "opportunity_id,post_id,person_id,model",
    );

    await upsertChunks(
      this.client,
      "recommendations",
      data.recommendations.map((recommendation) => ({
        client_id: clientId,
        analysis_run_id: analysisRunId,
        source_key: recommendation.id,
        content_idea: recommendation.contentIdea,
        hook: recommendation.hook,
        format: recommendation.format,
        angle: recommendation.angle,
        evidence: recommendation.evidence,
        expected_impact: recommendation.expectedImpact,
        confidence: recommendation.confidence,
        generated_at: data.generatedAt,
      })),
      "client_id,source_key",
    );

    const { error: runError } = await this.client.from("ingestion_runs").insert({
      client_id: clientId,
      source: "apify_linkedin_export",
      status: "succeeded",
      stats: data.ingestion,
      started_at: data.generatedAt,
      completed_at: new Date().toISOString(),
    });
    if (runError) throw runError;

    return {
      clientId,
      accountId,
      posts: postIds.size,
      people: personIds.size,
      companies: companyIds.size,
      opportunities: opportunityIds.size,
      recommendations: data.recommendations.length,
    };
  }
}
