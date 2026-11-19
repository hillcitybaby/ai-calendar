import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  isSameYear,
  isValid,
  parseISO,
  startOfWeek,
} from "date-fns";

export type CalendarView = "day" | "week" | "month";

export const VIEW_PATHS: Record<CalendarView, string> = {
  day: "/today",
  week: "/week",
  month: "/month",
};

/** Mobile keeps Today as its own tab, so the Calendar tab's Day view lives at /day. */
export const MOBILE_VIEW_PATHS: Record<CalendarView, string> = {
  day: "/day",
  week: "/week",
  month: "/month",
};

export function viewFromPath(pathname: string): CalendarView | null {
  if (pathname === "/day" || pathname.startsWith("/day/")) return "day";
  const entry = Object.entries(VIEW_PATHS).find(
    ([, p]) => pathname === p || pathname.startsWith(`${p}/`),
  );
  return entry ? (entry[0] as CalendarView) : null;
}

/** Default week start (Sunday); Settings › General can change it. */
export const WEEK_STARTS_ON = 0 as const;

/** Read the `?date=YYYY-MM-DD` param, falling back to today. */
export function parseDateParam(value: string | null | undefined, today: Date): Date {
  if (!value) return today;
  const d = parseISO(value);
  return isValid(d) ? d : today;
}

export function toDateParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function shiftDate(date: Date, view: CalendarView, step: 1 | -1) {
  if (view === "day") return addDays(date, step);
  if (view === "week") return addWeeks(date, step);
  return addMonths(date, step);
}

/** Top bar title: "Tuesday, November 17" for day; "November 2026" for week and month. */
export function viewTitle(date: Date, view: CalendarView, weekStartsOn: 0 | 1 = WEEK_STARTS_ON) {
  if (view === "day") return format(date, "EEEE, MMMM d");
  if (view === "month") return format(date, "MMMM yyyy");
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  if (isSameMonth(start, end)) return format(start, "MMMM yyyy");
  if (isSameYear(start, end)) return `${format(start, "MMM")} – ${format(end, "MMM yyyy")}`;
  return `${format(start, "MMM yyyy")} – ${format(end, "MMM yyyy")}`;
}

export function prevNextLabels(view: CalendarView) {
  const unit = view === "day" ? "day" : view === "week" ? "week" : "month";
  return { prev: `Previous ${unit}`, next: `Next ${unit}` };
}
