"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { addMinutes, format, parseISO } from "date-fns";

import { WorkTaskCard } from "@/components/tasks/work-task";
import { GRID_MINUTES, GRID_START_HOUR, snap } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { CalendarEvent, Task } from "@/lib/types";

export type DragData = { kind: "task"; task: Task } | { kind: "event"; event: CalendarEvent };

export type DropPreview = {
  date: string; // yyyy-MM-dd
  startMin: number; // minutes from grid start
  durationMin: number;
  title: string;
  calendarId: string;
  eventId?: string;
};

const PreviewContext = React.createContext<DropPreview | null>(null);
export const useDropPreview = () => React.useContext(PreviewContext);

function startFor(date: string, startMin: number) {
  const d = parseISO(`${date}T00:00:00`);
  return format(addMinutes(d, GRID_START_HOUR * 60 + startMin), "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Drag and drop for the scheduler: drag a Work Task from a list onto a day column to time-box
 * it, or drag an Event Block to move it. A Preview Event Block shows where it will land.
 */
export function SchedulerDnd({ children }: { children: React.ReactNode }) {
  const { dispatch } = useStore();
  const [active, setActive] = React.useState<DragData | null>(null);
  const [preview, setPreview] = React.useState<DropPreview | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const compute = (e: DragMoveEvent | DragEndEvent): DropPreview | null => {
    const data = e.active.data.current as DragData | undefined;
    const over = e.over;
    if (!data || !over || !String(over.id).startsWith("day:")) return null;
    const date = String(over.id).slice(4);
    // Tasks land where the pointer is; events keep their top edge under the pointer offset.
    let y: number;
    if (data.kind === "event" && e.active.rect.current.translated) {
      y = e.active.rect.current.translated.top;
    } else {
      const start = e.activatorEvent as PointerEvent | KeyboardEvent;
      const startY = "clientY" in start ? start.clientY : (e.active.rect.current.initial?.top ?? 0);
      y = startY + e.delta.y;
    }
    const ratio = (y - over.rect.top) / over.rect.height;
    const durationMin =
      data.kind === "task"
        ? data.task.durationMin
        : (parseISO(data.event.end).getTime() - parseISO(data.event.start).getTime()) / 60_000;
    const startMin = Math.max(0, Math.min(GRID_MINUTES - 15, snap(ratio * GRID_MINUTES)));
    return {
      date,
      startMin,
      durationMin,
      title: data.kind === "task" ? data.task.title : data.event.title,
      calendarId: data.kind === "task" ? "work" : data.event.calendarId,
      eventId: data.kind === "event" ? data.event.id : undefined,
    };
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActive((e.active.data.current as DragData) ?? null)}
      onDragMove={(e) => setPreview(compute(e))}
      onDragCancel={() => {
        setActive(null);
        setPreview(null);
      }}
      onDragEnd={(e) => {
        const p = compute(e);
        const data = e.active.data.current as DragData | undefined;
        if (p && data) {
          const start = startFor(p.date, p.startMin);
          if (data.kind === "task") dispatch({ type: "task/schedule", id: data.task.id, start });
          else dispatch({ type: "event/move", id: data.event.id, start });
        }
        setActive(null);
        setPreview(null);
      }}
      accessibility={{
        announcements: {
          onDragStart: () => "Picked up. Move over a day on the calendar and drop to schedule.",
          onDragOver: ({ over }) => (over ? `Over ${String(over.id).slice(4)}.` : "Not over the calendar."),
          onDragEnd: ({ over }) => (over ? "Scheduled." : "Dropped outside the calendar. Nothing changed."),
          onDragCancel: () => "Cancelled.",
        },
      }}
    >
      <PreviewContext.Provider value={preview}>{children}</PreviewContext.Provider>
      <DragOverlay dropAnimation={null}>
        {active?.kind === "task" ? (
          <WorkTaskCard task={active.task} state="dragging" className="w-[280px] cursor-grabbing" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
