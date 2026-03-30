import { annotatePredictions } from "@/lib/insight-engine";
import { collectLatestNews } from "@/lib/ingestion/collectors";
import { translateCollectedNews } from "@/lib/ingestion/translate";
import { mockNewsItems } from "@/lib/mock-news";
import {
  buildFallbackHistory,
  hasSupabaseConfig,
  loadInterestHistory,
  loadStoredNews,
  loadStoredSources,
  saveCollectedNews,
} from "@/lib/news-repository";
import { defaultSources, promotionCandidates, seedProfile } from "@/lib/source-registry";
import { isManualSyncEnabled } from "@/lib/sync-auth";
import { DashboardPayload, NewsItem } from "@/lib/types";

export async function getDashboardPayload(): Promise<DashboardPayload> {
  if (hasSupabaseConfig()) {
    const [storedItems, storedSources, storedHistory] = await Promise.all([
      loadStoredNews(),
      loadStoredSources(),
      loadInterestHistory(),
    ]);

    if (storedItems.length > 0) {
      return {
        items: storedItems,
        sources: storedSources,
        history: storedHistory.length > 0 ? storedHistory : buildFallbackHistory(storedItems),
        mode: "supabase",
        syncEnabled: true,
        manualSyncEnabled: isManualSyncEnabled(),
        collectorStatus: [],
        lastSyncedAt: storedItems[0]?.lastUpdatedAt,
      };
    }
  }

  if (shouldSkipLiveCollectionDuringRender()) {
    return createDemoPayload("첫 동기화 전이어서 데모 데이터를 표시합니다.");
  }

  const live = await collectLiveDashboardPayload();
  return live;
}

export async function syncLatestNews() {
  const collected = await collectLatestNews();
  const translated = await translateCollectedNews(collected.items);
  const persisted = hasSupabaseConfig() ? await saveCollectedNews(translated) : null;

  return {
    savedCount: persisted?.savedCount ?? 0,
    syncedAt: persisted?.syncedAt ?? new Date().toISOString(),
    collectorStatus: collected.collectorStatus,
    fallbackItems: mapCollectedItemsToNews(translated),
  };
}

async function collectLiveDashboardPayload(): Promise<DashboardPayload> {
  try {
    const collected = await collectLatestNews();
    const translated = await translateCollectedNews(collected.items);
    const liveItems = mapCollectedItemsToNews(translated);

    return {
      items: liveItems.length > 0 ? liveItems : mockNewsItems,
      sources: defaultSources,
      history: buildFallbackHistory(liveItems.length > 0 ? liveItems : mockNewsItems),
      mode: liveItems.length > 0 ? "live" : "demo",
      syncEnabled: true,
      manualSyncEnabled: isManualSyncEnabled(),
      collectorStatus: collected.collectorStatus,
      lastSyncedAt: liveItems[0]?.lastUpdatedAt,
    };
  } catch {
    return createDemoPayload("실시간 수집에 실패해 데모 데이터를 표시합니다.");
  }
}

function mapCollectedItemsToNews(items: Awaited<ReturnType<typeof translateCollectedNews>>) {
  const baseItems = items.map((item) => ({
    id: item.externalId,
    sourceId: item.sourceSlug,
    sourceName: item.sourceName,
    url: item.url,
    title: item.title,
    titleKo: item.titleKo ?? item.title,
    summary: item.summary,
    summaryKo: item.summaryKo ?? item.summary,
    publishedAt: item.publishedAt,
    lastUpdatedAt: item.lastUpdatedAt,
    engagement: item.engagement,
    crossSignalCount: item.crossSignalCount,
    tags: item.tags,
    userInterest: "hold" as const,
  }));

  return annotatePredictions(baseItems, seedProfile) as NewsItem[];
}

function shouldSkipLiveCollectionDuringRender() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.CI === "true"
  );
}

function createDemoPayload(note: string): DashboardPayload {
  return {
    items: mockNewsItems,
    sources: defaultSources,
    history: buildFallbackHistory(mockNewsItems),
    mode: "demo",
    syncEnabled: true,
    manualSyncEnabled: isManualSyncEnabled(),
    collectorStatus: [
      {
        slug: "bootstrap",
        label: "초기 상태",
        collected: 0,
        note,
      },
      ...promotionCandidates.map((candidate) => ({
        slug: candidate.id,
        label: candidate.name,
        collected: 0,
        note: candidate.reason,
      })),
    ],
    lastSyncedAt: mockNewsItems[0]?.lastUpdatedAt,
  };
}
