import type { ReactNode } from "react";
import { BrainCircuit, FolderArchive, Newspaper, Radar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "#dashboard", label: "대시보드", icon: Radar },
  { href: "#feed", label: "New Feed", icon: Newspaper },
  { href: "#archive", label: "아카이브", icon: FolderArchive },
  { href: "#sources", label: "소스 관리", icon: Sparkles },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <header className="sticky top-4 z-30 mb-6 overflow-hidden rounded-3xl border border-border/70 bg-background/85 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <BrainCircuit className="size-5" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">AI News Radar</h1>
                <Badge variant="secondary">1인용 AI 뉴스 워크벤치</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                글로벌 AI 뉴스를 수집하고, 한국어로 빠르게 훑고, 관심도를 기록하는 개인 대시보드
              </p>
            </div>
          </div>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <a
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/60 hover:text-foreground"
                href={href}
                key={href}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
