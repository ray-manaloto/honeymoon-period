# Local web MVP and iPhone baseline setup

## Local web MVP

Requirements: Node.js 22.18 or later and npm 11.6.2. The application uses only
synthetic fixture identities and a disposable local D1 database.

```sh
npm ci --ignore-scripts
npm run generate
npm run db:reset
```

Run the API and web UI in separate terminals:

```sh
npm run dev:api
npm run dev:web
```

Open `http://127.0.0.1:5173`. The UI starts as Participant A and can switch to
Participant B with the **Acting as participant** selector. These are obvious
local fixture tokens, not production identities. `npm run db:reset` deletes
only the disposable local Wrangler state before applying migrations and the
deterministic synthetic seed.

For local development while only one participant is voting, set the Worker
binding `SINGLE_PARTICIPANT_RANKING_ACTOR_ID` to `actor-a` or `actor-b`. When
unset (the default), ranking includes both participants. This provider-local
flag does not change the `/v1` contract.

Run `npm run check` for generation drift, Biome, strict types, unit/component,
contract, Worker/D1 integration, coverage, production builds, and Playwright
E2E verification. The aggregate also audits the complete authenticated OpenAPI
error-response matrix and tests the repository's read-only review tooling.

When the pinned Cherri binary already exists under `.build/bin`, verify both
canonical Shortcut sources plus the cryptographic envelopes and authenticated
payloads of the existing signed artifacts without changing the repository:

```sh
npm run check:shortcuts:readonly
```

`./scripts/verify.sh` and `./scripts/verify-save-date-idea.sh` are build/sign
commands: they replace signed deliverables and are not safe as read-only
validator commands. The read-only check uses the macOS `aea`, `aa`, and
`openssl` tools only in temporary storage: it derives each artifact's public key
from its embedded leaf certificate, verifies the AEA ECDSA signature and
authenticated payload integrity, and requires a nonempty `Shortcut.wflow`
inside the resulting `AA01` Apple Archive.

That verification does not contact an Apple Account or import or run a
Shortcut. It also does not prove Apple notarization, certificate-chain trust or
revocation, signer authorization, UI importability, or runtime behavior; those
remain separate release or device ceremonies.

## Save Date Idea API capture

`Save Date Idea API` is the supported API-backed candidate. It coexists with the
Reminders baseline until the candidate is explicitly accepted as its
replacement. When an artifact rebuild is explicitly intended, build and
structurally verify its signed artifact with:

```sh
./scripts/verify-save-date-idea.sh
```

For a Mac-only smoke test, keep `npm run dev:api` running and configure the
Shortcut's capture endpoint as `http://127.0.0.1:8788/v1/captures`. Use one of
the synthetic participant tokens from the disposable local seed; do not put a
production credential or private URL into the Shortcut or test database.

On macOS, Safari intentionally nests individual workflows under **Share →
Shortcuts**. For faster capture, this candidate is also a Services Quick Action
and receives Safari's onscreen page. Assign a keyboard shortcut in the
workflow's **Details → Add Keyboard Shortcut**, then invoke it while the Safari
page is active. The top-level Safari Share menu cannot contain an individual
workflow without a separate native Share extension.

For an authorized lab iPhone, connect the Mac and iPhone to the same trusted
LAN, reset the disposable database, and run the Worker on the LAN interface:

```sh
npm run db:reset
npm run dev:api:lan
```

Find the Mac's LAN IPv4 address in **System Settings → Network → Wi-Fi →
Details → TCP/IP**. Import `dist/Save Date Idea API.shortcut` on the iPhone and
answer its questions with
`http://MAC_LAN_IP:8788/v1/captures` and that phone's synthetic participant
token (`prototype-participant-a` or `prototype-participant-b`). Keep the
terminal open while testing; if macOS asks whether Node may
accept incoming connections, that system consent is a human-only step.

From Safari, share a synthetic public URL to **Save Date Idea API**. A new URL
reports that it saved a new date idea; sharing that URL again reports that its
source was added to the existing idea. Stop the LAN Worker when testing is
finished. This validates one-device capture mechanics, not independent partner
identity or onboarding.

## iPhone baseline

Complete the Reminders setup before importing the Shortcut.

### 1. Create and share the list

On one iPhone:

1. Open Reminders and create an iCloud list named **honeymoon-period**.
2. Add these sections in order: **Inbox**, **Both Want**, **Maybe**, and **Declined**.
3. Share the list with the other person and allow editing.
4. On the other iPhone, accept the invitation and confirm that a test reminder syncs both ways.

Apple does not expose Reminders sections to Shortcuts. New captures include `Status: Inbox` in their notes and may initially appear outside the visual Inbox section. Move them into Inbox when reviewing the list; subsequent moves record the shared outcome.

### 2. Install one personalized copy per person

On each iPhone:

1. Transfer and open `dist/Save honeymoon-period.shortcut`.
2. Review its actions, then add the shortcut.
3. Answer the import question with that person's display name.
4. Choose the shared **honeymoon-period** list when asked for the destination.
5. Open the shortcut's details and confirm **Show in Share Sheet** is enabled for URLs, text, rich text, and Safari webpages.
6. In any Share Sheet, edit favorites and move **Save honeymoon-period** near the top.

The first run asks for access to Reminders and may ask for permission to search Reminders. Allow both so duplicate detection works.

Run the first end-to-end capture on an iPhone. On macOS 26.5.2, Apple’s built-in Add Reminder action can remain pending when a generated Share Sheet shortcut is run from the editor even though the same reminder payload works through Reminders. This does not validate or invalidate the iPhone action path.

### 3. Daily workflow

1. In iMessage or a source app, long-press/open a link and tap **Share**.
2. Choose **Save honeymoon-period**. A notification confirms whether it was saved or already existed.
3. Discuss the idea in iMessage.
4. Move the reminder to **Both Want**, **Maybe**, or **Declined** and add context to its note.
5. For an expiring special or exact event, set the reminder's due date. For a recurring happy hour, write the days and times in the note without creating weekly alerts.
6. Flag the reminder when it deserves extra attention.

### 4. Beli handoff

- When a restaurant reaches **Both Want**, both people add it to Beli's want-to-try list and apply a `honeymoon-period` label if available.
- Keep timing, source links, and planning notes in Reminders.
- After visiting, each person records their own Beli ranking, dishes, and notes.
- Complete the reminder after the Beli entries are finished.
- Non-restaurant events remain in Reminders only.

## Correcting a capture

Some sites—especially Instagram—may block page metadata. The shortcut falls back to the website host. Rename the reminder during review; the source URL remains intact in the reminder note.

Duplicate detection uses the normalized URL stored in the note. Different links pointing to the same venue can still appear separately; merge those manually during review.

Duplicate lookup depends on the device’s Reminders/Spotlight index. During the first iPhone test, save one URL twice and confirm the second run reports an existing item. If it does not, continue the prototype without relying on automatic deduplication and merge duplicates during review.
