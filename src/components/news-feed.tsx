"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import {
  buildRecommendationReason,
  formatDateTime,
  labelForInterest,
} from "@/lib/insight-engine";
import { InterestLevel, NewsItem, interestLevels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type NewsFeedProps = {
  items: NewsItem[];
  onInterestChange: (itemId: string, level: InterestLevel) => void;
};

export function NewsFeed({ items, onInterestChange }: NewsFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        선택한 조건에 맞는 뉴스가 없습니다. 기간을 넓히거나 검색어를 바꿔보세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const recommendation =
          item.predictedInterest?.level === "interested" ||
          item.predictedInterest?.level === "breakthrough"
            ? item.predictedInterest.reason
            : buildRecommendationReason(item);

        return (
          <Card className="border-border/70 shadow-sm" key={item.id}>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{item.sourceName}</Badge>
                  <Badge variant="outline">업데이트 {formatDateTime(item.lastUpdatedAt)}</Badge>
                  <Badge variant="outline">속도 {item.engagement.velocity}</Badge>
                </div>
                <a
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  원문
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl leading-8">{item.titleKo}</CardTitle>
                <CardDescription className="text-sm leading-7 text-muted-foreground">
                  {item.summaryKo}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="rounded-2xl bg-muted/35 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    예측 관심도 {labelForInterest(item.predictedInterest?.level ?? "hold")}
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{recommendation}</p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">아카이빙</p>
                  <p className="text-xs text-muted-foreground">
                    클릭 즉시 관심도와 변경 시각이 기록됩니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestLevels.map((level) => (
                    <Button
                      className="rounded-full"
                      key={level}
                      onClick={() => onInterestChange(item.id, level)}
                      size="sm"
                      type="button"
                      variant={level === item.userInterest ? "default" : "outline"}
                    >
                      {labelForInterest(level)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
