import {
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { CalendarEvent, Task, WeatherKind } from "./types";

/** Time Grid (AC): 7 AM – 9 PM. */
export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 21;
export const GRID_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

/** Work Task (AC) duration pill: "2:00", "0:15". */
export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** Planned totals: "3h 15m", "45m", "8h". */
export function formatPlanned(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Time pill on a task: "10:00". */
export function formatClock(iso: string) {
  return format(parseISO(iso), "H:mm");
}

/** "10:00 – 11:30 AM", "11:30 AM – 12:15 PM". */
export function formatTimeRange(startIso: string, endIso: string) {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  const sameHalf = format(s, "a") === format(e, "a");
  const fmt = (d: Date, withHalf: boolean) =>
    format(d, d.getMinutes() ? "h:mm" : "h:mm") + (withHalf ? ` ${format(d, "a")}` : "");
  return `${fmt(s, !sameHalf)} – ${fmt(e, true)}`;
}

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

/* ---------- task lists ---------- */

export function tasksForDay(tasks: Task[], date: Date) {
  const key = ymd(date);
  return tasks.filter(
    (t) =>
      (t.bucket.kind === "day" && t.bucket.date === key) ||
      (t.scheduledAt && isSameDay(parseISO(t.scheduledAt), date)),
  );
}

function bucketDate(t: Task): Date | null {
  if (t.bucket.kind === "day") return parseISO(t.bucket.date);
  if (t.bucket.kind === "week") return parseISO(t.bucket.weekStart);
  return null;
}

/** Week "To schedule": unscheduled tasks for that week or any day in it. */
export function tasksToScheduleForWeek(tasks: Task[], date: Date, weekStartsOn: 0 | 1) {
  const interval = { start: startOfWeek(date, { weekStartsOn }), end: endOfWeek(date, { weekStartsOn }) };
  return tasks.filter((t) => {
    if (t.scheduledAt) return false;
    const d = bucketDate(t);
    return d ? isWithinInterval(d, interval) : false;
  });
}

/** Month "This month": unscheduled tasks for that month, or any week or day in it. */
export function tasksForMonth(tasks: Task[], date: Date) {
  const interval = { start: startOfMonth(date), end: endOfMonth(date) };
  const month = format(date, "yyyy-MM");
  return tasks.filter((t) => {
    if (t.scheduledAt) return false;
    if (t.bucket.kind === "month") return t.bucket.month === month;
    const d = bucketDate(t);
    return d ? isWithinInterval(d, interval) : false;
  });
}

export function totalMinutes(tasks: Task[]) {
  return tasks.reduce((sum, t) => sum + t.durationMin, 0);
}

/* ---------- events ---------- */

export function eventsOnDay(events: CalendarEvent[], date: Date) {
  return events.filter((e) => {
    const s = parseISO(e.start);
    const en = parseISO(e.end);
    if (e.allDay) return isSameDay(s, date) || (s <= date && en >= date);
    return isSameDay(s, date);
  });
}

export type PositionedEvent = {
  event: CalendarEvent;
  /** Minutes from the top of the grid (7 AM). */
  top: number;
  height: number;
  /** Column within its overlap cluster. */
  col: number;
  cols: number;
};

/**
 * Lay out a day's timed events: overlapping events split the column. Events are clamped to
 * the grid's 7 AM – 9 PM window; ones fully outside it are dropped.
 */
export function layoutDay(events: CalendarEvent[]): PositionedEvent[] {
  const timed = events
    .filter((e) => !e.allDay)
    .map((e) => {
      const s = parseISO(e.start);
      const en = parseISO(e.end);
      const startMin = s.getHours() * 60 + s.getMinutes() - GRID_START_HOUR * 60;
      const endMin = startMin + Math.max(15, differenceInMinutes(en, s));
      return { event: e, startMin, endMin };
    })
    .filter((x) => x.endMin > 0 && x.startMin < GRID_MINUTES)
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const out: PositionedEvent[] = [];
  let cluster: { item: (typeof timed)[number]; col: number }[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((c) => c.col + 1));
    for (const c of cluster) {
      const top = Math.max(0, c.item.startMin);
      const bottom = Math.min(GRID_MINUTES, c.item.endMin);
      out.push({ event: c.item.event, top, height: bottom - top, col: c.col, cols });
    }
    cluster = [];
  };
  for (const item of timed) {
    if (item.startMin >= clusterEnd) {
      flush();
      clusterEnd = -Infinity;
    }
    // First column whose last event has ended.
    const colEnds: number[] = [];
    for (const c of cluster) colEnds[c.col] = Math.max(colEnds[c.col] ?? -Infinity, c.item.endMin);
    let col = colEnds.findIndex((end) => end <= item.startMin);
    if (col === -1) col = colEnds.length;
    cluster.push({ item, col });
    clusterEnd = Math.max(clusterEnd, item.endMin);
  }
  flush();
  return out;
}

/** Minutes since the grid start for a Date, or null if outside the grid. */
export function minutesIntoGrid(d: Date) {
  const m = d.getHours() * 60 + d.getMinutes() - GRID_START_HOUR * 60;
  return m < 0 || m > GRID_MINUTES ? null : m;
}

/** Snap minutes to a step (default 15). */
export function snap(min: number, step = 15) {
  return Math.round(min / step) * step;
}

/* ---------- mock weather ---------- */

const WEATHER: WeatherKind[] = ["sun", "cloud-sun", "cloud", "rain", "sun", "cloud-sun", "cloud"];

/** Deterministic example weather per date until a weather source is connected. */
export function weatherFor(date: Date): { kind: WeatherKind; temp: number } {
  const n = Math.floor(date.getTime() / 86_400_000);
  return { kind: WEATHER[((n % 7) + 7) % 7], temp: 55 + (((n * 37) % 13) + 13) % 13 };
}
