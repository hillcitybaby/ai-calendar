"use client";

import { format, isSameDay } from "date-fns";

import { eventsOnDay } from "@/lib/schedule";
import type { CalendarEvent } from "@/lib/types";

import { DateNumber, DayDots } from "./day-dots";
import { useSwipe } from "./use-swipe";

/** Mobile Week: seven days with up to three event dots each. Tap a day; swipe to change week. */
export function WeekStrip({
  days,
  selected,
  today,
  events,
  onSelect,
  onPrev,
  onNext,
}: {
  days: Date[];
  selected: Date;
  today: Date;
  events: CalendarEvent[];
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const swipe = useSwipe(onPrev, onNext);
  return (
    <div className="grid shrink-0 grid-cols-7 px-2 pb-2" role="tablist" aria-label="Days this week" {...swipe}>
      {days.map((d) => {
        const on = isSameDay(d, selected);
        return (
          <button
            key={d.toISOString()}
            type="button"
            role="tab"
            aria-selected={on}
            aria-label={format(d, "EEEE, MMMM d")}
            onClick={() => onSelect(d)}
            className="flex flex-col items-center gap-1 rounded-lg py-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="text-xs text-muted-foreground">{format(d, "EEEEE")}</span>
            <DateNumber day={d.getDate()} selected={on} isToday={isSameDay(d, today)} />
            <DayDots events={eventsOnDay(events, d)} />
          </button>
        );
      })}
    </div>
  );
}
