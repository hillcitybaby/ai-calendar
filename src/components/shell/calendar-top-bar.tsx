"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  parseDateParam,
  prevNextLabels,
  shiftDate,
  toDateParam,
  VIEW_PATHS,
  viewFromPath,
  viewTitle,
  type CalendarView,
} from "@/lib/calendar-view";
import { useToday } from "@/lib/use-today";

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
  const view = viewFromPath(pathname) ?? "week";
  const raw = params.get("date");
  const date = parseDateParam(raw, today);

  const href = (v: CalendarView, d?: Date) =>
    d ? `${VIEW_PATHS[v]}?date=${toDateParam(d)}` : VIEW_PATHS[v];
  const labels = prevNextLabels(view);

  return (
    <TopBar
      title={<span suppressHydrationWarning>{viewTitle(date, view)}</span>}
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
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => {
              if (v) router.push(href(v as CalendarView, raw ? date : undefined));
            }}
            aria-label="Calendar view"
            spacing={1}
            className="rounded-lg border border-border p-1"
          >
            {VIEWS.map((v) => (
              <ToggleGroupItem
                key={v.value}
                value={v.value}
                className="h-8 rounded-md px-3 text-foreground hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button variant="ghost" size="icon" className="size-7 rounded-md" aria-label="Search">
            <Search />
          </Button>
        </>
      }
    />
  );
}
