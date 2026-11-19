"use client";

import { format, isSameDay, isSameMonth, parseISO } from "date-fns";

import { calendarColor, calendarColorVars } from "@/lib/calendars";
import { eventsOnDay, formatTimeRange } from "@/lib/schedule";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

import { DateNumber, DayDots } from "./day-dots";
import { useSwipe } from "./use-swipe";

/** Mobile Month: a compact grid of dates with event dots, then the selected day's agenda. */
export function MonthAgenda({
  days,
  month,
  selected,
  today,
  events,
  onSelect,
  onPrev,
  onNext,
}: {
  days: Date[];
  month: Date;
  selected: Date;
  today: Date;
  events: CalendarEvent[];
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const swipe = useSwipe(onPrev, onNext);
  const agenda = eventsOnDay(events, selected).sort(
    (a, b) => Number(!a.allDay) - Number(!b.allDay) || a.start.localeCompare(b.start),
  );
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div {...swipe} className="shrink-0 px-2">
        <div className="grid grid-cols-7" role="row">
          {days.slice(0, 7).map((d) => (
            <div key={d.toISOString()} role="columnheader" className="py-1 text-center text-xs text-muted-foreground">
              <abbr title={format(d, "EEEE")} className="no-underline">
                {format(d, "EEEEE")}
              </abbr>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7" role="grid" aria-label={format(month, "MMMM yyyy")}>
          {days.map((d) => {
            const inMonth = isSameMonth(d, month);
            const on = isSameDay(d, selected);
            return (
              <button
                key={d.toISOString()}
                type="button"
                role="gridcell"
                aria-selected={on}
                aria-label={format(d, "EEEE, MMMM d")}
                onClick={() => onSelect(d)}
                className="flex h-[47px] flex-col items-center gap-0.5 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <DateNumber day={d.getDate()} selected={on} isToday={isSameDay(d, today)} muted={!inMonth} />
                {inMonth && <DayDots events={eventsOnDay(events, d)} />}
              </button>
            );
          })}
        </div>
      </div>

      <section aria-label={format(selected, "EEEE, MMMM d")} className="mx-4 mt-2 flex flex-col gap-3 border-t border-border pt-4 pb-6">
        <h2 className="text-sm font-medium text-foreground">{format(selected, "EEE, MMM d")}</h2>
        {agenda.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled</p>}
        <ul className="flex flex-col gap-3">
          {agenda.map((e) => (
            <AgendaRow key={e.id} e={e} />
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Agenda row: time, a calendar-colored bar (dashed for suggested), title and time range. */
function AgendaRow({ e }: { e: CalendarEvent }) {
  return (
    <li style={calendarColorVars(calendarColor(e.calendarId))} className="flex items-stretch gap-3">
      <span className="w-[72px] shrink-0 pt-0.5 text-xs text-muted-foreground">
        {e.allDay ? "All day" : format(parseISO(e.start), "h:mm a")}
      </span>
      <span
        aria-hidden
        className={cn(
          "w-0 shrink-0 border-l-[3px]",
          e.suggested ? "border-dashed border-(color:--cal-accent)" : "rounded-full border-(color:--cal-accent)",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {e.title}
          {e.suggested && <span className="font-normal text-muted-foreground"> · suggested</span>}
        </span>
        {!e.allDay && <span className="text-xs text-muted-foreground">{formatTimeRange(e.start, e.end)}</span>}
      </span>
    </li>
  );
}
