"use client";

import { differenceInMinutes, format, isSameDay, parseISO } from "date-fns";

import { PlanCard } from "@/components/ai/plan";
import { SchedulerDnd } from "@/components/scheduler/scheduler-dnd";
import { TimeGrid } from "@/components/scheduler/time-grid";
import { AddTask } from "@/components/tasks/add-task";
import { DraggableWorkTask } from "@/components/tasks/work-task";
import { Progress } from "@/components/ui/progress";
import { eventsOnDay, formatPlanned, tasksForDay, totalMinutes } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import { useCalendarDate, useVisibleEvents } from "@/lib/use-calendar";

/** Today: the day's plan (capacity, AI plan, to-dos) beside the day's time grid. */
export function TodayView() {
  const { state, ready } = useStore();
  const { date, today } = useCalendarDate();
  const events = useVisibleEvents();
  if (!ready) return null;

  const key = format(date, "yyyy-MM-dd");
  const tasks = tasksForDay(state.tasks, date);
  const dayEvents = eventsOnDay(events, date);
  // Planned = the day's to-dos plus timed Work events (time-boxed tasks are counted once, as tasks).
  const eventMin = dayEvents
    .filter((e) => !e.allDay && !e.suggested && !e.taskId && e.calendarId === "work")
    .reduce((sum, e) => sum + differenceInMinutes(parseISO(e.end), parseISO(e.start)), 0);
  const plannedMin = totalMinutes(tasks) + eventMin;
  const capacityMin = (state.settings.workingHours.end - state.settings.workingHours.start) * 60;
  const over = plannedMin > capacityMin;
  const plan = state.plans.find((p) => p.date === key && (p.status === "open" || p.status === "reviewing"));
  const pendingSteps = plan?.steps.filter((s) => s.status === "pending").length ?? 0;
  const heading = isSameDay(date, today) ? "Today's plan" : `Plan for ${format(date, "EEEE")}`;

  return (
    <SchedulerDnd>
      <div className="flex h-full min-h-0">
        <section
          aria-label={heading}
          className="flex w-[536px] shrink-0 flex-col gap-7 overflow-y-auto border-r border-border px-10 pt-10 pb-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-end">
              <h2 className="text-h4 text-foreground">{heading}</h2>
              <div className="flex-1" />
              <p className="text-sm font-medium text-muted-foreground">
                {formatPlanned(plannedMin)} of {formatPlanned(capacityMin)} planned
              </p>
            </div>
            <Progress
              value={Math.min(100, (plannedMin / capacityMin) * 100)}
              tone={over ? "over" : "default"}
              aria-label={`${formatPlanned(plannedMin)} of ${formatPlanned(capacityMin)} planned`}
            />
          </div>

          {plan && (
            <PlanCard
              plan={plan}
              subtitle={`${pendingSteps} ${pendingSteps === 1 ? "change" : "changes"} · nothing is saved until you apply`}
            />
          )}

          <div className="flex flex-col gap-3">
            <AddTask bucket={{ kind: "day", date: key }} plannedMin={totalMinutes(tasks)} />
            {tasks.map((t) => (
              <DraggableWorkTask key={t.id} task={t} />
            ))}
          </div>
        </section>

        <section aria-label="Day calendar" className="min-w-0 flex-1 px-10 pt-8 pb-6">
          <TimeGrid days={[date]} today={today} events={events} />
        </section>
      </div>
    </SchedulerDnd>
  );
}
