# Calendar and scheduling candidate bake-off

- Status: source-researched; hands-on validation pending
- Last verified: 2026-07-15
- Access date: 2026-07-15
- Region: United States
- Scope: Howbout, Reclaim, Apple Calendar/iCloud + EventKit, and Google Calendar + Calendar API

## Question

Can a calendar-oriented product or a free/low-cost calendar composition provide the availability and planning portion of the honeymoon-period workflow without undermining quick iOS capture, private calendars, two-person collaboration, or the one-install-plus-invitation target?

## Method and evidence limits

This pass used only first-party product/help/developer pages and the US App Store listing. It did not create accounts, install apps, connect calendars, start trials, use private data, or exercise Share Sheet actions. A feature is marked **No evidence** when the reviewed first-party material does not document it; that is not proof that an undocumented feature cannot exist. App Store customer reviews were not used as feature evidence.

Rubric marks:

- **Yes** — directly supported by current first-party documentation.
- **Partial** — supports only part of the requirement or only as one component of a composition.
- **No evidence** — no supporting first-party documentation found in this pass.
- **Unknown** — requires hands-on validation or a vendor answer.

## Result

No candidate is a source-verified replacement for the complete workflow.

- **Howbout is the strongest product to trial for the scheduling slice.** It has friend invitations, availability views, general and time polls, undated bucket-list items that become scheduled plans, locations/details/chat, RSVP-like attendance, external-calendar import, and calendar export. It still lacks verified arbitrary-link Share Sheet capture, persistent per-person idea scoring, structured restaurant/special metadata, urgency-aware ranking, venue deduplication, and an API. It also requires both people to install and register, and external-calendar sync on iOS requires full Calendar access.
- **Reclaim is a scheduling layer, not a honeymoon-period system.** Its free tier can expose one scheduling link and automate calendar placement; invitees can book without a Reclaim account. Accurate mutual optimization still requires the partner's free/busy sharing or a Reclaim account. It has no native iOS app and no documented arbitrary-link capture, shared idea backlog, voting, restaurant metadata, or venue identity.
- **Apple Calendar/iCloud is the lowest-burden Apple-only planning substrate.** A shared iCloud calendar gives both people editable events through the built-in app and an invitation. EventKit can present an event editor without Calendar permission or write with write-only permission. Reading availability requires full access, and Calendar itself is not an idea backlog, voting, ranking, or enrichment product.
- **Google Calendar is the strongest privacy-preserving cross-provider building block.** Calendar sharing can expose only free/busy; the API returns busy intervals without event details, and a separate shared calendar can hold editable plans. Its API can create events with scoped authorization. It still needs a capture/database layer, Google account/OAuth setup, and potentially sensitive-scope verification if a custom public app reads calendar data.

## Full rubric comparison

