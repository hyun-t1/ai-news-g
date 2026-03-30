"use client";

import { PromotionCandidate, SourceDefinition } from "@/lib/types";

type SourceControlPanelProps = {
  prioritySources: SourceDefinition[];
  watchlistSources: SourceDefinition[];
  candidates: PromotionCandidate[];
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
};

export function SourceControlPanel({
  prioritySources,
  watchlistSources,
  candidates,
  onPromote,
  onDemote,
}: SourceControlPanelProps) {
  return (
    <div className="stack">
      <div className="source-grid">
        <section className="source-card">
          <span className="mini-label">최우선 매체</span>
          <h3>즉시 반응이 필요한 소스</h3>
          <p className="body-copy">
            우선 수집 대상입니다. X, GitHub, Reddit, Claude, Codex, ChatGPT,
            OpenAI, Anthropic을 기본 탑재했습니다.
          </p>

          <div className="stack">
            {prioritySources.map((source) => (
              <div className="history-item" key={source.id}>
                <div className="inline-row">
                  <span className="priority-badge priority">{source.name}</span>
                  <span className="pill">{source.domain}</span>
                </div>
                <p className="body-copy">{source.rationale}</p>
                <div className="source-actions">
                  <button
                    className="action-chip"
                    onClick={() => onDemote(source.id)}
                    type="button"
                  >
                    강등
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="source-card">
          <span className="mini-label">추가 관찰</span>
          <h3>반복 노출 매체와 승격 후보</h3>
          <p className="body-copy">
            특정 매체가 자주 반복되면 승격 후보로 띄우고, 이후 최우선 매체로
            올릴지 확인하도록 설계했습니다.
          </p>

          <div className="stack">
            {candidates.map((candidate) => (
              <div className="history-item" key={candidate.id}>
                <div className="inline-row">
                  <span className="pill gold">
                    반복 노출 {candidate.repeatCount}회
                  </span>
                  <span className="pill">{candidate.name}</span>
                </div>
                <p className="body-copy">{candidate.reason}</p>
                <div className="source-actions">
                  <button
                    className="action-chip is-active"
                    onClick={() => onPromote(candidate.id)}
                    type="button"
                  >
                    최우선으로 승격
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <span className="mini-label">보조 관찰 소스</span>
          <div className="inline-row">
            {watchlistSources.map((source) => (
              <span className="pill berry" key={source.id}>
                {source.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
