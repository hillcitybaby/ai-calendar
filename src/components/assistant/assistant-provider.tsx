"use client";

import * as React from "react";

import { scriptedReply, type ChatPlan } from "@/lib/assistant-script";
import { useStore } from "@/lib/store";

import type { AssistantState } from "./swarm";

export type ChatMessage =
  | { id: string; from: "user"; text: string }
  | {
      id: string;
      from: "assistant";
      text: string;
      plan?: ChatPlan & { status: "open" | "applied" | "dismissed" };
      suggestionIds?: string[];
    };

type AssistantContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  /** What the Assistant Mark shows everywhere. */
  markState: AssistantState;
  setMarkState: (s: AssistantState) => void;
  messages: ChatMessage[];
  working: { label: string } | null;
  send: (text: string) => void;
  applyPlan: (messageId: string) => void;
  dismissPlan: (messageId: string) => void;
};

const AssistantContext = React.createContext<AssistantContextValue | null>(null);

export function useAssistant() {
  const ctx = React.useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used inside <AssistantProvider>");
  return ctx;
}

let mid = 0;
const nextId = () => `m${++mid}`;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Assistant state: whether the panel is open, the conversation, and the Assistant Mark's state.
 * The mark moves through the kit's states as the assistant works:
 * summoned → thinking/searching → responding → waiting on you → scheduling → done → idle.
 */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const [open, setOpenState] = React.useState(false);
  const [markState, setMarkState] = React.useState<AssistantState>("idle");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [working, setWorking] = React.useState<{ label: string } | null>(null);
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const runRef = React.useRef(0);
  const settleTimer = React.useRef<number | undefined>(undefined);

  const settle = React.useCallback((s: AssistantState, ms: number, then: AssistantState = "idle") => {
    window.clearTimeout(settleTimer.current);
    setMarkState(s);
    settleTimer.current = window.setTimeout(() => setMarkState(then), ms);
  }, []);

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (next) settle("summoned", 900);
      else settle("idle", 0);
    },
    [settle],
  );
  const toggle = React.useCallback(() => setOpen(!open), [open, setOpen]);

  // ⌘J / Ctrl+J opens the assistant.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const send = React.useCallback(
    async (text: string) => {
      const run = ++runRef.current;
      window.clearTimeout(settleTimer.current);
      setMessages((m) => [...m, { id: nextId(), from: "user", text }]);
      const reply = scriptedReply(text, stateRef.current, new Date());
      setWorking({ label: reply.workingLabel });
      setMarkState(reply.working);
      await wait(reply.working === "searching" ? 2200 : 1400);
      if (run !== runRef.current) return;
      setWorking(null);
      setMarkState("responding");
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          from: "assistant",
          text: reply.text,
          plan: reply.plan ? { ...reply.plan, status: "open" } : undefined,
          suggestionIds: reply.suggestionIds,
        },
      ]);
      await wait(900);
      if (run !== runRef.current) return;
      if (reply.plan) setMarkState("waiting");
      else if (reply.suggestionIds?.length) settle("suggesting", 4000);
      else setMarkState("idle");
    },
    [settle],
  );

  const updatePlan = (messageId: string, status: "applied" | "dismissed") =>
    setMessages((m) =>
      m.map((msg) => (msg.id === messageId && msg.from === "assistant" && msg.plan ? { ...msg, plan: { ...msg.plan, status } } : msg)),
    );

  const applyPlan = React.useCallback(
    async (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg || msg.from !== "assistant" || !msg.plan) return;
      setMarkState("scheduling");
      for (const step of msg.plan.steps) dispatch(step.action);
      updatePlan(messageId, "applied");
      await wait(1200);
      settle("done", 1800);
    },
    [messages, dispatch, settle],
  );

  const dismissPlan = React.useCallback(
    (messageId: string) => {
      updatePlan(messageId, "dismissed");
      setMarkState("idle");
    },
    [],
  );

  const value = React.useMemo(
    () => ({ open, setOpen, toggle, markState, setMarkState, messages, working, send, applyPlan, dismissPlan }),
    [open, setOpen, toggle, markState, messages, working, send, applyPlan, dismissPlan],
  );
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
