import demoDataset from "@/data/demo-dataset.json";
import type { DashboardDataset } from "@/domain/types";

const dataset = demoDataset as DashboardDataset;

export type EvidenceLayer = "observed" | "derived" | "seeded";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export const reportMeta = {
  client: "Will Leatherman",
  channel: "LinkedIn",
  period: "June 9–18, 2026",
  prepared: "June 21, 2026",
  scope: "8 authored posts and 1 repost",
};

const substantiveComments = dataset.comments.filter((comment) => {
  const text = comment.text.trim();
  return (
    text.split(/\s+/).length >= 12 &&
    !/^(stack|aeo|systems)[.! ]*$/i.test(text)
  );
});

const engagedPostIds = new Map<string, Set<string>>();
for (const event of [...dataset.reactions, ...dataset.comments]) {
  const postIds = engagedPostIds.get(event.personId) ?? new Set<string>();
  postIds.add(event.postId);
  engagedPostIds.set(event.personId, postIds);
}

export const observedSummary = {
  posts: dataset.posts.length,
  authoredPosts: 8,
  reposts: 1,
  publicReactions: dataset.posts.reduce((sum, post) => sum + post.publicReactions, 0),
  publicComments: dataset.posts.reduce((sum, post) => sum + post.publicComments, 0),
  publicReposts: dataset.posts.reduce((sum, post) => sum + post.publicReposts, 0),
  capturedReactionIdentities: dataset.reactions.length,
  capturedComments: dataset.comments.length,
  uniqueEngagedPeople: dataset.people.length,
  substantiveComments: substantiveComments.length,
  repeatEngagers: [...engagedPostIds.values()].filter((postIds) => postIds.size >= 2).length,
  repeatEngagersThreePlus: [...engagedPostIds.values()].filter((postIds) => postIds.size >= 3).length,
  estimatedReachLow: 23_000,
  estimatedReachHigh: 47_000,
};

export interface PostIntelligence {
  id: string;
  date: string;
  linkedinUrl: string;
  excerpt: string;
  topic: string;
  coreIdea: string;
  hook: string;
  format: string;
  audience: string;
  reactions: number;
  publicComments: number;
  capturedComments: number;
  substantiveComments: number;
  layer: "observed";
}

const analyses: Record<
  string,
  Pick<PostIntelligence, "topic" | "coreIdea" | "hook" | "format" | "audience">
> = {
  post_7473410944619118592: {
    topic: "AI-search category visibility",
    coreIdea: "The agent-security category has no clear leader in AI answers.",
    hook: "Funding news followed by a ranked category benchmark",
    format: "Data-led category scan",
    audience: "Cybersecurity and category marketing leaders",
  },
  post_7473017986715574274: {
    topic: "Adaptive content planning",
    coreIdea:
      "When production gets faster, content planning should respond to current market signals instead of a fixed annual calendar.",
    hook: "“The annual editorial calendar is dead”",
    format: "Contrarian operator essay",
    audience: "B2B content and marketing leaders",
  },
  post_7469802826072821761: {
    topic: "Founder-led launches",
    coreIdea:
      "Launch performance is built through audience trust long before launch day.",
    hook: "A product launch compared with a “6-minute abs” workout",
    format: "Playbook with specific examples",
    audience: "B2B founders and growth leaders",
  },
  post_7472649386150330368: {
    topic: "AI content operations",
    coreIdea:
      "A coordinated set of AI specialists can handle repeatable parts of content production.",
    hook: "A seven-specialist content team offered for free",
    format: "System breakdown with comment-gated asset",
    audience: "Founder-led marketing teams",
  },
  post_7471268925415260161: {
    topic: "AI-search community",
    coreIdea:
      "Topical, educational events can build trust around a fast-forming category.",
    hook: "Vellum’s largest in-house event",
    format: "Event recap repost",
    audience: "AI, search, and GTM operators",
  },
  post_7471188524399046656: {
    topic: "AEO operating principles",
    coreIdea:
      "AI-search visibility depends on internet credibility, crawlability, measurement, and faster feedback loops.",
    hook: "Enthusiasm for an in-person AEO event",
    format: "Event takeaway list",
    audience: "B2B marketers building AI-search visibility",
  },
  post_7470536024490926080: {
    topic: "AI workflow adoption",
    coreIdea:
      "Recurring founder work can be converted into practical, reusable AI systems.",
    hook: "“Most founders are still doing this stuff manually”",
    format: "Course promotion with playbook offer",
    audience: "Founders and business operators",
  },
  post_7470460246420013056: {
    topic: "AEO tooling",
    coreIdea:
      "Reusable Claude skills can make AI-search work easier to operationalize.",
    hook: "A model release paired with ten free AEO skills",
    format: "Topical asset giveaway",
    audience: "SEO, AEO, and growth practitioners",
  },
  post_7467284933800214529: {
    topic: "Market credibility",
    coreIdea:
      "Content tactics only compound when the audience recognizes the creator’s expertise.",
    hook: "LinkedIn underperformance reframed as a credibility problem",
    format: "Operator framework",
    audience: "Founder-led experts and content leaders",
  },
};

