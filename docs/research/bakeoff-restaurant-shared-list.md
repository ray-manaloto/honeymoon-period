# Restaurant-first and shared-list candidate bake-off

- Status: public research retained; hands-on verification deferred by ADR-0002
- Last verified: 2026-07-15
- Region: United States
- Candidates: Beli, Tavola, Soonish, and Mapstr
- Governing decision: [ADR-0001](../adr/0001-existing-product-first.md)

## Question

Can any restaurant-first or shared-list candidate cover quick iOS Share Sheet
capture, two-person collaboration and independent scoring, structured restaurant
and event metadata, urgency-aware sorting, and calendar planning with one partner
installation plus an invitation?

## Method and evidence limits

This pass used current public product pages, developer privacy policies, support
documentation, and Apple App Store listings. No account was created, no app was
installed, no private data was supplied, and no paid or free trial was started.
Apple labels App Privacy details as developer-reported and not verified by Apple;
those disclosures are therefore recorded as claims rather than audited behavior.

Evidence labels used below:

- **Verified** — a current first-party source explicitly describes the behavior.
- **Inference** — a source supports a narrower fact, but the rubric result depends
  on interpretation.
- **Unknown** — public first-party evidence did not establish the behavior. This
  is not proof that the feature is absent.

## Outcome

No candidate is a public-evidence winner for the full workflow.

- **Tavola survives for a focused hands-on trial.** It has the strongest explicit
  iOS Share Sheet claim in this lane, accepts restaurant shares from Maps,
  Safari, Yelp, and Instagram, captures restaurant fields, detects duplicates,
  and lets invitees join shared lists and add spots. It does not publicly establish
  independent candidate voting, event support, urgency, calendar planning,
  offline use, or an in-app export.
- **Mapstr survives for a focused hands-on trial or composition.** It supports
  many types of places, tags, notes, ratings, sorting/filtering, collaborative
  maps, partial offline access, and CSV/GeoJSON export. Public documentation does
  not establish arbitrary-link Share Sheet capture, independent votes, calendar
  writes, or deadline-aware urgency. Collaboration also has asymmetric editing
  rules.
- **Beli remains the restaurant discovery/history baseline, not a complete
  replacement.** It verifies restaurant lists, personal ranking, notes, tags,
  friend discovery, and a friend Match Score. Public evidence does not establish
  arbitrary-link Share Sheet capture, event support, a shared two-person queue
  with independent votes, urgency, export/API access, or calendar planning.
- **Soonish survives as the strongest voting-layer candidate.** It is available
  in the U.S., supports account-free code invitations, and explicitly gives each
  collaborator voting and priority controls. Public evidence does not establish
  Share Sheet URL ingestion, venue enrichment, calendar integration, urgency, or
  offline behavior, so it is more plausible in a composition than as a complete
  standalone winner.

## Rubric matrix

Legend: **V** verified, **I** inference/partial, **U** unknown from public evidence.

