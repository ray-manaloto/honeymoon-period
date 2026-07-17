# Calendar and scheduling research

- Status: deferred until the API-first web MVP's capture, preference, metadata, and ranking workflows are stable
- Last verified: not yet baselined

## Required coverage

- Apple/iOS Calendar through EventKit or an approved composition.
- Google Calendar without exposing unrelated private event details.
- Free or low-cost AI scheduling services, including Reclaim, where they materially reduce implementation.

## Questions

- Read-only free/busy, suggested openings, or event creation and lifecycle management?
- Personal calendars, one shared honeymoon-period calendar, or both?
- How do both people approve creation, changes, cancellation, and reminders?
- What private event information leaves the device or calendar provider?
- Which OAuth scopes, app-review requirements, quotas, and ongoing costs apply?
- How do time zones, recurrence, travel time, reservation deadlines, and event duration interact?
- Can a service meet the one-install-plus-invitation partner target?

## Decision rule

Do not choose EventKit, Google APIs, or a scheduler during the first web MVP. Reopen this research after the capture, preference, metadata, and ranking workflows establish the minimum privacy-preserving planning need.
