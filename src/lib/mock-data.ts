/**
 * Generic example data, laid out around the current week so the prototype always looks lived-in.
 * The repo is public: keep every name, place and detail generic.
 */
import { addDays, format, set, startOfWeek } from "date-fns";

import { WEEK_STARTS_ON } from "./calendar-view";
import type {
  CalendarEvent,
  ChannelColor,
  Connector,
  DayPlan,
  Interest,
  Suggestion,
  Task,
} from "./types";
import type { Settings } from "./settings";
import { DEFAULT_SETTINGS } from "./settings";

export const CHANNEL_COLORS: ChannelColor = {
  product: "violet",
  design: "blue",
  growth: "orange",
  family: "pink",
  personal: "violet",
  errands: "amber",
  home: "teal",
  health: "emerald",
  work: "blue",
};

export type SeedData = {
  tasks: Task[];
  events: CalendarEvent[];
  suggestions: Suggestion[];
  plans: DayPlan[];
  interests: Interest[];
  connectors: Connector[];
  settings: Settings;
};

const ymd = (d: Date) => format(d, "yyyy-MM-dd");
const at = (day: Date, h: number, m = 0) =>
  format(set(day, { hours: h, minutes: m, seconds: 0, milliseconds: 0 }), "yyyy-MM-dd'T'HH:mm:ss");

