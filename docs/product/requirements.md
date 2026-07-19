# Product requirements inventory

- Status: approved MVP outcomes plus approved preference/history semantics; calendar and merge semantics remain deferred
- Last updated: 2026-07-18

## Confirmed outcomes

- Share an arbitrary restaurant or event link through the iOS Share Sheet.
- Store the idea in a shared system both people can add to and edit.
- Let each person vote or score, then sort and prioritize candidates.
- Add notes and metadata including happy hour, special-event date, food type, address/location, timing, source, and decline reason.
- Raise priority for expiring specials and compatible availability.
- Integrate with Apple Calendar and Google Calendar or a suitable low-cost scheduling layer.
- Keep partner onboarding to one app installation plus an invitation when possible.
- Time-box an existing-app bake-off before custom development.
- Keep preference ranking system-owned, explainable, and versioned.
- Support a development feature flag that can rank from one person's vote while partner voting is unavailable.
- Expose versioned REST APIs for capture, preferences, notes/metadata, sorting, ranking, and queries so presentation clients remain replaceable.
- Deliver the first complete interactive client as a responsive source-controlled web UI; retain the Shortcut as the initial iOS capture client.
- Generate clients, models, validators, mocks, and routine plumbing from stable contracts. Permit Codex/Sites-generated presentation source while keeping human-authored code focused on business behavior.
- Enable strict static analysis, unit/component/contract/integration tests, and Playwright E2E coverage from the first production slice.

## Sources to capture

Instagram, Yelp, OpenTable, Tock, Resy, restaurant websites, and links or text forwarded through iMessage.

## Constraints

- The owner is the only developer.
- The repository is intended to be public; no private production data belongs in fixtures or docs.
- No paid product or service without explicit approval.
- Simulator-first native development; physical-device, GPS, TestFlight, and production sharing validation require separate approval.
- No provider deployment, public URL, or production credential/data without explicit approval; local development and synthetic fixtures are the implementation default.
- Preserve original links and accept best-effort metadata rather than blocking capture.

## Superseded prototype assumption

The earlier Reminders design assumed one shared outcome and no independent scoring.
The later product goal requires actor-owned voting and scoring. The accepted local MVP
and the approved preference/history evolution below control future work.

## Current implemented MVP defaults

Use the behavior already proven by the local vertical slice so implementation can proceed without freezing future product semantics:

- votes are `interested`, `maybe`, or `decline` and are visible to both participants immediately;
- score is optional from 0 through 5; a missing vote or score contributes zero rather than blocking ranking;
- each participant can replace only their own preference;
- ranking is the average available score plus vote weights (`interested` +2, `maybe` +1, `decline` -2) plus an explicit `rank_boost`, with newest update as the tie-breaker;
- `decline` lowers rank but is not a hard veto; moving the shared item to declined status is a separate shared action;
- notes and metadata are shared, retain actor/source provenance where available, and never contain production private data in fixtures; and
- ranking responses expose score, vote, boost, and total components.

These defaults describe the accepted implementation baseline. They remain in place until
the approved #19 child tickets are implemented and independently accepted.

## Approved preference and history evolution

[Issue #19](https://github.com/ray-manaloto/honeymoon-period/issues/19) is the
approved specification. Its settled semantics are:

- preferences remain actor-owned and immediately visible to both participants;
- votes remain `interested`, `maybe`, or `decline`; score remains optional 0 through 5;
- missing values are neutral, and fixed ranking weights are system-owned and versioned;
- a current decline is a reversible planning-eligibility veto that does not change
  shared candidate status;
- every accepted state-changing write becomes one immutable `PreferenceChanged` event
  while the last accepted event per actor owns the current projection;
- one canonical client-request-ID mutation supplies exact replay and conflict guarantees;
- a server-assigned monotonic sequence, rather than timestamp alone, totally orders
  accepted events, and historical snapshots replay inclusively through a requested sequence;
- exact idempotent replay creates no duplicate event, and differing-payload key reuse
  fails without changing event or projection state;
- both participants can see preference history; an actor may redact their own entry
  through a later immutable participant-visible tombstone;
- historical rank replays events with their applicable policy version; and
- history is retained indefinitely by default through additive `/v1` evolution.

Immutable preference changes and participant-visible history are implemented by
[#23](https://github.com/ray-manaloto/honeymoon-period/issues/23). Versioned policy
replay and tombstone redaction remain intentionally deferred to the dependent
[#24](https://github.com/ray-manaloto/honeymoon-period/issues/24) and
[#25](https://github.com/ray-manaloto/honeymoon-period/issues/25) tracer bullets.

## Remaining semantics to refine

- Does calendar integration only suggest openings, or create/update/cancel events after approval?
- Which event details may be read while protecting unrelated private calendar content?
- How are recurring happy hours modeled separately from one-time specials and reservation deadlines?
- When do different source links merge into one venue or event?
- Which remaining semantics must be fixed before the API leaves local development?

Architecture and execution details live in the [approved web MVP plan](web-mvp-plan.md). These remaining product questions do not reopen the selected backend or web framework.
