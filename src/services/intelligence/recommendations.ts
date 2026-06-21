import type {
  AttributionLink,
  CanonicalPost,
  IcpScore,
  NormalizedComment,
  NormalizedReaction,
  Recommendation,
} from "@/domain/types";
import { round } from "@/lib/deterministic";

export function buildRecommendations(
  posts: CanonicalPost[],
  reactions: NormalizedReaction[],
  comments: NormalizedComment[],
  scores: IcpScore[],
  attribution: AttributionLink[],
): Recommendation[] {
  const scoreByPerson = new Map(scores.map((score) => [score.personId, score.score]));
  const weightedByPost = new Map<string, number>();
  for (const reaction of reactions) {
    weightedByPost.set(
      reaction.postId,
      (weightedByPost.get(reaction.postId) ?? 0) + (scoreByPerson.get(reaction.personId) ?? 20) / 100,
    );
  }
  for (const comment of comments) {
    weightedByPost.set(
      comment.postId,
      (weightedByPost.get(comment.postId) ?? 0) +
        ((scoreByPerson.get(comment.personId) ?? 20) / 100) * (1 + comment.qualityScore / 45),
    );
  }

  const ranked = [...posts].sort((a, b) => {
    const aMetric = a.metrics.at(-1)!;
    const bMetric = b.metrics.at(-1)!;
    const aScore = aMetric.engagementRate * 8 + (weightedByPost.get(a.id) ?? 0);
    const bScore = bMetric.engagementRate * 8 + (weightedByPost.get(b.id) ?? 0);
    return bScore - aScore;
  });
  const leader = ranked[0];
  const second = ranked[1];
  const leaderMetric = leader.metrics.at(-1)!;
  const pipelinePostIds = new Set(attribution.map((link) => link.postId));
  const pipelineLeader = ranked.find((post) => pipelinePostIds.has(post.id)) ?? leader;

  return [
    {
      id: "rec_signal_loop",
      contentIdea: "The 30-minute weekly signal review",
      hook: "Your content calendar is not the strategy. The Monday signal review is.",
      format: "Operator framework + one-page workflow visual",
      angle:
        "Turn the strongest audience objection into a practical operating ritual: inputs, decision rules, and what gets killed.",
      evidence: [
        `"${leader.analysis.topic}" produced ${leaderMetric.engagementRate}% engagement.`,
        `${Math.round(weightedByPost.get(leader.id) ?? 0)} ICP-weighted engagement points.`,
        "Several senior commenters asked how to preserve stakeholder alignment without returning to a static calendar.",
      ],
      expectedImpact: "15–25% lift in qualified comments; strong save potential",
      confidence: 91,
    },
    {
      id: "rec_aeo_category",
      contentIdea: "Who owns the next AI-search category?",
      hook: "We tested 10 AI answers. Even the category leader appeared less than half the time.",
      format: "Recurring data-drop series",
      angle:
        "Repeat the open-category benchmark for a Catalyst target vertical and add the three moves that change citation share.",
      evidence: [
        `${second.analysis.format} posts are creating high reach velocity.`,
        "AEO touches multiple target accounts and maps directly to Catalyst's category positioning.",
        "The open question CTA makes follow-on category requests an owned research backlog.",
      ],
      expectedImpact: "Broader reach with a higher share of target-account reactions",
      confidence: 86,
    },
    {
      id: "rec_proof_system",
      contentIdea: "What the AI content team learned after the giveaway spike",
      hook: "The free stack drove comments. Here is what actually made it into production.",
      format: "Build-in-public teardown",
      angle:
        "Move from asset promise to proof: adoption, where human judgment stayed essential, and which specialist affected pipeline.",
      evidence: [
        "Comment-gated assets created the deepest thread, but raw engagement overstates buyer quality.",
        `${pipelineLeader.analysis.topic} content is connected to influenced opportunity signals.`,
        "Proof-led follow-ups should convert the attention spike into consideration.",
      ],
      expectedImpact: "Higher ICP mix and 1–2 additional account-level influence signals",
      confidence: 82,
    },
  ].map((item) => ({ ...item, confidence: round(item.confidence) }));
}
