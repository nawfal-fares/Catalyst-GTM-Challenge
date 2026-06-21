import { confidenceFramework } from "@/data/market-intelligence";
import { cn } from "@/lib/utils";

const tone = {
  High: "bg-[#2f655d]",
  Medium: "bg-[#c1862f]",
  Low: "bg-[#9d6d67]",
};

export function ConfidencePanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="border border-black/12 bg-white">
      <div className="flex items-end justify-between border-b border-black/10 px-5 py-4">
        <div>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-black/45">
            Confidence framework
          </p>
          <h3 className="mt-1 font-serif text-xl leading-none">What the product knows</h3>
        </div>
        <span className="text-[10px] text-black/40">Method, not certainty</span>
      </div>
      <div className="divide-y divide-black/8">
        {confidenceFramework.map((item) => (
          <div
            key={item.label}
            className={cn(
              "grid gap-2 px-5 py-3",
              compact ? "grid-cols-[1fr_auto]" : "sm:grid-cols-[180px_80px_1fr]",
            )}
          >
            <span className="text-xs font-medium">{item.label}</span>
            <span className="flex items-center gap-2 text-[10px] font-semibold">
              <span className={cn("size-2 rounded-full", tone[item.level])} />
              {item.level}
            </span>
            {!compact && (
              <span className="text-[11px] leading-5 text-black/52">{item.note}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
