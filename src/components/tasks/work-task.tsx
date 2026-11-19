"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CalendarArrowUp, CalendarX2, Ellipsis, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHANNEL_COLORS } from "@/lib/mock-data";
import { calendarColorVars } from "@/lib/calendars";
import { formatClock, formatDuration } from "@/lib/schedule";
import { newId, useStore } from "@/lib/store";
import { sameBucket, whenOptions } from "@/lib/task-options";
import type { Task } from "@/lib/types";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

import { CheckCircle } from "./check-circle";
import { LengthMenu, TagMenu } from "./task-fields";

/** Pill used for duration and set time: same style for both. */
const pillClass = "shrink-0 rounded-sm bg-muted px-2 text-xs font-medium text-muted-foreground";

/**
 * Controls inside a draggable card keep their pointer and key events, so pressing one never
 * starts a drag (pointer) or a keyboard drag (Enter/Space).
 */
const own = {
  onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
};

const focusRing = "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Text you click to edit in place: Enter or clicking away saves, Esc cancels. */
function InlineText({
  value,
  onSave,
  label,
  className,
  multiline,
}: {
  value: string;
  onSave: (next: string) => void;
  label: string;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const cancelled = React.useRef(false);
  if (!editing) {
    return (
      <button
        type="button"
        {...own}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label={label}
        className={cn("min-w-0 flex-1 cursor-text rounded-sm text-left", focusRing, className)}
      >
        {value}
      </button>
    );
  }
  const props = {
    autoFocus: true,
    value: draft,
    "aria-label": label,
    onPointerDown: own.onPointerDown,
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value.replace(/\n/g, " ")),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        cancelled.current = true;
        e.currentTarget.blur();
      }
    },
    onBlur: () => {
      if (!cancelled.current && draft.trim() !== value) onSave(draft.trim());
      cancelled.current = false;
      setEditing(false);
    },
    className: cn("min-w-0 flex-1 resize-none rounded-sm bg-transparent outline-none ring-1 ring-ring", className),
  };
  return multiline ? <textarea rows={1} {...props} className={cn(props.className, "field-sizing-content")} /> : <input {...props} />;
}

export type WorkTaskState = "default" | "dragging";

