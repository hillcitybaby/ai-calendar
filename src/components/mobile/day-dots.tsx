import { calendarColor, calendarColorVars } from "@/lib/calendars";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Up to three event dots under a date (mobile week strip and month grid), in calendar colors. */
export function DayDots({ events, className }: { events: CalendarEvent[]; className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-1 items-center justify-center gap-0.5", className)}>
      {events.slice(0, 3).map((e) => (
        <span key={e.id} style={calendarColorVars(calendarColor(e.calendarId))} className="size-1 rounded-full bg-(--cal-accent)" />
      ))}
    </span>
  );
}

/** The date number: a filled circle when selected, bold when it's today. */
export function DateNumber({
  day,
  selected,
  isToday,
  muted,
}: {
  day: number;
  selected: boolean;
  isToday: boolean;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-base",
        selected
          ? "bg-primary font-medium text-primary-foreground"
          : cn(isToday ? "font-semibold text-foreground" : "text-foreground", muted && "text-muted-foreground"),
      )}
    >
      {day}
    </span>
  );
}
