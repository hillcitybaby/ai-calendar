"use client";

import * as React from "react";
import { format, startOfWeek } from "date-fns";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { parseDateParam } from "@/lib/calendar-view";
import { newId, useStore } from "@/lib/store";
import type { Subtask, Task, TaskBucket } from "@/lib/types";
import { useToday } from "@/lib/use-today";

import { CheckCircle } from "./check-circle";
import { LengthMenu, TagMenu, WhenMenu } from "./task-fields";

/** What a new to-do starts with: anything Add Task already parsed, or nothing. */
export type TaskDraft = Partial<Pick<Task, "title" | "durationMin" | "channel" | "bucket" | "subtasks">>;

type Ctx = {
  /** Open the form for a new to-do. Without a bucket, it lands in the list the page is showing. */
  openNew: (draft?: TaskDraft) => void;
};

const TaskEditorContext = React.createContext<Ctx | null>(null);

export function useTaskEditor() {
  const ctx = React.useContext(TaskEditorContext);
  if (!ctx) throw new Error("useTaskEditor must be used inside TaskEditorProvider");
  return ctx;
}

/** The list the current page is showing: the day on Today/Day, the week on Week, the month on Month. */
function pageBucket(today: Date, weekStartsOn: 0 | 1): TaskBucket {
  const path = window.location.pathname;
  const date = parseDateParam(new URLSearchParams(window.location.search).get("date"), today);
  if (path.startsWith("/week")) return { kind: "week", weekStart: format(startOfWeek(date, { weekStartsOn }), "yyyy-MM-dd") };
  if (path.startsWith("/month")) return { kind: "month", month: format(date, "yyyy-MM") };
  if (path.startsWith("/day") || path.startsWith("/today")) return { kind: "day", date: format(date, "yyyy-MM-dd") };
  return { kind: "day", date: format(today, "yyyy-MM-dd") };
}

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * Add a to-do from anywhere: the + in the top bar and mobile header, or N on the keyboard.
 * Existing to-dos are edited in place on their Work Task card.
 */
export function TaskEditorProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const today = useToday();
  const [session, setSession] = React.useState<{ key: number; draft: TaskDraft } | null>(null);

  const openNew = React.useCallback(
    (draft: TaskDraft = {}) =>
      setSession((s) => ({ key: (s?.key ?? 0) + 1, draft: { bucket: pageBucket(today, state.settings.weekStartsOn), ...draft } })),
    [today, state.settings.weekStartsOn],
  );

  // N adds a to-do, unless you're typing or a dialog is already open.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (isTypingTarget(e.target) || document.querySelector('[role="dialog"][data-state="open"]')) return;
      e.preventDefault();
      openNew();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNew]);

  const ctx = React.useMemo(() => ({ openNew }), [openNew]);

  return (
    <TaskEditorContext.Provider value={ctx}>
      {children}
      <Dialog open={!!session} onOpenChange={(o) => !o && setSession(null)}>
        {session && <TaskForm key={session.key} draft={session.draft} onDone={() => setSession(null)} />}
      </Dialog>
    </TaskEditorContext.Provider>
  );
}

/**
 * The new-task form: title, length, tag, when, subtasks. Centered on desktop, a bottom sheet on
 * mobile. Existing to-dos are edited in place on their Work Task card, not here.
 */
function TaskForm({ draft, onDone }: { draft: TaskDraft; onDone: () => void }) {
  const { state, dispatch } = useStore();
  const today = useToday();
  const [title, setTitle] = React.useState(draft.title ?? "");
  const [durationMin, setDurationMin] = React.useState(draft.durationMin ?? state.settings.defaultTaskMin);
  const [channel, setChannel] = React.useState(draft.channel);
  const [bucket, setBucket] = React.useState<TaskBucket>(draft.bucket ?? { kind: "day", date: format(today, "yyyy-MM-dd") });
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(draft.subtasks ?? []);
  const [newSub, setNewSub] = React.useState("");

  const addSub = () => {
    if (!newSub.trim()) return;
    setSubtasks((s) => [...s, { id: newId("sub"), title: newSub.trim(), done: false }]);
    setNewSub("");
  };

  const save = () => {
    if (!title.trim()) return;
    // A subtask typed but not yet added still counts.
    const subs = newSub.trim() ? [...subtasks, { id: newId("sub"), title: newSub.trim(), done: false }] : subtasks;
    const fields = { title: title.trim(), durationMin, channel, bucket, subtasks: subs.filter((s) => s.title.trim()) };
    dispatch({ type: "task/add", task: { id: newId("task"), done: false, ...fields } });
    toast(`Added "${fields.title}"`);
    onDone();
  };

  return (
    <DialogContent
      showCloseButton={false}
      className="gap-0 p-0 md:max-w-[440px] max-md:top-auto max-md:bottom-0 max-md:max-w-full max-md:translate-y-0 max-md:rounded-b-none max-md:pb-[env(safe-area-inset-bottom)]"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex max-h-[85dvh] flex-col"
      >
        <header className="flex items-center gap-2 px-4 pt-4 pb-2">
          <DialogTitle className="flex-1 text-base font-semibold">New task</DialogTitle>
          <Button type="button" variant="ghost" size="icon" className="size-7 rounded-md" aria-label="Close" onClick={onDone}>
            <X />
          </Button>
        </header>
        <DialogDescription className="sr-only">Title, length, tag, when it&apos;s due, and subtasks.</DialogDescription>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-4 py-2">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task name"
            aria-label="Task name"
            className="h-9 shadow-none"
          />
          <div className="flex flex-wrap gap-2">
            <LengthMenu variant="field" value={durationMin} onChange={setDurationMin} />
            <TagMenu variant="field" value={channel} onChange={setChannel} />
            <WhenMenu variant="field" value={bucket} onChange={setBucket} />
          </div>


          <section aria-label="Subtasks" className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Subtasks</h3>
            {subtasks.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <CheckCircle
                  checked={s.done}
                  label={`${s.title} done`}
                  onToggle={() => setSubtasks((all) => all.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))}
                />
                <input
                  value={s.title}
                  onChange={(e) => setSubtasks((all) => all.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))}
                  aria-label={`Subtask ${i + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-md"
                  aria-label={`Remove ${s.title}`}
                  onClick={() => setSubtasks((all) => all.filter((x) => x.id !== s.id))}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-muted-foreground" aria-hidden />
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSub();
                  }
                }}
                placeholder="Add a subtask"
                aria-label="Add a subtask"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </section>
        </div>

        <footer className="flex items-center gap-2 px-4 pt-3 pb-4">
          <span className="flex-1" />
          <Button type="button" variant="outline" size="sm" className="h-8 shadow-none" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="h-8" disabled={!title.trim()}>
            Add task
          </Button>
        </footer>
      </form>
    </DialogContent>
  );
}

/** The + that opens a new to-do from any page. */
export function AddTaskIconButton({ className }: { className?: string }) {
  const { openNew } = useTaskEditor();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className ?? "size-7 rounded-md"}
      aria-label="Add task"
      aria-keyshortcuts="N"
      title="Add task (N)"
      onClick={() => openNew()}
    >
      <Plus />
    </Button>
  );
}