/**
 * Work Task (AC): the one to-do card used everywhere. The check sits left of the title, with the
 * duration on the right; subtasks and the footer (optional set time, "+ Subtask" and the ⋯ menu,
 * #channel) indent to line up with the title. No source label.
 * Everything edits in place: click the title or a subtask to rename it; the duration, time and
 * #channel are dropdowns; ⋯ has Add subtask, Move to, Remove from calendar and Delete.
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
  const { state: store, dispatch } = useStore();
  const today = useToday();
  const [adding, setAdding] = React.useState(false);
  const [newSub, setNewSub] = React.useState("");
  const cancelled = React.useRef(false);
  const newSubRef = React.useRef<HTMLInputElement>(null);
  // "Add subtask" in the ⋯ menu: when the menu closes, focus goes to the new row, not back to ⋯.
  const addFromMenu = React.useRef(false);
  const update = (patch: Partial<Omit<Task, "id">>) => dispatch({ type: "task/update", id: task.id, patch });
  const addSub = () => {
    const title = newSub.trim();
    if (!title) return;
    update({ subtasks: [...task.subtasks, { id: newId("sub"), title, done: false }], done: false });
    setNewSub("");
  };
  const remove = () => {
    dispatch({ type: "task/delete", id: task.id });
    toast(`Deleted "${task.title}"`, {
      action: { label: "Undo", onClick: () => dispatch({ type: "task/add", task: { ...task, scheduledAt: undefined } }) },
    });
  };
  const color = task.channel ? (CHANNEL_COLORS[task.channel] ?? "slate") : "slate";
  // Hover-only controls: visible on hover or keyboard focus with a pointer, always on touch.
  const reveal = "opacity-0 transition-opacity group-hover/task:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100";
  const live = state !== "dragging";

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
        <InlineText
          multiline
          value={task.title}
          onSave={(title) => title && update({ title })}
          label={`Title: ${task.title}. Click to rename.`}
          className={cn("text-sm font-medium", task.done ? "text-muted-foreground" : "text-foreground")}
        />
        <LengthMenu
          variant="chip"
          value={task.durationMin}
          onChange={(durationMin) => update({ durationMin })}
          trigger={
            <button
              type="button"
              {...own}
              aria-label={`Length: ${formatDuration(task.durationMin)}. Change length.`}
              className={cn(pillClass, "py-0.5 hover:text-foreground", focusRing)}
            >
              {formatDuration(task.durationMin)}
            </button>
          }
        />
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
              <InlineText
                value={s.title}
                // Clearing a subtask's text removes it.
                onSave={(title) =>
                  update({
                    subtasks: title
                      ? task.subtasks.map((x) => (x.id === s.id ? { ...x, title } : x))
                      : task.subtasks.filter((x) => x.id !== s.id),
                  })
                }
                label={`Subtask: ${s.title}. Click to rename; clear it to remove.`}
                className={cn("text-sm", s.done ? "text-muted-foreground" : "text-foreground")}
              />
            </li>
          ))}
          {adding && (
            <li className="flex items-center gap-2">
              <CheckCircle checked={false} label="New subtask" />
              <input
                ref={newSubRef}
                autoFocus
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onPointerDown={own.onPointerDown}
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

      <div className={cn("flex min-h-[18px] items-center justify-between gap-2 pl-[26px]", !live && !task.scheduledAt && !task.channel && "hidden")}>
        <div className="flex items-center gap-1">
          {task.scheduledAt && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  {...own}
                  aria-label={`On your calendar at ${formatClock(task.scheduledAt)}. Options.`}
                  className={cn(pillClass, "mr-1 py-px hover:text-foreground", focusRing)}
                >
                  {formatClock(task.scheduledAt)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={() => dispatch({ type: "task/unschedule", id: task.id })}>
                  <CalendarX2 />
                  Remove from calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {live && !task.done && !adding && (
            <button
              type="button"
              {...own}
              onClick={() => setAdding(true)}
              aria-label={`Add subtask to ${task.title}`}
              className={cn("flex h-[18px] items-center gap-1 rounded-sm px-1 text-xs text-muted-foreground hover:text-foreground pointer-coarse:hidden", focusRing, reveal)}
            >
              <Plus className="size-3" aria-hidden />
              Subtask
            </button>
          )}
          {live && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  {...own}
                  aria-label={`More for ${task.title}`}
                  className={cn("flex size-[18px] items-center justify-center rounded-sm text-muted-foreground hover:text-foreground", focusRing, reveal)}
                >
                  <Ellipsis className="size-3.5" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48"
                onCloseAutoFocus={(e) => {
                  if (!addFromMenu.current) return;
                  addFromMenu.current = false;
                  e.preventDefault();
                  newSubRef.current?.focus();
                }}
              >
                {!task.done && (
                  <DropdownMenuItem
                    onSelect={() => {
                      addFromMenu.current = true;
                      setAdding(true);
                    }}
                  >
                    <Plus />
                    Add subtask
                  </DropdownMenuItem>
                )}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <CalendarArrowUp className="size-4 text-muted-foreground" />
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={whenOptions(today, store.settings.weekStartsOn).find((o) => sameBucket(o.bucket, task.bucket))?.id ?? ""}
                        onValueChange={(id) => {
                          const o = whenOptions(today, store.settings.weekStartsOn).find((x) => x.id === id);
                          if (o) update({ bucket: o.bucket });
                        }}
                      >
                        {whenOptions(today, store.settings.weekStartsOn).map((o) => (
                          <DropdownMenuRadioItem key={o.id} value={o.id}>
                            {o.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                {task.scheduledAt && (
                  <DropdownMenuItem onSelect={() => dispatch({ type: "task/unschedule", id: task.id })}>
                    <CalendarX2 />
                    Remove from calendar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={remove}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <TagMenu
          variant="chip"
          value={task.channel}
          onChange={(channel) => update({ channel })}
          trigger={
            <button
              type="button"
              {...own}
              aria-label={task.channel ? `Tag: ${task.channel}. Change tag.` : "Add a tag"}
              style={calendarColorVars(color)}
              className={cn("flex items-center gap-0.5 rounded-sm text-xs", focusRing, !task.channel && reveal)}
            >
              <span className={cn("font-semibold", task.channel ? "text-(--cal-accent)" : "text-muted-foreground")}>#</span>
              <span className="text-muted-foreground hover:text-foreground">{task.channel ?? "Tag"}</span>
            </button>
          }
        />
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