| Rubric item | Beli | Tavola | Soonish | Mapstr |
| --- | --- | --- | --- | --- |
| Arbitrary link capture | U — no current public ingestion claim | I — “any website,” but only restaurants are promised | U — list items are documented, URL ingestion is not | U — places/files are documented, arbitrary URLs are not |
| iOS Share Sheet quality | U | V — Maps, Safari, Yelp, Instagram; auto-fill and immediate save claims | U | U |
| Restaurant and event support | I — restaurants only | I — restaurants only | I — generic ideas include restaurants/activities, without venue enrichment | V — restaurants and arbitrary place types; event objects remain U |
| Two-person invitation | I — friend invitations/social following, not a shared queue | V — shared-list link; invitees join and add spots | V — unlimited collaborators by code, no account | V — collaborative-map invitations; accounts required to collaborate |
| Independent vote/score | I — personal restaurant ranking and friend Match Score, not shared candidate voting | U | V — each collaborator votes with emoji or 1–6 priority | I — personal ratings exist; per-person candidate voting is U |
| Sorting | V — ranked lists plus tags/filters | V — lists, tags, filters, distance sort | V — vote totals raise group favorites; current release adds sort/filter | V — tags, status, geography, distance/list filters |
| Notes | V — notes and favorite dishes | V — personal notes and star ratings are stored | V — completed-item note; pre-completion note semantics U | V — notes, comments, ratings, and photos |
| Structured happy-hour/special/cuisine/address metadata | I — cuisine/profile fields and labels; happy hour/special schema U | I — address, coordinates, cuisine, phone, website, tags; happy hour/special schema U | U — generic list entries/photos, no venue schema documented | I — addresses, tags, status, hours/descriptions; no user-owned special schema documented |
| Calendar availability and writes | U — policy mentions optional Google Calendar metadata access, but no workflow is documented | U | U | U — reservation availability is not personal calendar availability |
| Urgency | U | U | U | I — proximity alerts exist in Plus; deadlines/expiring specials U |
| Venue dedupe | U | I — duplicate warning verified; cross-source venue identity rules U | U | U |
| Offline behavior | U | U | U — support directs sync failures to network checks | V/I — saved map, tags, details readable offline; add/search/collaboration require network |
| Export/API | U — no current public user export or developer API located | I — machine-readable export is available by email request; no public API | I — export available by email request; no public API | V — in-app CSV and GeoJSON export; public developer API U |
| Privacy | I — extensive linked/account, contacts, usage, location, profile and UGC processing; advertising uses are allowed by policy | V/I — narrow disclosed collection and no ad/analytics SDK claim; Supabase U.S., Google search queries | V/I — no account, German/EU hosting, anonymous analytics/error claims; cloud stores list content | I — no-sale/no-ad and EU-hosting claims, but default map visibility language needs clarification |
| Partner burden | I — both people need accounts/apps for meaningful social use | V/I — one iPhone app plus shared-list link; browser preview alone cannot add | V — one app plus code; no account/email | I — browser can view a public map; app and account are needed to collaborate |
| Free cost | V — core listing is free; scope of free feature limits U | V — U.S. listing is free with no IAP displayed | V — U.S. listing and developer say all features are free | V — ad-free core through 300 addresses |
| Paid cost | V — U.S. IAP includes Supper Club annual $74.99 and creator subscriptions $5.79/month or $42.90/year; relevance to core workflow U | V — no paid tier/IAP displayed | V — no paid tier/IAP displayed; early adopters promised free access | V — current U.S. listing shows multiple legacy/current Plus prices, including $5.99–$8.99 monthly and about $59.90–$59.99 yearly; exact offer requires in-app confirmation |

## Candidate evidence

### Beli

**Verified facts**

