"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, PanelLeftClose, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { calendarColorVars, type Calendar } from "@/lib/calendars";
import { cn } from "@/lib/utils";

import { isActive, PLAN_NAV, type NavItem } from "./nav";
import { useShell } from "./shell-provider";

/** Sidebar (AC): expanded app nav, 256px wide. */
export function Sidebar({ name, initials }: { name: string; initials: string }) {
  const pathname = usePathname();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");
  const { toggleCollapsed, calendars, hiddenCalendarIds, toggleCalendar, suggestionCount } =
    useShell();

  return (
    <aside
      aria-label="Sidebar"
      className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <p className="min-w-0 flex-1 truncate text-base font-semibold">{name}</p>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={toggleCollapsed}
          aria-label="Collapse sidebar"
          aria-keyshortcuts="Meta+Backslash Control+Backslash"
          className="-mr-1 text-sidebar-foreground hover:bg-sidebar-accent [&_svg:not([class*='size-'])]:size-4"
        >
          <PanelLeftClose />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2">
        <nav aria-labelledby="sidebar-plan" className="flex flex-col gap-0.5">
          <GroupLabel id="sidebar-plan">Plan</GroupLabel>
          {PLAN_NAV.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={isActive(item, pathname)}
              count={item.showCount ? suggestionCount : undefined}
            />
          ))}
        </nav>

        <section aria-labelledby="sidebar-calendars" className="flex flex-col gap-0.5">
          <GroupLabel id="sidebar-calendars">Calendars</GroupLabel>
          {calendars.map((cal) => (
            <CalendarLegendItem
              key={cal.id}
              calendar={cal}
              visible={!hiddenCalendarIds.has(cal.id)}
              onToggle={() => toggleCalendar(cal.id)}
            />
          ))}
        </section>
      </div>

      {/* Footer: avatar + Settings (kit footer, shown in the app). */}
      <div className="flex items-center justify-between p-2">
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="bg-muted text-sm text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
        <Button
          asChild
          variant={settingsActive ? "secondary" : "ghost"}
          size="icon-sm"
          className={cn("rounded-lg", !settingsActive && "hover:bg-sidebar-accent")}
        >
          <Link href="/settings" aria-label="Settings" aria-current={settingsActive ? "page" : undefined}>
            <Settings />
          </Link>
        </Button>
      </div>
    </aside>
  );
}

function GroupLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex h-8 items-center px-2 text-xs font-medium text-muted-foreground">
      {children}
    </h2>
  );
}

/** Sidebar Item (AC): 36px row; label left, optional count, icon right. */
function SidebarItem({ item, active, count }: { item: NavItem; active: boolean; count?: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium outline-none transition-colors",
        "hover:bg-sidebar-accent",
        "focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50",
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {count ? (
        <span className="text-xs font-medium text-muted-foreground">
          {count}
          <span className="sr-only"> new</span>
        </span>
      ) : null}
      <Icon className="size-4 shrink-0" aria-hidden />
    </Link>
  );
}

/** Calendar Legend Item (AC): a calendar visibility toggle in its color. */
function CalendarLegendItem({
  calendar,
  visible,
  onToggle,
}: {
  calendar: Calendar;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={visible}
      onClick={onToggle}
      style={calendarColorVars(calendar.color)}
      className={cn(
        "flex h-7 items-center gap-2 rounded-md px-2 text-left text-sm text-foreground outline-none transition-colors",
        "hover:bg-sidebar-accent focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-(color:--cal-accent) text-white transition-colors",
          visible ? "bg-(--cal-accent)" : "bg-transparent",
        )}
      >
        {visible && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 truncate">{calendar.name}</span>
    </button>
  );
}
