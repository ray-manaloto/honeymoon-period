# Product requirements inventory

- Status: approved MVP outcomes with configurable semantics still to refine
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

The earlier Reminders design assumed one shared outcome and no independent scoring. The later product goal requires voting and scoring. Treat the later requirement and the reversible MVP defaults below as controlling; refine them through Grilling only when observed use justifies a change.

## Reversible MVP defaults

Use the behavior already proven by the local vertical slice so implementation can proceed without freezing future product semantics:

- votes are `interested`, `maybe`, or `decline` and are visible to both participants immediately;
- score is optional from 0 through 5; a missing vote or score contributes zero rather than blocking ranking;
- each participant can replace only their own preference;
- ranking is the average available score plus vote weights (`interested` +2, `maybe` +1, `decline` -2) plus an explicit `rank_boost`, with newest update as the tie-breaker;
- `decline` lowers rank but is not a hard veto; moving the shared item to declined status is a separate shared action;
- notes and metadata are shared, retain actor/source provenance where available, and never contain production private data in fixtures; and
- ranking responses expose score, vote, boost, and total components.

These defaults are configurable business behavior and may change behind a versioned contract. Tests should make the current behavior explicit rather than scattering constants through UI components.

## Configurable semantics to refine after the working slice

- Should votes later support hidden-until-both or configurable visibility?
- Should the score scale, veto behavior, missing-vote behavior, or decline history change from the reversible defaults?
- Which ranking signals and weights are user-configurable, and how is the result explained?
- Does calendar integration only suggest openings, or create/update/cancel events after approval?
- Which event details may be read while protecting unrelated private calendar content?
- How are recurring happy hours modeled separately from one-time specials and reservation deadlines?
- When do different source links merge into one venue or event?
- Which of these semantics must be fixed before the API leaves local development versus safely shipped behind versioned configuration?

Architecture and execution details live in the [approved web MVP plan](web-mvp-plan.md). These remaining product questions do not reopen the selected backend or web framework.
