"use client";

import * as React from "react";

import { EXAMPLE_CALENDARS, type Calendar } from "@/lib/calendars";
import { useStore } from "@/lib/store";

import { SIDEBAR_COOKIE } from "./constants";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type ShellContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /**
   * Expand/collapse. On desktop this collapses the sidebar to the icon rail; below desktop
   * (tablet) the rail is always shown and this opens the full sidebar as an overlay drawer.
   */
  toggleCollapsed: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  calendars: Calendar[];
  hiddenCalendarIds: ReadonlySet<string>;
  toggleCalendar: (id: string) => void;
  /** New suggestions, shown next to Suggestions in the sidebar. */
  suggestionCount: number;
};

const ShellContext = React.createContext<ShellContextValue | null>(null);

export function useShell() {
  const ctx = React.useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}

export function ShellProvider({
  defaultCollapsed = false,
  children,
}: {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const { state, ready } = useStore();
  const suggestionCount = ready ? state.suggestions.filter((s) => s.status === "new").length : 0;
  const [collapsed, setCollapsedState] = React.useState(defaultCollapsed);
  const [hiddenCalendarIds, setHidden] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const setCollapsed = React.useCallback((next: boolean) => {
    setCollapsedState(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; samesite=lax`;
  }, []);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const toggleCollapsed = React.useCallback(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) setCollapsed(!collapsed);
    else setDrawerOpen((o) => !o);
  }, [collapsed, setCollapsed]);

  const toggleCalendar = React.useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ⌘\ / Ctrl+\ toggles the sidebar.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "\\" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  const value = React.useMemo<ShellContextValue>(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      drawerOpen,
      setDrawerOpen,
      calendars: EXAMPLE_CALENDARS,
      hiddenCalendarIds,
      toggleCalendar,
      suggestionCount,
    }),
    [collapsed, setCollapsed, toggleCollapsed, drawerOpen, hiddenCalendarIds, toggleCalendar, suggestionCount],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
