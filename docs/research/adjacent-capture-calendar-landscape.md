# Adjacent capture and calendar product landscape

- Status: primary-source research complete; no product or architecture decision is authorized by this report
- Access date: 2026-07-20
- Research: linked — this report
- Last30Days: linked — root-owned report under `.build/research/last30days/`
- Scope: current first-party product/help/developer sources only; no account, install, credential, paid action, device test, or private data

## Question

Which current Shortcut-to-app workflows, shared-list and date-planning products,
calendar applications, and public platform capabilities offer features or techniques
worth considering for honeymoon-period without weakening its accepted local API-first
architecture, privacy boundaries, provider neutrality, deterministic verification,
one-install-plus-invitation target, or greenfield zero-debt policy?

## Decision boundary

This report can nominate decisions only. It does not authorize implementation,
dependency installation, tracker mutation, deployment, production credentials, paid
services, private-data access, Shortcut rebuilding/signing, or a roadmap rewrite.
Grilling must resolve each material choice before downstream state changes.

## Executive result

The accepted MVP remains the right canonical path. No examined product replaces its
combination of source provenance, actor-owned preferences, explainable ranking, venue
identity, and provider-neutral API. The strongest transferable patterns are:

1. save an undated candidate first, then make a confirmed plan an explicit lifecycle
   transition;
2. preserve source/provenance even when enrichment is narrow or fails;
3. offer a user-confirmed, write-only calendar handoff before considering availability
   reads; and
4. make shared-workspace synchronization immediate while keeping participant-owned
   preference writes separate from shared candidate data.

Those are product and contract patterns, not a reason to adopt another app, data
store, calendar provider, or client runtime.

## Current evidence and implications

### 1. Capture: source-first, asynchronous enrichment remains the durable seam

**Verified facts**

- The protected local Shortcut already accepts Share Sheet URL/text/webpage input,
  preserves source/normalized URL markers, and does not block save on weak metadata.
  Its limitations are exact-link-only dedupe, source-site metadata failures, and one
  personalized Shortcut installation per capturer. [Reminders + Beli prototype](reminders-beli-prototype.md)
