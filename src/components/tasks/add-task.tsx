"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { parseTask } from "@/lib/parse-task";
import { formatPlanned } from "@/lib/schedule";
import { newId, useStore } from "@/lib/store";
import type { TaskBucket } from "@/lib/types";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

import { CheckCircle } from "./check-circle";
import { useTaskEditor } from "./task-editor";
import { LengthMenu, TagMenu, WhenMenu } from "./task-fields";

/**
 * Add Task (AC): quick add at the top of every to-do list. Default / Hover / Typing.
 * Typing parses length, #tag and day into chips; each chip is also a dropdown, and
 * "More options" opens the full task form. The badge shows the list's planned time.
 */
export function AddTask({
  bucket,
  plannedMin,
  className,
}: {
  /** Where new tasks land unless the text names a day. */
  bucket: TaskBucket;
  plannedMin: number;
  className?: string;
}) {
  const { state, dispatch } = useStore();
  const { openNew } = useTaskEditor();
  const today = useToday();
  const [typing, setTyping] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  // Picks from the chip dropdowns win over what the text says.
  const [picked, setPicked] = React.useState<{ durationMin?: number; channel?: string | null; bucket?: TaskBucket }>({});
  const menuOpen = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const parsed = parseTask(draft, today);

  const durationMin = picked.durationMin ?? parsed.durationMin ?? state.settings.defaultTaskMin;
  const channel = picked.channel === null ? undefined : (picked.channel ?? parsed.channel);
  const target: TaskBucket =
    picked.bucket ?? (parsed.day ? { kind: "day", date: format(parsed.day, "yyyy-MM-dd") } : bucket);

  const close = () => {
    setTyping(false);
    setDraft("");
    setPicked({});
  };

  const submit = () => {
    if (!parsed.title) return;
    dispatch({
      type: "task/add",
      task: { id: newId("task"), title: parsed.title, durationMin, bucket: target, channel, subtasks: [], done: false },
    });
    setDraft("");
    setPicked({});
  };

  const menuProps = {
    variant: "chip" as const,
    onOpenChange: (o: boolean) => {
      menuOpen.current = o;
    },
    returnFocus: () => inputRef.current?.focus(),
  };

  if (!typing) {
    return (
      <button
        type="button"
        onClick={() => setTyping(true)}
        className={cn(
          "group/add flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 text-left shadow-xs outline-none transition-colors",
          "hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className,
        )}
      >
        <Plus className="size-4 text-muted-foreground group-hover/add:text-foreground" aria-hidden />
        <span className="min-w-0 flex-1 text-sm text-muted-foreground group-hover/add:text-foreground">Add task</span>
        <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {formatPlanned(plannedMin)}
          <span className="sr-only"> planned</span>
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn("flex w-full flex-col gap-2 rounded-lg border border-ring bg-card p-3 shadow-sm", className)}
      onBlur={(e) => {
        // Close when focus leaves the whole control with nothing typed (not while a chip menu is open).
        if (menuOpen.current || e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        if (!draft.trim()) close();
      }}
    >
      <div className="flex items-start gap-2">
        <CheckCircle checked={false} label="New task" className="mt-px" />
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              close();
            }
          }}
          aria-label="New task. Add a length like 45m, a #channel or a day."
          placeholder="Task name, 45m, #channel, tomorrow"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex flex-wrap gap-1 pl-[26px]" aria-live="polite">
        <LengthMenu {...menuProps} value={durationMin} onChange={(m) => setPicked((p) => ({ ...p, durationMin: m }))} />
        <TagMenu {...menuProps} value={channel} onChange={(t) => setPicked((p) => ({ ...p, channel: t ?? null }))} />
        <WhenMenu {...menuProps} value={target} onChange={(b) => setPicked((p) => ({ ...p, bucket: b }))} />
      </div>
      <div className="flex items-center gap-2 pl-[26px]">
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">Enter to add · Esc to cancel</p>
        <button
          type="button"
          onClick={() => {
            openNew({ title: parsed.title, durationMin, channel, bucket: target });
            close();
          }}
          className="shrink-0 rounded-sm text-xs font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          More options
        </button>
      </div>
    </div>
  );
}
