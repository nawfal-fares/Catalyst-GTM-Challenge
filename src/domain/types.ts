export type SourceMode = "observed" | "seeded" | "estimated";

export interface RawActor {
  id: string;
  name: string;
  linkedinUrl: string;
  position?: string;
  pictureUrl?: string;
}

export interface RawPost {
  type: "post";
  id: string;
  entityId?: string;
  linkedinUrl: string;
  shareLinkedinUrl?: string;
  content: string;
  author: {
    id: string;
    name: string;
    linkedinUrl: string;
    info?: string;
  };
  postedAt: { date: string; timestamp: number };
  postImages?: Array<{ url: string; width?: number; height?: number }>;
  article?: {
    title?: string;
    link?: string;
    image?: { url: string; width?: number; height?: number };
  };
  engagement: {
    id?: string;
    likes: number;
    comments: number;
    shares: number;
    reactions?: Array<{ type: string; count: number }>;
  };
}

export interface RawReaction {
  type: "reaction";
  id: string;
  reactionType: string;
  actor: RawActor;
  postId: string;
  query?: { post?: string };
}

export interface RawComment {
  type: "comment";
  id: string;
  linkedinUrl?: string;
  commentary: string;
  createdAt?: string;
  actor: RawActor & { author?: boolean };
  postId: string;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export type RawApifyRecord = RawPost | RawReaction | RawComment;

export interface Person {
  id: string;
  linkedinId: string;
  name: string;
  linkedinUrl: string;
  headline: string;
  role: string | null;
  seniority: string | null;
  department: string | null;
  companyId: string | null;
  sourceMode: SourceMode;
}

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  sizeBand: string;
  industry: string;
  geography: string;
  stage: string;
  targetAccount: boolean;
  sourceMode: SourceMode;
}

export interface ContentAnalysis {
  topic: string;
  subtopic: string;
  format: string;
  mediaType: string;
  visualStyle: string;
  hookType: string;
  narrativeStructure: string;
  ctaType: string;
  targetAudience: string;
  funnelStage: string;
  emotionalDriver: string;
  coreIdea: string;
  noveltyLevel: "low" | "medium" | "high";
  sophisticationLevel: "foundational" | "intermediate" | "advanced";
  provider: "openai" | "deterministic";
}

export interface MetricSnapshot {
  id: string;
  postId: string;
  capturedAt: string;
  impressions: number;
  reach: number;
  clicks: number;
  views: number;
  saves: number;
  reactions: number;
  comments: number;
  reposts: number;
  engagementRate: number;
  source: "zernio_seeded";
  sourceMode: "seeded";
}

export interface NormalizedReaction {
  id: string;
  postId: string;
  personId: string;
  reactionType: string;
}

export interface NormalizedComment {
  id: string;
  postId: string;
  personId: string;
  text: string;
  createdAt: string | null;
  likes: number;
  qualityScore: number;
  responsePriority: "high" | "medium" | "low";
}

export interface IcpScore {
  personId: string;
  companyId: string | null;
  score: number;
  confidence: number;
  tier: "A" | "B" | "C" | "Disqualified";
  reasons: string[];
  missingData: string[];
  modelVersion: string;
}

export interface CanonicalPost {
  id: string;
  sourceIds: string[];
  linkedinUrl: string;
  authorName: string;
  authorLinkedinUrl: string;
  publishedAt: string;
  content: string;
  excerpt: string;
  mediaCount: number;
  mediaUrl: string | null;
  publicReactions: number;
  publicComments: number;
  publicReposts: number;
  analysis: ContentAnalysis;
  metrics: MetricSnapshot[];
  status: "taking-off" | "steady" | "slowing";
  velocityLabel: string;
}

export interface IdeaSeed {
  id: string;
  postId: string;
  idea: string;
  companyId: string;
  peopleCount: number;
  touchCount: number;
  latestTouchAt: string;
  strength: "emerging" | "warming" | "saturated";
}

export interface Opportunity {
  id: string;
  companyId: string;
  name: string;
  stage: string;
  amount: number;
  closeDate: string;
  crm: "HubSpot" | "Salesforce";
  sourceMode: "seeded";
}

export interface AttributionLink {
  id: string;
  opportunityId: string;
  postId: string;
  personId: string;
  model: "direct" | "influenced" | "estimated";
  confidence: number;
  explanation: string;
  sourceMode: "seeded" | "estimated";
}

export interface Recommendation {
  id: string;
  contentIdea: string;
  hook: string;
  format: string;
  angle: string;
  evidence: string[];
  expectedImpact: string;
  confidence: number;
}

export interface CommentOpportunity {
  commentId: string;
  postId: string;
  personId: string;
  personName: string;
  headline: string;
  companyName: string | null;
  text: string;
  qualityScore: number;
  icpScore: number;
  reason: string;
}

export interface DashboardDataset {
  generatedAt: string;
  client: {
    name: string;
    contentAccount: string;
    attributionDisclaimer: string;
  };
  ingestion: {
    rawRecords: number;
    posts: number;
    reactions: number;
    comments: number;
    people: number;
    companies: number;
    duplicateRecordsMerged: number;
    mode: "demo";
  };
  posts: CanonicalPost[];
  people: Person[];
  companies: Company[];
  reactions: NormalizedReaction[];
  comments: NormalizedComment[];
  icpScores: IcpScore[];
  ideaSeeds: IdeaSeed[];
  opportunities: Opportunity[];
  attribution: AttributionLink[];
  recommendations: Recommendation[];
  commentOpportunities: CommentOpportunity[];
}
