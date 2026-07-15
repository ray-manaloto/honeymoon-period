# Existing-app bake-off hands-on evidence

- Status: public/no-account interaction complete; material hands-on gates blocked
- Test date: 2026-07-15
- Region: United States
- Governing policy: [existing-app bake-off](../research/existing-app-bakeoff.md)
- Issue: [#7, Test surviving candidates against material unknowns](https://github.com/ray-manaloto/honeymoon-period/issues/7)

## Result

Issue 7 cannot be completed within the approved execution boundaries. Every
surviving product requires an app installation, account or calendar identity
before at least one interaction that the governing policy requires to be tested
hands-on. The no-account browser pass reached those gates without creating an
account, submitting a form, installing software, connecting a calendar, or
creating external state.

No candidate or composition can yet be marked passing or assessed conclusively.
This is not a product-elimination decision: the scores below are constrained
lower bounds with blocked required interactions scored zero. A final score would
falsely imply that the intended two-person iOS workflow was exercised.

Reclaim remains conditionally deferred. The public-source screen says to test it
only if Howbout and the native calendar controls demonstrate that availability
selection is the dominant friction. Those prerequisite trials are blocked, so
the condition is not established.

## Method and boundaries

The pass used `agent-browser` 0.31.2 against public pages in a fresh session.
It inspected page titles, URLs, interactive-element snapshots, help text, and
destination links. It did not fill or submit email, phone, password, OAuth,
notification, invitation, signup, or support forms. It did not install an app or
extension; use an existing identity, private calendar, real social account, or
production data; start a paid trial; use native/Xcode tooling; or retain a
screenshot.

Public first-party facts already recorded in the candidate research reports are
used only for categories that the policy permits documentation to establish.
Share Sheet quality, invitations, independent preferences, synchronization,
metadata editing, calendar behavior, and offline behavior remain blocked or
unknown unless actually exercised.

## Synthetic fixture set

These deterministic reserved-domain fixtures are ready for an approved human
trial. They contain no real venue, address, relationship, or calendar data.
At kickoff, record `D1` as the trial day 1 local calendar date (`YYYY-MM-DD`) and
`Z` as the tester's IANA time-zone identifier (for example,
`America/Chicago`). Derive fixture dates by adding calendar days in `Z`, not by
adding elapsed hours to an instant. For each materialized timestamp, record the
numeric UTC offset actually in effect in `Z` at that local date and wall time.
This remains deterministic across daylight-saving transitions.

| ID | Fixture |
| --- | --- |
| `HP-R1` | Restaurant Alpha; `https://example.com/hp/restaurant-alpha?utm_source=bakeoff`; cuisine `Fixture cuisine`; address `100 Example Way`; special `Weekday special`; expires on `D1 + 9 calendar days` in `Z` (trial day 10 at local 17:00) |
| `HP-E1` | Event Beta; `https://example.org/hp/event-beta`; type `Fixture event`; occurs on `D1 + 10 calendar days` in `Z` (trial day 11 at local 19:00); note `Sanitized bake-off fixture` |
| `HP-C1` | Calendar event `HP Calendar Alpha`; occurs on `D1 + 12 calendar days` in `Z` (trial day 13 at local 18:00–19:00); location `100 Example Way`; URL `https://example.com/hp/restaurant-alpha` |
| `HP-P1` | Owner vote `interested` / score `5`; partner vote `maybe` / score `3`; expected consensus `4`; votes must remain separately attributable |

For enrichment tests, a human tester may substitute a documented public fixture
class without committing its real URL or address.

## Public browser observations

`Evidence` is the exact public surface observed in the browser session. A
`Blocked` result means the expected product behavior could not be reached without
a prohibited action; it is not a failure of the product.