- Beli is available in the U.S. App Store, requires iOS 16.6 or later, is free to
  download, and offers in-app purchases. Its listing describes ranked restaurant
  lists/maps, friend activity, tags, notes, favorite dishes, a Taste Profile, and
  friend Match Scores. [U.S. App Store listing](https://apps.apple.com/us/app/beli/id1478375386)
- Beli's product site describes the core as tracking restaurants, sharing with
  friends, and personalized discovery. It does not describe event capture or a
  shared couple-owned list. [Beli product site](https://beliapp.com/)
- The privacy policy says Beli may process restaurant history and wish-list data,
  labels, favorite dishes, dietary restrictions, friend/contact invitation data,
  precise geolocation, usage data, user-generated content, and optional calendar
  information. It also permits marketing, interest-based advertising, and
  location-based advertising uses. [Beli privacy policy](https://beliapp.com/app-privacy-policy)
- The same policy says a connected Google account can expose calendar event
  titles/descriptions, invitee email addresses, locations, and other metadata;
  it does not explain a consumer-facing availability or calendar-write workflow.
  [Beli privacy policy](https://beliapp.com/app-privacy-policy)
- The U.S. listing currently shows $0.99 for Weekly Streak Restore, $74.99/year
  for Beli Supper Club, and creator subscriptions at $5.79/month or $42.90/year.
  The listing does not say that these purchases are necessary for the evaluated
  core workflow. [U.S. App Store listing](https://apps.apple.com/us/app/beli/id1478375386)

**Inference and unknowns**

- Personal ranking and a friend Match Score are not evidence of two independent
  votes on each shared future candidate. A two-person candidate queue, per-person
  vote visibility, and consensus ranking remain unknown.
- A privacy-policy reference to calendar data proves possible collection, not
  availability comparison or event creation; both calendar rubric items remain
  unknown until hands-on testing or product documentation establishes them.
- Current public sources did not establish Share Sheet input, preservation of an
  arbitrary source URL, events/activities, deadline urgency, venue-level duplicate
  merging, offline behavior, or user export/API access.

**Disposition:** retain as baseline evidence and a possible restaurant companion;
do not advance it as a standalone replacement without new capture, collaboration,
and calendar evidence.

### Tavola

**Verified facts**

- Tavola's U.S. App Store listing says restaurants can be saved through the iOS
  Share Sheet from Maps, Safari, Yelp, or Instagram, or found by name. It says
  shared-list invitees can join, browse, and add their own spots.
  [U.S. App Store listing](https://apps.apple.com/us/app/tavola-restaurant-list-app/id6768360737)
- The developer site broadens that claim to Apple/Google Maps, Yelp, or any
  website and says a Share Sheet save captures name, location, and source.
  [Tavola product site](https://tavolaapp.com/)
- Version 1.2 notes say Tavola can auto-fill a restaurant name from an Instagram
  restaurant profile, warn when a restaurant is already saved, sort by distance,
  and preview shared lists in a browser before joining. The identity key and
  cross-source behavior behind duplicate detection are not described.
  [U.S. App Store listing](https://apps.apple.com/us/app/tavola-restaurant-list-app/id6768360737)
- Tavola's privacy policy enumerates saved name, address, coordinates, cuisine,
  phone, website, personal notes, tags, star rating, visited status/date, lists,
  and sharing relationships. It says location is used only while open, no location
  history is stored, and no third-party analytics or crash-reporting SDK is used.
  [Tavola privacy policy](https://tavolaapp.com/privacy)
- The policy says data is stored with Supabase in the United States, Google
  receives typed Places search queries, data is not sold or used for advertising,
  in-app account deletion is supported, and a machine-readable copy is available
  by email request. [Tavola privacy policy](https://tavolaapp.com/privacy)
- Tavola is free in the U.S. listing, shows no in-app purchases, and requires iOS
  17.6 or later. [U.S. App Store listing](https://apps.apple.com/us/app/tavola-restaurant-list-app/id6768360737)

**Inference and unknowns**

- “Any website” appears constrained by Tavola's restaurant-only domain. Behavior
  for unsupported pages, event pages, redirects, tracking wrappers, login walls,
  and metadata failures needs hands-on verification.
- The sources do not establish per-person candidate votes/scores, vote privacy,
  consensus sorting, deadline/special urgency, calendar read/write, offline use,
  a public API, or structured recurring happy-hour fields.
- Shared links can render a browser preview, but joining and adding appears to
  require the iPhone app and Sign in with Apple. That fits one app plus invitation,
  subject to a two-person sync test.

**Disposition:** advance to a no-cost, fixture-only hands-on trial. It is the best
capture candidate in this lane, but likely needs a voting/calendar composition.

### Soonish

**Verified facts**

- Soonish describes voting, priority, and todo list types; emoji voting; 1–6
  priority ratings; group-favorite ordering; unlimited collaborators; share codes;
  real-time sync; completed memories, photos, and ratings; and no required account.
  [Soonish site](https://soonish.life/) and
  [support](https://soonish.life/support/)
- Support says every collaborator can add items, vote on priorities, and mark
  items complete. It also says data export is available by email request and that
  sync troubleshooting begins with checking an internet connection.
  [Soonish support](https://soonish.life/support/)
- The developer says the app is free with all features, has no ads, and early
  adopters retain free access. [Soonish site](https://soonish.life/)
- The privacy policy says list content and an optional display name are stored in
  Supabase in Germany, Plausible analytics is anonymous/no-cookie/no-IP on a German
  server, Sentry uses EU servers without IP/profile tracking, and all app data can
  be deleted. [Soonish privacy policy](https://soonish.life/privacy/)
- Apple's U.S. listing identifies the product as “Bucket List Together - Soonish,”
  requires iOS 15.6, is free, and reports unlinked usage and diagnostics data. It
  shows no in-app purchases.
  [U.S. App Store listing](https://apps.apple.com/us/app/bucket-list-together-soonish/id6751187316)

**Inference and unknowns**

- Soonish clearly covers independent contributions and transparent voting, but
  public sources do not establish iOS Share Sheet ingestion, source URL retention,
  restaurant enrichment, address/cuisine/special fields, venue dedupe, calendar
  availability/writes, time-based urgency, or offline editing.
- The support page uses both “no account” collaboration and “signing out” language;
  anonymous identity persistence and device migration need hands-on clarification.

**Disposition:** advance to a no-cost, fixture-only hands-on trial as the strongest
voting layer. Test it both standalone and as a composition with Tavola or Mapstr.

### Mapstr

**Verified facts**

- Mapstr's U.S. App Store listing covers arbitrary place types, tags/colors,
  personal notes/ratings/photos, tried/to-try state, map sharing by browser link,
  and Google Maps/CSV/KML import. It is available on iPhone, Apple Watch, and
  iMessage and requires iOS 15.5 or later.
  [U.S. App Store listing](https://apps.apple.com/us/app/mapstr-save-follow-places/id917288465)
- Mapstr documentation says collaborative-map invitees accept an invitation and
  can add addresses, but only the map owner can modify or delete participant
  additions. [Mapstr FAQ](https://en.mapstr.com/faq)
- The FAQ documents custom tags, notes, comments, photos, to-try/tried status,
  filtering by tags/status/open state/available tables, sorting by geography, and
  reservation handoff to partners including OpenTable. These are place and booking
  features, not personal-calendar availability or event writes.
  [Mapstr FAQ](https://en.mapstr.com/faq)
- Saved places, tags, and details remain readable offline, while adding places,
  enriched content, search/advanced filters, and other people's maps require a
  connection. [Mapstr FAQ](https://en.mapstr.com/faq)
- In-app export emails CSV and GeoJSON containing addresses, tags, notes, and
  associated information. [Mapstr FAQ](https://en.mapstr.com/faq)
- The free tier is ad-free and accepts up to 300 addresses. The current U.S.
  listing exposes several Plus purchase records, including $5.99 and $8.99 monthly
  and approximately $59.90/$59.99 yearly. The active in-app offer must be checked
  without starting its advertised seven-day trial.
  [Mapstr FAQ](https://en.mapstr.com/faq) and
  [U.S. App Store listing](https://apps.apple.com/us/app/mapstr-save-follow-places/id917288465)
- The developer says Mapstr uses EU servers and does not sell data or use ad
  tracking. Apple's disclosure says linked usage/diagnostic data and unlinked
  precise location may be collected. [U.S. App Store listing](https://apps.apple.com/us/app/mapstr-save-follow-places/id917288465)

**Privacy ambiguity**

- The FAQ says a user's map is public by default and can be made private, while
  the App Store copy says notes, ratings, and pictures are private by default and
  visible only to followers. These statements may describe different layers
  (map/pins versus annotations), but a trial must verify fresh-account defaults
  before entering any private couple data. [Mapstr FAQ](https://en.mapstr.com/faq)

**Inference and unknowns**

- “One-tap pins” is not an explicit iOS Share Sheet ingestion claim. Public
  sources document in-app place search/manual pins and bulk file import, but not
  arbitrary source URL preservation or reliable sharing from discovery apps.
- Personal ratings and social following do not establish two independent votes
  on the same candidate or a couple-level consensus score.
- No current public source established venue duplicate merging, calendar
  availability/calendar writes, recurring-special metadata, deadline-based
  urgency, or a public user/developer API.

**Disposition:** advance to fixture-only hands-on checks for collaboration,
privacy defaults, capture surfaces, and whether tags can make an acceptable
metadata workaround. Treat it as a possible place database, not a voting or
calendar solution.

## Required hands-on questions

Use only public fixtures and free features; do not enter relationship data, private
notes, real calendar contents, or paid-trial flows.

### Tavola

1. From Apple Maps, Google Maps, Yelp, Instagram, a restaurant website, and a
   public event URL, does Tavola appear in Share Sheet and finish capture without
   opening the main app?
2. Does it preserve the exact source URL as well as resolved venue identity, and
   what happens when enrichment fails or a page is login-walled?
3. Do different Yelp/Maps/website URLs for one venue trigger duplicate detection,
   or only repeated identical sources?
4. Can both invited users add/edit/delete the same entry, and how quickly do
   updates converge on two simulators/accounts?
5. Can either person attach an independent score or vote without overwriting the
   other's value? If not, can separate ratings be represented at all?
6. What survives offline, and is an emailed machine-readable export complete and
   usable without support intervention?

### Mapstr

1. Does Mapstr expose an iOS Share Sheet extension for Apple Maps, Yelp, Safari,
   Instagram, OpenTable, Resy, and arbitrary event URLs? Does it retain source
   provenance?
2. What is public on a brand-new account before privacy settings are changed:
   map, pins, tags, notes, ratings, photos, and custom places?
3. In a collaborative map, can both people edit tags/notes/status on the same
   venue, and what ownership restrictions remain?
4. Can the same venue added by both participants or from different sources become
   one shared record, or does it duplicate?
5. Are the free tier's collaborative maps, offline cache, and CSV/GeoJSON export
   complete enough without starting Plus?
6. Can tags and filters represent happy hour/specials with an expiration or next
   occurrence, and can any such date be sorted rather than manually searched?

### Soonish

1. Can an arbitrary URL be pasted or shared into a list item, and is it retained
   as a tappable source rather than flattened to text?
2. Do the Voting and Priority list types preserve each collaborator's separate
   choice and identity, and how are ties or changed votes handled?
3. Can a list item store a note before completion, an address, cuisine, tags,
   multiple URLs, or a date/deadline without overloading its title?
4. Does the ranking update deterministically and explain the contribution of each
   person's vote?
5. What reads or edits offline, how do conflicts reconcile, and does anonymous
   identity survive reinstall or device migration?
6. What fields and identities are present in the emailed export?

### Beli baseline checks still unresolved by public evidence

1. Which source apps expose a working Beli Share Sheet action, what data is
   retained, and are events rejected cleanly?
2. Can a future restaurant be jointly shortlisted with two distinct scores, or
   are all rankings/profile decisions inherently per-account?
3. What optional calendar connection is exposed in-product, and does it read
   availability or write a selected plan?
4. Is there any export mechanism for a U.S. account?

## Sources consulted

All sources were accessed 2026-07-15.

- Beli: [product site](https://beliapp.com/),
  [U.S. App Store listing](https://apps.apple.com/us/app/beli/id1478375386),
  [privacy policy](https://beliapp.com/app-privacy-policy)
- Tavola: [product site](https://tavolaapp.com/),
  [U.S. App Store listing](https://apps.apple.com/us/app/tavola-restaurant-list-app/id6768360737),
  [privacy policy](https://tavolaapp.com/privacy),
  [terms](https://tavolaapp.com/terms)
- Soonish: [product site](https://soonish.life/),
  [support](https://soonish.life/support/),
  [privacy policy](https://soonish.life/privacy/),
  [U.S. App Store listing](https://apps.apple.com/us/app/bucket-list-together-soonish/id6751187316)
- Mapstr: [product site](https://en.mapstr.com/),
  [FAQ](https://en.mapstr.com/faq),
  [U.S. App Store listing](https://apps.apple.com/us/app/mapstr-save-follow-places/id917288465)
