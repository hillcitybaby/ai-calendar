import { describe, expect, it } from "vitest";

import {
  formatDuration,
  formatPlanned,
  formatTimeRange,
  isThisWeekend,
  layoutDay,
  snap,
  tasksForDay,
  tasksForMonth,
  tasksToScheduleForWeek,
} from "./schedule";
import type { CalendarEvent, Task } from "./types";

const ev = (id: string, start: string, end: string, extra: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id,
  calendarId: "work",
  title: id,
  start: `2026-11-17T${start}:00`,
  end: `2026-11-17T${end}:00`,
  ...extra,
});

const task = (id: string, bucket: Task["bucket"], extra: Partial<Task> = {}): Task => ({
  id,
  title: id,
  durationMin: 30,
  bucket,
  subtasks: [],
  done: false,
  ...extra,
});

describe("formatting", () => {
  it("formats durations as h:mm", () => {
    expect(formatDuration(120)).toBe("2:00");
    expect(formatDuration(15)).toBe("0:15");
    expect(formatDuration(90)).toBe("1:30");
  });
  it("formats planned totals", () => {
    expect(formatPlanned(195)).toBe("3h 15m");
    expect(formatPlanned(45)).toBe("45m");
    expect(formatPlanned(480)).toBe("8h");
  });
  it("formats time ranges, sharing AM/PM when both sides match", () => {
    expect(formatTimeRange("2026-11-17T10:00:00", "2026-11-17T11:30:00")).toBe("10:00 – 11:30 AM");
    expect(formatTimeRange("2026-11-17T11:30:00", "2026-11-17T12:15:00")).toBe("11:30 AM – 12:15 PM");
  });
  it("snaps to 15 minutes", () => {
    expect(snap(52)).toBe(45);
    expect(snap(53)).toBe(60);
  });
});

describe("layoutDay", () => {
  it("gives non-overlapping events the full width", () => {
    const out = layoutDay([ev("a", "08:00", "09:00"), ev("b", "09:00", "10:00")]);
    expect(out.map((p) => [p.event.id, p.col, p.cols])).toEqual([
      ["a", 0, 1],
      ["b", 0, 1],
    ]);
    expect(out[0].top).toBe(60);
    expect(out[0].height).toBe(60);
  });
  it("splits overlapping events into columns", () => {
    const out = layoutDay([ev("a", "18:00", "19:00"), ev("b", "18:30", "19:30"), ev("c", "20:00", "20:30")]);
    const byId = Object.fromEntries(out.map((p) => [p.event.id, p]));
    expect([byId.a.col, byId.a.cols]).toEqual([0, 2]);
    expect([byId.b.col, byId.b.cols]).toEqual([1, 2]);
    expect([byId.c.col, byId.c.cols]).toEqual([0, 1]);
  });
  it("reuses a column once its event ends", () => {
    const out = layoutDay([ev("a", "09:00", "11:00"), ev("b", "09:30", "10:00"), ev("c", "10:00", "10:30")]);
    const byId = Object.fromEntries(out.map((p) => [p.event.id, p]));
    expect(byId.c.col).toBe(1);
    expect(byId.c.cols).toBe(2);
  });
  it("clamps to the grid and drops all-day and out-of-range events", () => {
    const out = layoutDay([
      ev("early", "06:00", "08:00"),
      ev("night", "22:00", "23:00"),
      ev("allday", "00:00", "23:59", { allDay: true }),
    ]);
    expect(out.map((p) => p.event.id)).toEqual(["early"]);
    expect(out[0].top).toBe(0);
    expect(out[0].height).toBe(60);
  });
});

describe("task lists", () => {
  const day = new Date(2026, 10, 17); // Tue Nov 17 2026
  const tasks = [
    task("today", { kind: "day", date: "2026-11-17" }),
    task("scheduled", { kind: "day", date: "2026-11-17" }, { scheduledAt: "2026-11-17T10:00:00" }),
    task("week", { kind: "week", weekStart: "2026-11-15" }),
    task("nextWeek", { kind: "week", weekStart: "2026-11-22" }),
    task("month", { kind: "month", month: "2026-11" }),
    task("otherMonth", { kind: "month", month: "2026-12" }),
  ];
  it("Today lists the day's tasks, scheduled or not", () => {
    expect(tasksForDay(tasks, day).map((t) => t.id)).toEqual(["today", "scheduled"]);
  });
  it("Week lists unscheduled tasks in that week", () => {
    expect(tasksToScheduleForWeek(tasks, day, 0).map((t) => t.id)).toEqual(["today", "week"]);
  });
  it("Month lists unscheduled tasks in that month", () => {
    expect(tasksForMonth(tasks, day).map((t) => t.id)).toEqual(["today", "week", "nextWeek", "month"]);
  });
});

describe("isThisWeekend", () => {
  const wed = new Date(2026, 10, 18);
  it("covers Friday evening through Sunday", () => {
    expect(isThisWeekend(new Date(2026, 10, 20, 18), wed)).toBe(true);
    expect(isThisWeekend(new Date(2026, 10, 21, 10), wed)).toBe(true);
    expect(isThisWeekend(new Date(2026, 10, 22, 10, 30), wed)).toBe(true);
  });
  it("excludes weekdays and the following week", () => {
    expect(isThisWeekend(new Date(2026, 10, 20, 9), wed)).toBe(false);
    expect(isThisWeekend(new Date(2026, 10, 26, 9), wed)).toBe(false);
  });
  it("uses the current weekend on Sunday", () => {
    expect(isThisWeekend(new Date(2026, 10, 22, 15), new Date(2026, 10, 22))).toBe(true);
  });
});
