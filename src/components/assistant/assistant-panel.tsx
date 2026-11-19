"use client";

import * as React from "react";
import { X } from "lucide-react";

import { SuggestionCardCompact } from "@/components/suggestions/suggestion-card";
import { WorkTaskCard } from "@/components/tasks/work-task";
import { Button } from "@/components/ui/button";
import { greeting, PROMPT_SUGGESTIONS } from "@/lib/assistant-script";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/use-media";
import { cn } from "@/lib/utils";

import { useAssistant } from "./assistant-provider";
import { AssistantMessage, ChatPlanCard, PromptInput, SuggestionChip, Thinking, UserMessage } from "./chat";

/**
 * The Assistant: Sheet (AC), 440px, docked on the right over the current page. Opened from the
 * resting Assistant Mark in the top bar (or ⌘J). Not modal, so the calendar stays usable.
 */
export function AssistantPanel() {
  const { open, setOpen, messages, working, send, applyPlan, markState } = useAssistant();
  const { state } = useStore();
  // Full-screen and modal on mobile; a docked, non-modal panel from 768px up.
  const mobile = useIsMobile();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const [greet] = React.useState(() => greeting(state, new Date()));

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, working]);

  const lastUser = [...messages].reverse().find((m) => m.from === "user");

  return (
    <aside
      aria-label="Assistant"
      role={mobile ? "dialog" : undefined}
      aria-modal={mobile && open ? true : undefined}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-full flex-col md:w-[440px] md:border-l border-border bg-background shadow-lg transition-transform duration-300 ease-out motion-reduce:transition-none",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <h2 className="flex-1 text-base font-semibold text-foreground">AI Calendar assistant</h2>
        <Button variant="ghost" size="icon" className="size-7 rounded-md" aria-label="Close assistant" onClick={() => setOpen(false)}>
          <X />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2" aria-live="polite">
        {messages.length === 0 && <AssistantMessage text={greet} markState={markState} />}
        {messages.map((m) =>
          m.from === "user" ? (
            <UserMessage key={m.id} text={m.text} />
          ) : (
            <React.Fragment key={m.id}>
              <AssistantMessage
                text={m.text}
                onRetry={lastUser && m.id === messages[messages.length - 1].id ? () => send(lastUser.text) : undefined}
              >
                {m.suggestionIds?.length ? (
                  <div className="flex flex-col gap-2">
                    {m.suggestionIds
                      .map((id) => state.suggestions.find((s) => s.id === id))
                      .filter((s) => s && s.status === "new")
                      .map((s) => (
                        <SuggestionCardCompact key={s!.id} s={s!} />
                      ))}
                  </div>
                ) : null}
                {m.taskIds?.length ? (
                  <div className="flex flex-col gap-2">
                    {m.taskIds
                      .map((id) => state.tasks.find((t) => t.id === id))
                      .filter((t) => !!t)
                      .map((t) => (
                        <WorkTaskCard key={t.id} task={t} />
                      ))}
                  </div>
                ) : null}
              </AssistantMessage>
              {m.plan && <ChatPlanCard plan={m.plan} onApplyAll={() => applyPlan(m.id)} />}
            </React.Fragment>
          ),
        )}
        {working && <Thinking label={working.label} state={markState} />}
        <div ref={endRef} />
      </div>

      <div className="flex shrink-0 flex-col gap-4 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((p) => (
            <SuggestionChip key={p} label={p} onClick={() => send(p)} />
          ))}
        </div>
        <PromptInput onSubmit={send} loading={!!working} inputRef={inputRef} />
      </div>
    </aside>
  );
}