| Requirement | Howbout | Reclaim | Apple Calendar / iCloud + EventKit | Google Calendar + API |
| --- | --- | --- | --- | --- |
| Arbitrary link capture | **No evidence.** Plans accept details and locations, but no arbitrary URL ingestion is documented. | **No evidence.** Scheduling Links are booking pages, not inbound honeymoon-period capture. | **Partial.** A Shortcut can accept Share Sheet input and `Add New Event`, but Calendar is occurrence-first rather than an undated backlog. | **Partial.** A custom Shortcut/app can write an event through Apple Calendar sync or the API; Calendar has no documented general-purpose capture inbox. |
| iOS Share Sheet quality | **Unknown.** Must test whether Howbout appears as a share extension and what fields survive. | **No evidence.** Reclaim has no native iOS app. | **Partial.** Shortcuts supports Share Sheet workflows and `Add New Event`; quality depends on custom Shortcut/app logic. | **Partial.** Requires a custom Shortcut/app; Google Calendar itself is not documented as an arbitrary-link share target. |
| Restaurant and event support | **Partial.** Generic plans support location and details; no restaurant-specific model is documented. | **Partial.** Generic meeting title, description, location, duration, and travel buffer; restaurant backlog is not the intended model. | **Partial.** Events support title, physical location, time, travel time, invitees, attachments, alerts, and notes/search. | **Partial.** Events support title, description, location, time zones, attendees, visibility, recurrence, and attachments through the API. |
| Two-person invitation | **Yes.** Invite links add friends; registered users can be invited to plans and groups. | **Partial.** Anyone can use a Scheduling Link without an account; Smart Meetings accept non-users, but accurate mutual availability needs calendar visibility or signup. | **Yes, Apple-only private sharing.** Invitees must have an Apple Account/use iCloud for an editable private iCloud calendar. | **Yes.** Calendar owners can invite another person and grant event-editing permissions. |
| Independent vote / score | **Partial.** General polls support choices such as where/what to eat, and time polls support date/time voting. No persistent per-person numeric score or hidden-vote semantics are documented. | **No evidence.** RSVP, booking, and priority are scheduling concepts, not independent honeymoon-period votes. | **No evidence.** Invitee RSVP is not independent candidate voting/scoring. | **No evidence.** Guest RSVP is not independent candidate voting/scoring. |
| Sorting / ranking | **Partial.** Upcoming, past, declined, and canceled list filters/search are documented. No configurable preference ranking is documented. | **Partial for time only.** Priority-aware scheduling can displace lower-priority flexible items and select times; it does not rank honeymoon-period. | **Partial.** Calendar orders occurrences by time and supports text search; it does not rank candidates. | **Partial.** Calendar orders occurrences by time; the API enables a custom layer to query and rank, but no honeymoon-period ranking is built in. |
| Notes | **Yes.** Plans have details and event chats; the App Store listing also identifies notes among plan content. | **Partial.** Scheduling Link bookings can collect a description; custom screening fields require paid plans. | **Yes.** Event notes are searchable; events also support attachments. | **Yes.** Event descriptions and attachments are supported. |
| Structured happy-hour / special / cuisine / address metadata | **Partial.** Location and generic details are documented; no first-class cuisine, happy-hour, special, deadline, or source fields are documented. | **Partial.** Location, duration, time window, screening questions, and priority exist, but not the required restaurant/special schema. | **Partial.** Location, URL/notes, recurrence, alerts, time zone, and travel time can encode some fields, mostly as generic event data. | **Partial.** Location, description, recurrence, visibility, and time zone are structured; domain-specific fields require an external data model or custom extended properties. |
| Calendar availability and writes | **Yes, with privacy caveats.** Availability finder and group availability use synced calendars/settings; Howbout can export its events into the phone calendar and other calendar apps. iOS import/export requires full Calendar access. | **Yes for Google/Outlook.** Scheduling Links, Smart Meetings, Calendar Sync, and Planner create/manage calendar events. iCloud is indirect and can lag by hours or days when bridged through Google/Outlook. | **Yes.** Shared calendars allow editing. EventKitUI can let a person save without Calendar permission; write-only access can create events; full access can read/write/delete/fetch. | **Yes.** Sharing can expose free/busy or editable calendars; `freeBusy.query` returns busy intervals, and `events.insert` creates events. |
| Urgency | **Partial.** Plans support reminders, and undated bucket-list items move to the calendar after date confirmation. No deadline-aware ranking is documented. | **Partial for scheduling.** Priorities and due-date pressure affect Reclaim's scheduling, but no expiring-special model is documented. | **Partial.** Alerts and recurrence can represent deadlines manually; no urgency ranking. | **Partial.** Reminders/recurrence and custom logic can represent deadlines; no honeymoon-period urgency ranking is built in. |
| Venue deduplication | **No evidence.** | **No evidence.** | **No evidence.** | **No evidence.** A custom layer could compare normalized/venue identifiers, but Calendar does not supply the domain model. |
| Offline behavior | **Unknown.** No first-party offline guarantee found. | **Partial/weak.** There is no native app; the mobile path is a web app or the connected Google/Outlook app. Reclaim automation itself should be treated as network-dependent pending a vendor statement. | **Unknown for exact edit/sync semantics.** Apple documents device/iCloud sync and recovery, but this pass found no explicit offline contract. | **Yes on mobile.** The Google Calendar iOS app can find/create/edit/respond offline, then sync changes when online; guest email is unavailable offline. |
| Export / API | **Partial.** Howbout can export to the phone calendar and publish an iCloud calendar URL; no public developer API was found. A public calendar URL is read-only and privacy-sensitive. | **Partial.** Calendar events remain in Google/Outlook; Reclaim 2.0 documents MCP and Business/Enterprise webhooks for Scheduling Link events. No general public data API/export was verified. | **Yes as a building block.** EventKit/EventKitUI provide local APIs; iCloud calendars can be shared publicly as read-only URLs. | **Yes.** Calendar API includes events, ACLs, calendars, free/busy, and standard ICS export from desktop. |
| Privacy | **Mixed.** Calendar visibility can be limited to Close Friends, busy-only, or no one, but all friends see titles/details by default unless settings change. Howbout's policy says it may collect contacts, location, and third-party calendar/event information with consent and store data on servers in and outside the UK. The US App Store disclosure says Usage Data may track users across other companies' apps/sites and lists several linked data categories. | **Mixed.** Reclaim says connected secondary-calendar data used for Calendar Sync is not stored, but primary-calendar data is stored. Its policy says calendar titles, descriptions, invitee emails, locations, and metadata are collected/stored. Basic Google use requests view/edit access across all calendars; Outlook requests `Calendars.ReadWrite`. Self-service deletion is available. | **Strongest for write-only composition.** EventKitUI can present a user-controlled save without requesting Calendar access, and iOS 17+ offers write-only access. Full availability reading exposes all events to the app, so a custom app must process locally and minimize retention. Shared iCloud calendar members see its plan contents. | **Strong for free/busy composition, mixed for cloud data.** Sharing can hide details and `freeBusy.query` returns only intervals. Google says entries are encrypted in transit/at rest and stored on device for offline use. A custom app must request narrow OAuth scopes; reading Calendar is a sensitive scope that may require verification. |
| Partner burden | **One install + signup + invitation.** Both people need Howbout accounts; external calendar availability adds Calendar permission and privacy configuration. | **Low for one-way booking; higher for true mutual optimization.** A partner can use a booking link with no app/account, but accurate recurring mutual scheduling may require calendar sharing or a free Reclaim account. Owner uses web app because no native iOS app exists. | **Lowest if both use Apple.** No additional app; partner accepts an iCloud invitation and needs an Apple Account/iCloud. A custom capture Shortcut would add setup burden for each capturer. | **Low to medium.** Partner needs a Google Account and invitation; the Google Calendar app is optional when Google Calendar is synced into Apple Calendar, but some setup actions require desktop web. A custom app adds OAuth consent. |
| Free and paid cost | **Core described as free.** US App Store lists Howbout+ at **$3.99/month** or **$39.99/year**; documented premium items are mostly customization/convenience, not the core planning features evaluated here. | **Free Lite:** one-user team, one-week automated scheduling range, one Calendar Sync, and one Scheduling Link. Current pricing lists Starter at **$12/seat/month** and Business at **$18/seat/month**; webhooks require Business/Enterprise. | **No incremental service fee documented** beyond Apple hardware/account/iCloud service already in use; custom development has owner time and App Store/distribution implications if productized. | **Consumer calendar and standard API use add no API fee under current thresholds.** As of 2026-05-01 the API has 10,000 requests/min/project, 600/min/user/project, and a 1,000,000 requests/day/project no-charge threshold; Google says over-threshold charges are planned later in 2026 with advance notice. Custom development/OAuth verification costs owner time. |

