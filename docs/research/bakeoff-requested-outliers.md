# Requested outlier bake-off: Posteady and Privacy AI

- Status: both requested candidates eliminated on relevance; no replacement added
- Accessed: 2026-07-15
- Region: United States
- Candidates evaluated: Posteady and Privacy AI
- Governing rubric: [Existing-app bake-off](existing-app-bakeoff.md)
- Research boundary: current first-party product pages, documentation, legal/privacy disclosures, and the United States App Store listing; no account, trial, private data, or paid action was used

## Outcome

Neither requested outlier is a survivor for the honeymoon-period workflow.

- **Posteady** is a social-media marketing product. Its mobile capture is relevant as a pattern, but it turns links into social-post drafts and its calendar schedules publication, not dates. The reviewed documentation does not establish independent voting, a venue model, availability composition, or personal calendar writes. Eliminate it from the bake-off.
- **Privacy AI** is a general-purpose local/remote AI client. It has unusually broad iOS Share Sheet capture, offline processing, export, place search, and Apple Calendar actions, but the reviewed documentation does not establish partner invitations, a shared database, per-person voting, deterministic ranking, or venue deduplication. Eliminate it as a product candidate; retain only its local-processing and Share Extension patterns as evidence.

No replacement candidate was added. The governing bake-off already advances the
clearly relevant Tavola, Soonish, Mapstr, Howbout, and Notion lanes to scoped
validation. This outlier review found no evidence in the two requested products
that warrants adding a new full-score lane. That is a ticket-scoped disposition,
not a claim that no other product exists; an exhaustive market scan was outside
this ticket.

## Evidence labels and relevance screen

- **Verified** means a current first-party source directly documents the capability or limit.
- **Inference** means the conclusion follows from documented primitives but is not promised as a honeymoon-period workflow.
- **Unknown** means the documentation cannot resolve the behavior.
- **Not established** means the bounded documentation review did not supply affirmative evidence; it does not prove that a capability is absent.

This is a relevance screen, not full scoring. The governing bake-off requires the
17-category, zero-to-three rubric, cited hands-on observations for interaction
behavior, and a 34/51 threshold. Neither product merits that full trial and score:
the first-party evidence already places Posteady in a different product domain,
while Privacy AI does not establish the must-have two-person invitation, shared
editable record, or independent-preference workflow. Assigning numeric scores from
documentation alone would overstate what was validated.

## Rubric-aligned relevance matrix

