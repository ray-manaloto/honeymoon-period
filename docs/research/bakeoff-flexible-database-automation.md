# Flexible database and automation bake-off: Notion

- Status: documentation-qualified survivor; hands-on validation required
- Accessed: 2026-07-15
- Region: United States
- Candidate evaluated: Notion, including the first-party Notion Calendar companion where the rubric requires calendar evidence
- Governing rubric: [Existing-app bake-off](existing-app-bakeoff.md)
- Research boundary: first-party product pages, help, developer documentation, and the United States App Store listing only; no account, trial, private data, or paid action was used

## Outcome

Notion survives to a focused free hands-on trial as a configurable shared database, but the documentation does not qualify it as a turnkey replacement for the baseline. Its strongest fit is structured metadata, per-person fields, explainable formula-based ranking, notes, guest collaboration, offline access, and export/API. Its material gaps are capture from source apps other than browsers, actor-owned scoring, venue identity and deduplication, and a seamless path from a database idea to shared availability and an external calendar event.

No comparable was added. The ticket names Notion and permits at most one comparable only when primary evidence shows a material fit improvement. Nothing found in this bounded investigation established that need strongly enough to expand the lane.

## Ticket reconciliation

The answer to [Evaluate flexible database and automation
candidates](https://github.com/ray-manaloto/honeymoon-period/issues/4) is:
**documentation alone cannot establish that Notion satisfies the
requirements**. Notion can supply
the shared structured workspace, two editable per-person preference fields,
ranking primitives, export, and a one-guest invitation on its Free plan, but
current first-party documentation does not establish the required arbitrary
iOS Share Sheet capture or enforced actor-owned scoring. It also leaves the
intended iPhone calendar handoff and offline capture behavior unknown. Under
the approved bake-off policy, those are hands-on questions, so Notion advances
to the free synthetic-fixture trial and does not yet pass the product-path
threshold. No comparable has stronger primary-source evidence that warrants
adding it to this lane.

## Evidence labels and provisional scoring

- **Verified** means a current first-party source directly documents the capability or limit.
- **Inference** means the conclusion follows from documented primitives but is not promised as a honeymoon-period workflow.
- **Unknown** means documentation cannot resolve the behavior; it requires a hands-on test.
- Provisional score: **2** = verified native fit; **1** = partial fit, setup/custom composition, or material unknown; **0** = unsupported or conflicts with the workflow.

This provisional matrix is descriptive, not a binding pass/fail decision. The
governing bake-off now uses an approved 17-category, zero-to-three rubric with
a 34/51 threshold and must-have gates. This earlier 18-row, zero-to-two source
screen is not mechanically comparable with that final trial score; it only
records which capabilities current documentation supports and which still
require hands-on validation.

## Rubric matrix

| Criterion | Score | Evidence and assessment |
| --- | ---: | --- |
| Arbitrary link capture | 1 | **Verified:** Notion's mobile clipper uses the native iOS Share Sheet, but its help page says it works only for entire pages from a web browser or photos, not other apps such as Twitter or Notes. **Inference:** links opened in Safari or Chrome are capturable, while direct sharing from many restaurant, event, social, or messaging apps is not reliable enough to call arbitrary. **Unknown:** whether sharing a bare URL from iMessage succeeds consistently. [Web Clipper](https://www.notion.com/help/web-clipper) |
| Share Sheet quality | 1 | **Verified:** the iOS extension lets a user choose Notion, edit the title, choose a workspace and destination page/database, and save. Tags and other properties cannot be added during clipping; the user must open the saved database page afterward. This is quick for a raw save but makes metadata capture a second step. [Web Clipper](https://www.notion.com/help/web-clipper) |
| Restaurant and event support | 1 | **Verified:** databases accept URLs, dates, text, select fields, and a Place property; Place accepts a location name or address, and map view can visualize it. **Inference:** one schema can represent restaurants and events. No source documents restaurant/event-specific parsing, enrichment, booking, or occurrence handling. [Database properties](https://www.notion.com/help/database-properties), [Map view](https://www.notion.com/help/maps) |
| Two-person invitation | 2 | **Verified:** an owner can invite a guest by email to a page with view, comment, or edit access; a new guest must sign up to access it, and guests inherit access to subpages by default. The free plan allows 10 external guests. A partner can therefore install Notion, accept one invitation, and edit a shared database without a paid member seat. [Manage members & guests](https://www.notion.com/help/add-members-admins-guests-and-groups), [Pricing](https://www.notion.com/pricing) |
| Independent vote or score | 1 | **Verified:** number and select properties can hold scores or categorical votes, formulas can calculate from properties, and a guest with `Can edit content` can edit property values. **Inference:** separate `Owner score` and `Partner score` fields can preserve two values and feed a consensus formula. Notion does not document property-level ownership or write restrictions, so either editor can change either value; this is independent storage, not enforced actor-owned voting. [Database properties](https://www.notion.com/help/database-properties), [Intro to databases](https://www.notion.com/help/intro-to-databases) |
| Sorting | 2 | **Verified:** database views support multiple property sorts, numeric sorting, custom select ordering, filters, and grouping; sorts can be saved for everyone. [Views, filters, sorts & groups](https://www.notion.com/help/views-filters-and-sorts) |
| Notes | 2 | **Verified:** each database item is a page with free-form content, and collaborators can leave page, block, or property comments and receive mention notifications. [Intro to databases](https://www.notion.com/help/intro-to-databases), [Collaborate with people](https://www.notion.com/help/collaborate-with-people) |
| Structured happy-hour, special, cuisine, and address metadata | 2 | **Verified:** text, number, select, multi-select, date/date range, URL, formula, relation, and Place properties are available. **Inference:** these primitives directly model cuisine, happy-hour windows, special/deadline details, source URL, status, and address, though enrichment is manual unless custom automation is added. [Database properties](https://www.notion.com/help/database-properties), [Map view](https://www.notion.com/help/maps) |
| Calendar availability | 1 | **Verified:** Notion Calendar is free, can connect Google, iCloud, and Outlook calendars, and offers availability links on desktop/web. It can show Notion database dates beside calendar events, but a Notion database is connected per user and is not visible inside Google or iCloud Calendar. **Inference:** this helps a person compare ideas with their own schedule but does not document automatic two-partner availability intersection or privacy-preserving shared free/busy. [Create a Notion Calendar account](https://www.notion.com/help/create-a-notion-calendar-account), [Scheduling & availability](https://www.notion.com/help/availability-blocking-and-time-zones), [Use Notion Calendar with Notion](https://www.notion.com/help/use-notion-calendar-with-notion) |
| Calendar writes | 1 | **Verified:** Notion Calendar can create events in connected calendars and its product page specifically documents Apple Calendar meeting creation. A Notion database item with a date can be managed in Notion Calendar, but it remains a database item and is not shown in Google or iCloud Calendar. Mobile also cannot edit events unless they were created on iOS and the user is the organizer. **Unknown:** the exact low-friction iPhone flow for turning a chosen database item into a durable shared external event without duplicate entry. [Notion Calendar](https://www.notion.com/product/calendar), [Use Notion Calendar with Notion](https://www.notion.com/help/use-notion-calendar-with-notion), [Notion Calendar apps](https://www.notion.com/help/notion-calendar-apps) |
| Urgency | 2 | **Verified:** date properties support times, ranges, and reminders; formulas calculate from other properties; filters and multiple sorts can order items by formula or date values. **Inference:** an explicit urgency formula can combine special expiry, occurrence date, and scores and expose its inputs. It requires owner-designed schema and does not extract deadlines from captured pages. [Database properties](https://www.notion.com/help/database-properties), [Views, filters, sorts & groups](https://www.notion.com/help/views-filters-and-sorts) |
| Venue dedupe | 0 | **Verified:** URL and Place properties exist, but no cited Notion source promises venue identity resolution or duplicate detection. Place search uses a third-party provider and its quality varies by region. **Inference:** exact normalized-URL checks or address/name matching could be custom-built through formulas/API, but different URLs for one venue remain unresolved by the product evidence. [Map view](https://www.notion.com/help/maps), [Database properties](https://www.notion.com/help/database-properties) |
| Offline behavior | 1 | **Verified:** all plans can manually download pages and then view, edit, and create pages offline; changes sync on reconnect. Downloading a database fetches only its first 50 rows automatically, other rows and subpages must be selected separately, and embeds, forms, and buttons are unavailable offline. **Unknown:** whether the iOS Share Sheet extension can create a database item while offline. [Working offline in Notion](https://www.notion.com/help/guides/working-offline-in-notion-everything-you-need-to-know), [Pricing](https://www.notion.com/pricing) |
| Export and API | 2 | **Verified:** pages/databases export as HTML, Markdown, and CSV on desktop and mobile, and an entire workspace can be exported. The REST API reads and writes pages/databases, uses HTTPS and installation tokens, averages three requests per second per connection, and supports webhooks for page/database changes. [Export your content](https://www.notion.com/help/export-your-content), [API introduction](https://developers.notion.com/reference/intro), [Request limits](https://developers.notion.com/reference/request-limits), [Webhooks](https://developers.notion.com/reference/webhooks) |
| Privacy | 1 | **Verified:** Notion documents AES-256 encryption at rest, TLS 1.2+ in transit, encrypted backups, and self-service/requested deletion. The United States App Store disclosure says data linked to identity can include contact info, user content, search history, identifiers, and usage data, including some contact info/identifiers used for developer advertising or marketing. Calendar infrastructure is hosted on AWS in the United States; iCloud connection uses an Apple app-specific password and grants access to calendar, contacts, and mail data. **Inference:** access controls are adequate for a private two-person page, but the cloud collection footprint is materially broader than a local-first tool and needs explicit acceptance. [Security practices](https://www.notion.com/help/security-and-privacy), [US App Store privacy disclosure](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281), [Notion Calendar security](https://www.notion.com/help/notion-calendar-security-practices), [Create a Notion Calendar account](https://www.notion.com/help/create-a-notion-calendar-account) |
| Partner burden | 1 | **Verified:** the partner needs a Notion account and page invitation; `Can edit content` allows data editing without changing database structure. **Inference:** one Notion installation is enough for capture and database participation, but the generic database UI and second-step property editing add learning and interaction burden. A full calendar workflow may also require the separate Notion Calendar app or desktop/web use, weakening the one-install goal. [Manage members & guests](https://www.notion.com/help/add-members-admins-guests-and-groups), [Intro to databases](https://www.notion.com/help/intro-to-databases), [Notion Calendar apps](https://www.notion.com/help/notion-calendar-apps) |
| Free cost | 2 | **Verified:** the Free plan is $0 per member per month, provides databases with custom properties, one chart, basic forms, manually selected offline pages, 10 guests, a public API, webhooks, and basic button automation. An individual workspace has unlimited blocks; a Free workspace with two or more members is block-limited, so the documented guest pattern matters. Notion Calendar is free. [Pricing](https://www.notion.com/pricing), [Notion Calendar help](https://www.notion.com/help/category/notion-calendar) |
| Paid cost | 1 | **Verified:** web pricing lists Plus at $10 per member per month and Business at $20 per member per month in USD; paid workspaces charge per member while guests remain free. Plus adds unlimited collaborative blocks, automatic offline downloads for recents/favorites, unlimited guests, and custom database automations. The US App Store lists Plus at $11.99 monthly or $119.99 yearly. No paid feature was tried. [Pricing](https://www.notion.com/pricing), [Members and billing](https://www.notion.com/help/members-and-billing), [US App Store listing](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281) |

**Provisional evidence-fit total: 24/36.** This total is not a product pass threshold and should not be compared mechanically with other lanes unless they use the same provisional definitions.

## What the evidence supports building in Notion

The documentation supports a free, owner-configured database with fields such as source URL, type, Place/address, cuisine, happy-hour window, special expiry, occurrence date, status, owner score, partner score, notes, and a visible formula-derived rank. The partner can be invited as an editing guest so the workspace remains a one-member workspace and avoids both a second member seat and the Free multi-member block limit.

This is an **inference from documented primitives**, not a tested template. It would preserve original URLs only if the schema does so deliberately. It would not, by itself, normalize URLs, merge venue duplicates, enrich captured metadata, enforce which person owns each score, or create a shared external calendar event.

The public API and webhooks make a composition possible, including adapting the existing Shortcut to create a Notion page or adding a resolver later. That composition would introduce integration-token management, custom reliability work, and owner setup; it should not be counted as a native Notion capability or assumed safe for partner distribution without a separate design and security review.

## Hands-on uncertainties

A free trial with synthetic fixtures should answer only the questions that documentation cannot:

1. From iMessage and each target source app, does sharing a bare restaurant/event URL invoke Notion successfully, or must the link first be opened in Safari/Chrome?
2. Does the Share Sheet reliably remember the shared database destination, preserve the exact original URL, produce a usable title, and avoid blocking on weak connectivity?
3. Can an editing guest install one app, accept one invitation, add and edit records, and change only their intended score field without confusing the schema?
4. What happens when both people edit separate score fields offline and later reconnect?
5. Can a chosen database item be converted or copied into a shared iCloud/Google calendar event on iPhone while retaining the database record and source link?
6. Can a no-secret synthetic fixture demonstrate exact-URL and same-venue duplicate behavior, and is the lack of native venue identity acceptable?

Do not start a paid trial for these tests. Use the Free owner-plus-guest pattern, synthetic restaurant/event URLs, and non-private calendar fixtures only after the trial scope is approved.

## Recommendation

Keep Notion in the bake-off as the strongest documented flexible-database candidate and test it on the Free plan. Treat it as eliminated from **turnkey winner** status unless hands-on evidence overturns the documented browser-only capture limitation and demonstrates an acceptable calendar handoff. Treat it as a possible **small composition** only if the partner experience remains one Notion installation plus one invitation and any owner-side Shortcut/API work is demonstrably low burden.
