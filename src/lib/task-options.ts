import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";

import { CHANNEL_COLORS } from "./mock-data";
import type { Task, TaskBucket } from "./types";

/** Lengths offered in the length dropdown, in minutes. */
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240];

/** "15m", "1h", "1h 30m": the dropdown's labels. */
export function durationLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Every tag in use, plus the example set, alphabetical. */
export function allChannels(tasks: Task[]) {
  const set = new Set<string>(Object.keys(CHANNEL_COLORS));
  for (const t of tasks) if (t.channel) set.add(t.channel);
  return [...set].sort();
}

/** Tags are lowercase words: "#Deep Work" → "deep-work". */
export function normalizeChannel(input: string) {
  return input.trim().replace(/^#/, "").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export type WhenOption = { id: string; label: string; bucket: TaskBucket };

/** Quick choices for when a to-do is due: a day, a week's list or a month's list. */
export function whenOptions(today: Date, weekStartsOn: 0 | 1): WhenOption[] {
  const day = (d: Date): TaskBucket => ({ kind: "day", date: format(d, "yyyy-MM-dd") });
  const week = (d: Date): TaskBucket => ({ kind: "week", weekStart: format(startOfWeek(d, { weekStartsOn }), "yyyy-MM-dd") });
  const month = (d: Date): TaskBucket => ({ kind: "month", month: format(d, "yyyy-MM") });
  return [
    { id: "today", label: "Today", bucket: day(today) },
    { id: "tomorrow", label: "Tomorrow", bucket: day(addDays(today, 1)) },
    { id: "this-week", label: "This week", bucket: week(today) },
    { id: "next-week", label: "Next week", bucket: week(addWeeks(today, 1)) },
    { id: "this-month", label: "This month", bucket: month(today) },
    { id: "next-month", label: "Next month", bucket: month(addMonths(today, 1)) },
  ];
}

export const sameBucket = (a: TaskBucket, b: TaskBucket) => JSON.stringify(a) === JSON.stringify(b);

/** "Today", "Tomorrow", "Fri, Nov 27", "This week", "Week of Nov 29", "December". */
export function bucketLabel(bucket: TaskBucket, today: Date, weekStartsOn: 0 | 1) {
  const named = whenOptions(today, weekStartsOn).find((o) => sameBucket(o.bucket, bucket));
  if (named) return named.label;
  if (bucket.kind === "day") {
    const d = parseISO(bucket.date);
    return isSameDay(d, today) ? "Today" : format(d, "EEE, MMM d");
  }
  if (bucket.kind === "week") return `Week of ${format(parseISO(bucket.weekStart), "MMM d")}`;
  return format(parseISO(`${bucket.month}-01`), "MMMM yyyy");
}
