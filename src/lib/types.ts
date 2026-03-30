export const interestLevels = [
  "ignore",
  "hold",
  "reference",
  "interested",
  "breakthrough",
] as const;

export const timeRanges = [
  "hour",
  "day",
  "week",
  "month",
  "year",
  "all",
] as const;

export type InterestLevel = (typeof interestLevels)[number];
export type TimeRangeKey = (typeof timeRanges)[number];
export type SourceTier = "priority" | "watchlist";
export type DataMode = "supabase" | "live" | "demo";

export type SourceDefinition = {
  id: string;
  name: string;
  domain: string;
  channel: string;
  tier: SourceTier;
  rationale: string;
};

export type PromotionCandidate = {
  id: string;
  name: string;
  domain: string;
  repeatCount: number;
  reason: string;
};

export type InterestPrediction = {
  level: InterestLevel;
  confidence: number;
  reason: string;
};

export type NewsItem = {
  id: string;
  sourceId: string;
  sourceName: string;
  url: string;
  title: string;
  titleKo: string;
  summary: string;
  summaryKo: string;
  publishedAt: string;
  lastUpdatedAt: string;
  engagement: {
    likes: number;
    comments: number;
    stars?: number;
    velocity: number;
  };
  crossSignalCount: number;
  tags: string[];
  userInterest: InterestLevel;
  predictedInterest?: InterestPrediction;
};

export type RatingEvent = {
  id: string;
  itemId: string;
  itemTitle: string;
  from: InterestLevel;
  to: InterestLevel;
  changedAt: string;
};

export type UserInterestProfile = {
  keywords: string[];
  preferredSources: string[];
};

export type CollectedNewsItem = {
  externalId: string;
  sourceSlug: string;
  sourceName: string;
  url: string;
  title: string;
  titleKo?: string;
  summary: string;
  summaryKo?: string;
  publishedAt: string;
  lastUpdatedAt: string;
  tags: string[];
  engagement: {
    likes: number;
    comments: number;
    stars?: number;
    velocity: number;
  };
  crossSignalCount: number;
};

export type CollectorStatus = {
  slug: string;
  label: string;
  collected: number;
  note: string;
};

export type DashboardPayload = {
  items: NewsItem[];
  sources: SourceDefinition[];
  history: RatingEvent[];
  mode: DataMode;
  syncEnabled: boolean;
  manualSyncEnabled: boolean;
  lastSyncedAt?: string;
  collectorStatus: CollectorStatus[];
};
