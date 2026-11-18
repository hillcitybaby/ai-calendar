export const CALENDAR_COLORS = [
  "blue",
  "violet",
  "pink",
  "orange",
  "amber",
  "emerald",
  "teal",
  "slate",
] as const;

export type CalendarColor = (typeof CALENDAR_COLORS)[number];

export type Calendar = {
  id: string;
  name: string;
  color: CalendarColor;
};

/**
 * CSS custom properties for one calendar color. Tailwind can't build class names
 * from runtime values, so components read these through `var(--cal-*)`.
 */
export function calendarColorVars(color: CalendarColor): React.CSSProperties {
  return {
    "--cal-subtle": `var(--calendar-${color}-subtle)`,
    "--cal-bg": `var(--calendar-${color}-bg)`,
    "--cal-accent": `var(--calendar-${color}-accent)`,
    "--cal-text": `var(--calendar-${color}-text)`,
  } as React.CSSProperties;
}

/** Example calendars matching the default mapping in the design. */
export const EXAMPLE_CALENDARS: Calendar[] = [
  { id: "work", name: "Work", color: "blue" },
  { id: "personal", name: "Personal", color: "violet" },
  { id: "keep", name: "Keep to-dos", color: "amber" },
  { id: "date-nights", name: "Date nights", color: "pink" },
  { id: "local-events", name: "Local events", color: "teal" },
];

/** The color of a calendar by id; slate for unknown calendars. */
export function calendarColor(calendarId: string): CalendarColor {
  return EXAMPLE_CALENDARS.find((c) => c.id === calendarId)?.color ?? "slate";
}
