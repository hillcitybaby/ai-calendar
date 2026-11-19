"use client";

import * as React from "react";

/** Horizontal swipe on touch: left goes forward, right goes back. Ignores mostly-vertical moves. */
export function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = React.useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(t.clientY - s.y) * 1.5) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}
