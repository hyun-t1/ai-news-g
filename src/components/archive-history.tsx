import { ArrowRight } from "lucide-react";
import { formatDateTime, labelForInterest } from "@/lib/insight-engine";
import { RatingEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type ArchiveHistoryProps = {
  history: RatingEvent[];
};

export function ArchiveHistory({ history }: ArchiveHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        아직 관심도 변경 기록이 없습니다. 뉴스를 분류하면 여기에 바로 쌓입니다.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[26rem] rounded-2xl border border-border/70 bg-background/70">
      <div className="space-y-3 p-4">
        {history.map((event) => (
          <div
            className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
            key={event.id}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{formatDateTime(event.changedAt)}</Badge>
              <Badge className="gap-1" variant="secondary">
                {labelForInterest(event.from)}
                <ArrowRight className="size-3" />
                {labelForInterest(event.to)}
              </Badge>
            </div>
            <p className="text-sm leading-6 text-foreground">{event.itemTitle}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
