export type Settings = {
  name: string;
  timeZone: string;
  weekStartsOn: 0 | 1;
  theme: "light" | "dark" | "system";
  workingHours: { start: number; end: number; days: string };
  morningPlan: boolean;
  defaultTaskMin: number;
  protectFamilyTime: boolean;
  suggestionAmount: "few" | "some" | "lots";
  budget: "free" | "some" | "any";
  kidFriendlyFirst: boolean;
  useWeather: boolean;
  homeArea: string;
  notifyMorningPlan: boolean;
  notifySuggestionDigest: boolean;
  reminderMin: number;
};

export const DEFAULT_SETTINGS: Settings = {
  name: "Alex",
  timeZone: "Central Time",
  weekStartsOn: 0,
  theme: "system",
  workingHours: { start: 9, end: 17, days: "Mon–Fri" },
  morningPlan: true,
  defaultTaskMin: 30,
  protectFamilyTime: true,
  suggestionAmount: "some",
  budget: "free",
  kidFriendlyFirst: true,
  useWeather: true,
  homeArea: "Your town · within 30 miles",
  notifyMorningPlan: true,
  notifySuggestionDigest: true,
  reminderMin: 10,
};

const hourLabel = (h: number) => {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  const suffix = whole >= 12 ? "PM" : "AM";
  const h12 = whole % 12 === 0 ? 12 : whole % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${suffix}`;
};

/** "9:00 AM – 5:00 PM · Mon–Fri" */
export function formatWorkingHours(w: Settings["workingHours"]) {
  return `${hourLabel(w.start)} – ${hourLabel(w.end)} · ${w.days}`;
}

/**
 * Read working hours typed as "9 – 5", "9:00 AM – 5:30 PM · Mon–Fri", "8am-4pm".
 * Without AM/PM, an end at or before the start is read as PM. Returns null if unreadable.
 */
export function parseWorkingHours(text: string, fallbackDays = "Mon–Fri"): Settings["workingHours"] | null {
  const [range, days] = text.split("·").map((s) => s.trim());
  const m = range.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  const to24 = (h: string, min: string | undefined, ap: string | undefined) => {
    let hour = Number(h) % 12;
    if (ap?.toLowerCase() === "pm") hour += 12;
    if (!ap && Number(h) === 12) hour = 12;
    return hour + Number(min ?? 0) / 60;
  };
  const start = to24(m[1], m[2], m[3] ?? (m[6] && !m[3] && Number(m[1]) < 12 ? "am" : undefined));
  let end = to24(m[4], m[5], m[6]);
  if (!m[6] && end <= start) end += 12;
  if (end <= start || end > 24) return null;
  return { start, end, days: days || fallbackDays };
}

/** First number in "30 min", "45", "1h" (hours become minutes). */
export function parseMinutes(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour|hours)?/i);
  if (!m) return null;
  const n = Number(m[1]) * (m[2] ? 60 : 1);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}
