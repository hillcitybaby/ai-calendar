"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  parseInk,
  startAnimating,
  stopAnimating,
  Swarm,
  type AssistantState,
  type SwarmOptions,
} from "./swarm";

/**
 * Kit sizes: L 120, M 40, S 20. The top bar uses a 32px resting mark; Plan (AC) headers and
 * suggested Event Blocks use 16px.
 */
export type AssistantMarkSize = "L" | "M" | "S" | 32 | 16 | 14;

const PRESETS: Record<string, Pick<SwarmOptions, "n" | "size" | "scale"> & { px: number }> = {
  L: { px: 120, n: 260, size: 1, scale: 0.33 },
  M: { px: 40, n: 70, size: 0.75, scale: 0.36 },
  "32": { px: 32, n: 48, size: 0.72, scale: 0.38 },
  S: { px: 20, n: 22, size: 0.7, scale: 0.4 },
  "16": { px: 16, n: 18, size: 0.6, scale: 0.42 },
  "14": { px: 14, n: 16, size: 0.55, scale: 0.42 },
};

const STATE_LABELS: Record<AssistantState, string> = {
  idle: "Assistant",
  summoned: "Assistant is ready",
  listening: "Assistant is listening",
  thinking: "Assistant is thinking",
  responding: "Assistant is responding",
  waiting: "Assistant is waiting on you",
  done: "Assistant is done",
  error: "Assistant ran into a problem",
  offline: "Assistant is offline",
  searching: "Assistant is searching nearby",
  suggesting: "Assistant has a suggestion",
  scheduling: "Assistant is scheduling",
};

let seedCounter = 1;

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Assistant Mark (AC): the only AI signal in the app. A field of ink particles
 * that fills a simple shape per state and flows between shapes like a flock.
 * With reduced motion it renders each state as a still shape.
 */
export function AssistantMark({
  state = "idle",
  size = "M",
  label,
  decorative = false,
  className,
}: {
  state?: AssistantState;
  size?: AssistantMarkSize;
  /** Accessible name. Defaults to a description of the state. */
  label?: string;
  /** Hide from assistive tech, e.g. when a parent button already has a label. */
  decorative?: boolean;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const swarmRef = React.useRef<Swarm | null>(null);
  const entryRef = React.useRef<{ swarm: Swarm; visible: boolean } | null>(null);
  const reduced = usePrefersReducedMotion();
  const preset = PRESETS[String(size)];
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;

  // Create the swarm once per canvas and size.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const swarm = new Swarm(canvas, {
      n: preset.n,
      size: preset.size,
      scale: preset.scale,
      state: stateRef.current,
      seed: seedCounter++,
    });
    const ink = parseInk(getComputedStyle(canvas).color);
    if (ink) swarm.ink = ink;
    swarmRef.current = swarm;
    const entry = { swarm, visible: true };
    entryRef.current = entry;

    const ro = new ResizeObserver(() => {
      swarm.resize();
      if (reducedRef.current) swarm.draw(0, 0, true);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([e]) => {
        entry.visible = e.isIntersecting;
      },
      { rootMargin: "60px" },
    );
    io.observe(canvas);

    return () => {
      ro.disconnect();
      io.disconnect();
      stopAnimating(entry);
      swarmRef.current = null;
      entryRef.current = null;
    };
  }, [preset]);

  // Animate, or pose a still shape for reduced motion.
  React.useEffect(() => {
    const entry = entryRef.current;
    if (!entry) return;
    if (reduced) {
      stopAnimating(entry);
      entry.swarm.draw(0, 0, true);
    } else {
      startAnimating(entry);
    }
    return () => stopAnimating(entry);
  }, [reduced, preset]);

  // Follow state changes.
  React.useEffect(() => {
    const swarm = swarmRef.current;
    if (!swarm) return;
    swarm.set(state);
    if (reduced) swarm.draw(0, 0, true);
  }, [state, reduced]);

  return (
    <canvas
      ref={canvasRef}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : (label ?? STATE_LABELS[state])}
      data-state={state}
      className={cn("block shrink-0 text-ink", className)}
      style={{ width: preset.px, height: preset.px }}
    />
  );
}
