import { describe, expect, it } from "vitest";

import { parseTask } from "./parse-task";

const today = new Date(2026, 10, 17); // Tuesday

describe("parseTask", () => {
  it("pulls out length, channel and day", () => {
    const p = parseTask("Review case study 45m #work tomorrow", today);
    expect(p.title).toBe("Review case study");
    expect(p.durationMin).toBe(45);
    expect(p.channel).toBe("work");
    expect(p.dayLabel).toBe("Tomorrow");
    expect(p.day?.getDate()).toBe(18);
  });
  it("reads hours and combined lengths", () => {
    expect(parseTask("Write spec 1h30m", today).durationMin).toBe(90);
    expect(parseTask("Write spec 1.5h", today).durationMin).toBe(90);
    expect(parseTask("Write spec 2h", today).durationMin).toBe(120);
  });
  it("resolves weekdays to the next one", () => {
    const p = parseTask("Call the plumber fri", today);
    expect(p.dayLabel).toBe("Friday");
    expect(p.day?.getDate()).toBe(20);
  });
  it("leaves plain text alone", () => {
    const p = parseTask("Buy milk", today);
    expect(p).toEqual({ title: "Buy milk" });
  });
});
