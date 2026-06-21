import type { EvidenceLayer } from "@/data/market-intelligence";
import { cn } from "@/lib/utils";

const labels: Record<EvidenceLayer, { label: string; className: string }> = {
  observed: {
    label: "Observed",
    className: "border-[#1d2827] bg-[#1d2827] text-white",
  },
  derived: {
    label: "Derived",
    className: "border-[#b7781d] bg-[#fff8e8] text-[#7b4b05]",
  },
  seeded: {
    label: "Seeded",
    className: "border-[#7766a9] bg-[#f5f1ff] text-[#55447f]",
  },
};

export function EvidenceLabel({
  layer,
  className,
}: {
  layer: EvidenceLayer;
  className?: string;
}) {
  const item = labels[layer];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center justify-self-start rounded-full border px-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
        item.className,
        className,
      )}
    >
      {item.label}
    </span>
  );
}
