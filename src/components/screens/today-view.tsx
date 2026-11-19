"use client";

import { useRouter } from "next/navigation";
import { addDays, differenceInMinutes, format, isSameDay, parseISO } from "date-fns";

import { useSwipe } from "@/components/mobile/use-swipe";
import { PlanCard } from "@/components/ai/plan";
import { SchedulerDnd } from "@/components/scheduler/scheduler-dnd";
import { TimeGrid } from "@/components/scheduler/time-grid";
import { AddTask } from "@/components/tasks/add-task";
import { DraggableWorkTask } from "@/components/tasks/work-task";
import { Progress } from "@/components/ui/progress";
import { eventsOnDay, formatPlanned, tasksForDay, totalMinutes } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import { useCalendarDate, useVisibleEvents } from "@/lib/use-calendar";
import { cn } from "@/lib/utils";

/**
 * Today: the day's plan (capacity, AI plan, to-dos) beside the day's time grid.
 * Mobile shows one of the two: the plan on the Today tab, the timeline in the Calendar tab's Day view.
 */
export function TodayView({ mobile = "plan" }: { mobile?: "plan" | "calendar" }) {
  const { state, ready } = useStore();
  const { date, today } = useCalendarDate();
  const events = useVisibleEvents();
  const router = useRouter();
  // Mobile Day view: swipe between days.
  const go = (d: Date) => router.replace(`/day?date=${format(d, "yyyy-MM-dd")}`, { scroll: false });
  const swipe = useSwipe(
    () => go(addDays(date, -1)),
    () => go(addDays(date, 1)),
  );
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
          className={cn(
            "w-full flex-col gap-4 overflow-y-auto px-4 pt-2 pb-6",
            "md:w-[400px] md:shrink-0 md:gap-6 md:border-r md:border-border md:px-6 md:pt-6 xl:w-[536px] xl:gap-7 xl:px-10 xl:pt-10",
            mobile === "plan" ? "flex" : "hidden md:flex",
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-end">
              <h2 className="text-h4 text-foreground">
                <span className="md:hidden">{format(date, "EEE, MMM d")}</span>
                <span className="hidden md:inline">{heading}</span>
              </h2>
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

        <section
          {...(mobile === "calendar" ? swipe : {})}
          aria-label="Day calendar"
          className={cn(
            "min-w-0 flex-1 overflow-y-auto px-4 pb-4 md:overflow-visible md:px-6 md:pt-6 md:pb-6 xl:px-10 xl:pt-8",
            mobile === "calendar" ? "block" : "hidden md:block",
          )}
        >
          <TimeGrid days={[date]} today={today} events={events} className="h-auto md:h-full" hourClassName="h-[50px] flex-none md:h-auto md:flex-1" />
        </section>
      </div>
    </SchedulerDnd>
  );
}
