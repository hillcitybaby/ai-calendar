/** The mock data store's state, actions and reducer (pure, no React). */
import { addMinutes, format, parseISO } from "date-fns";

import { buildSeed, type SeedData } from "./mock-data";
import type { Settings } from "./settings";
import type { CalendarEvent, Connector, Task, TaskBucket } from "./types";

export type State = SeedData;

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" }
  | { type: "task/add"; task: Task }
  | { type: "task/update"; id: string; patch: Partial<Omit<Task, "id">> }
  | { type: "task/delete"; id: string }
  | { type: "task/toggle"; id: string }
  | { type: "task/toggleSubtask"; id: string; subtaskId: string }
  | { type: "task/schedule"; id: string; start: string }
  | { type: "task/unschedule"; id: string }
  | { type: "task/rebucket"; id: string; bucket: TaskBucket }
  | { type: "event/move"; id: string; start: string }
  | { type: "event/create"; event: Omit<CalendarEvent, "id"> }
  | { type: "event/accept"; id: string }
  | { type: "event/dismiss"; id: string }
  | { type: "plan/apply"; date: string; stepIds?: string[] }
  | { type: "plan/skipStep"; date: string; stepId: string }
  | { type: "plan/review"; date: string }
  | { type: "suggestion/accept"; id: string }
  | { type: "suggestion/dismiss"; id: string }
  | { type: "suggestion/restore"; id: string }
  | { type: "interest/add"; label: string }
  | { type: "interest/remove"; id: string }
  | { type: "interest/accept"; id: string }
  | { type: "settings/update"; patch: Partial<Settings> }
  | { type: "connector/add"; connector: Connector };

const iso = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm:ss");
let uid = Date.now();
export const newId = (p: string) => `${p}-${(uid++).toString(36)}`;

function durationOf(e: CalendarEvent) {
  return (parseISO(e.end).getTime() - parseISO(e.start).getTime()) / 60_000;
}

function applyStep(state: State, date: string, stepId: string): State {
  const plan = state.plans.find((p) => p.date === date);
  const step = plan?.steps.find((s) => s.id === stepId);
  if (!plan || !step || step.status !== "pending") return state;
  let next = state;
  if (step.change === "add") {
    // The proposed event becomes a real one.
    next = {
      ...next,
      events: next.events.map((e) => (e.id === "ev-plan-add" ? { ...e, suggested: false } : e)),
    };
  } else if (step.change === "move") {
    const taskId = step.id.replace("step-move-", "");
    const task = next.tasks.find((t) => t.id === taskId);
    if (task) {
      // "Today → Fri 10:00 AM": move it two days out at 10 AM.
      const target = parseISO(`${date}T10:00:00`);
      target.setDate(target.getDate() + 2);
      next = reducer(next, { type: "task/schedule", id: taskId, start: iso(target) });
    }
  } else if (step.change === "remove") {
    const taskId = step.id.replace("step-remove-", "");
    const task = next.tasks.find((t) => t.id === taskId);
    if (task) {
      // Back to this week's list.
      next = {
        ...next,
        tasks: next.tasks.map((t) =>
          t.id === taskId ? { ...t, bucket: weekBucketFor(t.bucket, date), scheduledAt: undefined } : t,
        ),
      };
    }
  }
  return {
    ...next,
    plans: next.plans.map((p) =>
      p.date === date
        ? { ...p, steps: p.steps.map((s) => (s.id === stepId ? { ...s, status: "applied" } : s)) }
        : p,
    ),
  };
}

function weekBucketFor(bucket: TaskBucket, date: string): TaskBucket {
  const d = parseISO(date);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return bucket.kind === "week" ? bucket : { kind: "week", weekStart: format(start, "yyyy-MM-dd") };
}

