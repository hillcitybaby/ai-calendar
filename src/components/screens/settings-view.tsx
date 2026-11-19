"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CalendarDays, ChevronRight, Lightbulb, Plug, Settings as Cog, User, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import {
  ActionRow,
  ChoiceRow,
  FieldRow,
  SettingsCard,
  ToggleRow,
} from "@/components/settings/settings-ui";
import { USER_INITIALS } from "@/components/shell/constants";
import { TopBar } from "@/components/shell/top-bar";
import { Button } from "@/components/ui/button";
import { formatWorkingHours, parseMinutes, parseWorkingHours, type Settings } from "@/lib/settings";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/use-media";
import { cn } from "@/lib/utils";

import { SECTIONS, type SettingsSectionId } from "./settings-sections";

const SECTION_ICONS: Record<string, LucideIcon> = {
  general: Cog,
  planning: CalendarDays,
  suggestions: Lightbulb,
  notifications: Bell,
  connectors: Plug,
  account: User,
};

/**
 * Settings: a sub-nav beside General, Planning, Suggestions, Notifications and Account.
 * Mobile: a profile card and a list of sections; each section is its own detail screen.
 */
export function SettingsView({ section }: { section?: SettingsSectionId }) {
  const { state, dispatch, ready } = useStore();
  const mobile = useIsMobile();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<string>("general");
  // After a nav click, keep that item active while the smooth scroll runs.
  const lockUntil = React.useRef(0);
  const s = state.settings;
  const set = (patch: Partial<Settings>) => dispatch({ type: "settings/update", patch });

  // Highlight the section nearest the top of the scroll area.
  React.useEffect(() => {
    const root = scrollRef.current;
    if (!root || !ready) return;
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return;
      const top = root.getBoundingClientRect().top;
      let current: string = SECTIONS[0].id;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top - top <= 48) current = sec.id;
      }
      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 4) current = "account";
      setActive(current);
    };
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    // Honor a #section link (e.g. Preferences on Suggestions) or a /settings/<section> route.
    const target = window.location.hash.slice(1) || section;
    if (target) document.getElementById(target)?.scrollIntoView();
    return () => root.removeEventListener("scroll", onScroll);
  }, [ready, mobile, section]);

  const workingHoursText = formatWorkingHours(s.workingHours);
  const interestCount = state.interests.filter((i) => !i.suggested).length;
  const connectorCount = state.connectors.length;

  /** One section's card. Mobile detail screens hide its header (the Back header names it). */
  const card = (id: SettingsSectionId, hideHeader = false) => {
    switch (id) {
      case "general":
        return (
      <SettingsCard id="general" hideHeader={hideHeader} title="General" description="Your name, time zone and how the calendar looks.">
        <FieldRow label="Name" value={s.name} onCommit={(v) => set({ name: v })} />
        <FieldRow label="Time zone" value={s.timeZone} onCommit={(v) => set({ timeZone: v })} />
        <ChoiceRow
          label="Week starts on"
          description="Used by Week and Month"
          value={String(s.weekStartsOn) as "0" | "1"}
          onChange={(v) => set({ weekStartsOn: Number(v) as 0 | 1 })}
          options={[
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
          ]}
        />
        <ChoiceRow
          label="Theme"
          description="Match your system or pick one. Only light is available for now."
          value={s.theme}
          onChange={(v) => set({ theme: v })}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </SettingsCard>
        );
      case "planning":
        return (
      <SettingsCard id="planning" hideHeader={hideHeader} title="Planning" description="How your days get planned.">
        <FieldRow
          label="Working hours"
          value={workingHoursText}
          onCommit={(v) => {
            const parsed = parseWorkingHours(v, s.workingHours.days);
            if (parsed) set({ workingHours: parsed });
            else toast("Couldn't read those hours", { description: 'Try something like "9:00 AM – 5:00 PM".' });
          }}
        />
        <ToggleRow
          label="Plan my day each morning"
          description="A short plan at 8:30 AM on weekdays"
          checked={s.morningPlan}
          onChange={(v) => set({ morningPlan: v })}
        />
        <FieldRow
          label="Default task length"
          value={`${s.defaultTaskMin} min`}
          onCommit={(v) => {
            const m = parseMinutes(v);
            if (m) set({ defaultTaskMin: m });
          }}
        />
        <ToggleRow
          label="Protect family time"
          description="No work tasks after 5:30 PM or on weekends"
          checked={s.protectFamilyTime}
          onChange={(v) => set({ protectFamilyTime: v })}
        />
      </SettingsCard>
        );
      case "suggestions":
        return (
      <SettingsCard id="suggestions" hideHeader={hideHeader} title="Suggestions" description="What I look for and how often.">
        <ChoiceRow
          label="How many suggestions"
          description="Per week, across activities and local events"
          value={s.suggestionAmount}
          onChange={(v) => set({ suggestionAmount: v })}
          options={[
            { value: "few", label: "A few" },
            { value: "some", label: "Some" },
            { value: "lots", label: "Lots" },
          ]}
        />
        <ChoiceRow
          label="Budget"
          description="Default cost for suggestions"
          value={s.budget}
          onChange={(v) => set({ budget: v })}
          options={[
            { value: "free", label: "Mostly free" },
            { value: "some", label: "Some cost" },
            { value: "any", label: "Any" },
          ]}
        />
        <ToggleRow
          label="Kid-friendly first"
          description="Put things the kids can do at the top"
          checked={s.kidFriendlyFirst}
          onChange={(v) => set({ kidFriendlyFirst: v })}
        />
        <ToggleRow
          label="Use the weather"
          description="Indoor ideas on rainy days"
          checked={s.useWeather}
          onChange={(v) => set({ useWeather: v })}
        />
        <FieldRow label="Home area" value={s.homeArea} onCommit={(v) => set({ homeArea: v })} />
        <ActionRow
          label="Your interests"
          description={`${interestCount} interests, used to find events`}
          action={
            <Button asChild variant="outline" size="sm" className="h-7 px-2.5 shadow-none">
              <Link href="/settings/connectors#interests">Edit interests</Link>
            </Button>
          }
        />
      </SettingsCard>
        );
      case "notifications":
        return (
      <SettingsCard id="notifications" hideHeader={hideHeader} title="Notifications" description="When I check in with you.">
        <ToggleRow
          label="Morning plan"
          description="8:30 AM on weekdays"
          checked={s.notifyMorningPlan}
          onChange={(v) => set({ notifyMorningPlan: v })}
        />
        <ToggleRow
          label="Suggestion digest"
          description="Fridays at 4 PM, for the weekend"
          checked={s.notifySuggestionDigest}
          onChange={(v) => set({ notifySuggestionDigest: v })}
        />
        <FieldRow
          label="Event reminders"
          value={`${s.reminderMin} min before`}
          onCommit={(v) => {
            const m = parseMinutes(v);
            if (m) set({ reminderMin: m });
          }}
        />
      </SettingsCard>
        );
      case "account":
        return (
      <SettingsCard id="account" hideHeader={hideHeader} title="Account" description="This prototype keeps everything in your browser.">
        <ActionRow
          label="Reset example data"
          description="Put back the example tasks, events, suggestions and settings."
          action={
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 shadow-none"
              onClick={() => {
                dispatch({ type: "reset" });
                toast("Example data reset");
              }}
            >
              Reset
            </Button>
          }
        />
      </SettingsCard>
        );
      default:
        return null;
    }
  };

  if (mobile && ready) {
    const current = section && SECTIONS.find((sec) => sec.id === section);
    if (current) {
      return (
        <>
          <TopBar title={current.label} mobile={{ back: "/settings" }} />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-2">{card(current.id, true)}</div>
        </>
      );
    }
    const subtitles: Record<string, string> = {
      general: "Name, time zone, theme",
      planning: "Working hours, morning plan",
      suggestions: "How many, budget, weather",
      notifications: "Morning plan, digest, reminders",
      connectors: `${connectorCount} connected · ${interestCount} interests`,
      account: "Reset example data",
    };
    return (
      <>
        <TopBar title="Settings" />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pt-2">
          <Link
            href="/settings/general"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
              {USER_INITIALS}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-base font-semibold text-foreground">{s.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {connectorCount} connectors · {interestCount} interests
              </span>
            </span>
          </Link>
          <nav aria-label="Settings sections" className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {SECTIONS.map((sec) => {
              const Icon = SECTION_ICONS[sec.id];
              return (
                <Link
                  key={sec.id}
                  href={"href" in sec ? sec.href : `/settings/${sec.id}`}
                  className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  <Icon className="size-4 shrink-0 text-foreground" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{sec.label}</span>
                    <span className="truncate text-xs text-muted-foreground">{subtitles[sec.id]}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-foreground" aria-hidden />
                </Link>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Settings" />
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {ready && (
          <div className="flex items-start gap-6 p-6 xl:gap-8">
            <nav aria-label="Settings sections" className="sticky top-6 flex w-44 shrink-0 flex-col gap-0.5 xl:w-50">
              {SECTIONS.map((sec) => {
                const isActive = active === sec.id;
                const cls = cn(
                  "flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground outline-none transition-colors",
                  "hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive && "bg-accent",
                );
                return "href" in sec ? (
                  <Link key={sec.id} href={sec.href} className={cls}>
                    {sec.label}
                  </Link>
                ) : (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cls}
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(sec.id);
                      lockUntil.current = Date.now() + 900;
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                      history.replaceState(null, "", `#${sec.id}`);
                    }}
                  >
                    {sec.label}
                  </a>
                );
              })}
            </nav>

            <div className="flex min-w-0 flex-1 flex-col gap-6 xl:w-[720px] xl:flex-none">
              {SECTIONS.filter((sec) => !("href" in sec)).map((sec) => (
                <React.Fragment key={sec.id}>{card(sec.id)}</React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