| Date | Region | Candidate / surface | Fixture | Expected | Actual | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-07-15 | US | Tavola public site | Public/no-account navigation | Reach a public interactive list, share preview, or capture test surface | The site exposed product copy, carousel controls, App Store links, and an email notification form; its download links resolved to the US App Store. No list or capture surface was available | Browser title `Tavola — Save restaurants you love`; snapshot headings `Save from anywhere`, `Share with friends`, and `Tap Share → Tavola`; download destination `apps.apple.com/us/app/tavola-app/id6768360737` | Blocked |
| 2026-07-15 | US | Soonish public site and support | Public/no-account navigation | Create or join a disposable list without an account | The site advertised no-account collaboration, voting, and an eight-character code, but `Get Started` remained on the marketing page and `Start Your First List` linked to `#how`; no web list UI was exposed | Browser title `soonish – Your Group Can't Decide? Fixed.`; snapshots included `Everyone's in. No account. Ever.`, `Vote`, and App Store/Google Play links | Blocked |
| 2026-07-15 | US | Mapstr site and web app | Public/no-account navigation | Reach a disposable map or inspect fresh-account privacy defaults | `Access the web version` opened `https://web.mapstr.com/`, which presented Facebook, Apple, or email/password sign-in plus signup; no map was visible before authentication | Browser title `Mapstr`; sign-in snapshot | Blocked |
| 2026-07-15 | US | Notion Web Clipper help and app | Public/no-account navigation | Reach a disposable database to exercise clipping, metadata edits, guest access, and export | Help was public; `https://www.notion.so/login` redirected to `https://app.notion.com/login` and required email or Google/Apple/Microsoft/passkey/SSO | Titles `Web Clipper – Notion Help Center` and `Notion - Log in`; login snapshot | Blocked |
| 2026-07-15 | US | Howbout About and add-friends help | Public/no-account navigation | Reach a public plan, poll, or invitation flow | The public site handed off to app stores. Help instructed a signed-in app user to open Home, tap Add Friends, then send an invite link or sync contacts; no planning UI was exposed on the web | Browser title `About - Howbout - shared calendar`; help text under `How do I add friends on Howbout?` | Blocked |
| 2026-07-15 | US | iCloud Calendar web | `HP-C1` | Create, edit, share, and delete a synthetic calendar event | The page showed product copy and a `Sign In` button; no calendar UI was accessible | Browser title `Calendar - Apple iCloud`; URL `https://www.icloud.com/calendar/`; sign-in snapshot | Blocked |
| 2026-07-15 | US | Google Calendar web | `HP-C1` | Create, share, edit, delete, and inspect offline synchronization for a synthetic event | Calendar redirected to Google Account authentication and requested email or phone before any calendar UI | Browser title `Google Calendar - Sign in to Access & Edit Your Schedule`; Google Account sign-in URL and snapshot | Blocked |

## Rubric lower bounds

Scores use the approved 0–3 scale. `0B` means the governing policy requires an
actual hands-on interaction, but this run could not reach it within its
constraints; it therefore counts as zero regardless of a published feature
claim. Plain zero means the bounded evidence does not currently establish the
category, not that this pass conclusively proved product failure. Nonzero scores
are limited to categories the policy permits first-party documentation to
establish and cite the source-screening reports, whose entries link to those
sources:
[restaurant/shared-list](../research/bakeoff-restaurant-shared-list.md),
[Notion](../research/bakeoff-flexible-database-automation.md), and
[calendar/scheduling](../research/bakeoff-calendar-scheduling.md).

| Category | Tavola | Soonish | Mapstr | Notion | Howbout | Apple / iCloud | Google Calendar |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Arbitrary link capture | 0B | 0B | 0B | 0B | 0B | 0B | 0B |
| iOS Share Sheet quality | 0B | 0B | 0B | 0B | 0B | 0B | 0B |
| Restaurant and event support | 1 | 1 | 1 | 2 | 1 | 1 | 1 |
| Two-person invitation | 0B | 0B | 0B | 0B | 0B | 0B | 0B |
| Independent vote / score | 0B | 0B | 0B | 0B | 0B | 0 | 0 |
| Sorting | 2 | 2 | 2 | 2 | 1 | 1 | 1 |
| Notes | 2 | 1 | 2 | 2 | 2 | 2 | 2 |
| Structured metadata | 0B | 0B | 0B | 0B | 0B | 0B | 0B |
| Calendar availability and writes | 0 | 0 | 0 | 0B | 0B | 0B | 0B |
| Urgency | 0 | 0 | 1 | 2 | 1 | 1 | 1 |
| Venue dedupe | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Offline behavior | 0B | 0B | 0B | 0B | 0B | 0B | 0B |
| Export / API | 1 | 1 | 2 | 3 | 1 | 2 | 3 |
| Privacy | 2 | 2 | 1 | 2 | 1 | 3 | 2 |
| Partner burden | 0B | 0B | 0B | 0B | 0B | 0B | 0B |
| Free cost | 3 | 3 | 2 | 2 | 2 | 3 | 3 |
| Paid cost | 3 | 3 | 1 | 2 | 2 | 3 | 3 |
| **Lower-bound total / 51** | **15** | **13** | **12** | **17** | **11** | **16** | **16** |

None of these lower bounds reaches 34, and every candidate has at least one
required score-2 or must-have interaction that remains blocked or unknown and
therefore counts as zero in this table. No candidate can yet be marked passing or
assessed conclusively. These lower bounds must not be used to rank products;
products with more documented features naturally receive a higher lower bound
even though none completed the trial.

## Blocked gates and exact human action

The actions below require explicit approval because they introduce app installs,
test identities, external state, calendar data, physical devices, or outbound
email. Use only the synthetic fixtures above and a dedicated empty calendar.
Where invitation, onboarding, synchronization, privacy defaults, or partner
burden are judged, two human participants must perform the flow, each controlling
their own test identity and environment; two accounts or devices operated by one
person are not sufficient evidence of the intended partner experience.

### Tavola

1. Approve two human participants, installation on one eligible iPhone per
   participant running iOS 17.6 or later, and one disposable Apple test identity
   per participant for Sign in with Apple.
2. Have each tester share `HP-R1` and `HP-E1` fixture classes from Maps (Apple
   and Google), Safari, Yelp, and Instagram; record whether the Tavola extension
   appears, exact URL retention, enrichment failure, duplicate behavior, and
   offline behavior without assuming any source succeeds.
