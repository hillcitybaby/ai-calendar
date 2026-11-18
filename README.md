# AI-calendar

An AI-powered calendar.

## Status

Design is done in Figma. Start with [`docs/design-handoff.md`](docs/design-handoff.md): the screens, the components, the tokens and the decisions behind them. The approved motion prototype for the AI mark is in [`design/assistant-mark-prototype.html`](design/assistant-mark-prototype.html).

Built so far (milestones 1–6, on example data): Today, Week, Month, Suggestions, Connectors & interests, Settings, and the Assistant panel. Everything runs on generic example data saved in your browser; Settings › Account resets it. Real calendars, tasks, weather and an AI model come next. See [`docs/build-plan.md`](docs/build-plan.md) and [`docs/kit-changes.md`](docs/kit-changes.md).

## Develop

Requires Node 20+ and pnpm.

```sh
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint
pnpm test     # unit tests (Vitest)
pnpm build
```

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (new-york, neutral) · Geist · lucide-react.

## Where things live

| Path | What |
| --- | --- |
| `src/app/globals.css` | Design tokens: colors, calendar colors, radius, shadows, type |
| `src/app/(app)/` | Routes inside the app shell; `(calendar)/` adds the calendar top bar |
| `src/components/shell/` | Sidebar (AC), Sidebar Collapsed (AC), top bars |
| `src/components/assistant/` | Assistant Mark (AC) (`swarm.ts` is the particle engine ported from the prototype) and the Assistant panel |
| `src/components/screens/` | One component per screen |
| `src/components/{tasks,scheduler,suggestions,ai,settings}/` | Kit components by area |
| `src/components/ui/` | Stock shadcn/ui components |
| `src/lib/` | Example data, the store (`reducer.ts` + `store.tsx`), scheduling helpers, scripted assistant replies |

Keyboard: <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>\\</kbd> collapses or expands the sidebar; <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>J</kbd> opens the assistant.
