"use client";

import type { Suggestion, Task, TaskBucket } from "@/lib/types";
import { totalMinutes } from "@/lib/schedule";
import { SuggestionCardCompact } from "@/components/suggestions/suggestion-card";

import { AddTask } from "./add-task";
import { DraggableWorkTask } from "./work-task";

/**
 * The to-do list beside the Week and Month grids: a heading with a count, Add Task (AC) at
 * the top, Work Task (AC) cards, then compact Suggestion Cards.
 */
export function TaskPanel({
  title,
  tasks,
  bucket,
  suggestions = [],
}: {
  title: string;
  tasks: Task[];
  bucket: TaskBucket;
  suggestions?: Suggestion[];
}) {
  const open = tasks.filter((t) => !t.done).length;
  return (
    <section aria-label={title} className="flex w-[336px] shrink-0 flex-col gap-4 overflow-y-auto px-[17px] pt-4 pb-6">
      <h2 className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {open}
          <span className="sr-only"> open</span>
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        <AddTask bucket={bucket} plannedMin={totalMinutes(tasks.filter((t) => !t.done))} />
        {tasks.map((t) => (
          <DraggableWorkTask key={t.id} task={t} />
        ))}
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-4" aria-label="Suggestions">
          {suggestions.map((s) => (
            <SuggestionCardCompact key={s.id} s={s} />
          ))}
        </div>
      )}
    </section>
  );
}
