"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CalendarDays, Lightbulb, Settings, type LucideIcon } from "lucide-react";

import { AssistantMark } from "@/components/assistant/assistant-mark";
import { useAssistant } from "@/components/assistant/assistant-provider";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; icon: LucideIcon; match: string[] };

const TABS: Tab[] = [
  { href: "/today", label: "Today", icon: CalendarCheck, match: ["/today"] },
  { href: "/week", label: "Calendar", icon: CalendarDays, match: ["/day", "/week", "/month"] },
  { href: "/suggestions", label: "Suggestions", icon: Lightbulb, match: ["/suggestions"] },
  { href: "/settings", label: "Settings", icon: Settings, match: ["/settings"] },
];

const isOn = (t: Tab, path: string) => t.match.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Tab Bar (AC): mobile navigation. Today, Calendar, the Assistant Mark in the center
 * (opens the Assistant), Suggestions and Settings. The device draws its own home indicator,
 * so the code pads for the safe area instead.
 */
export function TabBar() {
  const pathname = usePathname();
  const { open, toggle, markState } = useAssistant();
  const tab = (t: Tab) => {
    const active = isOn(t, pathname);
    const Icon = t.icon;
    return (
      <Link
        key={t.href}
        href={t.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <Icon className="size-[22px]" strokeWidth={active ? 2 : 1.75} aria-hidden />
        {t.label}
      </Link>
    );
  };
  return (
    <nav
      aria-label="Main"
      className="shrink-0 border-t border-border bg-background pt-1.5 pb-[max(env(safe-area-inset-bottom),8px)] md:hidden"
    >
      <div className="flex items-center">
        {tab(TABS[0])}
        {tab(TABS[1])}
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? "Close assistant" : "Open assistant"}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <AssistantMark state={markState} size={36} decorative />
        </button>
        {tab(TABS[2])}
        {tab(TABS[3])}
      </div>
    </nav>
  );
}
