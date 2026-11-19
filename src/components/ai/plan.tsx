"use client";

import { Clock, Plus, X, type LucideIcon } from "lucide-react";

import { AssistantMark } from "@/components/assistant/assistant-mark";
import { Button } from "@/components/ui/button";
import { calendarColorVars, type CalendarColor } from "@/lib/calendars";
import { useStore } from "@/lib/store";
import type { DayPlan, PlanStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const CHANGE: Record<PlanStep["change"], { icon: LucideIcon; color: CalendarColor; label: string }> = {
  add: { icon: Plus, color: "emerald", label: "Add" },
  move: { icon: Clock, color: "blue", label: "Move" },
  remove: { icon: X, color: "slate", label: "Remove" },
};

/** Plan Step (AC): one proposed change. Change = Add / Move / Remove. */
export function PlanStepRow({
  step,
  reviewing,
  onApply,
  onSkip,
}: {
  step: PlanStep;
  reviewing?: boolean;
  onApply?: () => void;
  onSkip?: () => void;
}) {
  const c = CHANGE[step.change];
  const Icon = c.icon;
  const settled = step.status !== "pending";
  return (
    <li className={cn("flex items-center gap-3 rounded-md p-2", settled && "opacity-50")}>
      <span
        style={calendarColorVars(c.color)}
        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-(--cal-bg) text-(--cal-text)"
      >
        <Icon className="size-3.5" aria-label={c.label} role="img" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{step.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {step.detail}
          {step.status === "applied" && " · applied"}
          {step.status === "skipped" && " · skipped"}
        </span>
      </span>
      {reviewing && !settled && (
        <span className="flex shrink-0 gap-1">
          <Button size="sm" className="h-7 px-2.5" onClick={onApply}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2.5" onClick={onSkip}>
            Skip
          </Button>
        </span>
      )}
    </li>
  );
}

/** Plan (AC): proposed changes applied together. */
export function PlanCard({ plan, subtitle, className }: { plan: DayPlan; subtitle?: string; className?: string }) {
  const { dispatch } = useStore();
  const reviewing = plan.status === "reviewing";
  return (
    <section
      aria-label={plan.title}
      className={cn("flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm", className)}
    >
      <header className="flex items-center gap-2">
        <AssistantMark size={16} decorative />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate text-sm font-semibold text-card-foreground">{plan.title}</h2>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </header>
      <ul className="flex flex-col gap-0.5">
        {plan.steps.map((s) => (
          <PlanStepRow
            key={s.id}
            step={s}
            reviewing={reviewing}
            onApply={() => dispatch({ type: "plan/apply", date: plan.date, stepIds: [s.id] })}
            onSkip={() => dispatch({ type: "plan/skipStep", date: plan.date, stepId: s.id })}
          />
        ))}
      </ul>
      {!reviewing && (
        <div className="flex gap-2">
          <Button size="sm" className="h-7 px-2.5" onClick={() => dispatch({ type: "plan/apply", date: plan.date })}>
            Apply all
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 shadow-none"
            onClick={() => dispatch({ type: "plan/review", date: plan.date })}
          >
            Review one by one
          </Button>
        </div>
      )}
    </section>
  );
}
