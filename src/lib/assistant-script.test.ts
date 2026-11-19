import { describe, expect, it } from "vitest";

import { scriptedReply } from "./assistant-script";
import { buildSeed } from "./mock-data";
import { reducer } from "./reducer";

const today = new Date(2026, 10, 18, 9); // Wednesday morning

describe("scriptedReply", () => {
  it("finds a free evening and proposes holding it", () => {
    const state = buildSeed(today);
    const r = scriptedReply("Find a free evening", state, today);
    expect(r.plan?.steps).toHaveLength(1);
    const next = reducer(state, r.plan!.steps[0].action);
    expect(next.events.some((e) => e.title === "Free evening")).toBe(true);
  });

  it("searches nearby and returns suggestions", () => {
    const state = buildSeed(today);
    const r = scriptedReply("What's on near me?", state, today);
    expect(r.working).toBe("searching");
    expect(r.suggestionIds?.length).toBeGreaterThan(0);
  });

  it("plans next week by time-boxing open to-dos inside working hours", () => {
    const state = buildSeed(today);
    const r = scriptedReply("Plan next week", state, today);
    expect(r.plan?.steps.length).toBeGreaterThan(0);
    let next = state;
    for (const s of r.plan!.steps) next = reducer(next, s.action);
    const scheduled = next.tasks.filter((t) => t.scheduledAt && t.scheduledAt > "2026-11-22");
    expect(scheduled.length).toBe(r.plan!.steps.length);
    for (const t of scheduled) {
      const h = new Date(t.scheduledAt!).getHours();
      expect(h).toBeGreaterThanOrEqual(9);
      expect(h).toBeLessThan(17);
    }
  });

  it("falls back to a hint", () => {
    const r = scriptedReply("hello", buildSeed(today), today);
    expect(r.plan).toBeUndefined();
    expect(r.text).toMatch(/Try one of the suggestions/);
  });
});
