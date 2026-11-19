import { cn } from "@/lib/utils";

/** Now Line (AC): current-time indicator, stretched to the column width. */
export function NowLine({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      role="presentation"
      style={style}
      className={cn("pointer-events-none absolute right-0 left-0 z-20 flex h-3 -translate-y-1/2 items-center", className)}
    >
      <span className="-ml-1 size-2.5 shrink-0 rounded-full bg-destructive" />
      <span className="h-0.5 flex-1 bg-destructive" />
    </div>
  );
}
