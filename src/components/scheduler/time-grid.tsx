"use client";

import * as React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { format, isSameDay, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { calendarColor } from "@/lib/calendars";
import {
  eventsOnDay,
  formatTimeRange,
  GRID_END_HOUR,
  GRID_MINUTES,
  GRID_START_HOUR,
  layoutDay,
  minutesIntoGrid,
  type PositionedEvent,
} from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

import { DayHeader } from "./day-header";
import { EventBlock } from "./event-block";
import { EventChip } from "./event-chip";
import { NowLine } from "./now-line";
import { useDropPreview } from "./scheduler-dnd";

const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);
const pct = (min: number) => `${(min / GRID_MINUTES) * 100}%`;

function previewRange(date: string, startMin: number, durationMin: number) {
  const start = parseISO(`${date}T00:00:00`);
  start.setMinutes(GRID_START_HOUR * 60 + startMin);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return formatTimeRange(format(start, "yyyy-MM-dd'T'HH:mm:ss"), format(end, "yyyy-MM-dd'T'HH:mm:ss"));
}

function useNow() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

/**
 * Time Grid (AC): day or week grid, 7 AM – 9 PM, 56px time gutter. Hour rows stretch to fill
 * the available height. Each day column accepts dropped tasks and events.
 */
export function TimeGrid({
  days,
  today,
  events,
  hideHeader,
  className,
  hourClassName,
}: {
  days: Date[];
  today: Date;
  events: CalendarEvent[];
  /** Mobile Week: the 7-day strip above stands in for the day headers. */
  hideHeader?: boolean;
  className?: string;
  /** Fixed hour-row height (mobile scrolls the grid instead of fitting it). */
  hourClassName?: string;
}) {
  const now = useNow();
  const allDay = events.filter((e) => e.allDay);
  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background", className)}>
      <div className={cn("flex shrink-0", hideHeader && "hidden")}>
        <div className="w-14 shrink-0" />
        {days.map((d) => (
          <DayHeader key={d.toISOString()} date={d} today={today} />
        ))}
      </div>

      <div className={cn("flex shrink-0", hideHeader && "[&>*]:border-t-0")}>
        <div className="flex min-h-7 w-14 shrink-0 items-center justify-end border-t border-border pr-2 text-xs text-muted-foreground">
          All day
        </div>
        {days.map((d) => (
          <div key={d.toISOString()} className="flex min-h-7 min-w-0 flex-1 flex-col gap-0.5 border-t border-l border-border p-[3px]">
            {eventsOnDay(allDay, d).map((e) => (
              <EventChip key={e.id} label={e.title} color={calendarColor(e.calendarId)} suggested={e.suggested} />
            ))}
          </div>
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {HOURS.map((h) => (
          <div key={h} className={cn("flex min-h-0 flex-1", hourClassName)}>
            <div className="w-14 shrink-0 border-t border-border pt-0.5 pr-2 text-right text-xs text-muted-foreground">
              {format(new Date(2000, 0, 1, h), "h a")}
            </div>
            {days.map((d) => (
              <div key={d.toISOString()} className="min-w-0 flex-1 border-t border-l border-border" />
            ))}
          </div>
        ))}

        <div className="absolute inset-y-0 right-0 left-14 flex">
          {days.map((d) => (
            <DayColumn
              key={d.toISOString()}
              date={d}
              events={eventsOnDay(events, d).filter((e) => !e.allDay)}
              now={isSameDay(d, now) ? now : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({ date, events, now }: { date: Date; events: CalendarEvent[]; now: Date | null }) {
  const key = format(date, "yyyy-MM-dd");
  const { setNodeRef } = useDroppable({ id: `day:${key}` });
  const preview = useDropPreview();
  const laid = layoutDay(events);
  const nowMin = now ? minutesIntoGrid(now) : null;
  return (
    <div ref={setNodeRef} className="relative min-w-0 flex-1" aria-label={format(date, "EEEE, MMMM d")} role="region">
      {laid.map((p) => (
        <PlacedEvent key={p.event.id} placed={p} hidden={preview?.eventId === p.event.id} />
      ))}
      {preview && preview.date === key && (
        <EventBlock
          title={preview.title}
          time={previewRange(key, preview.startMin, preview.durationMin)}
          color={calendarColor(preview.calendarId)}
          state="preview"
          showTime={preview.durationMin >= 40}
          className="pointer-events-none absolute right-1 left-1 z-30"
          style={{ top: pct(preview.startMin), height: pct(preview.durationMin) }}
        />
      )}
      {nowMin !== null && <NowLine style={{ top: pct(nowMin) }} />}
    </div>
  );
}

function PlacedEvent({ placed, hidden }: { placed: PositionedEvent; hidden: boolean }) {
  const { event: e, top, height, col, cols } = placed;
  const style: React.CSSProperties = {
    top: pct(top),
    height: pct(height),
    // Short events keep one readable line, as in the Pass 5 frames.
    minHeight: 20,
    left: `calc(${(col / cols) * 100}% + 2px)`,
    width: `calc(${100 / cols}% - 4px)`,
  };
  const props = {
    title: e.title,
    time: formatTimeRange(e.start, e.end),
    color: calendarColor(e.calendarId),
    showTime: height >= 45,
    className: height < 30 ? "py-0.5" : height < 60 ? "py-[3px]" : undefined,
  };
  if (e.suggested) return <SuggestedEvent event={e} style={style} {...props} />;
  return <DraggableEvent event={e} style={style} hidden={hidden} {...props} />;
}

function DraggableEvent({
  event,
  style,
  hidden,
  ...props
}: {
  event: CalendarEvent;
  style: React.CSSProperties;
  hidden: boolean;
  title: string;
  time: string;
  color: ReturnType<typeof calendarColor>;
  showTime: boolean;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event:${event.id}`,
    data: { kind: "event", event },
  });
  return (
    <EventBlock
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      aria-label={`${event.title}, ${props.time}. Drag to move.`}
      aria-roledescription="Draggable event"
      state={isDragging ? "dragging" : "default"}
      className={cn(
        "absolute z-10 cursor-grab",
        props.className,
        isDragging && "z-40 cursor-grabbing",
        hidden && !isDragging && "opacity-0",
      )}
      style={{
        ...style,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    />
  );
}

/** A suggested (AI-proposed) event: click to accept it or say it's not for you. */
function SuggestedEvent({
  event,
  style,
  ...props
}: {
  event: CalendarEvent;
  style: React.CSSProperties;
  title: string;
  time: string;
  color: ReturnType<typeof calendarColor>;
  showTime: boolean;
  className?: string;
}) {
  const { dispatch } = useStore();
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <EventBlock
          {...props}
          state="suggested"
          role="button"
          tabIndex={0}
          aria-label={`Suggested: ${event.title}, ${props.time}`}
          className={cn(
            "absolute z-10 cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            props.className,
          )}
          style={style}
        />
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-64 p-3">
        <p className="text-sm font-medium">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {format(parseISO(event.start), "EEEE")} · {props.time}
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="h-7 px-2.5"
            onClick={() => {
              dispatch({ type: "event/accept", id: event.id });
              setOpen(false);
            }}
          >
            Add to calendar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 shadow-none"
            onClick={() => {
              dispatch({ type: "event/dismiss", id: event.id });
              setOpen(false);
            }}
          >
            Not interested
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
