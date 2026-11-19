"use client";

import { useRouter } from "next/navigation";
import { addDays, addWeeks, endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";

import { SHEET_PEEK, ToScheduleSheet } from "@/components/mobile/to-schedule-sheet";
import { WeekStrip } from "@/components/mobile/week-strip";
import { SchedulerDnd } from "@/components/scheduler/scheduler-dnd";
import { TimeGrid } from "@/components/scheduler/time-grid";
import { TaskPanel } from "@/components/tasks/task-panel";
import { tasksToScheduleForWeek } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import { toDateParam } from "@/lib/calendar-view";
import { useCalendarDate, useVisibleEvents } from "@/lib/use-calendar";
import { useIsMobile } from "@/lib/use-media";

/**
 * Week: "To schedule" list with compact suggestions, beside the 7-day time grid.
 * Mobile: a 7-day strip, the selected day's timeline and a "To schedule" bottom sheet.
 */
export function WeekView() {
  const { state, ready } = useStore();
  const { date, today } = useCalendarDate();
  const events = useVisibleEvents();
  const mobile = useIsMobile();
  const router = useRouter();
  if (!ready) return null;

  const weekStartsOn = state.settings.weekStartsOn;
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const tasks = tasksToScheduleForWeek(state.tasks, date, weekStartsOn);
  // New suggestions this week that aren't already proposed on the grid.
  const proposed = new Set(state.events.filter((e) => e.suggested && e.suggestionId).map((e) => e.suggestionId));
  const suggestions = state.suggestions
    .filter((s) => s.status === "new" && isWithinInterval(parseISO(s.start), { start, end }) && !proposed.has(s.id))
    .slice(0, 2);

  const bucket = { kind: "week", weekStart: format(start, "yyyy-MM-dd") } as const;

  if (mobile) {
    const go = (d: Date) => router.replace(`/week?date=${toDateParam(d)}`, { scroll: false });
    return (
      <SchedulerDnd>
        <div className="relative flex h-full min-h-0 flex-col">
          <WeekStrip
            days={days}
            selected={date}
            today={today}
            events={events}
            onSelect={go}
            onPrev={() => go(addWeeks(date, -1))}
            onNext={() => go(addWeeks(date, 1))}
          />
          <section aria-label={format(date, "EEEE, MMMM d")} className="min-h-0 flex-1 overflow-y-auto px-4" style={{ paddingBottom: SHEET_PEEK + 16 }}>
            <TimeGrid
              days={[date]}
              today={today}
              events={events}
              hideHeader
              className="h-auto"
              hourClassName="h-[50px] flex-none"
            />
          </section>
          <ToScheduleSheet title="To schedule" tasks={tasks} bucket={bucket} suggestions={suggestions} />
        </div>
      </SchedulerDnd>
    );
  }

  return (
    <SchedulerDnd>
      <div className="flex h-full min-h-0 flex-col xl:flex-row">
        <TaskPanel
          title="To schedule"
          tasks={tasks}
          bucket={bucket}
          suggestions={suggestions}
        />
        <section aria-label="Week calendar" className="order-1 min-h-[420px] min-w-0 flex-1 p-4 pb-0 xl:order-2 xl:pb-4">
          <TimeGrid days={days} today={today} events={events} />
        </section>
      </div>
    </SchedulerDnd>
  );
}