export const posts: PostIntelligence[] = dataset.posts.map((post) => {
  const capturedComments = dataset.comments.filter(
    (comment) => comment.postId === post.id,
  );
  return {
    id: post.id,
    date: post.publishedAt,
    linkedinUrl: post.linkedinUrl,
    excerpt: post.excerpt,
    ...analyses[post.id],
    reactions: post.publicReactions,
    publicComments: post.publicComments,
    capturedComments: capturedComments.length,
    substantiveComments: capturedComments.filter((comment) =>
      substantiveComments.some((substantive) => substantive.id === comment.id),
    ).length,
    layer: "observed",
  };
});

export const clientFindings = [
  {
    title: "One argument created most of the useful discussion.",
    body:
      "The post challenging annual editorial calendars generated 23 captured comments, and all 23 contained a point, example, question, or objection. It accounts for 62% of substantive comments in the export.",
    evidence: "23 of 37 substantive comments",
    layer: "observed" as const,
  },
  {
    title: "Giveaway response should not be read as market conviction.",
    body:
      "The fractional content-team post reported 38 public comments. Of the 27 comments captured in the export, 20 were only the requested keyword. The post proved distribution demand for the asset, not agreement with the underlying thesis.",
    evidence: "20 keyword-only replies among 27 captured",
    layer: "observed" as const,
  },
  {
    title: "Senior people are present, but the audience is mixed.",
    body:
      "Headline-based role modeling classifies 18% of known engagers as executives and 16% as founders. That is a meaningful senior cohort, not evidence that the full audience matches Catalyst’s ICP.",
    evidence: "103 of 305 known engagers modeled as executives or founders",
    layer: "derived" as const,
  },
];

export const ideaClusters = [
  {
    idea: "Adaptive planning needs an operating model",
    posts: 1,
    comments: 23,
    description:
      "People agreed with faster feedback loops, then pushed on governance: preserving stakeholder alignment, avoiding reactive noise, and working before an audience is large enough to produce signal.",
    comment:
      "The audience moved quickly from agreement to implementation questions.",
  },
  {
    idea: "Credibility is a prerequisite for distribution",
    posts: 1,
    comments: 3,
    description:
      "The credibility framework drew the highest public reaction count in the period, but a small comment sample. The comments reinforced the distinction between presentation tactics and earned authority.",
    comment:
      "Strong recognition signal; too little discussion to infer which part needs expansion.",
  },
  {
    idea: "AI systems are useful when they become workflows",
    posts: 3,
    comments: 56,
    description:
      "The stack, systems course, and AEO skills posts created response volume. The substantive comments focused on repeatable workflows and adoption; most giveaway replies simply requested the asset.",
    comment:
      "Separate asset demand from demand for the operating belief behind it.",
  },
];

export const discussionSignals = [
  {
    kind: "Objection",
    signal:
      "A live-signal approach can become reactive if the team follows competitor moves without a judgment layer.",
    source: "Irving Walawitz · comment on adaptive planning",
    why:
      "The next piece should define how Catalyst separates durable market evidence from short-lived noise.",
  },
  {
    kind: "Recurring question",
    signal:
      "What should an early company use as signal before it has a large enough audience to learn from?",
    source: "Kerim G. · comment on adaptive planning",
    why:
      "This exposes an edge case in the operating model and a useful distinction between audience, customer, sales, and category signals.",
  },
  {
    kind: "Buying pain",
    signal:
      "The annual calendar was doing stakeholder-alignment work, even when it was poor editorial strategy.",
    source: "Farheen Naz and Luisa Franceschi · comments on adaptive planning",
    why:
      "A replacement process has to satisfy executives who still need visibility, priorities, and a planning artifact.",
  },
  {
    kind: "Category language",
    signal:
      "“Weekly signal review” appeared as a concrete ritual used by an operator, not a phrase introduced by the post.",
    source: "Andrew Miller · Co-Founder, Omada.ai",
    why:
      "The phrase is useful because it describes a behavior a buyer can picture adopting.",
  },
  {
    kind: "Content opportunity",
    signal:
      "Marketing leaders need a credible way to explain adaptive planning to a CFO or board asking for the quarter’s plan.",
    source: "Abida Khamis · comment on adaptive planning",
    why:
      "A board-ready one-page model would answer an observed implementation concern without inventing a new topic.",
  },
];

export const audienceMix = [
  { label: "Executives", value: 18, count: 55 },
  { label: "Founders", value: 16, count: 48 },
  { label: "Marketing", value: 18, count: 55 },
  { label: "Revenue / sales", value: 5, count: 15 },
  { label: "Technical", value: 7, count: 21 },
  { label: "Other / unclear", value: 36, count: 111 },
];

export const repeatEngagerExamples = [
  {
    name: "Maryann (MJ) Jamieson",
    role: "Former MD and CIO · ANZ, BMO, Barclays",
    posts: 8,
  },
  {
    name: "Barbara Jovanovic",
    role: "B2B marketing strategist · fractional CMO",
    posts: 7,
  },
  {
    name: "Jyoti Swaroop Mohanty",
    role: "Head of Marketing & Growth",
    posts: 7,
  },
  {
    name: "Sai Narendran",
    role: "Co-founder · Bull AI",
    posts: 7,
  },
  {
    name: "Casey Copeland",
    role: "Chief Marketing Officer · Mid America Capital",
    posts: 6,
  },
];

