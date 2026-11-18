"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  BookOpen,
  Calendar,
  DollarSign,
  Landmark,
  MapPin,
  Plus,
  ShoppingBasket,
  Trees,
  Users,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";

import { AssistantMark } from "@/components/assistant/assistant-mark";
import { WeatherIcon } from "@/components/scheduler/weather-icon";
import { useStore } from "@/lib/store";
import type { CostTier, Suggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

const PLACE_ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  "shopping-basket": ShoppingBasket,
  wine: Wine,
  trees: Trees,
  "book-open": BookOpen,
  users: Users,
};

/** The kit's placeholder fill for a card without a photo. */
const PLACEHOLDER =
  "radial-gradient(circle at 78% 92%, rgba(110,175,245,0.55), rgba(110,175,245,0) 45%), linear-gradient(180deg, rgb(21,99,204) 0%, rgb(34,115,216) 50%, rgb(58,138,227) 100%)";

/** Cost Tier (AC): Free = slashed dollar, Cost = $, Expensive = $$$. */
export function CostTierIcon({ tier, className }: { tier: CostTier; className?: string }) {
  const label = tier === "free" ? "Free" : tier === "cost" ? "Costs a little" : "Expensive";
  if (tier === "expensive") {
    return (
      <span role="img" aria-label={label} className={cn("flex -space-x-1", className)}>
        <DollarSign className="size-3" aria-hidden />
        <DollarSign className="size-3" aria-hidden />
        <DollarSign className="size-3" aria-hidden />
      </span>
    );
  }
  return (
    <span role="img" aria-label={label} className={cn("relative flex", className)}>
      <DollarSign className="size-3" aria-hidden />
      {tier === "free" && (
        <svg viewBox="0 0 12 12" className="absolute inset-0 size-3" aria-hidden>
          <line x1="2" y1="1.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

/** Icon tab, in a fixed order: type, weather for that time, cost tier. */
function IconRow({ s, className }: { s: Suggestion; className?: string }) {
  const TypeIcon = PLACE_ICONS[s.placeIcon] ?? MapPin;
  return (
    <span className={cn("flex items-center text-foreground", className)}>
      <TypeIcon className="size-3" aria-label={s.placeType} role="img" />
      <WeatherIcon kind={s.weather} className="size-3" />
      <CostTierIcon tier={s.cost} />
    </span>
  );
}

function Photo({ s, className, children }: { s: Suggestion; className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn("relative overflow-hidden bg-cover bg-center", className)}
      style={{ backgroundImage: s.photo ? `url(${s.photo})` : PLACEHOLDER }}
    >
      {children}
    </div>
  );
}

export function addLabel(s: Suggestion, compact = false) {
  const d = parseISO(s.start);
  const time = format(d, d.getMinutes() ? "h:mm a" : "h a");
  return compact ? `Add ${s.title} on ${format(d, "EEEE")} at ${time}` : `Add to ${format(d, "EEEE")}, ${time}`;
}

function useActions(s: Suggestion) {
  const { dispatch } = useStore();
  return {
    accept: () => dispatch({ type: "suggestion/accept", id: s.id }),
    dismiss: () => dispatch({ type: "suggestion/dismiss", id: s.id }),
  };
}

/**
 * Suggestion Card (AC), Size=Default: photo with the icon tab, title, subtitle (organizer goes
 * here), and stats (place type + travel time, day + time). Hover dims the photo and offers one
 * action; X means "Not interested".
 */
export function SuggestionCard({ s, onDismiss, className }: { s: Suggestion; onDismiss?: () => void; className?: string }) {
  const { accept, dismiss } = useActions(s);
  const d = parseISO(s.start);
  return (
    <article
      aria-label={s.title}
      className={cn(
        "group/sug flex flex-col gap-4 rounded-xl border border-border bg-card px-3 pt-3 pb-4 shadow-sm transition-[border-color,box-shadow]",
        "hover:border-ring hover:shadow-md focus-within:border-ring focus-within:shadow-md",
        className,
      )}
    >
      <Photo s={s} className="h-[158px] rounded-lg">
        <div
          aria-hidden
          className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover/sug:opacity-100 group-focus-within/sug:opacity-100"
        />
        <IconTab>
          <IconRow s={s} className="gap-2.5" />
        </IconTab>
        <button
          type="button"
          onClick={accept}
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm font-medium whitespace-nowrap text-secondary-foreground opacity-0 outline-none transition-opacity group-hover/sug:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-focus-within/sug:opacity-100"
        >
          <Plus className="size-4" aria-hidden />
          {addLabel(s)}
        </button>
        <button
          type="button"
          onClick={() => {
            dismiss();
            onDismiss?.();
          }}
          aria-label={`Not interested in ${s.title}`}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md border border-border bg-background opacity-0 outline-none transition-opacity group-hover/sug:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-focus-within/sug:opacity-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      </Photo>

      <div className="flex min-w-0 flex-col gap-0.5 px-[9px]">
        <h3 className="truncate text-base font-semibold text-foreground">{s.title}</h3>
        <p className="truncate text-sm text-muted-foreground">{s.subtitle}</p>
      </div>

      <div className="flex items-center gap-4 rounded-lg bg-muted px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{s.placeType}</span>
          </p>
          <p className="flex items-baseline gap-1">
            <span className="text-base font-semibold text-foreground">{s.travelMin}</span>
            <span className="text-xs text-muted-foreground">min</span>
          </p>
        </div>
        <div aria-hidden className="h-8 w-px bg-border" />
        <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3 shrink-0" aria-hidden />
            {format(d, "EEEE")}
          </p>
          <p className="text-base font-semibold whitespace-nowrap text-foreground">
            {format(d, d.getMinutes() ? "h:mm a" : "h a")}
          </p>
        </div>
      </div>
    </article>
  );
}

/** The white tab notched into the top of the photo, with concave corners. */
function IconTab({ children }: { children: React.ReactNode }) {
  const ear = "absolute top-0 size-2 bg-[radial-gradient(circle_at_var(--x)_100%,transparent_8px,var(--color-card)_8.5px)]";
  return (
    <div className="absolute top-0 left-1/2 flex h-[29px] w-[116px] -translate-x-1/2 items-center justify-center rounded-b-[10px] bg-card pb-1">
      <span aria-hidden className={cn(ear, "-left-2 [--x:0%]")} />
      <span aria-hidden className={cn(ear, "-right-2 [--x:100%]")} />
      {children}
    </div>
  );
}

/**
 * Suggestion Card (AC), Size=Compact: for to-do lists. Thumbnail, title, time and travel line,
 * and the icon row. Hover shows a + over the thumbnail and an X for "Not interested".
 */
export function SuggestionCardCompact({ s, className }: { s: Suggestion; className?: string }) {
  const { accept, dismiss } = useActions(s);
  const d = parseISO(s.start);
  return (
    <article
      aria-label={s.title}
      className={cn(
        "group/sug relative flex h-[84px] items-center gap-3 rounded-lg border border-border bg-card py-2.5 pr-3 pl-2.5 transition-[border-color,box-shadow]",
        "hover:border-ring hover:shadow-md focus-within:border-ring focus-within:shadow-md",
        className,
      )}
    >
      <Photo s={s} className="size-16 shrink-0 rounded-md">
        <div
          aria-hidden
          className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover/sug:opacity-100 group-focus-within/sug:opacity-100"
        />
        <button
          type="button"
          onClick={accept}
          aria-label={addLabel(s, true)}
          className="absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-secondary text-secondary-foreground opacity-0 outline-none transition-opacity group-hover/sug:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-focus-within/sug:opacity-100"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </Photo>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate text-sm font-medium text-foreground">{s.title}</h3>
        <p className="flex min-w-0 items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
          <AssistantMark size={14} decorative />
          <span className="truncate">
            {format(d, "EEEE")} · {format(d, d.getMinutes() ? "h:mm a" : "h a")} · {s.travelMin} min
          </span>
        </p>
        <IconRow s={s} className="gap-2" />
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={`Not interested in ${s.title}`}
        className="absolute top-[5px] right-[5px] flex size-[22px] items-center justify-center rounded-md text-foreground opacity-0 outline-none transition-opacity group-hover/sug:opacity-100 hover:bg-accent focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-focus-within/sug:opacity-100"
      >
        <X className="size-3" aria-hidden />
      </button>
    </article>
  );
}