export function buildSeed(today: Date): SeedData {
  const weekStart = startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON });
  const d = (i: number) => addDays(weekStart, i); // 0 = Sunday
  const month = format(today, "yyyy-MM");
  const sat = d(6);

  let n = 0;
  const id = (p: string) => `${p}-${++n}`;
  const ev = (
    day: Date,
    calendarId: string,
    title: string,
    sh: number,
    sm: number,
    eh: number,
    em: number,
    extra: Partial<CalendarEvent> = {},
  ): CalendarEvent => ({
    id: id("ev"),
    calendarId,
    title,
    start: at(day, sh, sm),
    end: at(day, eh, em),
    ...extra,
  });

  const designReviewTask = id("task");

  const events: CalendarEvent[] = [
    { id: id("ev"), calendarId: "personal", title: "Friend's birthday", start: at(today, 0), end: at(today, 23, 59), allDay: true },
    ev(d(1), "work", "Intro call with new client", 11, 0, 11, 30),
    ev(d(1), "work", "Team standup", 13, 0, 13, 30),
    ev(d(1), "personal", "Kids' swim lesson", 18, 0, 19, 0),
    ev(d(1), "personal", "Dinner with friends", 18, 30, 19, 30),
    ev(d(2), "personal", "House cleaner", 8, 0, 9, 0),
    ev(d(2), "personal", "School tour", 9, 0, 10, 0),
    ev(d(2), "work", "Customer interview", 13, 0, 13, 30),
    ev(d(2), "work", "Interview prep", 15, 0, 15, 30),
    ev(d(3), "work", "Roadmap sync", 11, 0, 11, 30),
    ev(d(3), "work", "Partner interview", 15, 0, 16, 0),
    ev(d(3), "work", "Lunch and learn", 16, 30, 17, 0),
    ev(d(3), "personal", "Preschool tour", 18, 0, 19, 0),
    ev(d(4), "work", "Project handoff", 10, 0, 11, 0),
    ev(d(4), "work", "1:1 with manager", 15, 0, 15, 30),
    ev(d(5), "work", "Sprint planning", 10, 0, 11, 0),
    ev(d(0), "local-events", "Farmers market", 8, 0, 9, 0),
    // The time-boxed task shows on the grid too.
    { ...ev(today, "work", "Design review", 10, 0, 11, 0), taskId: designReviewTask },
    ev(today, "keep", "Send thank-you note", 13, 30, 13, 45),
    ev(today, "keep", "Book a sitter for date night", 15, 30, 15, 45),
  ];

  // Repeat a couple of recurring items across the month so Month view has texture.
  for (let w = -3; w <= 4; w++) {
    const base = addDays(weekStart, w * 7);
    if (format(base, "yyyy-MM") !== month && format(addDays(base, 6), "yyyy-MM") !== month) continue;
    if (w !== 0) {
      events.push(ev(addDays(base, 2), "personal", "House cleaner", 8, 0, 9, 0));
      events.push(ev(addDays(base, 3), "work", "Roadmap sync", 11, 0, 11, 30));
      events.push(ev(addDays(base, 6), "local-events", "Farmers market", 8, 0, 9, 0));
    }
  }
  events.push(ev(addDays(weekStart, -1), "date-nights", "Date night", 19, 0, 21, 0));

  const tasks: Task[] = [
    {
      id: id("task"),
      title: "Build daily notes feature",
      durationMin: 120,
      bucket: { kind: "day", date: ymd(today) },
      subtasks: [],
      channel: "product",
      done: false,
    },
    {
      id: id("task"),
      title: "Document customer feedback",
      durationMin: 60,
      bucket: { kind: "day", date: ymd(today) },
      subtasks: [
        { id: id("sub"), title: "Summarize churn surveys", done: false },
        { id: id("sub"), title: "Review top feature requests", done: false },
      ],
      channel: "product",
      done: false,
    },
    {
      id: designReviewTask,
      title: "Design review",
      durationMin: 60,
      bucket: { kind: "day", date: ymd(today) },
      scheduledAt: at(today, 10),
      subtasks: [],
      channel: "design",
      done: false,
    },
    {
      id: id("task"),
      title: "Reply about launch copy",
      durationMin: 15,
      bucket: { kind: "day", date: ymd(today) },
      subtasks: [],
      channel: "growth",
      done: true,
    },
    {
      id: id("task"),
      title: "Inbox cleanup",
      durationMin: 30,
      bucket: { kind: "day", date: ymd(today) },
      subtasks: [],
      channel: "work",
      done: false,
    },
    {
      id: id("task"),
      title: "Take the kids to the museum",
      durationMin: 150,
      bucket: { kind: "week", weekStart: ymd(weekStart) },
      subtasks: [],
      channel: "family",
      done: true,
    },
    {
      id: id("task"),
      title: "Book a sitter for date night",
      durationMin: 15,
      bucket: { kind: "week", weekStart: ymd(weekStart) },
      subtasks: [],
      channel: "family",
      done: false,
    },
    {
      id: id("task"),
      title: "Send thank-you note",
      durationMin: 10,
      bucket: { kind: "week", weekStart: ymd(weekStart) },
      subtasks: [],
      channel: "personal",
      done: false,
    },
    {
      id: id("task"),
      title: "Return library books",
      durationMin: 20,
      bucket: { kind: "week", weekStart: ymd(weekStart) },
      subtasks: [],
      channel: "errands",
      done: false,
    },
    { id: id("task"), title: "Plan holiday menu", durationMin: 60, bucket: { kind: "month", month }, subtasks: [], channel: "home", done: false },
    { id: id("task"), title: "Order holiday cards", durationMin: 30, bucket: { kind: "month", month }, subtasks: [], channel: "home", done: false },
    { id: id("task"), title: "Schedule flu shots", durationMin: 15, bucket: { kind: "month", month }, subtasks: [], channel: "health", done: false },
    { id: id("task"), title: "Clean out the garage", durationMin: 120, bucket: { kind: "month", month }, subtasks: [], channel: "home", done: false },
  ];

  const sug = (s: Omit<Suggestion, "id" | "status">): Suggestion => ({ ...s, id: id("sug"), status: "new" });
  const thu = d(4);
  const sun = addDays(weekStart, 7);
  const suggestions: Suggestion[] = [
    sug({
      kind: "activity",
      title: "Take the kids to the science museum",
      subtitle: "Downtown",
      placeType: "Children's museum",
      placeIcon: "landmark",
      travelMin: 25,
      start: at(sat, 10),
      end: at(sat, 12, 30),
      weather: "rain",
      cost: "cost",
      calendarId: "personal",
    }),
    sug({
      kind: "localEvent",
      title: "Saturday farmers market",
      subtitle: "Town square",
      placeType: "Farmers market",
      placeIcon: "shopping-basket",
      travelMin: 5,
      start: at(sat, 8),
      end: at(sat, 9),
      weather: "sun",
      cost: "free",
      calendarId: "local-events",
    }),
    sug({
      kind: "activity",
      title: "Date night at a wine bar",
      subtitle: "Downtown",
      placeType: "Restaurant",
      placeIcon: "wine",
      travelMin: 12,
      start: at(sat, 19),
      end: at(sat, 21),
      weather: "moon",
      cost: "expensive",
      calendarId: "date-nights",
    }),
    sug({
      kind: "localEvent",
      title: "Parents' group playdate",
      subtitle: "Hosted by the neighborhood parents' group",
      placeType: "City park",
      placeIcon: "trees",
      travelMin: 6,
      start: at(addDays(thu, 7), 9, 30),
      end: at(addDays(thu, 7), 11),
      weather: "sun",
      cost: "free",
      calendarId: "local-events",
    }),
    sug({
      kind: "localEvent",
      title: "Library story time",
      subtitle: "Public library",
      placeType: "Library",
      placeIcon: "book-open",
      travelMin: 8,
      start: at(sun, 10, 30),
      end: at(sun, 11, 15),
      weather: "cloud-sun",
      cost: "free",
      calendarId: "local-events",
    }),
  ];

  // Two suggestions are also proposed on this week's calendar (dashed until accepted).
  for (const s of [suggestions[0], suggestions[2]]) {
    events.push({
      id: id("ev"),
      calendarId: s.calendarId,
      title: s.title,
      start: s.start,
      end: s.end,
      suggested: true,
      suggestionId: s.id,
    });
  }

  const inboxTask = tasks.find((t) => t.title === "Inbox cleanup")!;
  const libraryTask = tasks.find((t) => t.title === "Return library books")!;
  const plans: DayPlan[] = [
    {
      date: ymd(today),
      title: "Here's a plan for the rest of today",
      status: "open",
      steps: [
        {
          id: "step-add",
          change: "add",
          title: "Prep for the customer interview",
          detail: "Add · 11:00 – 11:45 AM, before your 1 PM call",
          status: "pending",
        },
        {
          id: `step-move-${libraryTask.id}`,
          change: "move",
          title: libraryTask.title,
          detail: `Move · Today → ${format(addDays(today, 2), "EEE")} 10:00 AM`,
          status: "pending",
        },
        {
          id: `step-remove-${inboxTask.id}`,
          change: "remove",
          title: inboxTask.title,
          detail: "Remove · not enough time today",
          status: "pending",
        },
      ],
    },
  ];
  // The Add step is proposed on the calendar until applied.
  events.push({
    id: "ev-plan-add",
    calendarId: "work",
    title: "Prep for the customer interview",
    start: at(today, 11),
    end: at(today, 11, 45),
    suggested: true,
  });

  const interests: Interest[] = [
    "Parents' group",
    "Public library",
    "Story time",
    "Farmers markets",
    "Free kid outings",
    "Parks & trails",
    "Free museum days",
    "Date night",
    "New restaurants",
  ].map((label, i) => ({ id: `int-${i}`, label }));
  const suggestedInterests: Interest[] = ["Splash pads", "Botanical garden", "Craft fairs", "Live music", "Toddler gym"].map(
    (label, i) => ({ id: `int-s-${i}`, label, suggested: true }),
  );

  const connectors: Connector[] = [
    { id: "con-gcal-work", kind: "calendar", provider: "Google Calendar", account: "Work account", detail: "Work account · Work", status: "connected" },
    { id: "con-gcal-personal", kind: "calendar", provider: "Google Calendar", account: "Personal account", detail: "Personal account · Personal, Date nights", status: "connected" },
    { id: "con-keep", kind: "integration", provider: "Google Keep", detail: "12 notes · someday ideas and to-dos", status: "connected" },
    { id: "con-tasks", kind: "integration", provider: "Google Tasks", detail: "2 pending tasks", status: "connected" },
    { id: "con-clickup", kind: "integration", provider: "ClickUp", detail: "3 lists · 18 work tasks", status: "connected" },
  ];

  return {
    tasks,
    events,
    suggestions,
    plans,
    interests: [...interests, ...suggestedInterests],
    connectors,
    settings: DEFAULT_SETTINGS,
  };
}
