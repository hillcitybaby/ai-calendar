# Build plan: all screens

Source of truth: the design system kit (see `CLAUDE.md`). Approved screens: Pass 5 in the AI-Calendar file. Everything runs on mock data until milestone 7.

## How every milestone runs

1. Read the Pass 5 frame and each kit component it uses (specs, variants, tokens).
2. Diff against the kit. Code matches the kit wherever the kit has the component. Anything the screen needs that the kit lacks, or where the Pass 5 frame differs from the kit, is built from the Pass 5 frame and logged in `docs/kit-changes.md` for the kit owner. The kit is not edited during this build.
3. Build components in `src/components/<area>/`, screens in `src/app/(app)/…`.
4. Verify: typecheck, lint, build, unit tests, and a Playwright pass at 1440×900 compared side by side with the Pass 5 frame.
5. Commit and push to `claude/screens` (no pull request, nothing merged to `main`).

## Shared foundations (start of milestone 2)

- **Mock data store**: one client store (React context + reducer) seeded with generic example data: tasks, events, suggestions, interests, connectors, settings. Changes persist to `localStorage` so the prototype feels real; a "reset" lives in Settings › Account.
- **Data types** from the handoff doc: `Task`, `CalendarEvent` (`suggested` → dashed), `Suggestion`, `Interest`, `Connector`.
- **Calendar visibility**: the sidebar toggles filter events everywhere.
- **Drag and drop**: `@dnd-kit` for dragging a task onto the grid to time-box it (Task Card (AC) is the drag preview).
- **Tests**: Vitest for date/layout logic (event overlap columns, month grid, durations); Playwright smoke tests per screen.

## Milestones

### 2. Today (`/today`)
- Capacity row: "Today's plan" + "6h 15m of 8h planned" + Progress (AC) (Tone=Over when overcommitted).
- Plan (AC) card with Plan Step (AC) rows (Add / Move / Remove), Apply all and Review one by one. Header uses the S Assistant Mark.
- To-do list: Add Task (AC) at the top (typing parses duration, #channel), Work Task (AC) with subtasks, Check Circle (AC) check-off, time pill, channel.
- Day time grid: Time Grid (AC) 7 AM–9 PM, Day Header (AC) with weather, all-day row with Event Chip (AC), Event Block (AC) (with overlap layout), Now Line (AC), and a dashed suggested Event Block.
- Drag a task onto the grid to schedule it.

### 3. Week and Month (`/week`, `/month`)
- Week: "To schedule" list (same Add Task + Work Task cards), compact Suggestion Cards under it, 7-day Time Grid with overlapping events, suggested events dashed, now line on today.
- Month: "This month" list (same cards), 6-week grid with Event Chips, "+N more" overflow (opens a Popover with the day's events), trailing days muted.
- Prev/next/Today and the view toggle already work.

### 4. Suggestions (`/suggestions`)
- Top bar with Preferences button (opens Settings › Suggestions).
- Filter Toggle Group: All / Activities / Local events.
- Groups ("This weekend", "Coming up") with a map-pin heading.
- Full-size Suggestion Card (AC): photo, icon tab (type, weather, Cost Tier), title, subtitle (organizer), place type + travel minutes, day + time. Hover dims the photo and shows "Add to Saturday, 10 AM". X = Not interested (with a Toast and Undo).
- Accepting adds a dashed suggested event to the calendar; the sidebar count updates.

### 5. Connectors & interests (`/settings/connectors`) and Settings (`/settings`)
- Connectors list (Google Calendar ×2, Google Keep, Google Tasks, ClickUp) with connected status (emerald) and Manage. Add connector menu: Calendar (Google, Outlook, iCloud) or Integration (ClickUp, Notion, Todoist…). All mocked.
- Your interests: removable tags, add field, "Suggested for you" tags; Use the weather switch; Home area field.
- Settings: sub-nav (General, Planning, Suggestions, Notifications, Connectors & interests, Account) that scrolls to sections and tracks the active one. All fields work against the store: name, time zone, week start (drives Week/Month), theme, working hours, morning plan, default task length, protect family time, suggestion count, budget, kid-friendly first, weather, home area, interests link, notification toggles, reminders.

### 6. Assistant
- The design shows the Assistant as a **right-side panel** over the current page (not a separate page). The top-bar mark opens it; ⌘J too. The `/assistant` route is gone.
- Panel: header + close, Message (AC) bubbles, Plan (AC) inside replies, suggestion chips, Prompt Input (AC) (attach, mic, send), Thinking (AC), Confirmation (AC).
- Assistant Mark (AC) finished: all 12 states wired to what the assistant is doing (summoned on open, thinking, responding, waiting on you, scheduling on apply, done), sizes L/M/S, reduced motion.
- Replies are scripted mock responses (no AI model yet); applying a plan really changes the calendar.

### 7. Real data (not started without you)
Google Calendar, Google Tasks, ClickUp, weather, event discovery, a real model for the Assistant. Needs accounts, API keys and an auth decision, so I stop before this and write up options. Google Keep's API is Workspace-only; I'll research alternatives.

## Defaults I'll follow without asking

- Desktop only (≥1280 wide), as designed. Light theme only until dark is designed.
- Weeks start Sunday; the Settings value overrides it.
- The sidebar keeps its Calendars group on every page (the kit's Sidebar has it; Settings and Connectors frames omit it).
- Example data stays generic: no names or places from the Figma frames.
- Theme control in Settings saves the choice; the app stays light until dark mode is designed.
- Suggestion photos: Unsplash-licensed photos saved in `public/photos/` with credits in `public/photos/CREDITS.md`; neutral placeholders if downloads are blocked.
- New dependencies limited to: `@dnd-kit/*`, `vitest`, `@playwright/test`, and shadcn/ui components as needed.
