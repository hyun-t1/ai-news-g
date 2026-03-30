"use client";

import { ArrowDownRight, ArrowUpRight, Pin, Radar } from "lucide-react";
import { PromotionCandidate, SourceDefinition } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">최우선 소스</Badge>
            <Badge variant="outline">{prioritySources.length}개</Badge>
          </div>
          <CardTitle>즉시 체크할 핵심 매체</CardTitle>
          <CardDescription>
            반응 속도가 빠르고, 제품 및 릴리스 업데이트가 자주 올라오는 소스입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {prioritySources.map((source) => (
            <div
              className="rounded-2xl border border-border/70 bg-muted/30 p-4"
              key={source.id}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="gap-1" variant="default">
                  <Pin className="size-3" />
                  {source.name}
                </Badge>
                <Badge variant="outline">{source.domain}</Badge>
              </div>
              <p className="mb-3 text-sm leading-6 text-muted-foreground">
                {source.rationale}
              </p>
              <Button
                onClick={() => onDemote(source.id)}
                size="sm"
                type="button"
                variant="outline"
              >
                <ArrowDownRight className="size-4" />
                watchlist로 내리기
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">승격 후보</Badge>
            <Badge variant="outline">{candidates.length}개</Badge>
          </div>
          <CardTitle>반복 노출 소스 관리</CardTitle>
          <CardDescription>
            자주 등장하는 소스는 우선 승격 후보로 올리고, 필요할 때 최우선으로 올립니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div
                className="rounded-2xl border border-border/70 bg-muted/30 p-4"
                key={candidate.id}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="gap-1" variant="secondary">
                    <Radar className="size-3" />
                    반복 노출 {candidate.repeatCount}회
                  </Badge>
                  <Badge variant="outline">{candidate.name}</Badge>
                </div>
                <p className="mb-3 text-sm leading-6 text-muted-foreground">
                  {candidate.reason}
                </p>
                <Button
                  onClick={() => onPromote(candidate.id)}
                  size="sm"
                  type="button"
                >
                  <ArrowUpRight className="size-4" />
                  최우선으로 승격
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">watchlist</p>
            <div className="flex flex-wrap gap-2">
              {watchlistSources.map((source) => (
                <Badge key={source.id} variant="outline">
                  {source.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
