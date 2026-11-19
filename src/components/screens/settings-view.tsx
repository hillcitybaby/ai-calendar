"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  ActionRow,
  ChoiceRow,
  FieldRow,
  SettingsCard,
  ToggleRow,
} from "@/components/settings/settings-ui";
import { TopBar } from "@/components/shell/top-bar";
import { Button } from "@/components/ui/button";
import { formatWorkingHours, parseMinutes, parseWorkingHours, type Settings } from "@/lib/settings";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "planning", label: "Planning" },
  { id: "suggestions", label: "Suggestions" },
  { id: "notifications", label: "Notifications" },
  { id: "connectors", label: "Connectors & interests", href: "/settings/connectors" },
  { id: "account", label: "Account" },
] as const;

/** Settings: a sub-nav beside General, Planning, Suggestions, Notifications and Account. */
export function SettingsView() {
  const { state, dispatch, ready } = useStore();
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
    // Honor a #section link (e.g. Preferences on Suggestions).
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView();
    return () => root.removeEventListener("scroll", onScroll);
  }, [ready]);

  const workingHoursText = formatWorkingHours(s.workingHours);
  const interestCount = state.interests.filter((i) => !i.suggested).length;

  return (
    <>
      <TopBar title="Settings" />
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {ready && (
          <div className="flex items-start gap-8 p-6">
            <nav aria-label="Settings sections" className="sticky top-6 flex w-50 shrink-0 flex-col gap-0.5">
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

            <div className="flex w-[720px] min-w-0 flex-col gap-6">
              <SettingsCard id="general" title="General" description="Your name, time zone and how the calendar looks.">
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

              <SettingsCard id="planning" title="Planning" description="How your days get planned.">
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

              <SettingsCard id="suggestions" title="Suggestions" description="What I look for and how often.">
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

              <SettingsCard id="notifications" title="Notifications" description="When I check in with you.">
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

              <SettingsCard id="account" title="Account" description="This prototype keeps everything in your browser.">
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
