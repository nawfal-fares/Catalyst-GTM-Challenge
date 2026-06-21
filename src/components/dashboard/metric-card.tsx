import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  delta,
  icon: Icon,
  dark = false,
}: {
  label: string;
  value: string;
  detail: string;
  delta?: number;
  icon: LucideIcon;
  dark?: boolean;
}) {
  const PositiveIcon = delta && delta < 0 ? ArrowDownRight : ArrowUpRight;
  return (
    <Card className={cn("overflow-hidden border-black/10 shadow-none", dark && "border-black bg-black text-white")}>
      <CardContent className="p-5">
        <div className="mb-8 flex items-start justify-between">
          <span className={cn("text-xs font-medium text-muted-foreground", dark && "text-white/55")}>{label}</span>
          <span className={cn("grid size-8 place-items-center rounded-full bg-black/5", dark && "bg-white/10")}>
            <Icon className="size-4" />
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-semibold tracking-[-0.04em]">{value}</div>
            <div className={cn("mt-1 text-xs text-muted-foreground", dark && "text-white/55")}>{detail}</div>
          </div>
          {typeof delta === "number" && (
            <span className={cn(
              "flex items-center gap-0.5 rounded-full bg-lime-200 px-2 py-1 text-[10px] font-semibold text-lime-950",
              delta < 0 && "bg-rose-100 text-rose-800",
            )}>
              <PositiveIcon className="size-3" /> {Math.abs(delta)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
