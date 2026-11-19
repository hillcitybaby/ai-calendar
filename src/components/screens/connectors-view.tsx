"use client";

import * as React from "react";
import { Blocks, CalendarDays, CalendarPlus, CircleCheck, ListChecks, Plus, StickyNote, SquareCheck } from "lucide-react";
import { toast } from "sonner";

import {
  InterestTag,
  SettingsCard,
  SettingsInput,
  SuggestedTag,
  ToggleRow,
  FieldRow,
} from "@/components/settings/settings-ui";
import { TopBar } from "@/components/shell/top-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { newId, useStore } from "@/lib/store";
import type { Connector } from "@/lib/types";

const PROVIDER_ICONS: Record<string, typeof CalendarDays> = {
  "Google Calendar": CalendarDays,
  Outlook: CalendarDays,
  iCloud: CalendarDays,
  "Google Keep": StickyNote,
  "Google Tasks": ListChecks,
  ClickUp: SquareCheck,
};

const CALENDAR_PROVIDERS = ["Google Calendar", "Outlook", "iCloud"];
const INTEGRATIONS = ["ClickUp", "Notion", "Todoist", "Asana", "Linear"];

/** Connectors & interests: linked calendars and tools, plus the interests suggestions use. */
export function ConnectorsView() {
  const { state, dispatch, ready } = useStore();
  const [draft, setDraft] = React.useState("");

  // Honor #interests links (from Settings › Suggestions) once the content renders.
  React.useEffect(() => {
    if (ready && window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [ready]);

  const connect = (kind: Connector["kind"], provider: string) => {
    dispatch({
      type: "connector/add",
      connector: {
        id: newId("con"),
        kind,
        provider,
        detail: kind === "calendar" ? "Example account · syncing" : "Connected · syncing",
        status: "connected",
      },
    });
    toast(`${provider} connected`, { description: "This prototype uses example data; nothing leaves your browser." });
  };

  const addInterest = () => {
    if (!draft.trim()) return;
    dispatch({ type: "interest/add", label: draft });
    setDraft("");
  };

  const interests = state.interests.filter((i) => !i.suggested);
  const suggested = state.interests.filter((i) => i.suggested);

  return (
    <>
      <TopBar title="Connectors & interests" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {ready && (
          <div className="grid grid-cols-1 items-start gap-6 p-6 xl:grid-cols-2">
            <SettingsCard
              title="Connectors"
              action={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="h-7 gap-1.5 px-2.5">
                      <Plus />
                      Add connector
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-74 p-1.5">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-3 p-2">
                        <CalendarPlus className="size-4" />
                        <MenuText title="Calendar" detail="Google, Outlook or iCloud" />
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {CALENDAR_PROVIDERS.map((p) => (
                            <DropdownMenuItem key={p} onSelect={() => connect("calendar", p)}>
                              {p}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-3 p-2">
                        <Blocks className="size-4" />
                        <MenuText title="Integration" detail="ClickUp, Notion, Todoist and more" />
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {INTEGRATIONS.map((p) => (
                            <DropdownMenuItem key={p} onSelect={() => connect("integration", p)}>
                              {p}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            >
              {state.connectors.map((c) => (
                <ConnectorRow key={c.id} c={c} />
              ))}
            </SettingsCard>

            <SettingsCard
              id="interests"
              title="Your interests"
              description="I look for events near your home area that match these and put the best ones in Suggestions. Add or remove anything."
            >
              <div className="flex flex-col gap-3 px-4 pt-1 pb-4">
                <ul className="flex flex-wrap gap-2" aria-label="Your interests">
                  {interests.map((i) => (
                    <li key={i.id}>
                      <InterestTag label={i.label} onRemove={() => dispatch({ type: "interest/remove", id: i.id })} />
                    </li>
                  ))}
                </ul>
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addInterest();
                  }}
                >
                  <SettingsInput
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add an interest, group or place"
                    aria-label="New interest"
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 shadow-none">
                    <Plus />
                    Add
                  </Button>
                </form>
                {suggested.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground">Suggested for you, based on what you keep and accept</p>
                    <ul className="flex flex-wrap gap-2" aria-label="Suggested interests">
                      {suggested.map((i) => (
                        <li key={i.id}>
                          <SuggestedTag label={i.label} onAdd={() => dispatch({ type: "interest/accept", id: i.id })} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <ToggleRow
                label="Use the weather"
                description="Indoor ideas on rainy days"
                checked={state.settings.useWeather}
                onChange={(v) => dispatch({ type: "settings/update", patch: { useWeather: v } })}
              />
              <FieldRow
                label="Home area"
                value={state.settings.homeArea}
                onCommit={(v) => dispatch({ type: "settings/update", patch: { homeArea: v } })}
              />
            </SettingsCard>
          </div>
        )}
      </div>
    </>
  );
}

function MenuText({ title, detail }: { title: string; detail: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </span>
  );
}

function ConnectorRow({ c }: { c: Connector }) {
  const Icon = PROVIDER_ICONS[c.provider] ?? Blocks;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{c.provider}</p>
        <p className="truncate text-xs text-muted-foreground">{c.detail}</p>
      </div>
      {c.status === "connected" && (
        <CircleCheck className="size-4 shrink-0 text-calendar-emerald-accent" aria-label="Connected" role="img" />
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2.5 shadow-none"
        onClick={() => toast(`Managing ${c.provider} isn't available in the prototype yet.`)}
      >
        Manage
      </Button>
    </div>
  );
}
