# Existing-app bake-off

- Status: public-source screening complete; decision threshold and hands-on validation pending
- Last verified: 2026-07-15
- Governing decision: [ADR-0001](../adr/0001-existing-product-first.md)

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

These dispositions are not the final bake-off decision. The scoring scale,
must-have failures, timebox, and pass threshold remain a human decision in
[Set the bake-off timebox and decision threshold](https://github.com/ray-manaloto/honeymoon-period/issues/2).

## Required rubric

Score every candidate against: arbitrary link capture; Share Sheet quality; restaurant and event support; two-person invitation; independent vote/score; sorting; notes; structured happy-hour/special/cuisine/address metadata; calendar availability and writes; urgency; venue dedupe; offline behavior; export/API; privacy; partner burden; free and paid cost.

## Rules

- Use current first-party product pages, App Store listings, privacy disclosures, API docs, and hands-on trials where necessary.
- Record access date and region.
- Do not assume the earlier claim that no product meets all requirements; make that a result.
- Obtain approval before starting a paid trial.
