"use client";

import * as React from "react";

import { AssistantMark } from "@/components/assistant/assistant-mark";
import { calendarColorVars, type CalendarColor } from "@/lib/calendars";
import { cn } from "@/lib/utils";

export type EventBlockState = "default" | "dragging" | "preview" | "suggested";

/**
 * Event Block (AC): a timed event in its calendar color.
 * Default / Dragging / Preview (drop ghost) / Suggested (AI proposal until accepted:
 * subtle fill, dashed muted outline, small Assistant Mark).
 */
export function EventBlock({
  title,
  time,
  color,
  state = "default",
  showTime = true,
  className,
  style,
  ref,
  ...rest
}: {
  title: string;
  time?: string;
  color: CalendarColor;
  state?: EventBlockState;
  showTime?: boolean;
  ref?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      {...rest}
      style={{ ...calendarColorVars(color), ...style }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-sm px-2 py-1 text-xs text-(--cal-text)",
        state === "default" && "border-l-3 border-(color:--cal-accent) bg-(--cal-bg)",
        state === "dragging" && "border-l-3 border-(color:--cal-accent) bg-(--cal-bg) shadow-lg",
        state === "preview" && "border border-dashed border-(color:--cal-accent) bg-(--cal-subtle)",
        state === "suggested" && "border-[1.5px] border-dashed border-muted-foreground bg-(--cal-subtle)",
        className,
      )}
    >
      <p
        className={cn(
          "truncate font-semibold",
          state === "preview" && "opacity-70",
          state === "suggested" && "pr-4",
        )}
      >
        {title}
      </p>
      {showTime && time && (
        <p className={cn("whitespace-nowrap", state === "preview" ? "opacity-60" : "opacity-80")}>{time}</p>
      )}
      {state === "suggested" && (
        <AssistantMark size={16} decorative className="absolute top-[2.5px] right-[2.5px]" />
      )}
    </div>
  );
}
