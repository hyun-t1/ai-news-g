"use client";

import { Search } from "lucide-react";
import { labelForTimeRange } from "@/lib/insight-engine";
import { TimeRangeKey, timeRanges } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-muted/40 p-4">
      <div className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          <Button
            className="rounded-full"
            key={range}
            onClick={() => onRangeChange(range)}
            size="sm"
            type="button"
            variant={range === activeRange ? "default" : "outline"}
          >
            {labelForTimeRange(range)}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="뉴스 검색"
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="키워드, 태그, 소스 이름으로 검색"
          type="search"
          value={searchQuery}
        />
      </div>
    </div>
  );
}
