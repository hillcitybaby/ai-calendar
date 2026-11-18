import { describe, expect, it } from "vitest";

import { formatWorkingHours, parseMinutes, parseWorkingHours } from "./settings";

describe("working hours", () => {
  it("formats", () => {
    expect(formatWorkingHours({ start: 9, end: 17, days: "Mon–Fri" })).toBe("9:00 AM – 5:00 PM · Mon–Fri");
    expect(formatWorkingHours({ start: 8.5, end: 12, days: "Mon–Thu" })).toBe("8:30 AM – 12:00 PM · Mon–Thu");
  });
  it("round-trips its own format", () => {
    expect(parseWorkingHours("9:00 AM – 5:00 PM · Mon–Fri")).toEqual({ start: 9, end: 17, days: "Mon–Fri" });
  });
  it("reads short forms", () => {
    expect(parseWorkingHours("9-5")).toEqual({ start: 9, end: 17, days: "Mon–Fri" });
    expect(parseWorkingHours("8am-4:30pm · Mon–Thu")).toEqual({ start: 8, end: 16.5, days: "Mon–Thu" });
  });
  it("rejects nonsense", () => {
    expect(parseWorkingHours("whenever")).toBeNull();
  });
});

describe("parseMinutes", () => {
  it("reads minutes and hours", () => {
    expect(parseMinutes("30 min")).toBe(30);
    expect(parseMinutes("45")).toBe(45);
    expect(parseMinutes("1h")).toBe(60);
    expect(parseMinutes("none")).toBeNull();
  });
});
