import { describe, expect, it } from "vitest";
import type { RawApifyRecord, RawPost } from "@/domain/types";
import { importApifyRecords } from "@/services/ingestion/apify-importer";

const basePost: RawPost = {
  type: "post",
  id: "source-1",
  entityId: "source-1",
  linkedinUrl: "https://www.linkedin.com/posts/example-activity-123?tracking=1",
  content: "A signal loop beats an annual calendar.",
  author: { id: "author", name: "Will", linkedinUrl: "https://linkedin.com/in/will" },
  postedAt: { date: "2026-06-18T12:00:00.000Z", timestamp: 1 },
  postImages: [],
  engagement: { id: "123", likes: 2, comments: 1, shares: 0 },
};

describe("importApifyRecords", () => {
  it("merges duplicate post URLs and deduplicates activity IDs", () => {
    const records: RawApifyRecord[] = [
      basePost,
      {
        ...basePost,
        id: "source-2",
        linkedinUrl: "https://www.linkedin.com/posts/example-activity-123",
      },
      {
        type: "reaction",
        id: "reaction-1",
        reactionType: "LIKE",
        postId: "source-1",
        actor: { id: "p1", name: "Buyer", linkedinUrl: "https://linkedin.com/in/buyer", position: "VP Marketing" },
      },
      {
        type: "reaction",
        id: "reaction-1",
        reactionType: "LIKE",
        postId: "source-2",
        actor: { id: "p1", name: "Buyer", linkedinUrl: "https://linkedin.com/in/buyer", position: "VP Marketing" },
      },
    ];

    const result = importApifyRecords(records);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].sourceIds).toEqual(["source-1", "source-2"]);
    expect(result.reactions).toHaveLength(1);
    expect(result.duplicateRecordsMerged).toBe(2);
  });

  it("is stable across repeated imports", () => {
    const first = importApifyRecords([basePost]);
    const second = importApifyRecords([basePost]);
    expect(second).toEqual(first);
  });
});
