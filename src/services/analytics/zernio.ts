import type { MetricSnapshot } from "@/domain/types";
import { round, seededNumber } from "@/lib/deterministic";

export interface AnalyticsPostIdentity {
  postId: string;
  linkedinUrl: string;
  publishedAt: string;
  reactions: number;
  comments: number;
  reposts: number;
}

export interface ZernioAnalyticsAdapter {
  snapshotsFor(post: AnalyticsPostIdentity): Promise<MetricSnapshot[]>;
}

const DEMO_AS_OF = new Date("2026-06-21T13:00:00.000Z");

export class SeededZernioAdapter implements ZernioAnalyticsAdapter {
  async snapshotsFor(post: AnalyticsPostIdentity): Promise<MetricSnapshot[]> {
    const published = new Date(post.publishedAt);
    const engagement = post.reactions + post.comments * 1.6 + post.reposts * 2;
    const multiplier = seededNumber(`${post.postId}:impressions`, 62, 112);
    const finalImpressions = Math.max(850, Math.round(engagement * multiplier));
    const reachRatio = seededNumber(`${post.postId}:reach`, 0.61, 0.78);
    const clickRate = seededNumber(`${post.postId}:click`, 0.007, 0.026);
    const saveRate = seededNumber(`${post.postId}:save`, 0.003, 0.014);
    const fractions = [0.08, 0.31, 0.66, 0.88, 1];
    const hours = [2, 8, 24, 72, Math.max(96, (DEMO_AS_OF.getTime() - published.getTime()) / 3_600_000)];

    return fractions.map((fraction, index) => {
      const captured = new Date(Math.min(
        DEMO_AS_OF.getTime(),
        published.getTime() + hours[index] * 3_600_000,
      ));
      const impressions = Math.round(finalImpressions * fraction);
      const reactions = Math.min(post.reactions, Math.round(post.reactions * Math.min(1, fraction * 1.08)));
      const comments = Math.min(post.comments, Math.round(post.comments * Math.min(1, fraction * 1.03)));
      const reposts = Math.min(post.reposts, Math.round(post.reposts * fraction));
      const clicks = Math.round(impressions * clickRate);
      const saves = Math.round(impressions * saveRate);

      return {
        id: `${post.postId}:${captured.toISOString()}`,
        postId: post.postId,
        capturedAt: captured.toISOString(),
        impressions,
        reach: Math.round(impressions * reachRatio),
        clicks,
        views: Math.round(impressions * seededNumber(`${post.postId}:view`, 0.72, 0.92)),
        saves,
        reactions,
        comments,
        reposts,
        engagementRate: round(((reactions + comments + reposts + saves) / Math.max(1, impressions)) * 100, 2),
        source: "zernio_seeded",
        sourceMode: "seeded",
      };
    });
  }
}

/**
 * Production Zernio supplies owned impressions/reach/clicks. Apify supplies
 * public engagement identity. Merge on LinkedIn post URL or post ID; fallback
 * matching uses normalized content hash plus publish timestamp within 15 min.
 */
export class ZernioApiAdapter implements ZernioAnalyticsAdapter {
  async snapshotsFor(_post: AnalyticsPostIdentity): Promise<MetricSnapshot[]> {
    void _post;
    throw new Error("Zernio live calls are intentionally disabled in demo mode.");
  }
}
