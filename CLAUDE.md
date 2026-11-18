# Working on AI Calendar

Read `docs/design-handoff.md` first. It covers the screens, kit components, tokens and design decisions.

## Ground rules

- **The design system kit is the source of truth.** Code must always match the kit: component structure, sizes, spacing, icons, colors, type and states. Where an approved screen and the kit disagree, follow the kit. If something the code needs doesn't exist in the kit, or the code has to differ from it, say so; the kit gets updated to match.
- **Don't re-litigate the design decisions in the handoff doc.** No sparkles; the Assistant Mark (particle array) is the only AI signal and there is no "Ask AI" button; one Suggestion Card for AI suggestions and local events; one to-do card (Work Task) everywhere; dashed outlines for suggested events. Ask if something seems wrong.
- **The repo is public.** Use generic example data. No real names, home location, calendar details, Figma links or screenshots of other products. Company and product names are fine.
- **Commit and push only when asked.** Work on a branch, not `main`.
- Weeks start on Sunday.

## Code conventions

- Tokens live in `src/app/globals.css`. Use them through Tailwind utilities, never raw hex values in components.
- In Tailwind v4, a color from a CSS variable on `border-*` needs the type hint: `border-(color:--cal-accent)`. Without it, the value is read as a border width.
- Server components must not import constants from `"use client"` modules; put shared constants in a plain module.
