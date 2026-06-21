import { formatCompact } from "@/lib/dashboard";

export function RankedBars({
  items,
  valueKey = "engagementRate",
  suffix = "%",
}: {
  items: Array<{ label: string; engagementRate: number; impressions: number; posts: number }>;
  valueKey?: "engagementRate" | "impressions";
  suffix?: string;
}) {
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  return (
    <div className="space-y-5">
      {items.slice(0, 5).map((item, index) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-4 text-xs">
            <span className="flex min-w-0 items-center gap-2 font-medium">
              <span className="text-muted-foreground">0{index + 1}</span>
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {valueKey === "engagementRate"
                ? `${item.engagementRate}${suffix}`
                : formatCompact(item.impressions)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/6">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${Math.max(8, (item[valueKey] / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
