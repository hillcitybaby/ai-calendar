"use client";

import * as React from "react";

import { buildSeed } from "./mock-data";
import { reducer, type Action, type State } from "./reducer";

export { newId, reducer, type Action, type State } from "./reducer";

const STORAGE_KEY = "ai-calendar:v1";

type StoreValue = { state: State; dispatch: React.Dispatch<Action>; ready: boolean };
const StoreContext = React.createContext<StoreValue | null>(null);

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

function load(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    // Storage blocked or corrupt: start fresh.
  }
  return buildSeed(new Date());
}

/**
 * Mock data store. Data is created and loaded on the client (it depends on today's date and
 * the browser's saved state), so screens render their content once `ready` is true.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, null, () => buildSeed(new Date()));
  const [ready, setReady] = React.useState(false);
  const loadedRef = React.useRef(false);

  React.useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    dispatch({ type: "hydrate", state: load() });
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: keep working in memory.
    }
  }, [state, ready]);

  const value = React.useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
