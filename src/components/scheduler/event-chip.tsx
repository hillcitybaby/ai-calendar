import { calendarColorVars, type CalendarColor } from "@/lib/calendars";
import { cn } from "@/lib/utils";

/** Event Chip (AC): all-day and month-view event: color dot + label. */
export function EventChip({
  label,
  color,
  suggested,
  className,
}: {
  label: string;
  color: CalendarColor;
  suggested?: boolean;
  className?: string;
}) {
  return (
    <div
      style={calendarColorVars(color)}
      className={cn(
        "flex h-[22px] min-w-0 items-center gap-1.5 rounded-sm px-2",
        suggested ? "border border-dashed border-muted-foreground bg-(--cal-subtle)" : "bg-(--cal-bg)",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--cal-accent)" />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-(--cal-text)">{label}</span>
    </div>
  );
}
