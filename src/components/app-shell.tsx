import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">AIR</div>
          <div className="brand-copy">
            <h1>AI News Radar</h1>
            <p>개인용 글로벌 AI 뉴스 수집 · 번역 · 아카이빙 허브</p>
          </div>
        </div>

        <nav aria-label="Primary" className="nav-links">
          <a className="nav-chip" href="#dashboard">
            대시보드
          </a>
          <a className="nav-chip" href="#feed">
            New Feed
          </a>
          <a className="nav-chip" href="#archive">
            아카이브
          </a>
          <a className="nav-chip" href="#sources">
            소스 관리
          </a>
        </nav>
      </header>

      {children}
    </div>
  );
}
