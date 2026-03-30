"use client";

import {
  buildRecommendationReason,
  formatDateTime,
  labelForInterest,
} from "@/lib/insight-engine";
import { InterestLevel, NewsItem, interestLevels } from "@/lib/types";

type NewsFeedProps = {
  items: NewsItem[];
  onInterestChange: (itemId: string, level: InterestLevel) => void;
};

export function NewsFeed({ items, onInterestChange }: NewsFeedProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        선택한 기간에 맞는 뉴스가 없습니다. 범위를 넓히거나 검색어를 조정해 보세요.
      </div>
    );
  }

  return (
    <div className="stack">
      {items.map((item) => (
        <article className="news-card" key={item.id}>
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
              <span className="pill">
                업데이트 {formatDateTime(item.lastUpdatedAt)}
              </span>
              <span className="pill forest">속도 {item.engagement.velocity}</span>
            </div>

            <h3>{item.titleKo}</h3>
            <p className="body-copy">{item.summaryKo}</p>

            <div className="meta-badges">
              {item.tags.map((tag) => (
                <span className="pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="news-footer">
              <span className="interest-badge">
                예측 관심도 {labelForInterest(item.predictedInterest?.level ?? "hold")}
              </span>
              <span className="muted">
                {item.predictedInterest?.level === "interested" ||
                item.predictedInterest?.level === "breakthrough"
                  ? item.predictedInterest.reason
                  : buildRecommendationReason(item)}
              </span>
            </div>

            <div className="divider" />

            <div className="inline-row">
              <span className="mini-label">아카이빙</span>
              <span className="muted">
                클릭 시 관심도와 변경 시각이 함께 기록됩니다
              </span>
            </div>

            <div className="interest-row">
              {interestLevels.map((level) => (
                <button
                  className={`interest-button ${level === item.userInterest ? "is-selected" : ""}`}
                  key={level}
                  onClick={() => onInterestChange(item.id, level)}
                  type="button"
                >
                  {labelForInterest(level)}
                </button>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
