# AI-calendar

An AI-powered calendar.

## Status

Design is done in Figma. Start with [`docs/design-handoff.md`](docs/design-handoff.md): the screens, the components, the tokens and the decisions behind them. The approved motion prototype for the AI mark is in [`design/assistant-mark-prototype.html`](design/assistant-mark-prototype.html).

Built so far: milestone 1, the scaffold, design tokens and app shell (expanded and collapsed sidebar, top bar with the Day/Week/Month toggle and the resting Assistant Mark).

## Develop

Requires Node 20+ and pnpm.

```sh
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint
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
| `src/components/assistant/` | Assistant Mark (AC): `swarm.ts` is the particle engine ported from the prototype |
| `src/components/ui/` | Stock shadcn/ui components |
| `src/lib/` | Calendar colors, view/date helpers |

Keyboard: <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>\\</kbd> collapses or expands the sidebar.
