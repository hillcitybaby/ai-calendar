# Milestone 7: real data, options to decide

Everything so far runs on example data in the browser. Connecting real data needs accounts, API keys and a few decisions. Nothing here has been built or tried yet; vendor details are to verify when we start.

## Decisions needed first

1. **Where the app runs and stores data.** Today there's no server-side storage. Real accounts need a database for users, connector tokens and preferences (for example Postgres on Vercel or Supabase). Choose a host and database.
2. **Sign-in.** Google sign-in fits best, since Google Calendar and Google Tasks need Google OAuth anyway. Auth.js (NextAuth) is the common choice for Next.js.
3. **Who it's for at first.** Just you (simplest: one Google account, unverified OAuth app in testing mode) or other people too (Google requires app verification for calendar scopes, which takes time).

## Connectors

| Source | Approach | Notes |
| --- | --- | --- |
| Google Calendar | Google Calendar API with OAuth; read events, write accepted suggestions and time-boxed tasks | Needs a Google Cloud project and OAuth consent screen. Sync with incremental sync tokens or push notifications later. |
| Google Tasks | Google Tasks API with the same OAuth sign-in | Tasks have titles, notes and due dates but no duration or channel; those would live in our database. |
| Google Keep | Official API is limited to Google Workspace enterprise accounts | Options: skip Keep, ask people to move to-dos to Google Tasks, or import a Google Takeout export once. Needs your call. |
| ClickUp | ClickUp API with OAuth or a personal token | Map lists or tags to #channels. |
| Outlook / iCloud | Microsoft Graph; CalDAV for iCloud | Later; the Add connector menu already lists them. |

## Weather

Free forecast APIs without keys exist (for example Open-Meteo, or the US National Weather Service). Needs the home area turned into coordinates (a geocoding call or a one-time location prompt).

## Event discovery (Suggestions)

No single source covers library story times, farmers markets and parents' groups. Options:

- **Event APIs** (ticketing and event-listing services): structured, but skew to ticketed events.
- **Web search + an AI model** to read local library, parks and city calendars and extract events matching your interests. Broadest coverage; needs a search API key and careful source attribution.
- **A curated list of local feeds** (iCal/RSS from the library, parks department, schools). Most reliable for a single town; manual to set up.

A mix is likely: curated feeds for the places you use most, search for everything else.

## The Assistant

Replace the scripted replies (`src/lib/assistant-script.ts`) with a model call (for example the Claude API) on the server. Give the model tools that map onto the existing store actions (schedule a task, create an event, move an event, search suggestions) so replies keep returning a Plan (AC) you approve before anything changes.

## Suggested order

1. Host + database + Google sign-in.
2. Google Calendar read-only, then write.
3. Google Tasks, then ClickUp.
4. Weather.
5. The Assistant on a real model.
6. Event discovery.
