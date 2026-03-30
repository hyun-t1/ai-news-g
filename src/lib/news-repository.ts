import { annotatePredictions, createSeedHistory } from "@/lib/insight-engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultSources, seedProfile } from "@/lib/source-registry";
import {
  CollectedNewsItem,
  NewsItem,
  RatingEvent,
  SourceDefinition,
} from "@/lib/types";

type FeedRow = {
  id: string;
  source_name: string;
  source_slug: string;
  source_tier: "priority" | "watchlist";
  url: string;
  title_original: string;
  title_ko: string | null;
  summary_original: string | null;
  summary_ko: string | null;
  published_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  stars_count: number;
  velocity_score: number;
  cross_signal_count: number;
  tags: string[] | null;
  user_interest: "ignore" | "hold" | "reference" | "interested" | "breakthrough" | null;
  interest_changed_at: string | null;
  predicted_interest: "ignore" | "hold" | "reference" | "interested" | "breakthrough" | null;
  predicted_interest_reason: string | null;
};

type SourceRow = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  channel: string;
  tier: "priority" | "watchlist";
  rationale: string | null;
};

type InterestEventRow = {
  id: string;
  changed_at: string;
  previous_level: "ignore" | "hold" | "reference" | "interested" | "breakthrough" | null;
  next_level: "ignore" | "hold" | "reference" | "interested" | "breakthrough";
  news_items: {
    id: string;
    title_ko: string | null;
    title_original: string;
  } | null;
};

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export async function saveCollectedNews(items: CollectedNewsItem[]) {
  const client = createSupabaseServerClient();

  if (!client) {
    return null;
  }

  await client.from("news_sources").upsert(
    defaultSources.map((source) => ({
      slug: source.id,
      name: source.name,
      domain: source.domain,
      channel: source.channel,
      tier: source.tier,
      rationale: source.rationale,
    })),
    {
      onConflict: "slug",
      ignoreDuplicates: false,
    },
  );

  const sourceLookupResponse = await client
    .from("news_sources")
    .select("id, slug");

  if (sourceLookupResponse.error) {
    throw sourceLookupResponse.error;
  }

  const sourceLookup = new Map(
    (sourceLookupResponse.data ?? []).map((row) => [row.slug as string, row.id as string]),
  );

  const rows = annotatePredictions(
    items.map((item) => ({
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
    })),
    seedProfile,
  )
    .map((item) => {
      const sourceId = sourceLookup.get(item.sourceId);

      if (!sourceId) {
        return null;
      }

      return {
        source_id: sourceId,
        external_id: item.id,
        url: item.url,
        title_original: item.title,
        title_ko: item.titleKo,
        summary_original: item.summary,
        summary_ko: item.summaryKo,
        published_at: item.publishedAt,
        updated_at: item.lastUpdatedAt,
        likes_count: item.engagement.likes,
        comments_count: item.engagement.comments,
        stars_count: item.engagement.stars ?? 0,
        velocity_score: item.engagement.velocity,
        cross_signal_count: item.crossSignalCount,
        tags: item.tags,
        predicted_interest: item.predictedInterest?.level ?? "hold",
        predicted_interest_reason: item.predictedInterest?.reason ?? null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const upsertResponse = await client.from("news_items").upsert(rows, {
    onConflict: "url",
    ignoreDuplicates: false,
  });

  if (upsertResponse.error) {
    throw upsertResponse.error;
  }

  return {
    savedCount: rows.length,
    syncedAt: new Date().toISOString(),
  };
}

export async function loadStoredNews(limit = 40) {
  const client = createSupabaseServerClient();

  if (!client) {
    return [] as NewsItem[];
  }

  const response = await client
    .from("news_feed_view")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    throw response.error;
  }

  return (response.data ?? []).map(mapFeedRowToNewsItem);
}

export async function loadStoredSources() {
  const client = createSupabaseServerClient();

  if (!client) {
    return defaultSources;
  }

  const response = await client
    .from("news_sources")
    .select("id, slug, name, domain, channel, tier, rationale")
    .order("tier", { ascending: true })
    .order("name", { ascending: true });

  if (response.error || !response.data?.length) {
    return defaultSources;
  }

  return response.data.map((row) => mapSourceRow(row as SourceRow));
}

export async function loadInterestHistory(limit = 24) {
  const client = createSupabaseServerClient();

  if (!client) {
    return [] as RatingEvent[];
  }

  const response = await client
    .from("user_interest_events")
    .select(
      "id, changed_at, previous_level, next_level, news_items ( id, title_ko, title_original )",
    )
    .order("changed_at", { ascending: false })
    .limit(limit);

  if (response.error) {
    throw response.error;
  }

  return (response.data ?? []).map((row) => {
    const event = row as unknown as InterestEventRow;
    return {
      id: event.id,
      itemId: event.news_items?.id ?? "unknown",
      itemTitle: event.news_items?.title_ko ?? event.news_items?.title_original ?? "제목 없음",
      from: event.previous_level ?? event.next_level,
      to: event.next_level,
      changedAt: event.changed_at,
    } satisfies RatingEvent;
  });
}

export async function recordInterestChange(newsItemId: string, nextLevel: NewsItem["userInterest"]) {
  const client = createSupabaseServerClient();

  if (!client || !isUuid(newsItemId)) {
    return null;
  }

  const currentResponse = await client
    .from("user_interest_current")
    .select("interest_level")
    .eq("news_item_id", newsItemId)
    .maybeSingle();

  if (currentResponse.error) {
    throw currentResponse.error;
  }

  const previousLevel =
    (currentResponse.data?.interest_level as NewsItem["userInterest"] | undefined) ?? "hold";

  const upsertCurrent = await client.from("user_interest_current").upsert(
    {
      news_item_id: newsItemId,
      interest_level: nextLevel,
      changed_at: new Date().toISOString(),
    },
    {
      onConflict: "news_item_id",
      ignoreDuplicates: false,
    },
  );

  if (upsertCurrent.error) {
    throw upsertCurrent.error;
  }

  const insertEvent = await client.from("user_interest_events").insert({
    news_item_id: newsItemId,
    previous_level: previousLevel,
    next_level: nextLevel,
    changed_at: new Date().toISOString(),
  });

  if (insertEvent.error) {
    throw insertEvent.error;
  }

  return {
    previousLevel,
    nextLevel,
  };
}

export function buildFallbackHistory(items: NewsItem[]) {
  return createSeedHistory(items);
}

function mapFeedRowToNewsItem(row: FeedRow) {
  return {
    id: row.id,
    sourceId: row.source_slug,
    sourceName: row.source_name,
    url: row.url,
    title: row.title_original,
    titleKo: row.title_ko ?? row.title_original,
    summary: row.summary_original ?? row.title_original,
    summaryKo: row.summary_ko ?? row.summary_original ?? row.title_original,
    publishedAt: row.published_at,
    lastUpdatedAt: row.updated_at,
    engagement: {
      likes: row.likes_count,
      comments: row.comments_count,
      stars: row.stars_count,
      velocity: Math.round(row.velocity_score),
    },
    crossSignalCount: row.cross_signal_count,
    tags: row.tags ?? [],
    userInterest: row.user_interest ?? "hold",
    predictedInterest: row.predicted_interest
      ? {
          level: row.predicted_interest,
          confidence: 0.78,
          reason:
            row.predicted_interest_reason ?? "저장된 관심 예측 데이터입니다",
        }
      : undefined,
  } satisfies NewsItem;
}

function mapSourceRow(row: SourceRow) {
  return {
    id: row.slug,
    name: row.name,
    domain: row.domain,
    channel: row.channel,
    tier: row.tier,
    rationale: row.rationale ?? "",
  } satisfies SourceDefinition;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