| Criterion | Posteady | Privacy AI | Evidence and assessment |
| --- | --- | --- | --- |
| Arbitrary link capture | Partial pattern | Documented pattern | **Verified:** Posteady's iPhone Shortcut accepts a shared link and opens a signed-in browser flow. Privacy AI's Action Extension accepts documents, images, URLs, and text from any app. **Inference:** Privacy AI is broader, while Posteady is link-oriented and purpose-built to create marketing content. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Share Sheet quality | Unknown pending hands-on use | Unknown pending hands-on use | **Verified:** Posteady requires adding an Apple Shortcut; the destination creates a social draft or idea. Privacy AI's native extension can select a prompt, model, tools, and destination chat folder. **Inference:** each flow has plausible friction, but interaction quality cannot be scored without the fixture-only test required by the governing policy. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Restaurant and event support | Not established | Partial pattern | **Verified:** Posteady documents link-to-social-content generation. Privacy AI documents URL/document processing and a `search_places` tool. **Inference:** Privacy AI could summarize a restaurant or event link; the reviewed sources do not establish a persistent restaurant/event entity or occurrence model. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Two-person invitation | Unrelated paid team seats | Not established | **Verified:** Posteady's paid Pro and Team plans include multiple user seats and role-based permissions. Privacy AI advertises no account/backend and syncs through personal iCloud devices. **Inference:** Posteady's access is for a marketing workspace; the reviewed Privacy AI sources do not establish a partner invitation or shared workspace. [Posteady pricing/features](https://www.posteady.com/), [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Independent vote or score | Not established | Not established | The reviewed sources document social-post analytics for Posteady and AI-response comparison for Privacy AI's multi-model council. Neither primitive establishes two people's independently owned preferences. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Sorting | Not established | Not established | The reviewed sources document marketing calendars/analytics in Posteady and pinned, searchable, foldered chats in Privacy AI. They do not establish sortable shared candidate properties or consensus ranking. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Notes | Not established | Personal-chat pattern | Posteady documents marketing ideas and drafts. Privacy AI documents persistent chats and per-chat workspace files, but the reviewed sources do not establish shared two-person notes. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Structured happy-hour, special, cuisine, and address metadata | Not established | Composition pattern | Posteady documents marketing content fields. Privacy AI can generate JSON/Markdown, maintain per-chat files, and search places, but the reviewed sources do not establish a validated record schema for the required fields. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Calendar availability and writes | Different-domain calendar | Documented personal-calendar pattern | Posteady's calendar schedules social-post publication. Privacy AI documents querying availability and creating, modifying, moving, and deleting Apple Calendar events for the device user; the reviewed sources do not establish a privacy-preserving intersection with a partner's calendar. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Urgency | Not established | AI-assistance pattern | Privacy AI's Share Extension can extract action items and deadlines. **Inference:** a chat could reason about urgency, but that does not establish the explicit, deterministic, shared ranking required by the product invariant. [Posteady product](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |
| Venue dedupe | Not established | Not established | The reviewed sources do not establish normalized-link or venue-identity deduplication. Privacy AI's documented place search alone does not establish duplicate detection. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Offline behavior | Not established | Documented local-model pattern; extension unknown | Posteady's iPhone handoff opens its website and expects the user to be signed in. Privacy AI documents offline local models and on-device features. **Unknown:** a no-network Share Extension save was not exercised. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html) |
| Export and API | Different-domain export/API | Personal-chat export/API pattern | **Verified:** Posteady downloads posts and metrics as CSV/JSON and offers REST API/MCP access for social publishing. Privacy AI exports chats in several formats and includes a local OpenAI-compatible gateway. The reviewed sources do not establish export of a shared honeymoon-period database. [Posteady pricing/features](https://www.posteady.com/), [Posteady API docs](https://www.posteady.com/docs/en), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Privacy | Documented policy; not trialed | Conflicting developer disclosures | Posteady's policy describes collection of account/contact data, connected social-account tokens and content, browser/device logs, cookies and web-beacon data, plus sharing with service providers and affiliates. Privacy AI's policy says there is no backend, app data stays on-device/personal iCloud, and optional API traffic goes directly to selected providers. Its developer-submitted US App Store label separately says identifiers and usage data may be used for tracking. Apple explicitly says this label is not verified and may vary by feature, so the discrepancy is an unresolved documentation risk—not proof that tracking occurs. [Posteady privacy](https://www.posteady.com/privacy-policy), [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html), [Privacy AI US App Store disclosure](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |
| Partner burden | Outside target | Outside target | Posteady documents accounts, Shortcut setup, browser sign-in, and paid multi-user marketing features. Privacy AI requires iOS 18+, lists a 3.2 GB download, and documents personal-device/iCloud continuity rather than invitation-based partner use. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Posteady pricing/features](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |
| Free cost | Documented restricted free tier; fitness unknown | Documented free local tier | Posteady publishes a seven-day trial with no credit card. Its Terms §§4.5 and 4.7 say an expired trial or ended paid subscription falls back to a restricted free tier with limited access; the reviewed sources do not define that tier's capabilities, so whether it clears any bake-off gate is **Unknown**. Privacy AI documents local models, Share Extension, iCloud sync, built-in tools, Apple Calendar tooling, and export in its free tier. No trial was started. [Posteady pricing/features](https://www.posteady.com/), [Posteady terms](https://www.posteady.com/terms-of-service), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Paid cost | Documented subscription | Optional Pro subscription | Posteady's displayed annual-billing prices are Creator $13/month, Pro $34/month, and Team $69/month; Pro includes three seats. Privacy AI Pro is optional for cloud providers, custom APIs, and MCP and is listed in the US App Store at $3.99 weekly, $9.99 monthly, or $99.99 yearly. No paid action was taken. [Posteady pricing/features](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |

## Posteady relevance decision

### Verified product purpose and US availability

Posteady calls itself a marketing automation tool for founders and agencies. Its documented workflow learns brand voice, discovers content ideas, creates posts, schedules and publishes them to social networks, and analyzes performance. Its terms define the service as a social-media management tool, and state that it is intended for visitors in the United States. It is therefore currently reachable and regionally intended, but its domain is unambiguously social publishing. [Posteady product](https://www.posteady.com/), [Posteady terms](https://www.posteady.com/terms-of-service)

The iPhone feature is a useful implementation pattern: because its web app cannot join the iOS Share Sheet, Posteady supplies an Apple Shortcut that accepts a link and opens a signed-in browser chooser. The result is an AI-generated social-post draft or a saved content idea, not a restaurant/event record. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content)

### Elimination

Eliminate Posteady without a hands-on trial. Its apparent matches—ideas, Share Sheet capture, collaboration, calendar, and API—belong to a different domain:

- an idea is a source for a marketing post;
- collaboration is paid team/agency access;
- the calendar schedules content publication;
- analytics rank social performance, not couple preference;
- the API publishes, schedules, and lists social posts.

**Inference:** repurposing it would require supplying nearly the entire honeymoon-period data and planning model while paying for an unrelated service. No hands-on comparison established that its capture Shortcut improves on the canonical Shortcut.

## Privacy AI relevance decision

### Verified product purpose and US availability

Privacy AI is a general-purpose AI client for local models and user-configured remote services. Its current United States App Store listing confirms availability for iPhone and iPad, requires iOS/iPadOS 18 or later, lists a 3.2 GB download, and describes local processing, a Share Extension, Apple Calendar tools, iCloud sync, and multi-format export. [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421)

Its strongest relevant primitives are real:

- the Share Extension accepts URLs, text, images, and documents from any app;
- a user can select a local model, prompt, tools, and chat folder during sharing;
- local models can work offline;
- `search_places` can retrieve place information;
- `manage_calendar` can query availability and create, modify, or delete Apple Calendar events;
- chats export in seven documented formats.

[Privacy AI feature inventory](https://privacyai.acmeup.com/)

### Privacy disclosure discrepancy

The developer privacy policy says AcmeUp runs no backend, collects no identifiable personal data, stores app data locally or in the user's personal iCloud, and uses no tracking technologies. It also says a random anonymized Apple device identifier may be collected for aggregate promotional statistics unless disabled. The current US App Store privacy label, which Apple identifies as developer-submitted and not verified by Apple, separately says identifiers and usage data may be used to track users across other companies' apps and websites and that identifiers and product-interaction data may be collected for analytics. [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html), [Privacy AI US App Store disclosure](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421)

The two AcmeUp disclosures do not reconcile on their face. **Unknown:** the source
review cannot determine whether either disclosure is stale, overly broad, or
feature-dependent, and it does not establish that tracking actually occurs. Any
reconsideration would require the developer to reconcile the disclosures before
private relationship, location, or calendar data is used. Optional cloud APIs and
MCP servers also apply their own privacy policies and, according to AcmeUp's
policy, receive user-configured traffic directly from the device.

### Elimination

Eliminate Privacy AI as a bake-off product without a hands-on trial. **Inference:** a custom prompt could extract a URL into JSON, rank a Markdown list, and create a calendar event, but that would be an AI-assisted personal workflow rather than a two-person product. The developer documents no accounts or backend and describes iCloud sync as continuity across a user's devices. The reviewed sources do not establish partner invitations, a shared record across two Apple accounts, independently owned votes, a deterministic urgency formula, or venue identity.

Its features remain useful **pattern evidence** for a future native design: broad Share Extension input, optional on-device extraction, explicit tool permissions, local-first storage, multi-format export, and direct EventKit-style calendar actions.

## Hands-on unknowns

No hands-on trial is recommended because both candidates fail relevance before interaction quality matters. If either is reconsidered, the minimum unresolved checks are:

1. **Posteady:** whether its Shortcut preserves the exact source URL after browser handoff, what is exportable when the trial ends, and whether account deletion removes captured source content.
2. **Privacy AI:** whether Share Extension capture preserves a raw URL without forcing model generation, whether a local model and extension work with no network, and whether a synthetic structured file can be updated deterministically rather than rewritten probabilistically.
3. **Privacy AI:** whether any iCloud mechanism can share app data between two different Apple accounts; no current first-party source reviewed here documents it.
4. **Privacy AI:** why the App Store tracking label and developer privacy policy do not reconcile.

Use only synthetic fixtures if these checks are ever approved. Do not connect real social accounts, private calendars, cloud AI providers, or paid plans for this bake-off.

## Recommendation

Close the requested-outlier lane with both candidates eliminated and no replacement. Preserve Posteady's iPhone Shortcut/browser handoff and Privacy AI's local Share Extension plus calendar tooling as feature-pattern evidence, not product finalists.