- Tavola documents iOS Share Sheet saves from Maps, Safari, Yelp, Instagram, and web
  sources, capturing a restaurant name, location, and source. Its public materials do
  not establish arbitrary event support, preserved raw URL semantics, independent
  preferences, or calendar workflows. [Tavola product page](https://tavolaapp.com/)
  and [U.S. App Store listing](https://apps.apple.com/us/app/tavola-restaurant-list-app/id6768360737)
- AnyList documents an iOS action extension that imports supported recipes from Safari
  and other apps, while its help describes a bounded importer rather than universal
  webpage capture. This is evidence for a progressive extractor with a safe raw-save
  fallback, not evidence for a restaurant/event resolver. [AnyList recipe import](https://help.anylist.com/articles/feature-overview-recipe-import/)

**Inference**

The lowest-debt capture contract remains `capture raw input -> persist immutable
provenance -> normalize conservatively -> enqueue/attempt enrichment -> expose
correction`. It handles Share Sheet variability without making a provider parser or
third-party app the authoritative record. The existing MVP already follows the first
four parts; later native work should retain that contract rather than copy a
restaurant-specific importer.

**Disposition: adopt as a product invariant, not a new dependency.** Keep the
Shortcut as the protected capture baseline until native replacement is accepted. Do
not add a compatibility transport or another capture database.

### 2. Shared lists: immediate shared state is useful; actor-owned preferences are non-negotiable

**Verified facts**

- AnyList shares lists by invitation and says changes synchronize immediately to all
  members. Its household recipe/meal-plan sharing makes all shared changes visible to
  everyone, which suits jointly owned content but does not provide actor-owned fields.
  [List sharing](https://help.anylist.com/articles/share-list/) and [household recipe and meal-plan sharing](https://help.anylist.com/articles/share-recipes-meal-plan/)
- Soonish retains the strongest prior public evidence for each collaborator adding
  items and recording an emoji vote or 1–6 priority, but it does not establish source
  ingestion, venue identity, calendar writes, or hidden/actor-enforced preferences.
  [2026-07-15 shared-list bake-off](bakeoff-restaurant-shared-list.md#soonish)
- Notion's documented per-person properties and formulas can model separate scores,
  but its documented editing model does not enforce property ownership. It also
  restricts mobile clipping to web pages/photos and adds setup/token complexity to a
  composition. [2026-07-15 flexible-database bake-off](bakeoff-flexible-database-automation.md)

**Inference**

The transferable interaction is immediate convergence of shared candidate fields,
not a generic shared-list platform. The MVP's separate authenticated preference
resource is stricter than all three patterns and should remain canonical. A later UI
may borrow the simple invitation-and-shared-list mental model, but must not collapse
preference ownership into an editable shared record.

**Disposition: adopt the interaction pattern; reject product substitution.** No
Notion/AnyList/Soonish composition passes the deletion test: each would duplicate the
canonical store or weaken ownership/provenance while adding an account, token, or paid
surface.

### 3. Candidate-to-plan lifecycle is the clearest feature worth specifying

**Verified facts**

- Howbout's bucket list holds undated items; a user can set a date or send a time
  poll, and a confirmed date moves the item onto the calendar. [Howbout bucket-list
  help](https://howbout.app/get-help/how-does-the-bucket-list-work)
- Howbout says availability depends on synced calendars and participant privacy
  settings. Its documented product has group availability, calendar import, event
  chat, and not-yet-booked items, but it does not establish raw-link provenance,
  actor-owned scoring, source identity, or a public API. [Howbout about](https://howbout.app/about)
  and [availability help](https://howbout.app/get-help/find-availability)
- Apple Invites supports a host-created event with date/time, location, description,
  web link, RSVP handling, and optional media collaboration. Hosting requires
  iCloud+, although anyone can attend from the web. [Apple Invites overview](https://support.apple.com/en-euro/guide/apple-invites/dev5266f8d6d/ios)
  and [create an event](https://support.apple.com/guide/apple-invites/create-an-event-dev1d1c7cb6b/ios)

**Inference**

The valuable abstraction is a non-destructive transition from an undated candidate to
a dated occurrence, with explicit confirmation and retained history. It resolves the
current #20 questions more directly than importing a full shared-calendar product.
Event chat, RSVP, photo, playlist, and paid-host features do not pass the deletion
test for this two-person planning MVP.

**Disposition: defer a bounded specification decision.** Issue #20 should decide:
whether a Plan is an immutable selected occurrence or a mutable scheduling object;
whether cancellation/rescheduling creates history; when a Special becomes expired;
and whether the first calendar action is only user-confirmed export or durable sync.
Do not build calendar integration before that decision.

### 4. Calendar: use least privilege and make the first handoff user-confirmed

**Verified facts**

- On iOS 17+, EventKit can present `EKEventEditViewController` for a person to save
  an event without granting Calendar access. Direct event creation needs write-only
  access; fetching calendar data needs full access. Apple expressly advises requesting
  only the level required. [Apple EventKit access guidance](https://developer.apple.com/documentation/eventkit/accessing-calendar-using-eventkit-and-eventkitui)
  and [event-store guidance](https://developer.apple.com/documentation/eventkit/accessing-the-event-store)
- A privately shared iCloud calendar requires invitees to have an Apple Account and
  iCloud; the owner can grant edit or read-only access. [Apple shared-calendar
  support](https://support.apple.com/en-gb/guide/icloud/mm6b1a9479/icloud)
- The Google Calendar API has a free/busy endpoint for availability intervals and an
  event insertion endpoint, but it is a provider API requiring authorization; it does
  not provide the candidate/backlog model. [Google Calendar free/busy reference](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)
  and [events insert reference](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert)

**Inference**

The smallest privacy-preserving native calendar slice is: render an explicit Plan
occurrence from canonical data, present the system event editor, and persist only the
user-confirmed local plan state (not unrelated calendar data). That satisfies the
calendar handoff goal without full calendar access, OAuth, external event IDs, or
sync/reconciliation debt. Cross-provider free/busy or managed event sync is a later,
separate product decision because it changes data sensitivity, authorization,
revocation, conflict, and lifecycle requirements.

**Disposition: bounded pilot only after #20's contract is accepted.** A later native
pilot may prove the no-permission system-editor flow with synthetic data. Reject
provider-specific read/sync now: it fails the deletion test and is outside the local
MVP.

### 5. Native frameworks and open-source techniques do not justify a new runtime

**Verified facts**

- Apple Share Extension activation rules can restrict accepted input to URL/web-page
  attachments. App Groups can share a bounded container between an extension and its
  containing app, but Apple requires coordinated access when both processes may touch
  the same data. [Activation rules](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSExtension/NSExtensionAttributes/NSExtensionActivationRule),
  [shared data](https://developer.apple.com/documentation/technologyoverviews/shared-data),
  and [App Groups](https://developer.apple.com/documentation/xcode/configuring-app-groups)
- App Intents can expose stable `AppEntity` identifiers and asynchronous
  `EntityQuery` lookups across system surfaces. Apple also supports sharing intent
  code between an app and extension through a Swift package. [EntityQuery](https://developer.apple.com/documentation/AppIntents/EntityQuery),
  [App Shortcuts](https://developer.apple.com/documentation/appintents/appshortcut),
  and [app extensions](https://developer.apple.com/documentation/appintents/app-extension)
- `LPMetadataProvider` can supply preview metadata, but its properties are optional
  and retrieval can fail. It is a presentation/enrichment primitive, not an identity
  service. [Apple Link Presentation](https://developer.apple.com/documentation/linkpresentation/lpmetadataprovider)
- Google's narrowest calendar scopes separate app-created calendars and free/busy
  access, while CalDAV standardizes calendar access rather than removing discovery,
  authorization, recurrence, sync-token, or conflict ownership. [Google Calendar
  scopes](https://developers.google.com/workspace/calendar/api/auth) and
  [RFC 4791](https://datatracker.ietf.org/doc/rfc4791/)
- AppAuth-iOS is a maintained Apache-2.0 OAuth/OIDC client and SwiftSoup is a maintained
  MIT HTML parser, but neither supplies the product policy around consent, safe fetch,
  terms, venue identity, or calendar lifecycle. [AppAuth-iOS](https://github.com/openid/AppAuth-iOS)
  and [SwiftSoup](https://github.com/scinfu/SwiftSoup)

**Inference**

A later native client should use Apple frameworks directly: one URL-focused Share
Extension, a small atomic App Group outbox only if immediate API delivery proves
insufficient, stable API-backed App Intents, and optional Link Presentation previews.
The outbox must remain pending capture envelopes, never a second source of truth.
CloudKit would create an Apple-specific collaboration authority beside the accepted API;
generic CalDAV, OAuth, parsing, or fuzzy-identity dependencies would add coupling before
their product boundaries are decided.

**Disposition: adopt platform primitives later; reject a new shared runtime now.** No
third-party dependency currently passes the deletion test. AppAuth becomes a narrow
candidate only after a Google-provider decision; SwiftSoup only after a measured native
HTML-parsing need; CalDAV only after export/import proves insufficient.

### 6. Recent practitioner discovery supports simplicity, not a new feature

The root-owned Last30Days run is retained at
[the raw report](../../.build/research/last30days/collaborative-date-planning-ios-share-sheet-capture-shared-lists-and-calendar-integration-techniques-raw-adjacent-2026-07-20.md).
Its 30-day corpus was broad and mostly single-source. The strongest on-topic current
signal was a 65-point `r/shortcuts` discussion about a “capture anything” Shortcut.
The most transferable warning came from an adjacent Shortcut project: a 35-upvote
comment rejected setup that required extra work, while the author explained that an
unprotected proxy endpoint would be spammed. These are discovery signals, not technical
authority, but they reinforce two existing requirements: keep partner setup to one app
plus an invitation, and keep authenticated/rate-limited server ingestion rather than
shipping user-maintained proxy infrastructure.

The post-engine web supplements nominated privacy-preserving free/busy tools and current
open-source schedulers, but primary-source review found no candidate that deletes enough
repository ownership to justify adoption. No recent-practice signal changes the accepted
API-first architecture or the decision order below.

### 7. What the historical bake-offs already settled

The 2026-07-15 reports were not rerun; this pass reconciles, rather than replaces,
their source-screening evidence.

| Historical evidence | Still supported by current source | Reconciled implication |
| --- | --- | --- |
| [Restaurant/shared-list bake-off](bakeoff-restaurant-shared-list.md) | Tavola remains the clearest restaurant Share Sheet pattern; Soonish remains a voting interaction reference; Mapstr/Beli are not full workflow replacements. | Preserve raw capture and actor-owned preferences; do not compose third-party products. |
| [Calendar bake-off](bakeoff-calendar-scheduling.md) | Howbout remains the closest “undated idea to dated plan” model. Apple/Google remain primitives, not an idea system. | Specify Plan lifecycle before selecting a calendar mechanism. |
| [Flexible-database bake-off](bakeoff-flexible-database-automation.md) | Notion remains a configurable but non-enforcing composition with capture and ownership gaps. | Reject it as a canonical path. |
| [Reminders + Beli prototype](reminders-beli-prototype.md) | Shortcut capture remains valuable baseline evidence, while exact URL dedupe and partner setup remain known limits. | Retain baseline unchanged until an accepted replacement. |
| [Link capture/enrichment baseline](link-capture-enrichment.md) | Provider parsing and venue identity remain unresolved, distinct concerns. | Do not infer venue merging from exact-link duplicate detection. |

## Deletion-test decision register

| Candidate / technique | Decision | Reason |
| --- | --- | --- |
| Canonical capture provenance plus non-blocking enrichment | **Adopt** | Already aligned with the accepted contract and removes no necessary ownership. |
| Third-party shared-list/database composition | **Reject** | Duplicates the canonical record or weakens provenance/actor ownership, while adding identity/token/vendor surface. |
| Undated candidate -> confirmed plan transition | **Defer to #20** | Valuable model, but lifecycle, recurrence, cancellation, deadlines, and retained history need one explicit product decision. |
| User-confirmed EventKit editor | **Bounded pilot after #20** | Least-privilege handoff; no calendar read/OAuth required. Native work is separately sequenced. |
| iCloud/Google free-busy and durable event sync | **Defer** | Requires provider, authorization, revocation, conflict, and retention decisions; not needed for the first handoff. |
| Apple Invites | **Reject for canonical integration** | RSVP/presentation is adjacent, host requires iCloud+, and it provides neither provenance nor preference/ranking semantics. |
| URL-focused Share Extension | **Adopt in native phase** | Thin API client preserves the canonical capture contract; activation rules constrain inputs. |
| App Group pending-capture outbox | **Bounded pilot only if needed** | Improves extension resilience but must not become a second sync store. |
| App Intents with stable API entities | **Adopt in native phase** | Deletes custom system-integration glue while preserving `/v1` IDs. |
| Link Presentation preview enrichment | **Adopt as optional enrichment** | Platform-native and failure-tolerant; never canonical identity. |
| CloudKit collaboration or shared UI runtime | **Reject** | Creates a second provider-specific authority and conflicts with the accepted API-first path. |
| AppAuth-iOS, SwiftSoup, or CalDAV client | **Defer behind measured need** | No candidate currently deletes more owned behavior than it adds. |

## Unresolved decisions for Grilling

1. Is the first calendar outcome deliberately **export-only via a user-confirmed
   editor**, or does the product require managed synchronization from the outset?
2. When dates change or a plan is cancelled, should history preserve one Plan with
   revisions, or create a replacement occurrence linked to the original candidate?
3. Do “recurring offers” mean repeatable templates (for example, weekly happy hour),
   discrete time windows, or both? This changes the model and ranking semantics.
4. Is private availability a future convenience feature limited to free/busy, or is it
   explicitly out of scope until a provider/consent design is approved?
5. Before public deployment, which fields constitute enough same-venue evidence to
   propose a merge without silently merging independently captured sources? This is
   the #21 decision and remains separate from URL normalization.

## Evidence limits

No source establishes offline native Share Extension behavior, universal parser
coverage, calendar sync conflict handling, private availability UX, or safe cross-
source venue merging for this product. Those remain testable hypotheses, not claims.
Any bounded pilot must use synthetic data and retain the existing local API-first
contract.
