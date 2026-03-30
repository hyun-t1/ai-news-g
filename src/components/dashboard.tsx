"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Flame,
  RefreshCcw,
  Sparkles,
  Star,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ArchiveHistory } from "@/components/archive-history";
import { FilterBar } from "@/components/filter-bar";
import { NewsFeed } from "@/components/news-feed";
import { SourceControlPanel } from "@/components/source-control-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  buildBreakingNews,
  buildDailyHighlights,
  buildRecommendationReason,
  filterNewsByRange,
  formatDateTime,
  groupArchiveCounts,
  labelForInterest,
} from "@/lib/insight-engine";
import { promotionCandidates } from "@/lib/source-registry";
import {
  DashboardPayload,
  InterestLevel,
  PromotionCandidate,
  SourceDefinition,
  TimeRangeKey,
} from "@/lib/types";

type DashboardProps = {
  initialData: DashboardPayload;
};

const seedTopics = ["Claude Mythos", "GitHub Impeccable", "Codex", "클로드코드 업데이트"];

export function Dashboard({ initialData }: DashboardProps) {
  const router = useRouter();
  const [isSyncing, startSyncTransition] = useTransition();
  const [items, setItems] = useState(initialData.items);
  const [history, setHistory] = useState(initialData.history);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [sources, setSources] = useState<SourceDefinition[]>(initialData.sources);
  const [candidates, setCandidates] =
    useState<PromotionCandidate[]>(promotionCandidates);

  useEffect(() => {
    setItems(initialData.items);
    setHistory(initialData.history);
    setSources(initialData.sources);
  }, [initialData]);

  const filteredByRange = filterNewsByRange(items, timeRange);
  const filteredItems = filteredByRange.filter((item) => {
    const haystack =
      `${item.titleKo} ${item.summaryKo} ${item.sourceName} ${item.tags.join(" ")}`.toLowerCase();

    return haystack.includes(searchQuery.toLowerCase());
  });

  const breakingNews = buildBreakingNews(items);
  const dailyHighlights = buildDailyHighlights(items);
  const archiveCounts = groupArchiveCounts(items);
  const prioritySources = sources.filter((source) => source.tier === "priority");
  const watchlistSources = sources.filter((source) => source.tier === "watchlist");
  const predictedHighInterest = items.filter(
    (item) =>
      item.predictedInterest?.level === "interested" ||
      item.predictedInterest?.level === "breakthrough",
  );

  function handleInterestChange(itemId: string, nextLevel: InterestLevel) {
    let changedItemTitle = "";
    let previousLevel: InterestLevel = "hold";
    const nextTimestamp = new Date().toISOString();

    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        changedItemTitle = item.titleKo;
        previousLevel = item.userInterest;

        return {
          ...item,
          userInterest: nextLevel,
        };
      }),
    );

    setHistory((current) => [
      {
        id: `event-${itemId}-${nextTimestamp}`,
        itemId,
        itemTitle: changedItemTitle,
        from: previousLevel,
        to: nextLevel,
        changedAt: nextTimestamp,
      },
      ...current,
    ]);

    fetch("/api/news/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newsItemId: itemId,
        nextLevel,
      }),
    }).catch(() => null);
  }

  function handlePromote(candidateId: string) {
    const matchedCandidate = candidates.find((candidate) => candidate.id === candidateId);

    if (!matchedCandidate) {
      return;
    }

    setSources((current) => [
      ...current,
      {
        id: matchedCandidate.id,
        name: matchedCandidate.name,
        domain: matchedCandidate.domain,
        channel: "watch",
        tier: "priority",
        rationale: `반복 노출 ${matchedCandidate.repeatCount}회로 최우선 후보에 올렸습니다.`,
      },
    ]);

    setCandidates((current) =>
      current.filter((candidate) => candidate.id !== candidateId),
    );
  }

  function handleDemote(sourceId: string) {
    setSources((current) =>
      current.map((source) =>
        source.id === sourceId ? { ...source, tier: "watchlist" } : source,
      ),
    );
  }

  function handleSync() {
    startSyncTransition(async () => {
      await fetch("/api/news/sync", {
        method: "POST",
      }).catch(() => null);
      router.refresh();
    });
  }

  return (
    <AppShell>
      <main className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]" id="dashboard">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Realtime AI Briefing</Badge>
                <Badge variant="outline">{modeLabel(initialData.mode)}</Badge>
                {initialData.lastSyncedAt ? (
                  <Badge variant="outline">
                    최근 수집 {formatDateTime(initialData.lastSyncedAt)}
                  </Badge>
                ) : null}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <CardTitle className="text-4xl leading-tight sm:text-5xl">
                      빠르게 쏟아지는 AI 뉴스를
                      <br />
                      한국어로 정리하고,
                      <br />
                      관심도까지 바로 기록합니다.
                    </CardTitle>
                    <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground">
                      실시간 핵심 뉴스, 오늘의 하이라이트, 최신 피드, 관심도 아카이빙,
                      주요 소스 관리까지 한 화면에서 볼 수 있게 구성했습니다.
                    </CardDescription>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="실시간 핵심 뉴스"
                      value={String(breakingNews.length)}
                      description="최근 1시간 기준으로 반응 속도가 높은 뉴스만 압축합니다."
                      icon={Flame}
                    />
                    <MetricCard
                      label="고관심 예측"
                      value={String(predictedHighInterest.length)}
                      description="혁신 또는 관심으로 예측된 뉴스를 빠르게 확인할 수 있습니다."
                      icon={Sparkles}
                    />
                    <MetricCard
                      label="최우선 소스"
                      value={String(prioritySources.length)}
                      description="자주 등장하는 핵심 매체를 최우선 리스트로 관리합니다."
                      icon={Star}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/35 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Badge variant="outline">Sync Status</Badge>
                      <h2 className="text-lg font-semibold">수집 상태</h2>
                      <p className="text-sm leading-6 text-muted-foreground">
                        운영 배포에서는 Cron 기반 자동 수집을 기본으로 사용합니다.
                      </p>
                    </div>
                    <Button
                      disabled={
                        !initialData.syncEnabled ||
                        !initialData.manualSyncEnabled ||
                        isSyncing
                      }
                      onClick={handleSync}
                      size="sm"
                      type="button"
                      variant={initialData.manualSyncEnabled ? "default" : "outline"}
                    >
                      <RefreshCcw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
                      {initialData.manualSyncEnabled
                        ? isSyncing
                          ? "동기화 중"
                          : "지금 동기화"
                        : "Cron 자동 동기화"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {initialData.collectorStatus.map((status) => (
                      <Badge className="rounded-full" key={status.slug} variant="outline">
                        {status.label} {status.collected}건
                      </Badge>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    {!initialData.manualSyncEnabled ? (
                      <p className="text-sm leading-6 text-muted-foreground">
                        운영 환경에서는 수동 버튼 대신 Vercel Cron이 `/api/news/sync`를 호출합니다.
                        `CRON_SECRET`이 있으면 인증된 요청만 허용됩니다.
                      </p>
                    ) : null}

                    {initialData.mode === "demo" ? (
                      <p className="text-sm leading-6 text-muted-foreground">
                        첫 배포 직후에는 데모 데이터가 먼저 보일 수 있습니다. 이후 Cron 또는
                        수동 sync가 실행되면 Supabase 저장 데이터로 전환됩니다.
                      </p>
                    ) : null}

                    <div className="rounded-2xl bg-background/80 p-4">
                      <p className="mb-2 text-sm font-medium text-foreground">초기 관심 시드</p>
                      <div className="flex flex-wrap gap-2">
                        {seedTopics.map((topic) => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">추천 시드</Badge>
                <Badge variant="outline">초기 설정 반영</Badge>
              </div>
              <CardTitle>오늘 가장 먼저 볼 만한 포인트</CardTitle>
              <CardDescription>
                당신이 관심 가질 확률이 높은 주제와 오늘의 대표 뉴스 흐름을 한 번에 보여줍니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-muted/35 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Flame className="size-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">오늘의 대표 소스</p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {dailyHighlights[0]?.sourceName ?? "아직 없음"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {dailyHighlights[0]?.reason ??
                    "하이라이트를 계산할 만큼 충분한 데이터가 아직 모이지 않았습니다."}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/35 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BrainCircuit className="size-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">다음 추천 개선 포인트</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  관심도 변경 시각과 선택 로그가 누적되면서 예측 이유와 추천 우선순위가 더 정교해집니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>실시간 핵심 뉴스</CardTitle>
              <CardDescription>
                최근 1시간 기준으로 반응 속도, 교차 언급 수, 관심사 적합도를 함께 반영합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {breakingNews.map((item) => (
                <StoryCard
                  key={item.id}
                  kicker={item.sourceName}
                  metadata={[
                    `속도 ${item.engagement.velocity}`,
                    formatDateTime(item.lastUpdatedAt),
                  ]}
                  reason={item.reason}
                  summary={item.summaryKo}
                  title={item.titleKo}
                  url={item.url}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>오늘의 하이라이트</CardTitle>
              <CardDescription>
                오늘 날짜 기준으로 가장 뜨겁거나, 당신이 특히 좋아할 가능성이 높은 뉴스를 추천합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {dailyHighlights.map((item) => (
                <StoryCard
                  key={item.id}
                  kicker={`${item.sourceName} · 예측 ${labelForInterest(item.predictedInterest?.level ?? "hold")}`}
                  metadata={[formatDateTime(item.lastUpdatedAt)]}
                  reason={
                    item.predictedInterest?.level === "interested" ||
                    item.predictedInterest?.level === "breakthrough"
                      ? item.predictedInterest.reason
                      : buildRecommendationReason(item)
                  }
                  summary={item.summaryKo}
                  title={item.titleKo}
                  url={item.url}
                />
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.55fr_0.95fr]" id="feed">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>New Feed</CardTitle>
              <CardDescription>
                추천 여부와 관계없이 최신순으로 정렬하고, 바로 관심 단계를 지정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilterBar
                activeRange={timeRange}
                onRangeChange={setTimeRange}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
              />
              <NewsFeed items={filteredItems} onInterestChange={handleInterestChange} />
            </CardContent>
          </Card>

          <div className="space-y-4" id="archive">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>아카이브 상태</CardTitle>
                <CardDescription>
                  클릭 한 번으로 나눈 관심도 버킷 현황입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <ArchiveCountCard label="관심없음" value={archiveCounts.ignore} />
                <ArchiveCountCard label="보류" value={archiveCounts.hold} />
                <ArchiveCountCard label="참고" value={archiveCounts.reference} />
                <ArchiveCountCard label="관심" value={archiveCounts.interested} />
                <ArchiveCountCard label="혁신" value={archiveCounts.breakthrough} />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>관심도 변경 기록</CardTitle>
                <CardDescription>
                  추천 알고리즘 개선을 위해 뉴스별 관심도 변경 시각을 이벤트로 남깁니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArchiveHistory history={history} />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="sources">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>최우선 매체 관리</CardTitle>
              <CardDescription>
                자주 반복되는 중요한 매체를 승격하고, 필요하면 언제든 강등하거나 watchlist로 이동할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SourceControlPanel
                candidates={candidates}
                onDemote={handleDemote}
                onPromote={handlePromote}
                prioritySources={prioritySources}
                watchlistSources={watchlistSources}
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}

function modeLabel(mode: DashboardPayload["mode"]) {
  return {
    supabase: "Supabase 저장 데이터",
    live: "실시간 공개 소스",
    demo: "데모 데이터",
  }[mode];
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Badge variant="outline">{label}</Badge>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function StoryCard({
  kicker,
  title,
  summary,
  reason,
  metadata,
  url,
}: {
  kicker: string;
  title: string;
  summary: string;
  reason: string;
  metadata: string[];
  url: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-muted/25 p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">{kicker}</Badge>
        <a
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          원문
          <ArrowUpRight className="size-4" />
        </a>
      </div>
      <h3 className="text-lg font-semibold leading-7 text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
      <Separator className="my-4" />
      <p className="text-sm leading-6 text-foreground">{reason}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {metadata.map((entry) => (
          <Badge key={entry} variant="outline">
            {entry}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ArchiveCountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
