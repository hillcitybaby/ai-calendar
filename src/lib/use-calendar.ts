"use client";

import { useSearchParams } from "next/navigation";

import { useShell } from "@/components/shell/shell-provider";

import { parseDateParam } from "./calendar-view";
import { useStore } from "./store";
import { useToday } from "./use-today";

/** The date the calendar views are showing (?date=), plus today. */
export function useCalendarDate() {
  const params = useSearchParams();
  const today = useToday();
  return { date: parseDateParam(params.get("date"), today), today };
}

/** Events on calendars the sidebar hasn't hidden. */
export function useVisibleEvents() {
  const { state } = useStore();
  const { hiddenCalendarIds } = useShell();
  return state.events.filter((e) => !hiddenCalendarIds.has(e.calendarId));
}
