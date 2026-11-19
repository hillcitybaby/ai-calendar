"use client";

import * as React from "react";

import { TaskPanelBody } from "@/components/tasks/task-panel";
import { formatPlanned, totalMinutes } from "@/lib/schedule";
import type { Suggestion, Task, TaskBucket } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Height of the peeking bar above the tab bar. */
export const SHEET_PEEK = 60;

/**
 * The mobile Week's "To schedule" bottom sheet. It peeks above the tab bar with the count,
 * planned time and suggestion count; tap or drag the bar up to open it.
 */
export function ToScheduleSheet({
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
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [dragH, setDragH] = React.useState<number | null>(null);
  const drag = React.useRef<{ y: number; h: number; moved: boolean } | null>(null);
  const skipClick = React.useRef(false);
  const maxH = () => (ref.current?.parentElement?.clientHeight ?? 600) * 0.82;

  const openTasks = tasks.filter((t) => !t.done);
  const summary = [
    formatPlanned(totalMinutes(openTasks)),
    suggestions.length ? `${suggestions.length} ${suggestions.length === 1 ? "suggestion" : "suggestions"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      ref={ref}
      style={{ height: dragH ?? (open ? "82%" : SHEET_PEEK) }}
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-xl border border-b-0 border-border bg-background shadow-[0_-4px_16px_rgb(0_0_0/0.06)]",
        dragH === null && "transition-[height] duration-300 ease-out motion-reduce:transition-none",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${title}, ${openTasks.length} open, ${summary}`}
        className="flex shrink-0 touch-none flex-col items-stretch gap-2 px-4 pt-2 pb-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={() => {
          if (skipClick.current) skipClick.current = false;
          else setOpen((o) => !o);
        }}
        onPointerDown={(e) => {
          drag.current = { y: e.clientY, h: ref.current?.offsetHeight ?? SHEET_PEEK, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dy = d.y - e.clientY;
          if (Math.abs(dy) > 4) d.moved = true;
          if (d.moved) setDragH(Math.min(maxH(), Math.max(SHEET_PEEK, d.h + dy)));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d?.moved && dragH !== null) {
            skipClick.current = true;
            setOpen(dragH > (SHEET_PEEK + maxH()) / 2);
          }
          setDragH(null);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragH(null);
        }}
      >
        <span aria-hidden className="mx-auto h-1 w-9 rounded-full bg-border" />
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs font-medium text-muted-foreground">{openTasks.length}</span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">{summary}</span>
        </span>
      </button>
      <div
        inert={!open && dragH === null}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4",
          !open && dragH === null && "invisible",
        )}
      >
        <TaskPanelBody tasks={tasks} bucket={bucket} suggestions={suggestions} layout="single" />
      </div>
    </div>
  );
}
