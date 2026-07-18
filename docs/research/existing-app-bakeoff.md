# Existing-app bake-off

- Status: source research retained; hands-on trial deferred by the accepted web MVP decision
- Last verified: 2026-07-15
- Governing decision: [ADR-0001](../adr/0001-existing-product-first.md)
- Superseding implementation decision: [ADR-0002](../adr/0002-api-first-web-mvp.md)

## Question

Can one existing product—or a small, low-cost composition—deliver quick iOS Share Sheet capture, two-person collaboration and scoring, structured metadata, urgency-aware sorting, and calendar planning with one partner install plus invitation?

## Candidate set

| Candidate | Why it remains in the bake-off | Evidence status |
| --- | --- | --- |
| [Beli](https://beliapp.com/) | Current restaurant discovery/history handoff | Source-screened baseline companion; not a standalone replacement |
| [Tavola](https://tavolaapp.com/) | Strongest explicit restaurant Share Sheet candidate | Advance to free fixture-only trial |
| Soonish | Strongest account-free independent-voting layer | Advance to free fixture-only trial or composition check |
| [Mapstr](https://en.mapstr.com/) | Place database, tagging, collaboration, and export | Advance to free fixture-only trial or composition check |
| [Howbout](https://howbout.app/about) | Strongest scheduling and group-availability candidate | Advance to synthetic-calendar trial after threshold approval |
| [Notion](https://www.notion.com/help/web-clipper) | Strongest flexible structured-database candidate | Advance to free synthetic-fixture trial; not a turnkey winner |
| [Reclaim](https://reclaim.ai/) | Scheduling composition benchmark | Test only if availability becomes the dominant friction |
| [Posteady](https://www.posteady.com/) | User-requested candidate | Eliminated: social-marketing automation, not date planning |
| [Privacy AI](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) | User-requested App Store candidate | Eliminated as a product; retain Share Extension/local-processing patterns |
| Paid comparables | Feature-pattern benchmarks | Subscription requires explicit approval |

## Source-screening reports

- [Restaurant-first and shared-list candidates](bakeoff-restaurant-shared-list.md)
- [Flexible database and automation candidates](bakeoff-flexible-database-automation.md)
- [Calendar and scheduling candidates](bakeoff-calendar-scheduling.md)
- [Requested outliers](bakeoff-requested-outliers.md)

These dispositions are not the final bake-off decision. Apply the approved
policy below during hands-on validation and the final product-path decision.

## Approved decision policy

### Timebox

- Run the bake-off for 14 calendar days total, not 14 days per candidate.
- Use the first three days for sanitized capture, invitation, and setup checks.
- Use the remaining eleven days for realistic planning scenarios with the
  candidates that survive setup checks.
- Eliminate a candidate immediately after confirming a must-have failure.

### Evidence standard

- Current first-party documentation is sufficient for pricing, published
  feature availability, privacy policy, export/API support, and United States
  availability.
- Sanitized hands-on testing is required for Share Sheet capture,
  invitation/onboarding, independent voting, synchronization, metadata editing,
  calendar behavior, and offline behavior.
- A capability passes only when it works in the intended two-person workflow.
- Untested or ambiguous behavior remains unknown rather than passing.

### Must-have gates

A candidate or small composition must:

- save an arbitrary restaurant or event link from the iOS Share Sheet while
  preserving the original URL;
- give both people a shared, editable record through at most one partner app
  installation plus an invitation;
- record each person's preference independently using categorical votes or
  numeric scores;
- retain notes and structured cuisine/type, location, and time-sensitive
  special/date fields;
- export the shared data in a usable form or provide a documented API;
- operate within free access unless a paid trial is separately approved; and
- avoid exposing private votes, relationship data, or unrelated calendar
  content publicly or to unnecessary recipients.

Calendar planning, automatic ranking, enrichment, deduplication, and offline
support affect scoring but do not cause immediate elimination because a small
composition may supply them.

### Scoring and pass threshold

Score each rubric category from zero to three:

- `0` — absent, unusable, or still unknown after reasonable validation;
- `1` — major friction, workaround, or important limitation;
- `2` — workable for the intended two-person workflow; and
- `3` — strong, low-friction fit.

Each score requires a cited first-party fact or sanitized hands-on observation.
Inference may explain a score but cannot establish an unknown capability.

The rubric has 17 categories and a maximum score of 51. A candidate or small
composition passes only when it:

- passes every must-have gate;
- scores at least 34 out of 51 overall;
- scores at least `2` for Share Sheet capture, two-person collaboration,
  independent preferences, structured metadata, privacy, export/API, and
  partner burden; and
- has no unresolved unknown in a must-have category at the end of the trial.

If multiple options pass, prefer the highest score unless its additional
complexity or partner burden outweighs a small score advantage.

## Required rubric

Score every candidate against: arbitrary link capture; Share Sheet quality; restaurant and event support; two-person invitation; independent vote/score; sorting; notes; structured happy-hour/special/cuisine/address metadata; calendar availability and writes; urgency; venue dedupe; offline behavior; export/API; privacy; partner burden; free and paid cost.

## Rules

- Use current first-party product pages, App Store listings, privacy disclosures, API docs, and hands-on trials where necessary.
- Record access date and region.
- Do not assume the earlier claim that no product meets all requirements; make that a result.
- Obtain approval before starting a paid trial.
