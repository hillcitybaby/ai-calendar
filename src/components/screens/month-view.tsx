"use client";

import Link from "next/link";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { EventChip } from "@/components/scheduler/event-chip";
import { SchedulerDnd } from "@/components/scheduler/scheduler-dnd";
import { TaskPanel } from "@/components/tasks/task-panel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { calendarColor } from "@/lib/calendars";
import { eventsOnDay, tasksForMonth } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { CalendarEvent } from "@/lib/types";
import { useCalendarDate, useVisibleEvents } from "@/lib/use-calendar";
import { cn } from "@/lib/utils";

const MAX_CHIPS = 3;

/** The weeks covering a month (5 or 6, sometimes 4), starting on the configured week start. */
export function monthGrid(date: Date, weekStartsOn: 0 | 1) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

/** Month: "This month" list beside a 6-week grid of Event Chips. */
export function MonthView() {
  const { state, ready } = useStore();
  const { date, today } = useCalendarDate();
  const events = useVisibleEvents();
  if (!ready) return null;

  const weekStartsOn = state.settings.weekStartsOn;
  const days = monthGrid(date, weekStartsOn);
  const tasks = tasksForMonth(state.tasks, date);

  return (
    <SchedulerDnd>
      <div className="flex h-full min-h-0">
        <TaskPanel title="This month" tasks={tasks} bucket={{ kind: "month", month: format(date, "yyyy-MM") }} />
        <section aria-label="Month calendar" className="flex min-w-0 flex-1 p-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background">
            <div className="grid shrink-0 grid-cols-7" role="row">
              {days.slice(0, 7).map((d) => (
                <div key={d.toISOString()} role="columnheader" className="py-1.5 text-center text-xs font-medium text-muted-foreground">
                  {format(d, "EEE")}
                </div>
              ))}
            </div>
            <div
              className="grid min-h-0 flex-1 grid-cols-7"
              style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))` }}
              role="grid"
              aria-label={format(date, "MMMM yyyy")}
            >
              {days.map((d) => (
                <MonthCell
                  key={d.toISOString()}
                  day={d}
                  inMonth={isSameMonth(d, date)}
                  isToday={isSameDay(d, today)}
                  events={eventsOnDay(events, d).sort(
                    (a, b) => Number(!a.allDay) - Number(!b.allDay) || a.start.localeCompare(b.start),
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </SchedulerDnd>
  );
}

function MonthCell({
  day,
  inMonth,
  isToday,
  events,
}: {
  day: Date;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}) {
  const shown = events.slice(0, MAX_CHIPS);
  const more = events.length - shown.length;
  return (
    <div
      role="gridcell"
      aria-label={`${format(day, "EEEE, MMMM d")}${events.length ? `, ${events.length} events` : ""}`}
      className={cn(
        "flex min-h-0 min-w-0 flex-col gap-1 overflow-hidden border-t border-l border-border p-1.5 [&:nth-child(7n+1)]:border-l-0",
        !inMonth && "bg-muted/60",
      )}
    >
      <Link
        href={`/today?date=${format(day, "yyyy-MM-dd")}`}
        className={cn(
          "flex size-[22px] items-center justify-center rounded-full text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground hover:bg-accent" : "text-muted-foreground hover:bg-accent",
        )}
        aria-label={`Open ${format(day, "EEEE, MMMM d")}`}
      >
        {format(day, "d")}
      </Link>
      {inMonth &&
        shown.map((e) => (
          <EventChip key={e.id} label={e.title} color={calendarColor(e.calendarId)} suggested={e.suggested} />
        ))}
      {inMonth && more > 0 && (
        <Popover>
          <PopoverTrigger className="self-start rounded-sm px-1 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50">
            +{more} more
          </PopoverTrigger>
          <PopoverContent align="start" className="flex w-60 flex-col gap-1 p-2">
            <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">{format(day, "EEEE, MMMM d")}</p>
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <EventChip label={e.title} color={calendarColor(e.calendarId)} suggested={e.suggested} className="flex-1" />
                {!e.allDay && (
                  <span className="shrink-0 text-xs text-muted-foreground">{format(parseISO(e.start), "h:mm a")}</span>
                )}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
