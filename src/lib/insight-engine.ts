import {
  InterestLevel,
  InterestPrediction,
  NewsItem,
  RatingEvent,
  TimeRangeKey,
  UserInterestProfile,
} from "@/lib/types";

const interestRank: Record<InterestLevel, number> = {
  ignore: 0,
  hold: 1,
  reference: 2,
  interested: 3,
  breakthrough: 4,
};

const windowsInHours: Record<Exclude<TimeRangeKey, "all">, number> = {
  hour: 1,
  day: 24,
  week: 24 * 7,
  month: 24 * 30,
  year: 24 * 365,
};

export function labelForInterest(level: InterestLevel) {
  return {
    ignore: "관심없음",
    hold: "보류",
    reference: "참고",
    interested: "관심",
    breakthrough: "혁신",
  }[level];
}

export function labelForTimeRange(range: TimeRangeKey) {
  return {
    hour: "1시간",
    day: "오늘",
    week: "1주",
    month: "1개월",
    year: "1년",
    all: "전체",
  }[range];
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function annotatePredictions(
  items: NewsItem[],
  profile: UserInterestProfile,
) {
  return items.map((item) => ({
    ...item,
    predictedInterest: predictInterest(item, profile),
  }));
}

export function filterNewsByRange(items: NewsItem[], range: TimeRangeKey) {
  if (range === "all") {
    return [...items].sort(sortByFreshness);
  }

  const now = items.length
    ? Math.max(...items.map((item) => new Date(item.lastUpdatedAt).getTime()))
    : Date.now();
  const cutoff = now - windowsInHours[range] * 60 * 60 * 1000;

  return items
    .filter((item) => new Date(item.lastUpdatedAt).getTime() >= cutoff)
    .sort(sortByFreshness);
}

export function buildBreakingNews(items: NewsItem[]) {
  const oneHourItems = filterNewsByRange(items, "hour");

  return oneHourItems
    .map((item) => ({
      ...item,
      momentum:
        item.engagement.velocity * 1.6 +
        item.crossSignalCount * 18 +
        (item.engagement.stars ?? 0) * 0.05,
      reason: buildRecommendationReason(item),
    }))
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 4);
}

export function buildDailyHighlights(items: NewsItem[]) {
  return filterNewsByRange(items, "day")
    .map((item) => ({
      ...item,
      highlightScore: computeHighlightScore(item),
      reason: buildRecommendationReason(item),
    }))
    .sort((a, b) => b.highlightScore - a.highlightScore)
    .slice(0, 3);
}

export function groupArchiveCounts(items: NewsItem[]) {
  return items.reduce<Record<InterestLevel, number>>(
    (acc, item) => {
      acc[item.userInterest] += 1;
      return acc;
    },
    {
      ignore: 0,
      hold: 0,
      reference: 0,
      interested: 0,
      breakthrough: 0,
    },
  );
}

export function createSeedHistory(items: NewsItem[]): RatingEvent[] {
  return items
    .slice()
    .sort(sortByFreshness)
    .slice(0, 6)
    .map((item, index) => ({
      id: `seed-${item.id}`,
      itemId: item.id,
      itemTitle: item.titleKo,
      from: item.userInterest,
      to: item.userInterest,
      changedAt: new Date(
        new Date(item.lastUpdatedAt).getTime() - (index + 1) * 22 * 60 * 1000,
      ).toISOString(),
    }));
}

export function buildRecommendationReason(item: NewsItem) {
  const reasons = [];

  if (item.engagement.velocity >= 90) {
    reasons.push("반응 속도가 매우 빠릅니다");
  }

  if (item.crossSignalCount >= 6) {
    reasons.push("여러 커뮤니티에서 동시에 언급됩니다");
  }

  if ((item.predictedInterest?.level ?? "hold") === "breakthrough") {
    reasons.push("사용자 관심사와 강하게 맞습니다");
  } else if ((item.predictedInterest?.level ?? "hold") === "interested") {
    reasons.push("사용자 관심사와 관련성이 높습니다");
  }

  return reasons.slice(0, 2).join(" · ") || "최신 반응이 안정적으로 쌓이는 이슈입니다";
}

function predictInterest(
  item: NewsItem,
  profile: UserInterestProfile,
): InterestPrediction {
  const haystack = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.sourceName}`.toLowerCase();
  const matchedKeywords = profile.keywords.filter((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );

  let score = matchedKeywords.length * 20;

  if (profile.preferredSources.includes(item.sourceId)) {
    score += 18;
  }

  score += item.engagement.velocity * 0.42;
  score += item.crossSignalCount * 6;

  const level: InterestLevel =
    score >= 90
      ? "breakthrough"
      : score >= 64
        ? "interested"
        : score >= 42
          ? "reference"
          : score >= 24
            ? "hold"
            : "ignore";

  const reason =
    matchedKeywords.length > 0
      ? `관심 키워드 ${matchedKeywords.slice(0, 2).join(", ")} 와 직접 연결됩니다`
      : profile.preferredSources.includes(item.sourceId)
        ? `${item.sourceName} 는 우선 추적 소스로 등록되어 있습니다`
        : "반응 속도와 교차 언급량이 평균보다 높습니다";

  return {
    level,
    confidence: Math.min(0.96, 0.4 + score / 150),
    reason,
  };
}

function computeHighlightScore(item: NewsItem) {
  const predicted = item.predictedInterest
    ? interestRank[item.predictedInterest.level] * 14
    : 0;

  return (
    item.engagement.velocity * 1.15 +
    item.crossSignalCount * 15 +
    (item.engagement.stars ?? 0) * 0.08 +
    predicted
  );
}

function sortByFreshness(a: NewsItem, b: NewsItem) {
  return (
    new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
  );
}
