import Link from "next/link";

import { AssistantMark } from "@/components/assistant/assistant-mark";
import type { AssistantState } from "@/components/assistant/swarm";
import { cn } from "@/lib/utils";

/**
 * Top bar shared by every page: title on the left, page actions on the right,
 * and the resting Assistant Mark as the entry point to the Assistant.
 */
export function TopBar({
  title,
  leading,
  actions,
  assistantState = "idle",
  className,
}: {
  title: React.ReactNode;
  /** Controls right after the title (e.g. calendar prev/next/Today). */
  leading?: React.ReactNode;
  /** Controls before the Assistant Mark (e.g. view toggle, search). */
  actions?: React.ReactNode;
  assistantState?: AssistantState;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-[60px] shrink-0 items-center gap-2 border-b border-border px-6",
        className,
      )}
    >
      <h1 className="truncate text-h4 text-foreground">{title}</h1>
      {leading}
      <div className="min-w-0 flex-1" />
      {actions}
      <AssistantEntry state={assistantState} />
    </header>
  );
}

/** The resting particle array *is* the entry point: there is no "Ask AI" button. */
function AssistantEntry({ state }: { state: AssistantState }) {
  return (
    <Link
      href="/assistant"
      aria-label="Open assistant"
      className="flex size-8 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <AssistantMark state={state} size={32} decorative />
    </Link>
  );
}
