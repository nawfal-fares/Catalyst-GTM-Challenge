import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: "taking-off" | "steady" | "slowing" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-0 px-2 py-1 text-[10px] font-semibold",
        status === "taking-off" && "bg-lime-200 text-lime-950",
        status === "steady" && "bg-sky-100 text-sky-800",
        status === "slowing" && "bg-stone-200 text-stone-700",
      )}
    >
      <span className="mr-1 size-1.5 rounded-full bg-current" />
      {status === "taking-off" ? "Taking off" : status === "slowing" ? "Slowing" : "Steady"}
    </Badge>
  );
}
