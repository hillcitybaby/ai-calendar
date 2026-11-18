"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Check Circle (AC): round 18px checkbox for Work Task (AC) and Subtask (AC).
 * Unchecked shows a faint check; Hover (or a hovered parent with `group/task`) turns emerald;
 * Checked fills emerald.
 */
export function CheckCircle({
  checked,
  onToggle,
  label,
  className,
}: {
  checked: boolean;
  onToggle?: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-full outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        checked
          ? "bg-calendar-emerald-accent text-white"
          : "border-[1.5px] border-border text-border hover:border-calendar-emerald-accent hover:text-calendar-emerald-accent",
        className,
      )}
    >
      <Check className="size-3" aria-hidden />
    </button>
  );
}
