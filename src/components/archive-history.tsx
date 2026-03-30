import { formatDateTime, labelForInterest } from "@/lib/insight-engine";
import { RatingEvent } from "@/lib/types";

type ArchiveHistoryProps = {
  history: RatingEvent[];
};

export function ArchiveHistory({ history }: ArchiveHistoryProps) {
  return (
    <div className="history-list">
      {history.map((event) => (
        <div className="history-item" key={event.id}>
          <div className="inline-row">
            <span className="pill">{formatDateTime(event.changedAt)}</span>
            <span className="pill forest">
              {labelForInterest(event.from)} → {labelForInterest(event.to)}
            </span>
          </div>
          <p className="body-copy">{event.itemTitle}</p>
        </div>
      ))}
    </div>
  );
}
