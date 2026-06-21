import { z } from "zod";
import type {
  CanonicalPost,
  NormalizedComment,
  NormalizedReaction,
  Person,
  RawApifyRecord,
  RawComment,
  RawPost,
  RawReaction,
} from "@/domain/types";
import { uniqueBy } from "@/lib/deterministic";

const recordSchema = z.object({
  type: z.enum(["post", "reaction", "comment"]),
}).passthrough();

export interface ImportResult {
  rawCount: number;
  posts: Omit<CanonicalPost, "analysis" | "metrics" | "status" | "velocityLabel">[];
  people: Array<Omit<Person, "role" | "seniority" | "department" | "companyId" | "sourceMode">>;
  reactions: NormalizedReaction[];
  comments: Omit<NormalizedComment, "qualityScore" | "responsePriority">[];
  duplicateRecordsMerged: number;
}

function normalizeLinkedInUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function canonicalKey(post: RawPost): string {
  return normalizeLinkedInUrl(post.linkedinUrl || post.shareLinkedinUrl || post.id);
}

function actorToPerson(actor: RawReaction["actor"] | RawComment["actor"]) {
  return {
    id: `person_${actor.id}`,
    linkedinId: actor.id,
    name: actor.name,
    linkedinUrl: actor.linkedinUrl,
    headline: actor.position ?? "",
  };
}

/**
 * Pure, idempotent importer. Database persistence uses the same source IDs as
 * unique keys, so replaying an export updates rows instead of duplicating them.
 */
export function importApifyRecords(input: unknown): ImportResult {
  if (!Array.isArray(input)) throw new Error("Apify payload must be an array.");

  const records = input.map((record, index) => {
    const parsed = recordSchema.safeParse(record);
    if (!parsed.success) throw new Error(`Invalid record at index ${index}.`);
    return record as RawApifyRecord;
  });

  const rawPosts = records.filter((record): record is RawPost => record.type === "post");
  const rawReactions = records.filter(
    (record): record is RawReaction => record.type === "reaction",
  );
  const rawComments = records.filter((record): record is RawComment => record.type === "comment");

  const groups = new Map<string, RawPost[]>();
  for (const post of rawPosts) {
    const key = canonicalKey(post);
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }

  const sourceToCanonical = new Map<string, string>();
  const posts = [...groups.values()].map((versions) => {
    const sorted = [...versions].sort(
      (a, b) => new Date(b.postedAt.date).getTime() - new Date(a.postedAt.date).getTime(),
    );
    const primary = sorted[0];
    const id = `post_${primary.engagement?.id || primary.entityId || primary.id}`;
    for (const version of versions) sourceToCanonical.set(version.id, id);

    const reactionCount = Math.max(...versions.map((post) => post.engagement.likes ?? 0));
    const commentCount = Math.max(...versions.map((post) => post.engagement.comments ?? 0));
    const repostCount = Math.max(...versions.map((post) => post.engagement.shares ?? 0));
    const media = primary.postImages?.[0] ?? primary.article?.image;

    return {
      id,
      sourceIds: versions.map((post) => post.id).sort(),
      linkedinUrl: primary.linkedinUrl,
      authorName: primary.author.name,
      authorLinkedinUrl: primary.author.linkedinUrl,
      publishedAt: versions
        .map((post) => post.postedAt.date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0],
      content: primary.content,
      excerpt: primary.content.replace(/\s+/g, " ").trim().slice(0, 180),
      mediaCount: Math.max(...versions.map((post) => post.postImages?.length ?? 0)),
      mediaUrl: media?.url ?? null,
      publicReactions: reactionCount,
      publicComments: commentCount,
      publicReposts: repostCount,
    };
  });

  const fallbackUrlToPost = new Map(posts.map((post) => [normalizeLinkedInUrl(post.linkedinUrl), post.id]));
  const resolvePostId = (sourceId: string, queryUrl?: string) =>
    sourceToCanonical.get(sourceId) ??
    (queryUrl ? fallbackUrlToPost.get(normalizeLinkedInUrl(queryUrl)) : undefined);

  const reactions = uniqueBy(rawReactions, (reaction) => reaction.id)
    .map((reaction) => {
      const postId = resolvePostId(reaction.postId, reaction.query?.post);
      if (!postId) return null;
      return {
        id: reaction.id,
        postId,
        personId: `person_${reaction.actor.id}`,
        reactionType: reaction.reactionType,
      };
    })
    .filter((reaction): reaction is NormalizedReaction => reaction !== null);

  const comments = uniqueBy(rawComments, (comment) => comment.id)
    .map((comment) => {
      const postId = resolvePostId(comment.postId, comment.linkedinUrl);
      if (!postId) return null;
      return {
        id: comment.id,
        postId,
        personId: `person_${comment.actor.id}`,
        text: comment.commentary,
        createdAt: comment.createdAt ?? null,
        likes: comment.engagement?.likes ?? 0,
      };
    })
    .filter(
      (comment): comment is Omit<NormalizedComment, "qualityScore" | "responsePriority"> =>
        comment !== null,
    );

  const people = uniqueBy(
    [...rawReactions.map((item) => item.actor), ...rawComments.map((item) => item.actor)],
    (actor) => actor.id,
  ).map(actorToPerson);

  return {
    rawCount: records.length,
    posts,
    people,
    reactions,
    comments,
    duplicateRecordsMerged:
      rawPosts.length - posts.length +
      rawReactions.length - reactions.length +
      rawComments.length - comments.length,
  };
}