function settlePlan(state: State, date: string): State {
  return {
    ...state,
    plans: state.plans.map((p) => {
      if (p.date !== date) return p;
      const pending = p.steps.some((s) => s.status === "pending");
      if (pending) return p;
      // Drop the proposed event if its step was skipped.
      return { ...p, status: "applied" };
    }),
    events: state.events.filter((e) => {
      if (e.id !== "ev-plan-add") return true;
      const plan = state.plans.find((p) => p.date === date);
      const add = plan?.steps.find((s) => s.change === "add");
      return add?.status !== "skipped";
    }),
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return buildSeed(new Date());
    case "task/add":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "task/update": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      const next = { ...task, ...action.patch };
      // Moving a time-boxed to-do to another day or list takes it off the calendar.
      const moved = action.patch.bucket && JSON.stringify(action.patch.bucket) !== JSON.stringify(task.bucket);
      if (moved && next.scheduledAt) next.scheduledAt = undefined;
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === task.id ? next : t)),
        events: state.events.flatMap((e) => {
          if (e.taskId !== task.id) return [e];
          if (!next.scheduledAt) return [];
          // Keep the time-boxed block in step with the to-do's title and length.
          return [{ ...e, title: next.title, end: iso(addMinutes(parseISO(e.start), next.durationMin)) }];
        }),
      };
    }
    case "task/delete":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.id),
        events: state.events.filter((e) => e.taskId !== action.id),
      };
    case "task/toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.id) return t;
          const done = !t.done;
          return { ...t, done, subtasks: done ? t.subtasks.map((s) => ({ ...s, done: true })) : t.subtasks };
        }),
      };
    case "task/toggleSubtask":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, subtasks: t.subtasks.map((s) => (s.id === action.subtaskId ? { ...s, done: !s.done } : s)) }
            : t,
        ),
      };
    case "task/schedule": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      const start = parseISO(action.start);
      const end = addMinutes(start, task.durationMin);
      const existing = state.events.find((e) => e.taskId === task.id);
      const event: CalendarEvent = {
        id: existing?.id ?? newId("ev"),
        calendarId: "work",
        title: task.title,
        start: iso(start),
        end: iso(end),
        taskId: task.id,
      };
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === task.id
            ? { ...t, scheduledAt: iso(start), bucket: { kind: "day", date: format(start, "yyyy-MM-dd") } }
            : t,
        ),
        events: existing ? state.events.map((e) => (e.id === existing.id ? event : e)) : [...state.events, event],
      };
    }
    case "task/unschedule":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, scheduledAt: undefined } : t)),
        events: state.events.filter((e) => e.taskId !== action.id),
      };
    case "task/rebucket":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, bucket: action.bucket } : t)) };
    case "event/move": {
      const ev = state.events.find((e) => e.id === action.id);
      if (!ev) return state;
      if (ev.taskId) return reducer(state, { type: "task/schedule", id: ev.taskId, start: action.start });
      const start = parseISO(action.start);
      const end = addMinutes(start, durationOf(ev));
      return {
        ...state,
        events: state.events.map((e) => (e.id === ev.id ? { ...e, start: iso(start), end: iso(end) } : e)),
      };
    }
    case "event/create":
      return { ...state, events: [...state.events, { ...action.event, id: newId("ev") }] };
    case "event/accept": {
      const ev = state.events.find((e) => e.id === action.id);
      if (!ev) return state;
      if (ev.suggestionId) return reducer(state, { type: "suggestion/accept", id: ev.suggestionId });
      if (ev.id === "ev-plan-add") {
        const plan = state.plans.find((p) => p.steps.some((s) => s.change === "add" && s.status === "pending"));
        if (plan) return reducer(state, { type: "plan/apply", date: plan.date, stepIds: ["step-add"] });
      }
      return { ...state, events: state.events.map((e) => (e.id === ev.id ? { ...e, suggested: false } : e)) };
    }
    case "event/dismiss": {
      const ev = state.events.find((e) => e.id === action.id);
      if (!ev) return state;
      if (ev.suggestionId) return reducer(state, { type: "suggestion/dismiss", id: ev.suggestionId });
      if (ev.id === "ev-plan-add") {
        const plan = state.plans.find((p) => p.steps.some((s) => s.change === "add" && s.status === "pending"));
        if (plan) return reducer(state, { type: "plan/skipStep", date: plan.date, stepId: "step-add" });
      }
      return { ...state, events: state.events.filter((e) => e.id !== ev.id) };
    }
    case "plan/apply": {
      const plan = state.plans.find((p) => p.date === action.date);
      if (!plan) return state;
      const ids = action.stepIds ?? plan.steps.filter((s) => s.status === "pending").map((s) => s.id);
      let next = state;
      for (const id of ids) next = applyStep(next, action.date, id);
      return settlePlan(next, action.date);
    }
    case "plan/skipStep":
      return settlePlan(
        {
          ...state,
          plans: state.plans.map((p) =>
            p.date === action.date
              ? { ...p, steps: p.steps.map((s) => (s.id === action.stepId ? { ...s, status: "skipped" } : s)) }
              : p,
          ),
        },
        action.date,
      );
    case "plan/review":
      return { ...state, plans: state.plans.map((p) => (p.date === action.date ? { ...p, status: "reviewing" } : p)) };
    case "suggestion/accept": {
      const s = state.suggestions.find((x) => x.id === action.id);
      if (!s) return state;
      const proposed = state.events.find((e) => e.suggestionId === s.id);
      const events = proposed
        ? state.events.map((e) => (e.id === proposed.id ? { ...e, suggested: false } : e))
        : [
            ...state.events,
            { id: newId("ev"), calendarId: s.calendarId, title: s.title, start: s.start, end: s.end, suggestionId: s.id },
          ];
      return {
        ...state,
        events,
        suggestions: state.suggestions.map((x) => (x.id === s.id ? { ...x, status: "accepted" } : x)),
      };
    }
    case "suggestion/dismiss":
      return {
        ...state,
        events: state.events.filter((e) => !(e.suggestionId === action.id && e.suggested)),
        suggestions: state.suggestions.map((x) => (x.id === action.id ? { ...x, status: "dismissed" } : x)),
      };
    case "suggestion/restore":
      return {
        ...state,
        suggestions: state.suggestions.map((x) => (x.id === action.id ? { ...x, status: "new" } : x)),
      };
    case "interest/add": {
      const label = action.label.trim();
      if (!label || state.interests.some((i) => !i.suggested && i.label.toLowerCase() === label.toLowerCase()))
        return state;
      return { ...state, interests: [...state.interests, { id: newId("int"), label }] };
    }
    case "interest/remove":
      return { ...state, interests: state.interests.filter((i) => i.id !== action.id) };
    case "interest/accept":
      return {
        ...state,
        interests: state.interests.map((i) => (i.id === action.id ? { ...i, suggested: false } : i)),
      };
    case "settings/update":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case "connector/add":
      return { ...state, connectors: [...state.connectors, action.connector] };
  }
}

