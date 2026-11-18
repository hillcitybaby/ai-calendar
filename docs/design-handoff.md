# Design handoff

Read this before building. The design is finished in Figma. This doc is the bridge from Figma to code: what exists, where it lives, the tokens, and the decisions behind it.

> This repo is public. Don't commit the owner's calendar details, family members' names, their home location, screenshots of other products, or Figma file links. Use generic example data: "Take the kids to the museum", "Date night", "Parents' group playdate". Company and product names (Google Calendar, ClickUp, Notion…) are fine.

## 1. What we're building

An AI calendar for a busy parent who also works. Three things live together:

1. **Work to-dos, planned Sunsama-style.** A daily list with quick "Add task" at the top. Tasks have a duration, optional subtasks, a #channel, and a check-off. You drag a task onto the calendar to time-box it.
2. **Personal life as calendar events.** Personal items stay regular events on the calendar. They aren't checkable tasks.
3. **AI suggestions.** Activities and local events (library story time, farmers market, a parents' group, date night…). The AI finds them from the user's *interests*, weather, budget and free time. Each suggestion can be added at a suggested time with one action, or dismissed ("Not interested").

## 2. Where the design lives

There are two Figma files. The owner will share the links; they're kept out of this repo.

| File | What's in it |
|---|---|
| **Design system kit** (the owner's shadcn/ui kit) | Source of truth for tokens and components. The app's own components end in **"(AC)"**. |
| **AI-Calendar** | Screens and iteration history on the page *Exploration and iteration*. Frames Pass 1 → Pass 5. **Pass 5 is the latest and approved.** |

### Pass 5 screens (AI-Calendar file, node IDs)

| Screen | Node |
|---|---|
| Week | `79:6127` |
| Month | `79:6658` |
| Today | `79:7101` |
| Suggestions | `79:7495` |
| Assistant | `79:7829` |
| Connectors & interests | `79:8471` |
| Settings | `86:8056` |
| Week, sidebar collapsed | `90:8000` |

All screens are 1440 wide, desktop only for now.

### Kit components to build (node IDs in the kit file)

| Kit page | Components |
|---|---|
| Navigation (AC) | `Sidebar (AC)` 4016:45 (expanded); `Sidebar Collapsed (AC)` 4107:62 (icon rail); `Sidebar Item (AC)` 4016:39; `Sidebar Calendar (AC)` 4050:84; `Toggle Group (AC)` 4016:126 (Day / Week / Month) |
| Tasks (AC) | `Work Task (AC)` 4047:190; `Add Task (AC)` 4047:230; `Subtask (AC)` 4047:51; `Check Circle (AC)` 4047:34; `Task Column Header (AC)` 4047:236 |
| Scheduler (AC) | `Time Grid (AC)` 4021:277; `Event Block (AC)` 4020:96; `Event Chip (AC)` 4020:127; `Now Line (AC)` 4020:218; `Day Header (AC)` 4020:212; `Task Card (AC)` 4020:189 (drag preview only; lists use Work Task) |
| AI Elements (AC) | `Suggestion Card (AC)` 4074:481; `Cost Tier (AC)` 4074:453; `Plan (AC)` 4018:219 + `Plan Step (AC)` 4018:218; `Message (AC)`; `Prompt Input (AC)`; `Thinking (AC)`; `Confirmation (AC)` (Assistant chat only) |
| Assistant (AC) | `Assistant Mark (AC)` 4053:4909: 12 states × sizes L 120 / M 40 / S 20 |
| Calendar & Date Picker (AC), Feedback (AC), Overlays (AC) | `Calendar (AC)`, `Date Picker (AC)`, `Empty (AC)`, `Progress (AC)`, `Skeleton (AC)`, `Popover (AC)`, `Sheet (AC)`, `Drawer (AC)`, `Toast (AC)` |

Everything else is stock shadcn/ui: Button, Icon Button, Badge, Input, Switch, Avatar, and so on. Icons are **lucide**.

## 3. Decisions (don't undo these without asking)

**AI signal**
- The *only* AI signal is the **Assistant Mark**, a dark ("ink") particle array that moves like a murmuration and fills simple shapes per state. **No sparkle icons anywhere.** There's no "Ask AI" button either: the resting particle array (Idle state) *is* the entry point in the top bar.
- The approved motion prototype is [`design/assistant-mark-prototype.html`](../design/assistant-mark-prototype.html). Open it in a browser. Match its physics and states. Honor `prefers-reduced-motion` with still shapes.
- States and shapes:

  | State | Shape |
  |---|---|
  | Idle | circle |
  | Summoned | small circle |
  | Listening | pill |
  | Thinking | donut |
  | Responding | three lines |
  | Waiting on you | rounded square |
  | Done | small low circle |
  | Error | soft triangle |
  | Offline | thin line |
  | Searching | three circles |
  | Suggesting | circle → dot |
  | Scheduling | rectangle |

**Suggestions**
- **AI suggestions and local events are the same card**: `Suggestion Card (AC)`.
  - `Type` = Activity | Local event.
  - `State` = Default | Hover.
  - `Size` = Default (Suggestions page, ~340–362 wide) | Compact (to-do lists).
- **Icon tab order is fixed:**
  1. a type icon (what it is: group meetup, library, farmers market, park, museum, date night…)
  2. the weather icon for that time
  3. the cost tier: Free (slashed $) / $ / $$$
- **Hover = photo overlay.** The photo dims and shows one action, "Add to Saturday, 10 AM". Compact cards show a + over the thumbnail instead. An **X** in the corner means "Not interested".
- No organizer badge on cards. The organizer goes in the subtitle.
- **Suggested events on the calendar use a dashed outline** in the calendar's color until accepted.

**Tasks and lists**
- **Every to-do uses one card, `Work Task (AC)`**, on Today, Week and Month. It doesn't show where a to-do came from (no source label or icon). A set time shows as a pill in the footer, matching the duration pill.
- **Add Task sits at the top of every to-do list** (day, week, month). It's not in the sidebar.

**Navigation and pages**
- **Sidebar:**
  - "Plan": Today, Week, Suggestions (with a count)
  - "Calendars": colored checkboxes
- There's no Inbox and no Lists section. The sidebar collapses to an icon rail.
- **Connectors & interests page:**
  - One **Connectors** list: Google Calendar accounts, Google Keep, Google Tasks, ClickUp.
  - **Add connector** opens a menu: *Calendar* (Google, Outlook, iCloud) or *Integration* (ClickUp, Notion, Todoist…).
  - **Your interests** are removable tags, an "add interest" field, and "Suggested for you" tags. The AI uses them to search the web for events.
- **Settings page:** a sub-nav (General, Planning, Suggestions, Notifications, Connectors & interests, Account). Sections:
  - General: name, time zone, week start, theme
  - Planning: working hours, morning plan, default task length, protect family time
  - Suggestions: how many, budget, kid-friendly first, weather, home area, interests
  - Notifications

## 4. Tokens

The kit is shadcn/ui ("New York"-style neutral) with **Geist** / **Geist Mono**. Only a light theme is defined so far; dark mode isn't designed yet.

### Colors (light)

| Token | Value |
|---|---|
| background | `#ffffff` |
| foreground | `#000000` |
| card / popover | `#ffffff` |
| card-foreground / popover-foreground | `#0a0a0a` |
| primary | `#171717` |
| primary-foreground | `#ffffff` |
| secondary / accent / muted | `#f5f5f5` |
| secondary-foreground | `#171717` |
| accent-foreground | `#000000` |
| muted-foreground | `#737373` |
| destructive | `#dc2626` |
| border / input | `#e5e5e5` |
| ring | `#d4d4d4` |
| sidebar | `#fafafa` |
| sidebar-foreground | `#404040` |
| sidebar-accent | `#f5f5f5` |
| sidebar-accent-foreground | `#171717` |
| sidebar-primary | `#404040` |
| sidebar-border | `#e5e5e5` |
| sidebar-ring | `#d4d4d4` |

### Calendar colors

Each calendar color has 4 roles: `subtle` (wash), `bg` (event fill), `accent` (left bar, dot, checkbox), and `text`.

| Color | subtle | bg | accent | text |
|---|---|---|---|---|
| blue | `#eff6ff` | `#dbeafe` | `#3b82f6` | `#1e40af` |
| violet | `#f5f3ff` | `#ede9fe` | `#8b5cf6` | `#5b21b6` |
| pink | `#fdf2f8` | `#fce7f3` | `#ec4899` | `#9d174d` |
| orange | `#fff7ed` | `#ffedd5` | `#f97316` | `#9a3412` |
| amber | `#fffbeb` | `#fef3c7` | `#f59e0b` | `#92400e` |
| emerald | `#ecfdf5` | `#d1fae5` | `#10b981` | `#065f46` |
| teal | `#f0fdfa` | `#ccfbf1` | `#14b8a6` | `#115e59` |
| slate | `#f8fafc` | `#f1f5f9` | `#64748b` | `#1e293b` |

Default calendar mapping in the designs:

| Calendar | Color |
|---|---|
| Work | blue |
| Personal | violet |
| Keep to-dos | amber |
| Date nights | pink |
| Local events | teal |

"Connected" status uses the emerald accent.

### Spacing, radius, shadows

| Token | Values |
|---|---|
| Spacing | `3xs 2` · `2xs 4` · `xs 8` · `sm 12` · `md 16` · `lg 20` · `xl 24` (px). Screens use 24–40 px section padding. |
| Radius | `sm 6` · `md 8` · `lg 10` (base `--radius`) · `xl 14` · `2xl 16` · `full 999` |
| Shadow sm | `0 1px 3px #0000001a, 0 1px 2px -1px #0000001a` (cards) |
| Shadow md | `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a` (hovered cards) |
| Shadow lg | `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` (menus, popovers) |

### Type (Geist)

| Style | Weight | Size / line height | Letter spacing |
|---|---|---|---|
| heading 1 | Medium | 40/40 | −1.5 |
| heading 2 | Medium | 26/26 | −1 |
| heading 3 | Medium | 22/26.4 | −0.5 |
| heading 4 | Medium | 18/21.6 | — |
| paragraph large | Regular / Medium / SemiBold | 18/27 | — |
| paragraph | Regular / Medium / SemiBold | 16/24 | — |
| paragraph small | Regular / Medium / SemiBold | 14/20 | — |
| paragraph mini | Regular / Medium / SemiBold | 12/16 | — |
| mono | Geist Mono | 16/24, 14/20, 12/16 | — |

## 5. Suggested stack and first milestones

These are proposals; confirm with the owner.

- **Stack:**
  - Next.js (App Router) + TypeScript
  - Tailwind CSS with the tokens above as CSS variables
  - shadcn/ui
  - `geist` font package
  - `lucide-react`
  - a small canvas component for the Assistant Mark
- **Milestones:**
  1. **Scaffold and tokens:** Tailwind theme, Geist fonts, and the app shell (expanded and collapsed sidebar, top bar with Day/Week/Month toggle and the resting Assistant Mark).
  2. **Today** with mock data:
     - the AI plan card
     - the to-do list (Add Task, Work Tasks with subtasks and check-off)
     - the day time grid with event blocks, a now line, and a dashed suggested event
  3. **Week and Month** using the same to-do list and compact Suggestion Cards.
  4. **Suggestions page:**
     - filter (All / Activities / Local events)
     - full-size Suggestion Cards with the hover overlay and dismiss
  5. **Connectors & interests** and **Settings**.
  6. **Assistant Mark** component, ported from the prototype (states, sizes, reduced motion).
  7. Then real data: Google Calendar, Google Tasks, ClickUp, weather, and event discovery.

   Note that **Google Keep's official API is limited to Google Workspace enterprise accounts.** Verify how to read Keep before relying on it.

### Sketch of the core data

```ts
type Task = { id; title; durationMin; scheduledAt?; subtasks: {title; done}[]; channel?; done };
type CalendarEvent = { id; calendarId; title; start; end; allDay?; suggested?: boolean }; // suggested → dashed
type Suggestion = {
  id; kind: 'activity' | 'localEvent'; title; subtitle; placeType; travelMin;
  when: { label; time }; typeIcon; weather; cost: 'free' | 'cost' | 'expensive';
  photoUrl?; fromAI: boolean;
};
type Interest = { id; label; suggested?: boolean };
type Connector = { id; kind: 'calendar' | 'integration'; provider; account?; status };
```
