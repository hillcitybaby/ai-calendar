import type { CalendarColor } from "./calendars";

/** Where a to-do lives until it's time-boxed: a specific day, a week, or a month. */
export type TaskBucket =
  | { kind: "day"; date: string } // yyyy-MM-dd
  | { kind: "week"; weekStart: string } // yyyy-MM-dd of the week's first day
  | { kind: "month"; month: string }; // yyyy-MM

export type Subtask = { id: string; title: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  durationMin: number;
  bucket: TaskBucket;
  /** Set when time-boxed on the calendar (ISO, local time). */
  scheduledAt?: string;
  subtasks: Subtask[];
  channel?: string;
  done: boolean;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  start: string; // ISO, local time
  end: string;
  allDay?: boolean;
  /** AI proposal not yet accepted: renders as Event Block (AC) State=Suggested. */
  suggested?: boolean;
  /** Set when the event came from a suggestion. */
  suggestionId?: string;
  /** Set when the event is a time-boxed task. */
  taskId?: string;
};

export type WeatherKind = "sun" | "cloud-sun" | "cloud" | "rain" | "moon";
export type CostTier = "free" | "cost" | "expensive";

export type Suggestion = {
  id: string;
  kind: "activity" | "localEvent";
  title: string;
  subtitle: string;
  placeType: string;
  placeIcon: string; // lucide icon name, see suggestion icons map
  travelMin: number;
  start: string; // ISO
  end: string;
  weather: WeatherKind;
  cost: CostTier;
  photo?: string;
  calendarId: string;
  status: "new" | "accepted" | "dismissed";
};

export type PlanStep = {
  id: string;
  change: "add" | "move" | "remove";
  title: string;
  detail: string;
  status: "pending" | "applied" | "skipped";
};

export type DayPlan = {
  date: string;
  title: string;
  steps: PlanStep[];
  status: "open" | "applied" | "dismissed" | "reviewing";
};

export type Interest = { id: string; label: string; suggested?: boolean };

export type Connector = {
  id: string;
  kind: "calendar" | "integration";
  provider: string;
  account?: string;
  detail: string;
  status: "connected" | "error";
};

export type ChannelColor = Record<string, CalendarColor>;
