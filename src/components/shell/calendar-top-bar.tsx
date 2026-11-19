"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/common/segmented";
import {
  MOBILE_VIEW_PATHS,
  parseDateParam,
  prevNextLabels,
  shiftDate,
  toDateParam,
  VIEW_PATHS,
  viewFromPath,
  viewTitle,
  type CalendarView,
} from "@/lib/calendar-view";
import { useStore } from "@/lib/store";
import { useToday } from "@/lib/use-today";

import { MobileHeaderButton } from "./mobile-header";
import { TopBar } from "./top-bar";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

/** Top bar for Today / Week / Month: title, prev/next/Today, Day/Week/Month toggle, search. */
export function CalendarTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const today = useToday();
  const { state } = useStore();
  const view = viewFromPath(pathname) ?? "week";
  const raw = params.get("date");
  const date = parseDateParam(raw, today);

  const href = (v: CalendarView, d?: Date) =>
    d ? `${VIEW_PATHS[v]}?date=${toDateParam(d)}` : VIEW_PATHS[v];
  const labels = prevNextLabels(view);
  // Mobile: Today is its own tab; Day/Week/Month live in the Calendar tab.
  const calendarTab = pathname !== "/today";
  const mobileHref = (v: CalendarView) => `${MOBILE_VIEW_PATHS[v]}${raw ? `?date=${toDateParam(date)}` : ""}`;

  return (
    <>
    <TopBar
      mobile={{
        title: calendarTab ? <span suppressHydrationWarning>{format(date, "MMMM")}</span> : "Today",
        trailing: (
          <MobileHeaderButton aria-label="Search">
            <Search />
          </MobileHeaderButton>
        ),
      }}
      title={<span suppressHydrationWarning>{viewTitle(date, view, state.settings.weekStartsOn)}</span>}
      leading={
        <div className="flex items-center gap-1 pl-3">
          <Button asChild variant="outline" size="icon" className="size-7 rounded-md shadow-none">
            <Link href={href(view, shiftDate(date, view, -1))} aria-label={labels.prev}>
              <ChevronLeft />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="size-7 rounded-md shadow-none">
            <Link href={href(view, shiftDate(date, view, 1))} aria-label={labels.next}>
              <ChevronRight />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-7 rounded-md px-2.5 shadow-none">
            <Link href={href(view)}>Today</Link>
          </Button>
        </div>
      }
      actions={
        <>
          <Segmented
            value={view}
            onChange={(v) => router.push(href(v, raw ? date : undefined))}
            options={VIEWS}
            label="Calendar view"
          />
          <Button variant="ghost" size="icon" className="size-7 rounded-md" aria-label="Search">
            <Search />
          </Button>
        </>
      }
    />
    {calendarTab && (
      <div className="shrink-0 px-4 pt-1 pb-2 md:hidden">
        <Segmented
          value={view}
          onChange={(v) => router.push(mobileHref(v))}
          options={VIEWS}
          label="Calendar view"
          stretch
        />
      </div>
    )}
    </>
  );
}
