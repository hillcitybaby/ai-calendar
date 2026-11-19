import { describe, expect, it } from "vitest";

import { reducer, type State } from "./reducer";
import { buildSeed } from "./mock-data";
import { bucketLabel, durationLabel, normalizeChannel, whenOptions } from "./task-options";

const today = new Date(2026, 10, 19); // Thu, Nov 19 2026

describe("task options", () => {
  it("labels lengths", () => {
    expect(durationLabel(15)).toBe("15m");
    expect(durationLabel(60)).toBe("1h");
    expect(durationLabel(90)).toBe("1h 30m");
  });

  it("normalizes tags", () => {
    expect(normalizeChannel("#Deep Work")).toBe("deep-work");
    expect(normalizeChannel("  errands ")).toBe("errands");
  });

  it("offers Sunday-start week buckets and labels them back", () => {
    const opts = whenOptions(today, 0);
    expect(opts.find((o) => o.id === "this-week")?.bucket).toEqual({ kind: "week", weekStart: "2026-11-15" });
    expect(bucketLabel({ kind: "day", date: "2026-11-20" }, today, 0)).toBe("Tomorrow");
    expect(bucketLabel({ kind: "day", date: "2026-11-27" }, today, 0)).toBe("Fri, Nov 27");
    expect(bucketLabel({ kind: "month", month: "2026-11" }, today, 0)).toBe("This month");
  });
});

describe("task update and delete", () => {
  const seeded = (): State => {
    const s = buildSeed(today) as State;
    return reducer(s, { type: "task/schedule", id: s.tasks[0].id, start: "2026-11-19T10:00:00" });
  };

  it("keeps a time-boxed block in step with the to-do", () => {
    const s = seeded();
    const id = s.tasks[0].id;
    const next = reducer(s, { type: "task/update", id, patch: { title: "Renamed", durationMin: 45 } });
    const ev = next.events.find((e) => e.taskId === id)!;
    expect(ev.title).toBe("Renamed");
    expect(ev.end).toBe("2026-11-19T10:45:00");
  });

  it("unschedules a to-do moved to another list", () => {
    const s = seeded();
    const id = s.tasks[0].id;
    const next = reducer(s, { type: "task/update", id, patch: { bucket: { kind: "month", month: "2026-12" } } });
    expect(next.tasks.find((t) => t.id === id)?.scheduledAt).toBeUndefined();
    expect(next.events.some((e) => e.taskId === id)).toBe(false);
  });

  it("deletes a to-do and its block", () => {
    const s = seeded();
    const id = s.tasks[0].id;
    const next = reducer(s, { type: "task/delete", id });
    expect(next.tasks.some((t) => t.id === id)).toBe(false);
    expect(next.events.some((e) => e.taskId === id)).toBe(false);
  });
});
