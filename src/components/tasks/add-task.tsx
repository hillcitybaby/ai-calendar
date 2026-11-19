"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { parseTask } from "@/lib/parse-task";
import { formatDuration } from "@/lib/schedule";
import { newId, useStore } from "@/lib/store";
import type { TaskBucket } from "@/lib/types";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

import { CheckCircle } from "./check-circle";
import { LengthMenu, TagMenu } from "./task-fields";

/**
 * Add Task (AC): quick add at the top of every to-do list. Default / Hover / Typing.
 * Typing: the length chip sits at the end of the text and the #tag chip below, right-aligned;
 * both are dropdowns. A day in the text ("tomorrow") files it there. Shift+Enter adds a subtask
 * line; Enter adds the task. The badge shows the list's planned time (h:mm).
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
  // Picks from the chip dropdowns win over what the text says.
  const [picked, setPicked] = React.useState<{ durationMin?: number; channel?: string | null }>({});
  const menuOpen = React.useRef(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  // Subtask lines added with Shift+Enter.
  const [subs, setSubs] = React.useState<string[]>([]);
  const subRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [focusSub, setFocusSub] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (focusSub === null) return;
    subRefs.current[focusSub]?.focus();
    setFocusSub(null);
  }, [focusSub, subs]);
  const parsed = parseTask(draft, today);

  const durationMin = picked.durationMin ?? parsed.durationMin ?? state.settings.defaultTaskMin;
  const channel = picked.channel === null ? undefined : (picked.channel ?? parsed.channel);
  // A day named in the text ("tomorrow", "friday") files it there; otherwise this list.
  const target: TaskBucket = parsed.day ? { kind: "day", date: format(parsed.day, "yyyy-MM-dd") } : bucket;

  const close = () => {
    setTyping(false);
    setDraft("");
    setPicked({});
    setSubs([]);
  };

  const submit = () => {
    if (!parsed.title) return;
    const subtasks = subs
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title) => ({ id: newId("sub"), title, done: false }));
    dispatch({
      type: "task/add",
      task: { id: newId("task"), title: parsed.title, durationMin, bucket: target, channel, subtasks, done: false },
    });
    setDraft("");
    setPicked({});
    setSubs([]);
    inputRef.current?.focus();
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
          {formatDuration(plannedMin)}
          <span className="sr-only"> planned</span>
        </span>
      </button>
    );
  }

  /** Keys shared by the title and subtask fields. Shift+Enter starts a subtask line below `at`. */
  const onFieldKey = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>, at: number) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setSubs((all) => [...all.slice(0, at + 1), "", ...all.slice(at + 1)]);
      setFocusSub(at + 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Backspace" && at >= 0 && !subs[at]) {
      // Backspace on an empty subtask removes it and goes back up.
      e.preventDefault();
      setSubs((all) => all.filter((_, i) => i !== at));
      if (at === 0) inputRef.current?.focus();
      else setFocusSub(at - 1);
    }
  };

  return (
    <div
      className={cn("flex w-full flex-col gap-2 rounded-lg border border-ring bg-card p-3 shadow-sm", className)}
      onBlur={(e) => {
        // Close when focus leaves the whole control with nothing typed (not while a chip menu is open).
        if (menuOpen.current || e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        if (!draft.trim() && !subs.some((x) => x.trim())) close();
      }}
    >
      <div className="flex items-start gap-2">
        <CheckCircle checked={false} label="New task" className="mt-px" />
        <textarea
          ref={inputRef}
          autoFocus
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\n/g, " "))}
          onKeyDown={(e) => onFieldKey(e, -1)}
          aria-label="New task. Add a length like 45m, a #tag or a day. Shift+Enter adds a subtask."
          placeholder="Task name, 45m, #tag, tomorrow"
          className="field-sizing-content min-w-0 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <LengthMenu {...menuProps} value={durationMin} onChange={(m) => setPicked((p) => ({ ...p, durationMin: m }))} />
      </div>
      {subs.length > 0 && (
        <ul className="flex flex-col gap-1 pl-[26px]" aria-label="Subtasks">
          {subs.map((sub, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle checked={false} label={`Subtask ${i + 1}`} />
              <input
                ref={(el) => {
                  subRefs.current[i] = el;
                }}
                value={sub}
                onChange={(e) => setSubs((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
                onKeyDown={(e) => onFieldKey(e, i)}
                aria-label={`Subtask ${i + 1}`}
                placeholder="Subtask"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap justify-end gap-1 pl-[26px]" aria-live="polite">
        <TagMenu {...menuProps} value={channel} onChange={(t) => setPicked((p) => ({ ...p, channel: t ?? null }))} />
      </div>
    </div>
  );
}
