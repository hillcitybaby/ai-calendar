"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress as ProgressPrimitive } from "radix-ui"

/** Progress (AC): track primary/20, indicator primary. Tone "over" uses destructive for overcommitted days. */
function Progress({
  className,
  value,
  tone = "default",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { tone?: "default" | "over" }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        tone === "over" ? "bg-destructive/20" : "bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 rounded-full transition-all",
          tone === "over" ? "bg-destructive" : "bg-primary"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