## Candidate detail

### Howbout

#### Verified facts

- The US App Store lists an iPhone-only app requiring iOS 16+, free with in-app purchases, and explicitly markets it for couples as well as friend groups and families ([US App Store](https://apps.apple.com/us/app/howbout-shared-calendar/id1477248221)).
- Plans support headers, location, details, RSVPs, reminders, and event chat. Availability can show free, busy, or maybe-busy states while creating plans ([Howbout groups](https://howbout.app/groups)).
- General polls can ask where to go, what to do, or what to eat; time polls collect date/time choices. Polls exist within an event, group, or one-to-one chat ([Howbout poll help](https://howbout.app/get-help/how-do-i-create-a-poll/)).
- Bucket lists hold undated things to do. A person can set a date or propose a time poll; confirmation moves the item onto the calendar ([Howbout bucket-list help](https://howbout.app/get-help/how-does-the-bucket-list-work)).
- An invite link can bring a friend into Howbout. The privacy policy describes registered users inviting external people to events/groups through links, but participation in Howbout collaboration is framed around registered users ([add-friends help](https://howbout.app/get-help/add-friends/), [privacy policy](https://howbout.app/privacy-policy)).
- Howbout can import any calendar visible to the phone's native calendar app. On iOS 17+ it instructs users to grant **Full Access**, and lets users decide whether each calendar affects availability and whether Friends, Close Friends, or No one can see synced plans ([calendar import help](https://howbout.app/get-help/import-calendars/)).
- It does not maintain a separate communal group calendar. Instead, friends see each other's calendars subject to visibility, while groups provide chat and a shortcut to make plans together ([group-calendar help](https://howbout.app/get-help/group-calendar/)).
- By default, friends can see event titles/details. Close Friends restricts details to selected people while others see Busy; No one hides an event. Settings can be applied per plan, per synced calendar, or by default ([calendar visibility help](https://howbout.app/get-help/who-see-calendar/)).
- Howbout events can be exported into the native calendar. Exporting onward from iCloud to Google/Outlook uses a **Public Calendar** URL; on Android, Howbout warns that events may appear only on mobile and not sync to desktop ([calendar export help](https://howbout.app/get-help/export-calendar/)).
- The privacy policy says Howbout may process, with consent, contact-directory data, precise location, photos/media, and third-party calendar/event information. Data is hosted on third-party servers inside and outside the UK. Account deletion is self-service, though some data may be retained for fraud, investigations, terms enforcement, or legal requirements ([privacy policy](https://howbout.app/privacy-policy)).
- The US App Store disclosure says Usage Data may be used to track users and that purchases, contact information, identifiers, usage, and diagnostics may be linked to identity; Apple states the disclosure is developer-provided and unverified ([US App Store privacy disclosure](https://apps.apple.com/us/app/howbout-shared-calendar/id1477248221)).

#### Inference

Howbout is worth a tightly scoped hands-on trial because its bucket-list-to-time-poll-to-calendar sequence most closely matches “save now, choose later, plan together.” It could replace the scheduling portion and some generic notes, but absent verified Share Sheet ingestion and durable scoring it would likely remain paired with a capture/database tool. Default social visibility and full-calendar access make privacy setup part of onboarding, not an optional polish step.

#### Unknowns requiring hands-on validation

- Does Howbout expose an iOS Share extension for URL/text from Instagram, Yelp, OpenTable, Tock, Resy, websites, or Messages?
- If a URL can be pasted or shared, is the original URL retained and link-preview metadata preserved?
- Can each partner vote independently before seeing the other's answer, and are poll results exportable?
- Can an event's fields or chats reliably represent cuisine, recurring happy hour, one-time special, reservation deadline, source, and decline reason?
- Does export round-trip edits/deletes, or is it effectively one-way? Are duplicate events produced?
- What works offline, and how quickly do external-calendar changes affect availability?
- Is there any undocumented API, account-data export, or bulk backup beyond calendar export?

### Reclaim

#### Verified facts

- Reclaim is a calendar assistant that works with Google Calendar or Outlook rather than replacing them. It has no native iOS/Android app; its supported mobile path is the mobile-friendly web app or the connected calendar app ([existing-calendar help](https://help.reclaim.ai/en/articles/5202336-how-to-use-reclaim-with-your-existing-calendars), [mobile help](https://help.reclaim.ai/en/articles/6916961-how-to-use-reclaim-on-your-mobile-device)).
- Scheduling Links can be used by anyone without a Reclaim account. Invitees choose duration/time zone, submit contact/meeting details, and receive calendar/email confirmation with reschedule/cancel paths ([attendee experience](https://help.reclaim.ai/en/articles/6666683-what-your-attendees-see-when-you-share-a-scheduling-link-with-them)).
- Smart Meetings can invite non-users. Reclaim can only accurately include their availability when it has visibility through Reclaim membership/team membership or calendar sharing; otherwise signup or free/busy sharing is recommended ([Smart Meeting attendees](https://help.reclaim.ai/en/articles/6418105-do-my-attendees-have-to-use-reclaim-to-be-invited-to-smart-meetings)).
- Priority-aware scheduling can offer lower-priority flexible time, reschedule displaced events, and rank Tasks by due date. This is scheduling urgency, not candidate ranking ([automatic scheduling](https://help.reclaim.ai/en/articles/6207587-how-reclaim-manages-your-schedule-automatically)).
- Reclaim fully supports Google and Outlook. iCloud calendars can be imported into Google/Outlook first, but Reclaim warns that iCloud bridging can lag by hours or days ([shared-calendar connection](https://help.reclaim.ai/en/articles/3640324-connect-a-shared-calendar-to-reclaim)).
- Current pricing shows free Lite with one user, a one-week automated scheduling range, one Calendar Sync, and one Scheduling Link. Starter is $12/seat/month and Business is $18/seat/month on the displayed US monthly view. Two-person meetings do not consume Attendee User units ([pricing](https://reclaim.ai/pricing)).
- Reclaim 2.0 webhooks send Scheduling Link booking/reschedule/cancellation data but require Business or Enterprise. Reclaim 2.0 also documents MCP-based access from AI tools, without enough public detail in this pass to treat it as a general export API ([webhooks](https://help.reclaim.ai/en/articles/15423363-reclaim-2-0-webhooks-integration), [Reclaim 2.0 FAQ](https://help.reclaim.ai/en/articles/15280604-reclaim-2-0-faq)).
- Reclaim says it stores primary-calendar data but not data from secondary calendars connected only for Calendar Sync. Its privacy policy identifies titles, descriptions, invitee emails, locations, and calendar metadata as collected/stored data. Its security page documents broad view/edit scopes for Google calendars and `Calendars.ReadWrite` for Outlook ([security](https://reclaim.ai/security), [privacy policy](https://reclaim.ai/privacy)).

#### Inference

Reclaim is disproportionate unless availability optimization proves to be the dominant problem after the idea backlog is solved. A one-person free Scheduling Link could be a no-install experiment for choosing a date, but it represents the partner as an external booker rather than an equal collaborator and does not retain an idea pipeline. Full mutual scheduling either shifts privacy configuration to calendar sharing or asks the partner to create another account.

#### Unknowns requiring hands-on validation

- Can a one-off Scheduling Link be pleasant and symmetric enough for a couple choosing a date, rather than a host/guest appointment flow?
- Can the free tier target a dedicated shared honeymoon-period calendar and preserve locations, URLs, notes, reminders, and attendee lifecycle correctly?
- Does the 2.0 mobile web app expose any useful iOS Share Sheet/PWA integration?
- What exact MCP capabilities, plan limits, data retention, and authorization scopes apply to a two-person consumer use case?
- How do cancellations, declines, manual calendar edits, and time-zone changes behave across both partners' calendars?

### Apple Calendar / iCloud + EventKit

#### Verified facts

- An iCloud calendar can be shared privately with another iCloud user, who can be allowed to add/change events. Invitees receive an invitation; private calendar participants need an Apple Account and iCloud ([share iCloud calendars on iPhone](https://support.apple.com/guide/iphone/share-icloud-calendars-iph7613c4fb/ios), [iCloud.com sharing](https://support.apple.com/guide/icloud/mm6b1a9479/icloud)).
- Calendar events support title, physical location, start/end, travel time, invitees, attachments, alerts, and time zones. Search covers title, invitees, location, and notes ([create/edit events](https://support.apple.com/en-nz/guide/iphone/iph3d110f84/ios), [time zones](https://support.apple.com/en-mide/guide/iphone/iph69525c028/ios), [search](https://support.apple.com/en-ie/guide/iphone/iph2c9ef44ad/ios)).
- Shortcuts includes an `Add New Event` action, so a custom Share Sheet Shortcut can create Calendar events ([Shortcuts share actions](https://support.apple.com/en-lb/guide/shortcuts/apdaf74d75a5/ios)).
- On iOS 17+, `EKEventEditViewController` can present a user-controlled event save without Calendar permission. Write-only authorization lets an app create events but not read or delete any event, including its own. Full access permits fetch/create/edit/delete across the user's calendars ([EventKit access](https://developer.apple.com/documentation/EventKit/accessing-the-event-store), [EventKit access-level technote](https://developer.apple.com/documentation/technotes/tn3153-adopting-api-changes-for-eventkit-in-iOS-macOS-and-watchOS)).

#### Inference

Use a dedicated shared honeymoon-period calendar only for confirmed occurrences, not as the candidate system of record. For a future custom app, first prefer user-confirmed EventKitUI or write-only access for event creation. If availability is essential, full EventKit access is unavoidable on device; compute free/busy locally and never upload titles/details. Apple does not document an EventKit free/busy-only authorization level.

#### Unknowns requiring hands-on validation

- Does an editable shared iCloud calendar meet both partners' notification and approval expectations for create/update/delete?
- What exact data remains available to each device while offline, and how do conflicting edits resolve?
- Can EventKitUI prefill every needed field while preserving a clear final user confirmation?
- Is either partner non-Apple or unwilling to use iCloud Calendar, which would invalidate the lowest-burden composition?

### Google Calendar + Calendar API

#### Verified facts

- A calendar owner can share a calendar and grant free/busy-only, full-detail, event-editing, or event-editing-plus-sharing permissions. Free/busy sharing hides names and details ([calendar sharing](https://support.google.com/calendar/answer/37082?hl=en-GB)).
- Google Calendar's Find a time compares guest calendars only when those calendars have been shared. Gemini-suggested times require an eligible paid Workspace plan and is therefore not part of the free baseline ([Find a time](https://support.google.com/calendar/answer/6294878?co=GENIE.Platform%3DDesktop&hl=EN), [Gemini suggested times](https://support.google.com/calendar/answer/16690875?hl=en)).
- `freeBusy.query` returns busy start/end intervals and supports narrow free/busy scopes. `events.insert` creates an event and supports event-oriented scopes; it accepts title, description, location, start/end/time zone, recurrence-related fields, attendees, visibility, transparency, and attachments ([free/busy API](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query), [event insertion](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert)).
- The Google Calendar iOS app can find/create/edit/respond to events offline and sync later. It cannot email guests while offline ([offline help](https://support.google.com/calendar/answer/1340696?co=GENIE.Platform%3DiOS&hl=en)).
- Google calendars can sync into Apple's built-in Calendar app. Some Google-specific features, including creating new Google calendars and room scheduling, do not work there ([Apple Calendar sync](https://support.google.com/calendar/answer/99358?co=GENIE.Platform%3DiOS&hl=en)).
- Standard Calendar API usage currently has no additional charge below published quotas. Google says charges above a daily threshold are planned later in 2026, with at least 90 days' notice. Current default limits are 10,000 requests/minute/project, 600/minute/user/project, and a 1,000,000-request daily no-charge threshold ([API usage limits](https://developers.google.com/workspace/calendar/api/guides/quota)).
- Reading Calendar is a sensitive OAuth scope example. A public app may need Google verification, narrow scopes, a privacy policy, domain verification, justification, and a demonstration; the stated review can take up to 10 days ([sensitive-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)).
- Google says calendar entries are encrypted in transit and at rest, and stored on-device to support offline access ([Calendar privacy basics](https://support.google.com/calendar/answer/10366125?hl=en)).

#### Inference

For a custom composition, the most privacy-preserving Google design is: each person authorizes only free/busy access for availability; confirmed plans are written to a separate shared honeymoon-period calendar using the narrowest event scope; the canonical idea record remains elsewhere. This avoids ingesting unrelated event details, but OAuth verification and cross-account consent remain real product work. If both people already use Google Calendar, manual free/busy sharing plus one shared plan calendar is a viable no-cost control for the bake-off.

#### Unknowns requiring hands-on validation

- Do both partners have personal Google accounts and calendars accurate enough for free/busy suggestions?
- Can a shared secondary honeymoon-period calendar be created once on desktop and then managed comfortably from Apple Calendar on iPhone?
- Which exact OAuth scope combination would satisfy free/busy plus writes to only an app-created/shared calendar, and would Google classify the final combination as sensitive for external users?
- How should event ownership, attendee invitations, updates, cancellation, recurrence, reminders, and conflicts behave when either partner initiates the plan?

## Recommended bake-off actions

1. **Trial Howbout first, with synthetic data only.** Time-box Share Sheet capture, one invite, one undated restaurant, one one-time event, one general poll, one time poll, privacy defaults, one external-calendar free/busy check, one confirmed plan, edit/delete lifecycle, and export. Do not grant access to real calendars; create a synthetic test calendar if hands-on approval is given.
2. **Run a no-install calendar control.** Compare one shared iCloud calendar (if both use iCloud) against one shared Google Calendar using synthetic events and free/busy-only personal-calendar sharing.
3. **Test Reclaim only if the first two show that availability selection is the dominant friction.** Begin with a free one-person Scheduling Link and synthetic calendar; do not upgrade or connect private calendars without approval.
4. **Keep capture and scheduling decisions separate.** None of these sources supports replacing the verified Reminders + Beli capture baseline before hands-on capture testing.

## Decision impact

The calendar lane does not justify selecting an all-in-one winner from source evidence alone. It narrows the next experiment to Howbout versus native shared-calendar controls. Reclaim should remain a conditional benchmark, and EventKit/Google Calendar API should remain implementation options only after the bake-off defines whether the minimum requirement is user-confirmed event creation, private free/busy suggestions, or full lifecycle synchronization.
