"use client";

import { labelForTimeRange } from "@/lib/insight-engine";
import { TimeRangeKey, timeRanges } from "@/lib/types";

type FilterBarProps = {
  activeRange: TimeRangeKey;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRangeChange: (value: TimeRangeKey) => void;
};

export function FilterBar({
  activeRange,
  searchQuery,
  onSearchChange,
  onRangeChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-actions">
        {timeRanges.map((range) => (
          <button
            key={range}
            className={`range-button ${range === activeRange ? "is-active" : ""}`}
            onClick={() => onRangeChange(range)}
            type="button"
          >
            {labelForTimeRange(range)}
          </button>
        ))}
      </div>

      <input
        aria-label="뉴스 검색"
        className="search-box"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="키워드, 소스, 태그로 검색"
        type="search"
        value={searchQuery}
      />
    </div>
  );
}
