"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { CHANNEL_COLORS } from "@/lib/mock-data";
import { calendarColorVars } from "@/lib/calendars";
import { formatClock, formatDuration } from "@/lib/schedule";
import { newId, useStore } from "@/lib/store";
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
 * Work Task (AC): the one to-do card used everywhere. The check sits left of the title, with the
 * duration on the right; subtasks and the footer (optional set time, "+ Subtask" on hover,
 * #channel) indent to line up with the title. No source label.
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
  const [adding, setAdding] = React.useState(false);
  const [newSub, setNewSub] = React.useState("");
  const cancelled = React.useRef(false);
  const addSub = () => {
    const title = newSub.trim();
    if (!title) return;
    dispatch({
      type: "task/update",
      id: task.id,
      patch: { subtasks: [...task.subtasks, { id: newId("sub"), title, done: false }], done: false },
    });
    setNewSub("");
  };
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
        <CheckCircle
          checked={task.done}
          label={`Mark "${task.title}" ${task.done ? "not done" : "done"}`}
          onToggle={() => dispatch({ type: "task/toggle", id: task.id })}
          className={cn(
            "mt-px",
            !task.done && "group-hover/task:border-calendar-emerald-accent group-hover/task:text-calendar-emerald-accent",
            !task.done && state === "dragging" && "border-border text-border",
          )}
        />
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

      {(task.subtasks.length > 0 || adding) && (
        <ul className="flex flex-col gap-1 pl-[26px]">
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
          {adding && (
            <li className="flex items-center gap-2">
              <CheckCircle checked={false} label="New subtask" />
              {/* Keys and pointer stay here so typing never starts a drag. */}
              <input
                autoFocus
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSub();
                  } else if (e.key === "Escape") {
                    cancelled.current = true;
                    setNewSub("");
                    setAdding(false);
                  }
                }}
                onBlur={() => {
                  // Clicking away keeps what was typed; Esc throws it away.
                  if (!cancelled.current) addSub();
                  cancelled.current = false;
                  setAdding(false);
                }}
                placeholder="Subtask, then Enter"
                aria-label={`New subtask for ${task.title}`}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </li>
          )}
        </ul>
      )}

      <div
        className={cn(
          "flex items-center justify-between gap-2 pl-[26px]",
          // With no time or tag the footer only holds "+ Subtask": hide it when that can't show.
          !task.scheduledAt && !task.channel && (task.done || adding || state === "dragging" ? "hidden" : "pointer-coarse:hidden"),
        )}
      >
        <div className="flex items-center gap-2">
          {task.scheduledAt && <Pill className="py-px">{formatClock(task.scheduledAt)}</Pill>}
          {!task.done && !adding && state !== "dragging" && (
            // Shows on hover or keyboard focus; on touch, tap the title and add subtasks in the form.
            <button
              type="button"
              onClick={() => setAdding(true)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label={`Add subtask to ${task.title}`}
              className="flex h-[18px] items-center gap-1 rounded-sm px-1 text-xs text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover/task:opacity-100 pointer-coarse:hidden"
            >
              <Plus className="size-3" aria-hidden />
              Subtask
            </button>
          )}
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
      // dnd-kit marks a done (undraggable) card aria-disabled, which would also disable its checks for
      // assistive tech. Only dragging is off, so drop it.
      aria-disabled={undefined}
      aria-roledescription="Draggable task"
      aria-label={`${task.title}, ${formatDuration(task.durationMin)}. Drag onto the calendar to schedule.`}
    />
  );
}
