"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftOpen, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calendarColorVars } from "@/lib/calendars";
import { cn } from "@/lib/utils";

import { isActive, PLAN_NAV } from "./nav";
import { useShell } from "./shell-provider";

/** Sidebar Collapsed (AC): 56px icon rail. */
export function SidebarRail({ initials }: { initials: string }) {
  const pathname = usePathname();
  const { toggleCollapsed, calendars, hiddenCalendarIds, suggestionCount } = useShell();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <aside
      aria-label="Sidebar"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-2.5 text-sidebar-foreground"
    >
      <RailTip label="Expand sidebar">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapsed}
          aria-label="Expand sidebar"
          aria-keyshortcuts="Meta+Backslash Control+Backslash"
          className="rounded-lg hover:bg-sidebar-accent"
        >
          <PanelLeftOpen />
        </Button>
      </RailTip>

      <div aria-hidden className="size-2 shrink-0" />

      <nav aria-label="Plan" className="flex flex-col items-center gap-1">
        {PLAN_NAV.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          const label =
            item.showCount && suggestionCount ? `${item.label} (${suggestionCount})` : item.label;
          return (
            <RailTip key={item.href} label={label}>
              <Button
                asChild
                variant={active ? "secondary" : "ghost"}
                size="icon-sm"
                className={cn("rounded-lg", !active && "hover:bg-sidebar-accent")}
              >
                <Link href={item.href} aria-label={label} aria-current={active ? "page" : undefined}>
                  <Icon />
                </Link>
              </Button>
            </RailTip>
          );
        })}
      </nav>

      <div aria-hidden className="flex h-[17px] w-6 shrink-0 items-center">
        <div className="h-px w-full bg-sidebar-border" />
      </div>

      <ul aria-label="Calendars" className="flex flex-col items-center gap-2.5 py-1.5">
        {calendars.map((cal) => {
          const visible = !hiddenCalendarIds.has(cal.id);
          return (
            <li key={cal.id} style={calendarColorVars(cal.color)}>
              <RailTip label={visible ? cal.name : `${cal.name} (hidden)`}>
                <span
                  tabIndex={0}
                  role="img"
                  aria-label={visible ? cal.name : `${cal.name}, hidden`}
                  className={cn(
                    "block size-3 rounded-[3px] outline-none focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/50",
                    visible ? "bg-(--cal-accent)" : "border-[1.5px] border-(color:--cal-accent)",
                  )}
                />
              </RailTip>
            </li>
          );
        })}
      </ul>

      <div aria-hidden className="min-h-0 flex-1" />

      <RailTip label="Settings">
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
      </RailTip>

      <Avatar className="size-8 border border-border">
        <AvatarFallback className="bg-muted text-sm text-muted-foreground">{initials}</AvatarFallback>
      </Avatar>
    </aside>
  );
}

function RailTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
