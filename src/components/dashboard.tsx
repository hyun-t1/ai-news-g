"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArchiveHistory } from "@/components/archive-history";
import { FilterBar } from "@/components/filter-bar";
import { NewsFeed } from "@/components/news-feed";
import { SourceControlPanel } from "@/components/source-control-panel";
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
        rationale: `반복 노출 ${matchedCandidate.repeatCount}회로 최우선 승격 후보로 채택`,
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
      <main className="stack">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="mini-label">Sync Status</span>
              <h2 className="section-title">실데이터 동기화 상태</h2>
              <p className="section-copy">
                현재 데이터 모드 <strong>{modeLabel(initialData.mode)}</strong>
                {initialData.lastSyncedAt
                  ? ` · 최근 기준 ${formatDateTime(initialData.lastSyncedAt)}`
                  : ""}
              </p>
            </div>

            <button
              className={`action-chip ${isSyncing ? "is-active" : ""}`}
              disabled={
                !initialData.syncEnabled ||
                !initialData.manualSyncEnabled ||
                isSyncing
              }
              onClick={handleSync}
              type="button"
            >
              {initialData.manualSyncEnabled
                ? isSyncing
                  ? "동기화 중..."
                  : "지금 동기화"
                : "배포 후 Cron 자동동기화"}
            </button>
          </div>

          <div className="meta-badges">
            {initialData.collectorStatus.map((status) => (
              <span className="pill" key={status.slug}>
                {status.label} {status.collected}건
              </span>
            ))}
          </div>

          {!initialData.manualSyncEnabled ? (
            <p className="body-copy">
              운영 배포에서는 수동 버튼 대신 Vercel Cron 이 자동으로 수집합니다.
              `CRON_SECRET` 이 설정되면 동기화 API 는 인증된 요청만 허용합니다.
            </p>
          ) : null}
        </section>

        <section className="hero-grid" id="dashboard">
          <div className="panel">
            <span className="eyebrow">Realtime AI Briefing</span>
            <h2 className="hero-title">
              빠르게 쏟아지는 AI 뉴스를
              <br />
              한국어로 정리하고,
              <br />
              관심도까지 바로 기록합니다.
            </h2>
            <p className="lede">
              실시간 핵심 뉴스, 오늘의 하이라이트, 최신 피드, 관심도 예측,
              우선 소스 관리까지 한 화면에서 다루는 개인용 AI 뉴스 레이더입니다.
              Supabase가 연결되면 저장형으로, 아니면 공개 소스 실시간 수집형으로
              동작합니다.
            </p>

            <div className="summary-grid">
              <div className="summary-card">
                <span className="mini-label">실시간 핵심 뉴스</span>
                <strong>{breakingNews.length}</strong>
                <p className="body-copy">
                  최근 1시간 안에 반응 속도가 높은 이슈만 추렸습니다.
                </p>
              </div>
              <div className="summary-card">
                <span className="mini-label">예측 관심 고점</span>
                <strong>{predictedHighInterest.length}</strong>
                <p className="body-copy">
                  혁신 또는 관심으로 예측된 뉴스 수입니다.
                </p>
              </div>
              <div className="summary-card">
                <span className="mini-label">최우선 소스</span>
                <strong>{prioritySources.length}</strong>
                <p className="body-copy">
                  반복 노출 매체는 승격 후보로 자동 제안됩니다.
                </p>
              </div>
            </div>
          </div>

          <aside className="panel">
            <div className="panel-header">
              <div>
                <span className="mini-label">초기 관심사</span>
                <h2 className="section-title">추천 기준 시드</h2>
              </div>
              <span className="status-chip is-active">1인 전용</span>
            </div>

            <div className="meta-badges">
              <span className="pill accent">Claude Mythos</span>
              <span className="pill forest">GitHub Impeccable</span>
              <span className="pill berry">Codex</span>
              <span className="pill gold">클로드코드 업데이트</span>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <span className="mini-label">오늘의 하이라이트</span>
                <strong>{dailyHighlights[0]?.sourceName ?? "없음"}</strong>
                <p className="body-copy">
                  {dailyHighlights[0]?.reason ??
                    "하이라이트 판단에 충분한 데이터가 아직 없습니다."}
                </p>
              </div>
              <div className="metric-card">
                <span className="mini-label">다음 추천 개선</span>
                <strong>행동 기록 누적</strong>
                <p className="body-copy">
                  관심도 변경 시각을 이벤트 로그로 남겨 추천 기준을 계속 조정합니다.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="mini-label">Breaking Now</span>
              <h2 className="section-title">실시간 핵심 뉴스</h2>
              <p className="section-copy">
                단순 최신순이 아니라 최근 1시간 내 반응 속도, 교차 언급량,
                사용자 관심사 적합도를 함께 반영합니다.
              </p>
            </div>
          </div>

          <div className="breaking-grid">
            {breakingNews.map((item) => (
              <article className="highlight-card" key={item.id}>
                <a
                  aria-label={`${item.titleKo} 원문 열기`}
                  className="card-link-overlay"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                />
                <div className="card-layer">
                  <div className="inline-row">
                    <span className="pill accent">{item.sourceName}</span>
                    <span className="pill forest">
                      급상승 {item.engagement.velocity}
                    </span>
                    <span className="pill">
                      {formatDateTime(item.lastUpdatedAt)}
                    </span>
                  </div>
                  <h3>{item.titleKo}</h3>
                  <p className="body-copy">{item.summaryKo}</p>
                  <div className="divider" />
                  <span className="mini-label">추천 이유</span>
                  <p className="body-copy">{item.reason}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="mini-label">Today's Highlight</span>
              <h2 className="section-title">오늘의 하이라이트</h2>
              <p className="section-copy">
                오늘 날짜 기준 가장 뜨겁거나, 사용자가 관심있어 할 가능성이 높은
                소식을 우선 노출합니다.
              </p>
            </div>
          </div>

          <div className="highlight-grid">
            {dailyHighlights.map((item) => (
              <article className="highlight-card" key={item.id}>
                <a
                  aria-label={`${item.titleKo} 원문 열기`}
                  className="card-link-overlay"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                />
                <div className="card-layer">
                  <div className="inline-row">
                    <span className="pill accent">{item.sourceName}</span>
                    <span className="pill berry">
                      예측 {labelForInterest(item.predictedInterest?.level ?? "hold")}
                    </span>
                  </div>
                  <h3>{item.titleKo}</h3>
                  <p className="body-copy">{item.summaryKo}</p>
                  <div className="divider" />
                  <span className="mini-label">한 줄 이유</span>
                  <p className="body-copy">
                    {item.predictedInterest?.level === "interested" ||
                    item.predictedInterest?.level === "breakthrough"
                      ? item.predictedInterest.reason
                      : buildRecommendationReason(item)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-grid" id="feed">
          <div className="panel feed-column">
            <div className="panel-header">
              <div>
                <span className="mini-label">New Feed</span>
                <h2 className="section-title">최신 뉴스 피드</h2>
                <p className="section-copy">
                  추천 여부와 별개로 최신순으로 정렬하고, 바로 관심 단계를 기록할
                  수 있도록 설계했습니다.
                </p>
              </div>
            </div>

            <FilterBar
              activeRange={timeRange}
              onRangeChange={setTimeRange}
              onSearchChange={setSearchQuery}
              searchQuery={searchQuery}
            />

            <NewsFeed
              items={filteredItems}
              onInterestChange={handleInterestChange}
            />
          </div>

          <div className="stack" id="archive">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <span className="mini-label">Archive Buckets</span>
                  <h2 className="section-title">아카이브 상태</h2>
                </div>
              </div>

              <div className="archive-grid">
                <div className="archive-card">
                  <span className="mini-label">관심없음</span>
                  <h3>{archiveCounts.ignore}</h3>
                </div>
                <div className="archive-card">
                  <span className="mini-label">보류</span>
                  <h3>{archiveCounts.hold}</h3>
                </div>
                <div className="archive-card">
                  <span className="mini-label">참고</span>
                  <h3>{archiveCounts.reference}</h3>
                </div>
                <div className="archive-card">
                  <span className="mini-label">관심</span>
                  <h3>{archiveCounts.interested}</h3>
                </div>
                <div className="archive-card">
                  <span className="mini-label">혁신</span>
                  <h3>{archiveCounts.breakthrough}</h3>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <span className="mini-label">Interest Log</span>
                  <h2 className="section-title">관심도 변경 기록</h2>
                  <p className="section-copy">
                    검색 알고리즘 개선을 위해 어떤 뉴스의 관심 단계를 언제 바꿨는지
                    이벤트 단위로 남깁니다.
                  </p>
                </div>
              </div>

              <ArchiveHistory history={history} />
            </section>
          </div>
        </section>

        <section className="panel" id="sources">
          <div className="panel-header">
            <div>
              <span className="mini-label">Source Control</span>
              <h2 className="section-title">최우선 매체 관리</h2>
              <p className="section-copy">
                반복되는 주요 매체는 승격 후보로 올리고, 언제든 강등하거나 수정할
                수 있도록 준비했습니다.
              </p>
            </div>
          </div>

          <SourceControlPanel
            candidates={candidates}
            onDemote={handleDemote}
            onPromote={handlePromote}
            prioritySources={prioritySources}
            watchlistSources={watchlistSources}
          />
        </section>
      </main>
    </AppShell>
  );
}

function modeLabel(mode: DashboardPayload["mode"]) {
  return {
    supabase: "Supabase 저장 데이터",
    live: "공개 소스 실시간 수집",
    demo: "데모 데이터",
  }[mode];
}
