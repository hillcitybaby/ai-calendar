"use client";

import * as React from "react";

/** Mobile is under 768px (Tailwind `md`); tablet and desktop share the sidebar shell. */
export const MOBILE_QUERY = "(max-width: 767.98px)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * True below 768px. Views that would otherwise mount two drag-and-drop trees (one hidden)
 * use this to render only the layout that's showing. False during server render.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
