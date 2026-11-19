"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar, Clock, Hash, Plus } from "lucide-react";

import { parseTask } from "@/lib/parse-task";
import { formatPlanned } from "@/lib/schedule";
import { newId, useStore } from "@/lib/store";
import type { TaskBucket } from "@/lib/types";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

import { CheckCircle } from "./check-circle";

function Chip({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
      <Icon className="size-3" aria-hidden />
      {children}
    </span>
  );
}

/**
 * Add Task (AC): quick add at the top of every to-do list. Default / Hover / Typing.
 * Typing parses length, #channel and day into chips. The badge shows the list's planned time.
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
  const today = useToday();
  const [typing, setTyping] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const parsed = parseTask(draft, today);

  const close = () => {
    setTyping(false);
    setDraft("");
  };

  const submit = () => {
    if (!parsed.title) return;
    dispatch({
      type: "task/add",
      task: {
        id: newId("task"),
        title: parsed.title,
        durationMin: parsed.durationMin ?? state.settings.defaultTaskMin,
        bucket: parsed.day ? { kind: "day", date: format(parsed.day, "yyyy-MM-dd") } : bucket,
        channel: parsed.channel,
        subtasks: [],
        done: false,
      },
    });
    setDraft("");
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

  const hasChips = parsed.durationLabel || parsed.channel || parsed.dayLabel;
  return (
    <div
      className={cn("flex w-full flex-col gap-2 rounded-lg border border-ring bg-card p-3 shadow-sm", className)}
    >
      <div className="flex items-start gap-2">
        <CheckCircle checked={false} label="New task" className="mt-px" />
        <input
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
          onBlur={() => {
            if (!draft.trim()) close();
          }}
          aria-label="New task. Add a length like 45m, a #channel or a day."
          placeholder="Task name, 45m, #channel, tomorrow"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {hasChips && (
        <div className="flex flex-wrap gap-1 pl-[26px]" aria-live="polite">
          {parsed.durationLabel && <Chip icon={Clock}>{parsed.durationLabel}</Chip>}
          {parsed.channel && <Chip icon={Hash}>{parsed.channel}</Chip>}
          {parsed.dayLabel && <Chip icon={Calendar}>{parsed.dayLabel}</Chip>}
        </div>
      )}
      <p className="pl-[26px] text-xs text-muted-foreground">Enter to add · Esc to cancel</p>
    </div>
  );
}
