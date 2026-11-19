"use client";

import { addDays, endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";

import { SchedulerDnd } from "@/components/scheduler/scheduler-dnd";
import { TimeGrid } from "@/components/scheduler/time-grid";
import { TaskPanel } from "@/components/tasks/task-panel";
import { tasksToScheduleForWeek } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import { useCalendarDate, useVisibleEvents } from "@/lib/use-calendar";

/** Week: "To schedule" list with compact suggestions, beside the 7-day time grid. */
export function WeekView() {
  const { state, ready } = useStore();
  const { date, today } = useCalendarDate();
  const events = useVisibleEvents();
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

  return (
    <SchedulerDnd>
      <div className="flex h-full min-h-0">
        <TaskPanel
          title="To schedule"
          tasks={tasks}
          bucket={{ kind: "week", weekStart: format(start, "yyyy-MM-dd") }}
          suggestions={suggestions}
        />
        <section aria-label="Week calendar" className="min-w-0 flex-1 p-4">
          <TimeGrid days={days} today={today} events={events} />
        </section>
      </div>
    </SchedulerDnd>
  );
}
