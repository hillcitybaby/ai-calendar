"use client";

import { AssistantMark } from "@/components/assistant/assistant-mark";
import { useAssistant } from "@/components/assistant/assistant-provider";
import { cn } from "@/lib/utils";

import { MobileHeader } from "./mobile-header";

/**
 * Top bar shared by every page: title on the left, page actions on the right,
 * and the resting Assistant Mark as the entry point to the Assistant.
 */
export function TopBar({
  title,
  leading,
  actions,
  mobile,
  className,
}: {
  title: React.ReactNode;
  /** Controls right after the title (e.g. calendar prev/next/Today). */
  leading?: React.ReactNode;
  /** Controls before the Assistant Mark (e.g. view toggle, search). */
  actions?: React.ReactNode;
  /** Mobile Header (AC) below 768px. Defaults to the same title with no trailing actions. */
  mobile?: { title?: React.ReactNode; back?: string; trailing?: React.ReactNode };
  className?: string;
}) {
  return (
    <>
    <MobileHeader title={mobile?.title ?? title} back={mobile?.back} trailing={mobile?.trailing} />
    <header
      className={cn(
        "hidden h-[60px] shrink-0 items-center gap-2 border-b border-border px-6 md:flex",
        className,
      )}
    >
      <h1 className="truncate text-h4 text-foreground">{title}</h1>
      {leading}
      <div className="min-w-0 flex-1" />
      {actions}
      <AssistantEntry />
    </header>
    </>
  );
}

/**
 * The resting particle array *is* the entry point: there is no "Ask AI" button.
 * It shows what the assistant is doing (thinking, waiting on you, scheduling…).
 */
function AssistantEntry() {
  const { open, toggle, markState } = useAssistant();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close assistant" : "Open assistant"}
      aria-expanded={open}
      aria-keyshortcuts="Meta+J Control+J"
      className="flex size-8 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <AssistantMark state={markState} size={32} decorative />
    </button>
  );
}
