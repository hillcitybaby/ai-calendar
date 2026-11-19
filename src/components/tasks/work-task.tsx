"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";

import { CHANNEL_COLORS } from "@/lib/mock-data";
import { calendarColorVars } from "@/lib/calendars";
import { formatClock, formatDuration } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CheckCircle } from "./check-circle";
import { useTaskEditor } from "./task-editor";

/** Pill used for duration and set time: same style for both. */
function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("shrink-0 rounded-sm bg-muted px-2 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export type WorkTaskState = "default" | "dragging";

/**
 * Work Task (AC): the one to-do card used everywhere. Title + duration, optional subtasks,
 * and a footer with the check, an optional set time and #channel. No source label.
 * States: Default / Hover (CSS) / Dragging / Done.
 */
export function WorkTaskCard({
  task,
  state = "default",
  className,
  ref,
  ...rest
}: {
  task: Task;
  state?: WorkTaskState;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { dispatch } = useStore();
  const { openEdit } = useTaskEditor();
  const color = task.channel ? (CHANNEL_COLORS[task.channel] ?? "slate") : "slate";
  return (
    <div
      ref={ref}
      {...rest}
      className={cn(
        "group/task flex flex-col gap-2 rounded-lg border bg-card p-3 text-left shadow-xs transition-[border-color,box-shadow]",
        state === "dragging" ? "border-ring shadow-lg" : "border-border hover:border-ring hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {/* The title opens the task form. Keys stay here so Enter/Space don't also start a keyboard drag. */}
        <button
          type="button"
          onClick={() => openEdit(task.id)}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={`Edit "${task.title}"`}
          className={cn(
            "min-w-0 flex-1 cursor-pointer rounded-sm text-left text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            task.done ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {task.title}
        </button>
        <Pill className="py-0.5">{formatDuration(task.durationMin)}</Pill>
      </div>

      {task.subtasks.length > 0 && (
        <ul className="flex flex-col gap-1">
          {task.subtasks.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <CheckCircle
                checked={s.done}
                label={`${s.title}, subtask of ${task.title}`}
                onToggle={() => dispatch({ type: "task/toggleSubtask", id: task.id, subtaskId: s.id })}
              />
              <span className={cn("min-w-0 flex-1 text-sm", s.done ? "text-muted-foreground" : "text-foreground")}>
                {s.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle
            checked={task.done}
            label={`Mark "${task.title}" ${task.done ? "not done" : "done"}`}
            onToggle={() => dispatch({ type: "task/toggle", id: task.id })}
            className={cn(
              !task.done && "group-hover/task:border-calendar-emerald-accent group-hover/task:text-calendar-emerald-accent",
              !task.done && state === "dragging" && "border-border text-border",
            )}
          />
          {task.scheduledAt && <Pill className="py-px">{formatClock(task.scheduledAt)}</Pill>}
        </div>
        {task.channel && (
          <span className="flex items-center gap-0.5 text-xs" style={calendarColorVars(color)}>
            <span className="font-semibold text-(--cal-accent)">#</span>
            <span className="text-muted-foreground">{task.channel}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** A Work Task you can drag onto the calendar to time-box it. */
export function DraggableWorkTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task:${task.id}`,
    data: { kind: "task", task },
    disabled: task.done,
  });
  return (
    <WorkTaskCard
      ref={setNodeRef}
      task={task}
      className={cn(!task.done && "cursor-grab", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
      // The card holds checkboxes, so it's a group rather than a button; it stays focusable for keyboard dragging.
      role="group"
      aria-roledescription="Draggable task"
      aria-label={`${task.title}, ${formatDuration(task.durationMin)}. Drag onto the calendar to schedule.`}
    />
  );
}
