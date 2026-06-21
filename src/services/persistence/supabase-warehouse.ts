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

    return {
      clientId,
      accountId,
      posts: postIds.size,
      people: personIds.size,
      companies: companyIds.size,
    };
  }
}
