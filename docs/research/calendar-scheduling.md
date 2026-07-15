# Calendar and scheduling research

- Status: planned
- Last verified: not yet baselined

## Required coverage

- Apple/iOS Calendar through EventKit or an approved composition.
- Google Calendar without exposing unrelated private event details.
- Free or low-cost AI scheduling services, including Reclaim, where they materially reduce implementation.

## Questions

- Read-only free/busy, suggested openings, or event creation and lifecycle management?
- Personal calendars, one shared Date Ideas calendar, or both?
- How do both people approve creation, changes, cancellation, and reminders?
- What private event information leaves the device or calendar provider?
- Which OAuth scopes, app-review requirements, quotas, and ongoing costs apply?
- How do time zones, recurrence, travel time, reservation deadlines, and event duration interact?
- Can a service meet the one-install-plus-invitation partner target?

## Decision rule

Do not choose EventKit, Google APIs, or a scheduler until the bake-off establishes whether scheduling is the dominant bottleneck and defines the minimum privacy-preserving workflow.
