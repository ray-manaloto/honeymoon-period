# honeymoon-period context

## Actors

- **Owner** — develops and administers the project.
- **Partner** — installs at most one app, accepts an invitation, and can add, edit, vote, and plan without developer setup.
- **Participant** — one person in the shared honeymoon-period workspace who owns their own votes and scores.

## Core workflow

1. Either person shares a restaurant or event link from iMessage or a source app.
2. The system captures the original source and enriches it without blocking save.
3. Each person can add notes, metadata, and an independent vote or score.
4. The system ranks candidates using interest plus time, availability, and other configured signals.
5. The couple chooses an occurrence and optionally creates a calendar event.
6. Completed ideas retain history without crowding active candidates.

## Canonical terms

- **honeymoon-period** — one restaurant, event, or activity candidate, independent of which URL discovered it.
- **Capture** — one Share Sheet ingestion attempt and its provenance.
- **Source URL** — the exact shared link before normalization.
- **Normalized URL** — a tracking-cleaned URL used for exact-link duplicate checks.
- **Venue duplicate** — different URLs or captures that refer to the same real place or event.
- **Vote** — a person's categorical decision, such as interested, maybe, or decline.
- **Score** — a person's configurable numeric preference used for ranking.
- **Preference** — one participant's vote and optional score for one honeymoon-period.
- **Special** — a time-constrained offer, menu, event, deadline, or reservation opportunity.
- **Availability** — free time inferred or selected without exposing unrelated private calendar details.
- **Plan** — a honeymoon-period assigned to a specific occurrence and optionally a calendar event.
- **Protected baseline** — the current shared Reminders, Beli handoff, and Save honeymoon-period Shortcut retained only until replacement acceptance.
- **Lab identity suite** — two long-lived, non-production identity stacks, one independently owned by each human participant, with provider-specific accounts, empty synthetic calendars, and isolated authenticated test environments.
- **Human-only ceremony** — an identity or security step that an agent must hand back to the account owner, including passwords, recovery, CAPTCHA, two-factor authentication, biometrics, terms acceptance, and system or OAuth consent.

## Invariants and boundaries

- Capture must stay quick even when metadata enrichment fails.
- Preserve the original link and provenance.
- Explain ranking signals; do not hide urgency or scoring behind unexplained AI output.
- Private votes, calendars, locations, notes, and relationship data must not enter the public repository or logs.
- External-product tests use the approved lab identity suite and synthetic fixtures; agents never receive account-root credentials or impersonate a second participant.
- No paid service, physical-device workflow, or external publication without explicit approval; the bounded lab-device approval is recorded in `docs/conventions/lab-identities.md`.
- Independent participant-owned preferences supersede the prototype's older shared-outcome assumption; reversible MVP semantics are recorded outside this glossary.
