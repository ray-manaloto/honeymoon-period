# Date Ideas context

## Current phase

Run a time-boxed bake-off of existing apps, tools, and composable services before deciding whether to build a native iOS app. The Reminders + Beli Shortcut is the baseline prototype and must remain usable while alternatives are evaluated.

## Actors

- **Owner** — develops and administers the project.
- **Partner** — installs at most one app, accepts an invitation, and can add, edit, vote, and plan without developer setup.

## Core workflow

1. Either person shares a restaurant or event link from iMessage or a source app.
2. The system captures the original source and enriches it without blocking save.
3. Each person can add notes, metadata, and an independent vote or score.
4. The system ranks candidates using interest plus time, availability, and other configured signals.
5. The couple chooses an occurrence and optionally creates a calendar event.
6. Completed ideas retain history without crowding active candidates.

## Canonical terms

- **Date Idea** — one restaurant, event, or activity candidate, independent of which URL discovered it.
- **Capture** — one Share Sheet ingestion attempt and its provenance.
- **Source URL** — the exact shared link before normalization.
- **Normalized URL** — a tracking-cleaned URL used for exact-link duplicate checks.
- **Venue duplicate** — different URLs or captures that refer to the same real place or event.
- **Vote** — a person's categorical decision, such as interested, maybe, or decline.
- **Score** — a person's configurable numeric preference used for ranking.
- **Special** — a time-constrained offer, menu, event, deadline, or reservation opportunity.
- **Availability** — free time inferred or selected without exposing unrelated private calendar details.
- **Plan** — a Date Idea assigned to a specific occurrence and optionally a calendar event.
- **Baseline prototype** — the current shared Reminders, Beli handoff, and Save Date Idea Shortcut.

## Invariants and boundaries

- Capture must stay quick even when metadata enrichment fails.
- Preserve the original link and provenance.
- Explain ranking signals; do not hide urgency or scoring behind unexplained AI output.
- Private votes, calendars, locations, notes, and relationship data must not enter the public repository or logs.
- No paid service, physical-device workflow, or external publication without explicit approval.
- Later requirements for independent voting/scoring supersede the prototype's older shared-outcome assumption; exact semantics remain a spec question.