export const accountActivity = [
  {
    account: "Vellum",
    people: 4,
    posts: 3,
    touches: 14,
    ideas: "AI search, events, faster feedback loops",
    confidence: "High" as const,
  },
  {
    account: "Gauge",
    people: 4,
    posts: 3,
    touches: 10,
    ideas: "AI search, category visibility, events",
    confidence: "High" as const,
  },
  {
    account: "Bull AI",
    people: 1,
    posts: 7,
    touches: 7,
    ideas: "AEO, credibility, AI content operations",
    confidence: "Medium" as const,
  },
  {
    account: "Arcadia",
    people: 1,
    posts: 5,
    touches: 6,
    ideas: "Adaptive planning, launches, credibility",
    confidence: "Medium" as const,
  },
  {
    account: "Mid America Capital",
    people: 1,
    posts: 6,
    touches: 6,
    ideas: "Adaptive planning, AI systems, credibility",
    confidence: "Medium" as const,
  },
];

export const seededPipeline = [
  {
    account: "Vellum",
    opportunity: "Executive LinkedIn program",
    stage: "Solution fit",
    value: 144_000,
    observedSignal: "4 people · 14 touches · 3 posts",
    influence:
      "Observed account activity precedes a seeded open opportunity. This is a plausible influence path, not a causal claim.",
  },
  {
    account: "Gauge",
    opportunity: "AI-search research program",
    stage: "Discovery",
    value: 96_000,
    observedSignal: "4 people · 10 touches · 3 posts",
    influence:
      "Observed engagement around AI search is joined to a seeded opportunity for demonstration.",
  },
  {
    account: "Noma Security",
    opportunity: "Category visibility sprint",
    stage: "Discovery",
    value: 72_000,
    observedSignal: "SVP Marketing commented on the category scan",
    influence:
      "The observed senior comment is real; the opportunity and its timing are seeded.",
  },
];

export const recommendations = [
  {
    observation:
      "The adaptive-planning post generated 23 substantive comments and surfaced three implementation concerns: stakeholder alignment, weak early-stage signals, and the risk of chasing noise.",
    evidence:
      "23 captured comments; operator examples from Omada.ai and demand-gen leaders; repeated questions about governance.",
    recommendation:
      "Publish the operating model for a weekly signal review. Show inputs, decision rules, the quarterly planning artifact, and what the team deliberately ignores.",
    expectedOutcome:
      "More implementation-level responses from marketing leaders and a clearer sales conversation about how Catalyst works.",
    confidence: "High" as const,
  },
  {
    observation:
      "The fractional content-team giveaway created response volume, but 20 of 27 captured comments were only the requested keyword.",
    evidence:
      "38 public comments; 27 captured comments; 20 keyword-only replies; two substantive workflow comments.",
    recommendation:
      "Follow with a production teardown: which specialist was used, what failed, where human judgment remained necessary, and what changed after one week.",
    expectedOutcome:
      "Lower comment volume but a higher share of buyer questions, implementation stories, and objections.",
    confidence: "Medium" as const,
  },
  {
    observation:
      "The AI-agent security benchmark reached senior category buyers, but one of two captured commenters flagged a wrong logo and company tag.",
    evidence:
      "Comment from Noma’s SVP Marketing; comment from Check Point’s Head of Enterprise Business; 14 public reactions.",
    recommendation:
      "Correct the benchmark, publish the query set and naming method, then repeat the scan only after the data-quality check is visible.",
    expectedOutcome:
      "Greater trust in the research format and a stronger basis for future category conversations.",
    confidence: "High" as const,
  },
];

export const confidenceFramework: Array<{
  label: string;
  level: ConfidenceLevel;
  note: string;
}> = [
  {
    label: "Observed activity",
    level: "High",
    note: "Directly present in the supplied LinkedIn export.",
  },
  {
    label: "Content classification",
    level: "Medium",
    note: "Human-readable interpretation of nine posts.",
  },
  {
    label: "Audience and account grouping",
    level: "Medium",
    note: "Derived from self-reported LinkedIn headlines.",
  },
  {
    label: "Estimated audience reach",
    level: "Low",
    note: "Directional range using a 1.5–3% response assumption.",
  },
  {
    label: "Pipeline influence",
    level: "Low",
    note: "CRM opportunities and timing are seeded for demonstration.",
  },
  {
    label: "Recommendations",
    level: "Medium",
    note: "Grounded in a small, recent sample and should be tested.",
  },
];

export const whatWeLearned = [
  "Specific operating beliefs created more market learning than asset-led promotion in this sample.",
  "The most useful comments did not simply agree; they supplied constraints, edge cases, and language for a stronger operating model.",
  "There is a visible senior audience and repeat exposure, but no owned impression data or CRM history to prove reach, conversion, or revenue impact.",
];
