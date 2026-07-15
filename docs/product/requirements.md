# Product requirements inventory

- Status: requirements inventory; not yet an approved specification
- Last updated: 2026-07-15

## Confirmed outcomes

- Share an arbitrary restaurant or event link through the iOS Share Sheet.
- Store the idea in a shared system both people can add to and edit.
- Let each person vote or score, then sort and prioritize candidates.
- Add notes and metadata including happy hour, special-event date, food type, address/location, timing, source, and decline reason.
- Raise priority for expiring specials and compatible availability.
- Integrate with Apple Calendar and Google Calendar or a suitable low-cost scheduling layer.
- Keep partner onboarding to one app installation plus an invitation when possible.
- Time-box an existing-app bake-off before custom development.
- Keep scoring and ranking parameters configurable.
- Support a development feature flag that can rank from one person's vote while partner voting is unavailable.

## Sources to capture

Instagram, Yelp, OpenTable, Tock, Resy, restaurant websites, and links or text forwarded through iMessage.

## Constraints

- The owner is the only developer.
- The repository is intended to be public; no private production data belongs in fixtures or docs.
- No paid product or service without explicit approval.
- Simulator-first native development; physical-device, GPS, TestFlight, and production sharing validation require separate approval.
- Preserve original links and accept best-effort metadata rather than blocking capture.

## Superseded prototype assumption

The earlier Reminders design assumed one shared outcome and no independent scoring. The later product goal requires voting and scoring. Treat the later requirement as controlling, but define exact semantics through Grilling before To Spec.

## Questions for Grilling

- Are votes visible immediately, hidden until both vote, or configurable?
- What score scale, veto behavior, missing-vote behavior, and decline history are required?
- Which ranking signals and weights are user-configurable, and how is the result explained?
- Does calendar integration only suggest openings, or create/update/cancel events after approval?
- Which event details may be read while protecting unrelated private calendar content?
- How are recurring happy hours modeled separately from one-time specials and reservation deadlines?
- When do different source links merge into one venue or event?
- What duration and pass/fail threshold define the expanded bake-off?
