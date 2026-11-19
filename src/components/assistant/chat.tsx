"use client";

import * as React from "react";
import { ArrowUp, Copy, LoaderCircle, Mic, Paperclip, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { PlanStepRow } from "@/components/ai/plan";
import { Button } from "@/components/ui/button";
import type { ChatPlan } from "@/lib/assistant-script";
import { useStore } from "@/lib/store";
import type { PlanStep } from "@/lib/types";
import { cn } from "@/lib/utils";

import { AssistantMark } from "./assistant-mark";
import type { AssistantState } from "./swarm";

/** Message (AC), From=User: a secondary bubble on the right. */
export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[300px] rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">{text}</p>
    </div>
  );
}

/** Message (AC), From=Assistant: mark avatar, plain text, then actions. */
export function AssistantMessage({
  text,
  markState = "idle",
  onRetry,
  children,
}: {
  text: string;
  markState?: AssistantState;
  onRetry?: () => void;
  children?: React.ReactNode;
}) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
        <AssistantMark state={markState} size={32} decorative />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm text-foreground">{text}</p>
        {children}
        <div className="flex">
          <IconAction
            label="Copy"
            onClick={() => {
              navigator.clipboard?.writeText(text).catch(() => {});
              toast("Copied");
            }}
          >
            <Copy />
          </IconAction>
          <IconAction label="Good reply" pressed={vote === "up"} onClick={() => setVote(vote === "up" ? null : "up")}>
            <ThumbsUp />
          </IconAction>
          <IconAction label="Bad reply" pressed={vote === "down"} onClick={() => setVote(vote === "down" ? null : "down")}>
            <ThumbsDown />
          </IconAction>
          {onRetry && (
            <IconAction label="Try again" onClick={onRetry}>
              <RefreshCw />
            </IconAction>
          )}
        </div>
      </div>
    </div>
  );
}

function IconAction({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7 rounded-md text-foreground", pressed && "bg-accent")}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

/** Thinking (AC): status line with the mark, then skeleton lines. */
export function Thinking({ label, state }: { label: string; state: AssistantState }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <AssistantMark state={state} size={16} decorative />
        {label}
      </p>
      <span aria-hidden className="h-3 w-full animate-pulse rounded-md bg-muted" />
      <span aria-hidden className="h-3 w-4/5 animate-pulse rounded-md bg-muted" />
      <span aria-hidden className="h-3 w-3/5 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

/** Suggestion (AC): AI Elements prompt chip. */
export function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <AssistantMark size={16} decorative />
      {label}
    </button>
  );
}

/** Prompt Input (AC): textarea + toolbar (attach, mic) + send. Empty / Typing / Loading. */
export function PromptInput({
  onSubmit,
  loading,
  inputRef,
}: {
  onSubmit: (text: string) => void;
  loading: boolean;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}) {
  const [value, setValue] = React.useState("");
  const submit = () => {
    const text = value.trim();
    if (!text || loading) return;
    onSubmit(text);
    setValue("");
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col rounded-lg border border-input bg-background shadow-xs transition-[border-color,box-shadow] focus-within:border-ring"
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        aria-label="Message the assistant"
        placeholder="Ask to plan your day, move something, or find time…"
        className="min-h-14 resize-none bg-transparent px-3 pt-3 pb-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center p-2">
        <div className="flex flex-1 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            aria-label="Attach a file"
            onClick={() => toast("Attachments aren't available in the prototype yet.")}
          >
            <Paperclip />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            aria-label="Voice input"
            onClick={() => toast("Voice input isn't available in the prototype yet.")}
          >
            <Mic />
          </Button>
        </div>
        <Button
          type="submit"
          size="icon"
          className="size-8 rounded-md disabled:opacity-50"
          disabled={!value.trim() && !loading}
          aria-label={loading ? "Working" : "Send"}
        >
          {loading ? <LoaderCircle className="size-3 animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  );
}

/** Plan (AC) inside a reply: Apply all, or review steps one at a time. */
export function ChatPlanCard({
  plan,
  onApplyAll,
}: {
  plan: ChatPlan & { status: "open" | "applied" | "dismissed" };
  onApplyAll: () => void;
}) {
  const { dispatch } = useStore();
  const [reviewing, setReviewing] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Record<string, PlanStep["status"]>>({});
  const applied = plan.status === "applied";
  const status = (id: string): PlanStep["status"] => (applied ? "applied" : (statuses[id] ?? "pending"));
  const pending = plan.steps.filter((s) => status(s.id) === "pending").length;

  return (
    <section
      aria-label={plan.title}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <header className="flex items-center gap-2">
        <AssistantMark size={16} decorative />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-sm font-semibold text-card-foreground">{plan.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {applied || pending === 0 ? "Applied to your calendar" : plan.subtitle}
          </p>
        </div>
      </header>
      <ul className="flex flex-col gap-0.5">
        {plan.steps.map((s) => (
          <PlanStepRow
            key={s.id}
            step={{ ...s, status: status(s.id) }}
            reviewing={reviewing && !applied}
            onApply={() => {
              dispatch(s.action);
              setStatuses((m) => ({ ...m, [s.id]: "applied" }));
            }}
            onSkip={() => setStatuses((m) => ({ ...m, [s.id]: "skipped" }))}
          />
        ))}
      </ul>
      {!applied && !reviewing && (
        <div className="flex gap-2">
          <Button size="sm" className="h-7 px-2.5" onClick={onApplyAll}>
            Apply all
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2.5 shadow-none" onClick={() => setReviewing(true)}>
            Review one by one
          </Button>
        </div>
      )}
    </section>
  );
}
