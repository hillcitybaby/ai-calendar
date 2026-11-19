# Kit changes needed

Things the code needed that the design system kit doesn't have yet, or where the approved Pass 5 screens differ from the kit. The code follows the Pass 5 frame for these until the kit is updated; then the code is brought in line with the kit.

| Milestone | Component | Change needed | Why |
| --- | --- | --- | --- |
| 1 | Sidebar Calendar (AC) | Delete, or document where it's used | Sidebar (AC) now uses Calendar Legend Item (AC); nothing uses this one. |
| 1 | Local Event Card (AC) | Delete | Replaced by Suggestion Card (AC) per the handoff doc. (Suggestion (AC) is the AI Elements prompt chip and is used by the Assistant; keep it.) |
| 2 | Event Block (AC), State=Suggested | Confirm the style | The kit draws suggested events with a gray (muted-foreground) dashed outline, a subtle fill and a 16px Assistant Mark. The handoff doc says "dashed outline in the calendar's color", and the Pass 5 Today/Week frames use the Preview style for suggestions. The code follows the kit. |
| 2 | Event Block (AC) | Add a compact size for short events | Events under 30 minutes need a 20px minimum height and tighter padding (title only); the kit only shows 72px blocks. |
| 2 | Event Chip (AC) | Add a Suggested state | Suggested all-day/month events need a dashed variant; the code uses a dashed muted outline on the subtle fill, matching Event Block Suggested. |
| 2 | Suggested event popover | New component | Clicking a suggested event offers "Add to calendar" / "Not interested". Built with Popover; no kit design. |
| 2 | Plan (AC) / Plan Step (AC) | Add a review state | "Review one by one" needs per-step Apply / Skip buttons and applied/skipped step states (code dims settled steps and appends "· applied" / "· skipped"). |
| 2 | Assistant Mark (AC) | Add a 16px size | Plan (AC) headers and suggested Event Blocks use a 16px mark; the kit has L 120 / M 40 / S 20 only. The top bar uses 32px. |
| 2 | Work Task (AC) time pill | Confirm the time format | The kit example "10:00" doesn't show whether times are 12- or 24-hour. The code uses 24-hour ("14:00") so it can't be confused with the duration pill ("2:00"). |
| 2 | Task Card (AC) | Clarify or delete | The handoff doc says Task Card is the drag preview, but Work Task (AC) has its own Dragging state, which the code uses. |
| 2 | Now Line (AC) | Name the color token | The kit draws it red without a token; the code uses `destructive`. |
| 2 | Day capacity row | New component | Today's "Today's plan · 6h 45m of 8h planned" heading with Progress (AC) isn't a kit component. |
| 2 | Add Task (AC), State=Typing | Add placeholder text | The empty input needs placeholder copy; the code uses "Task name, 45m, #channel, tomorrow". |
| 3 | Month grid | New component | Month view's 7-column grid (weekday header, day cells with a date that's a filled circle on today, Event Chips, "+N more", muted days outside the month) isn't in the kit. Calendar (AC) is the date-picker style. Built from the Pass 5 Month frame. |
| 3 | "+N more" popover | New component | Lists all of a day's events with times. Built with Popover; no kit design. |
| 3 | To-do list heading | New component | "To schedule 4" / "This month 7" heading (14px semibold + 12px muted count) isn't a kit component; Task Column Header (AC) is a different, per-day design. |
| 3 | Suggestion Card (AC) photos | Add real photos or confirm the placeholder | Downloading stock photos was blocked in this build environment, so cards use the kit's blue gradient placeholder. The card shows a photo whenever a suggestion has one. |
| 4 | Suggestions section header | New component | "This weekend" / "Coming up" heading with a 16px map-pin isn't a kit component. |
| 4 | Suggestions empty state | Confirm copy | Uses Empty (AC) with a lightbulb: "No new suggestions" + "Edit interests". No Pass 5 frame shows it. |
| 4 | Toast (AC) copy | Confirm copy | Dismissing a suggestion shows "Hidden "<title>"" with "We'll suggest fewer things like this." and Undo; adding shows "Added "<title>" to your calendar". |
| 5 | Settings card + rows | New components | The bordered card with a header and divided rows (text field row, switch row, Toggle Group row, button row) is used across Settings and Connectors but isn't in the kit. |
| 5 | Settings sub-nav item | New component | 36px nav rows with an accent fill on the active section. |
| 5 | Connector row | New component | Icon tile, name + detail, emerald connected check, Manage button. |
| 5 | Interest tags | New components | Removable secondary pill (label + x) and the outline "suggested" pill (+ label). |
| 5 | Add connector menu | Add the second level | The Pass 5 menu shows Calendar / Integration; picking a provider (Google, Outlook, iCloud / ClickUp, Notion, Todoist…) needs a submenu, built with the stock dropdown submenu. |
| 5 | Settings › Account | Design the section | Not in Pass 5. The code has one row, "Reset example data". |
| 5 | Settings › Theme | Note | Dark and System save the choice but the app stays light until a dark theme is designed. The description says so. |
| 5 | Sidebar on Settings / Connectors | Confirm | Those Pass 5 frames hide the Calendars group; the code keeps it on every page, as the kit's Sidebar (AC) does. |
| 6 | Sheet (AC) for the Assistant | Confirm behavior | Built as a non-modal 440px panel docked on the right (no dimmed overlay, the calendar stays usable), matching the Pass 5 Assistant frame. Esc or the close button closes it; ⌘J toggles it. |
| 6 | Prompt Input (AC), Listening | Not wired | The kit has a Listening state; voice input and attachments show a "not available yet" toast in the prototype. |
| 6 | Confirmation (AC) | Unused | Nothing in the Pass 5 Assistant frame uses it; replies with changes use Plan (AC). |
| 6 | Plan (AC) inside chat | Note | Applied plans show "Applied to your calendar" as the subtitle and dim their steps; review mode reuses the milestone 2 per-step Apply / Skip. |
| 6 | Assistant greeting | Confirm copy | The panel opens with "Good morning/afternoon/evening, <name>. What should we plan?" No Pass 5 frame shows an empty conversation. |
| 7a | Sidebar on tablet | New state / confirm | Tablet always shows Sidebar Collapsed (AC). Its toggle opens the expanded Sidebar (AC) as an overlay drawer over a light scrim (click outside, Esc or navigating closes it). The kit has no overlay variant or scrim. |
| 7a | Work Task (AC) in two columns | Confirm | On tablet Week and Month, the list sits below the calendar in two columns; cards in a row stretch to the taller card's height, so a short card gains empty space. The kit only shows the single-column 304px card. |
| 7a | Suggestion Card (AC) width | Confirm | Tablet Suggestions uses two cards per row filling the content width (about 352px each at 834px), not the fixed desktop card width. |
| 7a | Settings rows on tablet | Confirm | With the 176px sub-nav, the Toggle Group rows still fit beside their label at 834px; long descriptions wrap. |
| 7b | Tab Bar (AC) home indicator | Note | The kit draws the home indicator inside the bar. On the web the device draws its own, so the code pads for the safe area instead and leaves it out. The same goes for Status Bar (AC). |
| 7b | Assistant Mark (AC), 36px | Add the size | Tab Bar (AC) uses a 36px mark, which isn't one of the kit sizes (L 120, M 40, S 20). The code adds a 36 preset. |
| 7b | Mobile Week strip | New component | Weekday letter, 36px date (filled when selected, bold for today) and up to three 4px dots in calendar colors. Swiping it changes the week. |
| 7b | Mobile Month grid + agenda row | New components | The compact date grid with dots, and the agenda row (time, 3px calendar bar dashed for suggested, title, time range). Long titles wrap; suggested rows end with "· suggested". |
| 7b | "To schedule" bottom sheet | New component | Peeks above the tab bar (handle, title, count, planned time, suggestion count); tap or drag it up to about 80% height. Inside: Add Task, Work Tasks and compact Suggestion Cards in one column. |
| 7b | Calendar tab › Day | Design the screen | Pass 6 has no mobile Day frame. The code shows the day's Time Grid with its Day Header at /day, so the Today tab stays the plan. |
| 7b | Moving between weeks, months and days on mobile | Design a control | The frames have no prev/next. The code uses swipes (strip, month grid, day timeline); there's no visible control or "Today" button yet. |
| 7b | Mobile Month "This month" tasks | Confirm | The Month frame shows only the grid and agenda, so month to-dos aren't reachable on mobile. They could reuse the bottom sheet. |
| 7b | Mobile Today | Note | Per the frame: capacity row titled with the date ("Thu, Nov 19"), plan and to-dos, no time grid and no day navigation. |