3. Send and accept one shared-list invitation; add/edit/delete the same record on
   both devices and measure convergence.
4. Enter `HP-P1` to determine whether scores are actor-owned or overwrite one
   shared rating. Request the machine-readable export by email only with approval.

### Soonish

1. Approve two human participants, each installing Soonish on an isolated mobile
   test environment; no account is expected, but installation and external list
   creation are stateful.
2. Create one disposable list, join it with the eight-character code, and run
   `HP-R1`, `HP-E1`, and `HP-P1` through URL retention, independent voting,
   changed votes, ties, ranking, sync, and conflict cases.
3. Disconnect each environment in turn to test reads, edits, and reconciliation.
   Approve an outbound export email before testing export contents.

### Mapstr

1. Approve two human participants, app installation on one isolated environment
   per participant, and one disposable account per participant using a
   non-production identity method; do not use Facebook, existing Apple IDs, or
   existing email.
2. Before adding data, record fresh-account defaults for map, pin, tag, note,
   rating, photo, and custom-place visibility.
3. Create one collaborative map and exercise Share Sheet capture, URL provenance,
   `HP-P1`, asymmetric edits, duplicate venue inputs, tag/date workarounds,
   offline behavior, and synchronization on two devices.
4. Export CSV and GeoJSON without starting Plus and compare every synthetic field.

### Notion

1. Approve two human participants, one disposable Free-plan identity and one
   isolated iOS environment per participant, and one owner workspace with one
   guest invitation.
2. Build a disposable database for `HP-R1`, `HP-E1`, and separately attributed
   `HP-P1`; verify whether either editor can overwrite the other's field.
3. Attempt sharing fixture classes from Safari, Messages, Instagram, Yelp,
   OpenTable, Tock, Resy, and restaurant websites online and offline; inspect
   whether Notion appears or accepts input, then inspect source URL, title,
   destination choice, properties, and sync without assuming compatibility.
4. Approve a dedicated synthetic Google or iCloud calendar connection, then test
   database-item-to-event create/edit/delete behavior. Export Markdown/CSV and
   compare the structured fields.

### Howbout

1. Approve two human participants, one disposable Howbout account and one
   isolated app installation per participant, then have them send and accept one
   invitation without syncing real contacts.
2. Before adding data, record event-title/detail visibility defaults and restrict
   the fixture calendar to the minimum intended audience.
3. Exercise `HP-R1`, `HP-E1`, one general poll, one time poll, and `HP-P1` on two
   devices; inspect source URL retention, actor attribution, metadata, sync, and
   offline behavior.
4. Approve Full Calendar access only to a dedicated empty synthetic iCloud or
   Google calendar. Create `HP-C1`, edit time/location/notes, delete it from each
   side, and check for one-way updates or duplicates. Test calendar/data export.

### Apple / iCloud control

1. Approve two human participants, one non-production Apple Account and one
   isolated Apple test device per participant, and one empty shared iCloud
   calendar; explicitly approve physical-device use if physical devices are
   required.
2. Invite the second account with edit access. Create `HP-C1`, observe both
   devices, edit it from the invitee, delete it from the owner, and repeat with
   each device offline before reconnection.
3. Separately approve a synthetic Shortcut/EventKit fixture if Share Sheet
   handoff is in scope; verify user-confirmed create and the chosen permission
   level without exposing unrelated calendars.

### Google Calendar control

1. Approve two human participants, one disposable Google test account and one
   isolated iOS client per participant, and a dedicated empty secondary calendar.
   Grant the partner event-editing access and expose only synthetic free/busy
   data.
2. On two isolated iOS clients, create `HP-C1`, edit it from the partner, delete
   it from the owner, and repeat offline before reconnection. Record ownership,
   attendee, notification, conflict, and duplicate behavior.
3. If API behavior is in scope, separately approve a test Cloud project and the
   narrowest synthetic OAuth scopes; do not reuse production credentials.

### Reclaim conditional checkpoint

Do not start a Reclaim trial yet. First complete the Howbout, Apple/iCloud, and
Google controls and record that availability selection is the dominant remaining
friction after capture, collaboration, preferences, and metadata work. Only then
seek approval for one disposable Reclaim identity, a dedicated synthetic Google
or Outlook calendar, OAuth, and a free Scheduling Link lifecycle test. If that
condition is never met, close Reclaim as deferred without account creation.

## Residual risks

- Marketing and help surfaces may differ from current installed releases.
- App Store availability, OS requirements, free-tier limits, and privacy defaults
  can change during the 14-day trial.
- Simulator support may not reproduce Share extensions, Sign in with Apple,
  offline transitions, notifications, or calendar permissions; an approved
  physical-device trial may be necessary.
- Export-by-email flows require vendor interaction and create external state.
- No two-person synchronization latency, conflict resolution, data deletion, or
  actual privacy default was observed in this pass.

This blocked preflight does not count toward the 14-day trial. The clock starts
once approvals, test identities and devices, and the ability to install the apps
and connect a dedicated empty calendar are available. Installation, account
setup, invitations, and the initial capture checks must still occur within trial
days 1–3, as required by the governing policy.
