"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/**
 * Toggle Group (AC): shadcn ToggleGroup (single) in a bordered 4px-padded group.
 * Items are 32px tall with 12px side padding; the selected item uses the accent fill.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  stretch,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
  /** Fill the width, items sharing it equally. "mobile" only does so below 768px. */
  stretch?: boolean | "mobile";
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as T);
      }}
      aria-label={label}
      spacing={1}
      className={cn("rounded-lg border border-border p-1", stretch === true && "w-full", stretch === "mobile" && "w-full md:w-fit", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className={cn(
            "h-8 rounded-md px-3 text-foreground",
            stretch === true && "flex-1",
            stretch === "mobile" && "flex-1 md:flex-none",
            "hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
          )}
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
