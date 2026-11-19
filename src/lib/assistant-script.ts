/**
 * Scripted assistant replies for the prototype. No model is called: the reply is picked from
 * the request's wording and built from the current (example) data, so applying a plan really
 * changes the calendar. Replace with a model call in milestone 7.
 */
import { addDays, format, parseISO, set, startOfWeek } from "date-fns";

import { formatTimeRange } from "./schedule";
import type { Action, State } from "./reducer";
import type { PlanStep } from "./types";

export type ChatPlanStep = Omit<PlanStep, "status"> & { action: Action };
export type ChatPlan = { title: string; subtitle: string; steps: ChatPlanStep[] };

export type ScriptedReply = {
  /** What the mark shows while working on it. */
  working: "thinking" | "searching";
  workingLabel: string;
  text: string;
  plan?: ChatPlan;
  suggestionIds?: string[];
};

const iso = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm:ss");

function freeEvening(state: State, today: Date) {
  for (let i = 0; i < 7; i++) {
    const day = addDays(today, i);
    const key = format(day, "yyyy-MM-dd");
    const busy = state.events.some((e) => {
      if (e.allDay || !e.start.startsWith(key)) return false;
      return parseISO(e.end).getHours() >= 17 && parseISO(e.start).getHours() < 21;
    });
    if (!busy) return day;
  }
  return null;
}

/** First open 30-minute-aligned slot on a day within working hours, or null. */
function freeSlot(state: State, day: Date, minutes: number) {
  const { start, end } = state.settings.workingHours;
  const key = format(day, "yyyy-MM-dd");
  const busy = state.events
    .filter((e) => !e.allDay && e.start.startsWith(key))
    .map((e) => [parseISO(e.start).getTime(), parseISO(e.end).getTime()] as const);
  for (let m = start * 60; m + minutes <= end * 60; m += 30) {
    const s = set(day, { hours: Math.floor(m / 60), minutes: m % 60, seconds: 0, milliseconds: 0 });
    const e = new Date(s.getTime() + minutes * 60_000);
    if (busy.every(([bs, be]) => e.getTime() <= bs || s.getTime() >= be)) return s;
  }
  return null;
}

export function scriptedReply(input: string, state: State, today: Date): ScriptedReply {
  const text = input.toLowerCase();

  if (/free (evening|night)|evening free|night off/.test(text)) {
    const day = freeEvening(state, today);
    if (!day) {
      return {
        working: "thinking",
        workingLabel: "Checking your evenings…",
        text: "Every evening this week already has something on. Want me to look at next week instead?",
      };
    }
    const start = set(day, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 });
    const end = set(day, { hours: 20, minutes: 0, seconds: 0, milliseconds: 0 });
    const label = format(day, "EEEE");
    return {
      working: "thinking",
      workingLabel: "Checking your evenings…",
      text: `${label} evening is open from 5 PM. Want me to hold 6 to 8 PM so nothing else lands there?`,
      plan: {
        title: `Here's a plan for ${label}`,
        subtitle: "1 change · nothing is saved until you apply",
        steps: [
          {
            id: "hold-evening",
            change: "add",
            title: "Free evening",
            detail: `Add · ${label} ${formatTimeRange(iso(start), iso(end))}`,
            action: {
              type: "event/create",
              event: { calendarId: "personal", title: "Free evening", start: iso(start), end: iso(end) },
            },
          },
        ],
      },
    };
  }

  if (/near me|nearby|what'?s on|local|this weekend|things to do/.test(text)) {
    const picks = state.suggestions.filter((s) => s.status === "new").slice(0, 3);
    return {
      working: "searching",
      workingLabel: "Looking for things near your home area…",
      text: picks.length
        ? `I found ${picks.length} ${picks.length === 1 ? "idea" : "ideas"} that match your interests. Add any of them at the suggested time:`
        : "Nothing new matches your interests right now. Add a few more interests and I'll look again.",
      suggestionIds: picks.map((s) => s.id),
    };
  }

  if (/plan (my )?(next )?week|plan next week|schedule my (to-?dos|tasks)/.test(text)) {
    const nextWeek = /next week/.test(text);
    const weekStart = startOfWeek(nextWeek ? addDays(today, 7) : today, { weekStartsOn: state.settings.weekStartsOn });
    const candidates = state.tasks.filter((t) => !t.done && !t.scheduledAt).slice(0, 3);
    const steps: ChatPlanStep[] = [];
    let dayOffset = nextWeek ? 1 : Math.max(1, (today.getDay() - weekStart.getDay() + 7) % 7);
    for (const t of candidates) {
      let slot: Date | null = null;
      for (; dayOffset < 6 && !slot; dayOffset++) slot = freeSlot(state, addDays(weekStart, dayOffset), t.durationMin);
      if (!slot) break;
      const end = new Date(slot.getTime() + t.durationMin * 60_000);
      steps.push({
        id: `sched-${t.id}`,
        change: "add",
        title: t.title,
        detail: `Add · ${format(slot, "EEE")} ${formatTimeRange(iso(slot), iso(end))}`,
        action: { type: "task/schedule", id: t.id, start: iso(slot) },
      });
    }
    if (!steps.length) {
      return {
        working: "thinking",
        workingLabel: "Looking for open time…",
        text: "Your to-do lists are clear, so there's nothing to schedule. Nice.",
      };
    }
    return {
      working: "thinking",
      workingLabel: "Checking your calendars and your to-do lists…",
      text: `I found time for ${steps.length} of your to-dos ${nextWeek ? "next week" : "this week"}, inside your working hours.`,
      plan: {
        title: nextWeek ? "Here's a plan for next week" : "Here's a plan for this week",
        subtitle: `${steps.length} ${steps.length === 1 ? "change" : "changes"} · nothing is saved until you apply`,
        steps,
      },
    };
  }

  return {
    working: "thinking",
    workingLabel: "Thinking…",
    text: "I can plan your week, find a free evening, or look for things to do nearby. Try one of the suggestions below.",
  };
}

/** The pre-filled example conversation is generic; this keeps the chips in one place. */
export const PROMPT_SUGGESTIONS = ["Find a free evening", "What's on near me?", "Plan next week"];

export const firstName = (state: State) => state.settings.name.split(" ")[0] || "there";

export function greeting(state: State, now: Date) {
  const h = now.getHours();
  const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  return `Good ${part}, ${firstName(state)}. What should we plan?`;
}

