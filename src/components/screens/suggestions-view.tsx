"use client";

import * as React from "react";
import Link from "next/link";
import { isAfter, parseISO } from "date-fns";
import { Lightbulb, MapPin, Settings } from "lucide-react";
import { toast } from "sonner";

import { Segmented } from "@/components/common/segmented";
import { TopBar } from "@/components/shell/top-bar";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { isThisWeekend } from "@/lib/schedule";
import { useStore } from "@/lib/store";
import type { Suggestion } from "@/lib/types";
import { useToday } from "@/lib/use-today";

type Filter = "all" | "activity" | "localEvent";

/** Suggestions: AI suggestions and local events, filtered by type and grouped by when. */
export function SuggestionsView() {
  const { state, dispatch, ready } = useStore();
  const today = useToday();
  const [filter, setFilter] = React.useState<Filter>("all");

  const list = ready
    ? state.suggestions
        .filter((s) => s.status === "new" && isAfter(parseISO(s.end), today))
        .filter((s) => filter === "all" || s.kind === filter)
        .sort((a, b) => a.start.localeCompare(b.start))
    : [];
  const weekend = list.filter((s) => isThisWeekend(parseISO(s.start), today));
  const later = list.filter((s) => !weekend.includes(s));

  const onDismiss = (s: Suggestion) =>
    toast(`Hidden "${s.title}"`, {
      description: "We'll suggest fewer things like this.",
      action: { label: "Undo", onClick: () => dispatch({ type: "suggestion/restore", id: s.id }) },
    });
  const onAdd = (s: Suggestion) => toast(`Added "${s.title}" to your calendar`);

  return (
    <>
      <TopBar
        title="Suggestions"
        actions={
          <Button asChild variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 shadow-none">
            <Link href="/settings#suggestions">
              <Settings />
              Preferences
            </Link>
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-8 p-6">
          <Segmented
            value={filter}
            onChange={setFilter}
            label="Show"
            className="self-start"
            options={[
              { value: "all", label: "All" },
              { value: "activity", label: "Activities" },
              { value: "localEvent", label: "Local events" },
            ]}
          />
          {ready && list.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Lightbulb />
                </EmptyMedia>
                <EmptyTitle>No new suggestions</EmptyTitle>
                <EmptyDescription>
                  You&apos;re all caught up. New ideas show up here as they match your interests.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild variant="outline" size="sm">
                  <Link href="/settings/connectors">Edit interests</Link>
                </Button>
              </EmptyContent>
            </Empty>
          )}
          <Section title="This weekend" items={weekend} onAdd={onAdd} onDismiss={onDismiss} />
          <Section title="Coming up" items={later} onAdd={onAdd} onDismiss={onDismiss} />
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  items,
  onAdd,
  onDismiss,
}: {
  title: string;
  items: Suggestion[];
  onAdd: (s: Suggestion) => void;
  onDismiss: (s: Suggestion) => void;
}) {
  if (!items.length) return null;
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MapPin className="size-4" aria-hidden />
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-[repeat(auto-fill,minmax(320px,362px))]">
        {items.map((s) => (
          <SuggestionCard key={s.id} s={s} onDismiss={() => onDismiss(s)} onAdd={() => onAdd(s)} />
        ))}
      </div>
    </section>
  );
}
