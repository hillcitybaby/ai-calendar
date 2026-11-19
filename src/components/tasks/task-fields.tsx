"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, ChevronDown, Clock, Hash } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import {
  allChannels,
  bucketLabel,
  DURATION_OPTIONS,
  durationLabel,
  normalizeChannel,
  sameBucket,
  whenOptions,
} from "@/lib/task-options";
import type { TaskBucket } from "@/lib/types";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

type Variant = "chip" | "field";

/**
 * The trigger for a task dropdown. "chip" is the small pill under Add Task (AC) while typing;
 * "field" is the outlined control in the task form.
 */
function Trigger({
  variant,
  icon: Icon,
  label,
  placeholder,
  ...props
}: {
  variant: Variant;
  icon: typeof Clock;
  label?: string;
  placeholder: string;
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex items-center gap-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        variant === "chip"
          ? "rounded-full bg-muted px-2 py-0.5 text-xs font-medium hover:bg-accent"
          : "h-8 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-accent",
        label ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className={variant === "chip" ? "size-3" : "size-4"} aria-hidden />
      {label ?? placeholder}
      {variant === "field" && <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />}
    </button>
  );
}

const closeFocus = (to?: () => void) => (e: Event) => {
  if (!to) return;
  e.preventDefault();
  to();
};

/** Keep typing inside a menu's text field from triggering the menu's typeahead. */
const stopKeys = (e: React.KeyboardEvent) => {
  if (e.key !== "Escape") e.stopPropagation();
};

export function LengthMenu({
  value,
  onChange,
  variant,
  onOpenChange,
  returnFocus,
}: {
  value?: number;
  onChange: (min: number) => void;
  variant: Variant;
  onOpenChange?: (open: boolean) => void;
  /** Where focus goes when the menu closes (Add Task sends it back to the text field). */
  returnFocus?: () => void;
}) {
  const options = value && !DURATION_OPTIONS.includes(value) ? [...DURATION_OPTIONS, value].sort((a, b) => a - b) : DURATION_OPTIONS;
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Trigger variant={variant} icon={Clock} label={value ? durationLabel(value) : undefined} placeholder="Length" aria-label={`Length${value ? `: ${durationLabel(value)}` : ""}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onCloseAutoFocus={closeFocus(returnFocus)} className="w-36">
        <DropdownMenuRadioGroup value={value ? String(value) : ""} onValueChange={(v) => onChange(Number(v))}>
          {options.map((m) => (
            <DropdownMenuRadioItem key={m} value={String(m)}>
              {durationLabel(m)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TagMenu({
  value,
  onChange,
  variant,
  onOpenChange,
  returnFocus,
}: {
  value?: string;
  onChange: (tag: string | undefined) => void;
  variant: Variant;
  onOpenChange?: (open: boolean) => void;
  /** Where focus goes when the menu closes (Add Task sends it back to the text field). */
  returnFocus?: () => void;
}) {
  const { state } = useStore();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const tags = allChannels(state.tasks);
  if (value && !tags.includes(value)) tags.push(value);
  const create = () => {
    const tag = normalizeChannel(draft);
    if (!tag) return;
    onChange(tag);
    setDraft("");
    setOpen(false);
  };
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        onOpenChange?.(o);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Trigger variant={variant} icon={Hash} label={value} placeholder="Tag" aria-label={`Tag${value ? `: ${value}` : ""}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onCloseAutoFocus={closeFocus(returnFocus)} className="max-h-72 w-52">
        <div className="p-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              stopKeys(e);
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
            }}
            placeholder="New tag, then Enter"
            aria-label="New tag"
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value ?? ""} onValueChange={(v) => onChange(v || undefined)}>
          <DropdownMenuRadioItem value="">No tag</DropdownMenuRadioItem>
          {tags.map((t) => (
            <DropdownMenuRadioItem key={t} value={t}>
              #{t}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WhenMenu({
  value,
  onChange,
  variant,
  onOpenChange,
  returnFocus,
}: {
  value: TaskBucket;
  onChange: (bucket: TaskBucket) => void;
  variant: Variant;
  onOpenChange?: (open: boolean) => void;
  /** Where focus goes when the menu closes (Add Task sends it back to the text field). */
  returnFocus?: () => void;
}) {
  const { state } = useStore();
  const today = useToday();
  const [open, setOpen] = React.useState(false);
  const weekStartsOn = state.settings.weekStartsOn;
  const options = whenOptions(today, weekStartsOn);
  const current = options.find((o) => sameBucket(o.bucket, value))?.id ?? "";
  const label = bucketLabel(value, today, weekStartsOn);
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        onOpenChange?.(o);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Trigger variant={variant} icon={Calendar} label={label} placeholder="When" aria-label={`When: ${label}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onCloseAutoFocus={closeFocus(returnFocus)} className="w-52">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(id) => {
            const o = options.find((x) => x.id === id);
            if (o) onChange(o.bucket);
          }}
        >
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.id} value={o.id}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Pick a day</DropdownMenuLabel>
        <div className="px-1 pb-1">
          <input
            type="date"
            aria-label="Pick a day"
            value={value.kind === "day" ? value.date : ""}
            onKeyDown={stopKeys}
            onChange={(e) => {
              if (!e.target.value) return;
              onChange({ kind: "day", date: format(parseISO(e.target.value), "yyyy-MM-dd") });
              setOpen(false);
            }}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
