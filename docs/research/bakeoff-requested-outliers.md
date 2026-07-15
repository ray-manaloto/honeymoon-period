# Requested outlier bake-off: Posteady and Privacy AI

- Status: both requested candidates eliminated on relevance; no replacement added
- Accessed: 2026-07-15
- Region: United States
- Candidates evaluated: Posteady and Privacy AI
- Governing rubric: [Existing-app bake-off](existing-app-bakeoff.md)
- Research boundary: current first-party product pages, documentation, legal/privacy disclosures, and the United States App Store listing; no account, trial, private data, or paid action was used

## Outcome

Neither requested outlier is a survivor for the honeymoon-period workflow.

- **Posteady** is a social-media marketing product. Its mobile capture is relevant as a pattern, but it turns links into social-post drafts and its calendar schedules publication, not dates. It has no documented independent voting, venue model, availability composition, or personal calendar write. Eliminate it from the bake-off.
- **Privacy AI** is a general-purpose local/remote AI client. It has unusually broad iOS Share Sheet capture, offline processing, export, place search, and Apple Calendar actions, but it has no documented partner invitation, shared database, per-person voting, deterministic ranking, or venue deduplication. Eliminate it as a product candidate; retain only its local-processing and Share Extension patterns as evidence.

No replacement candidate was added. The bounded first-party evidence did not show a missing product whose fit materially warranted a third full evaluation, and an open-ended market scan would violate the ticket scope.

## Evidence labels and provisional scoring

- **Verified** means a current first-party source directly documents the capability or limit.
- **Inference** means the conclusion follows from documented primitives but is not promised as a honeymoon-period workflow.
- **Unknown** means the documentation cannot resolve the behavior.
- Provisional score: **2** = verified native fit; **1** = partial fit, repurposing/custom composition, or material unknown; **0** = no documented fit or a direct conflict with the workflow.

The matrix is a relevance aid, not a binding pass/fail threshold. Weighting and the decision threshold remain deferred to the human-in-the-loop timebox and threshold ticket.

## Full-rubric relevance matrix

| Criterion | Posteady | Privacy AI | Evidence and assessment |
| --- | ---: | ---: | --- |
| Arbitrary link capture | 1 | 2 | **Verified:** Posteady's iPhone Shortcut accepts a link shared from apps such as Safari, Instagram, and YouTube, then opens a signed-in browser flow. Privacy AI's Action Extension accepts documents, images, URLs, and text from any app. **Inference:** Privacy AI is broader, while Posteady is link-oriented and purpose-built to create marketing content. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Share Sheet quality | 1 | 1 | **Verified:** Posteady requires adding a ready-made Apple Shortcut; the destination is a browser chooser that creates a draft or idea. Privacy AI's native extension can select a prompt, local/remote model, tools, and destination chat folder and remembers the folder. **Inference:** Privacy AI's extension is capable but creates an AI chat, not a fast durable honeymoon-period record; Posteady adds Shortcut and browser-sign-in friction. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Restaurant and event support | 0 | 1 | **Verified:** Posteady documents link-to-social-content generation, not restaurant or event handling. Privacy AI documents URL/document processing and a `search_places` tool. **Inference:** Privacy AI could summarize a restaurant or event link, but no source documents a persistent restaurant/event entity or occurrence model. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Two-person invitation | 1 | 0 | **Verified:** Posteady's paid Pro and Team plans include multiple user seats and role-based permissions. Privacy AI advertises no account/backend and syncs through a user's personal iCloud devices. **Inference:** Posteady supports team access only inside an unrelated paid marketing workspace; Privacy AI has no documented partner invitation or shared workspace. [Posteady pricing/features](https://www.posteady.com/), [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Independent vote or score | 0 | 0 | No reviewed first-party source documents per-person honeymoon-period votes or scores in either product. Posteady's analytics measure social-post performance; Privacy AI's multi-model council compares AI responses, not two users' preferences. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Sorting | 0 | 0 | No reviewed first-party source documents sortable shared candidate properties or consensus ranking. Posteady's calendar and analytics order marketing content; Privacy AI pins, searches, and folders chats. Those are different domain primitives. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Notes | 0 | 1 | Posteady stores marketing ideas and drafts, not documented per-idea collaborative notes. Privacy AI persists chats and per-chat workspace files and can export them, but they are personal AI conversations rather than shared notes. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Structured happy-hour, special, cuisine, and address metadata | 0 | 1 | Posteady documents marketing content fields, not date metadata. Privacy AI can generate JSON/Markdown, maintains per-chat files, and offers place search, but no source documents a schema, validation, or record-level fields for these values. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Calendar availability | 0 | 1 | Posteady's content calendar schedules social-post publication and is not personal availability. Privacy AI's `manage_calendar` tool can query Apple Calendar and check the device user's availability. No source documents privacy-preserving intersection with a partner's calendar. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Calendar writes | 0 | 2 | Posteady schedules posts rather than external date events. Privacy AI directly documents creating, modifying, moving, and deleting Apple Calendar events through `manage_calendar`. [Posteady terms](https://www.posteady.com/terms-of-service), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Urgency | 0 | 1 | Posteady schedules content but has no honeymoon-period deadline ranking. Privacy AI's Share Extension can extract action items and deadlines, and an AI chat could reason about urgency. **Inference:** this would be model-generated and not the explicit, deterministic, shared ranking required by the product invariant. [Posteady product](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |
| Venue dedupe | 0 | 0 | No reviewed first-party source promises normalized-link or venue-identity deduplication in either product. Privacy AI's place search does not establish duplicate detection. [Posteady product](https://www.posteady.com/), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Offline behavior | 0 | 2 | Posteady's iPhone handoff opens its website and explicitly expects the user to be signed in; no offline mode was documented. Privacy AI documents fully offline local models and on-device features, with personal iCloud sync optional. **Unknown:** a no-network Share Extension save was not exercised. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html) |
| Export and API | 1 | 2 | **Verified:** Posteady downloads posts and metrics as CSV/JSON and offers paid REST API/MCP access for social publishing. Privacy AI exports chats to text, Markdown, HTML, JSON, PDF, EPUB, or image and includes a local OpenAI-compatible gateway. Neither documents a honeymoon-period API or shared data export. [Posteady pricing/features](https://www.posteady.com/), [Posteady API docs](https://www.posteady.com/docs/en), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Privacy | 1 | 1 | Posteady collects account/contact data, connected social-account tokens and content, browser/device logs, cookies and web-beacon data, and may share personal information with service providers and affiliates. Privacy AI's policy says there is no backend, data stays on-device/personal iCloud, and optional API traffic goes directly to user-selected providers. However, its US App Store disclosure says identifiers and usage data may be used to track users, directly conflicting with the policy's claim that it does not use tracking technologies. The mismatch prevents a higher confidence score. [Posteady privacy](https://www.posteady.com/privacy-policy), [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html), [Privacy AI US App Store disclosure](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |
| Partner burden | 0 | 0 | Posteady requires accounts, a Shortcut installation, browser sign-in, and paid multi-user marketing features. Privacy AI requires iOS 18+, a 3.2 GB app, local-model/device setup for offline use, and manual export/sharing; it offers no invitation-based couple workflow. [Posteady Mobile Share](https://www.posteady.com/features/share-to-content), [Posteady pricing/features](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |
| Free cost | 0 | 2 | Posteady publishes a seven-day trial with no credit card, not a permanent free plan. Privacy AI's local models, Share Extension, iCloud sync, built-in tools, Apple Calendar tool, and export are documented as free. No trial was started. [Posteady pricing/features](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421), [Privacy AI feature inventory](https://privacyai.acmeup.com/) |
| Paid cost | 0 | 1 | Posteady's currently displayed annual-billing prices are Creator $13/month, Pro $34/month, and Team $69/month; useful collaboration begins with Pro's three seats, making it disproportionate for this workflow. Privacy AI Pro is optional for cloud providers, custom APIs, and MCP and is listed in the US App Store at $3.99 weekly, $9.99 monthly, or $99.99 yearly. No paid action was taken. [Posteady pricing/features](https://www.posteady.com/), [Privacy AI US App Store](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421) |

- **Posteady provisional evidence-fit: 5/36.** Its few points describe generic capture, paid team access, export/API, and baseline privacy controls, not end-to-end date planning.
- **Privacy AI provisional evidence-fit: 18/36.** Its score reflects strong device integration, but it receives zeroes on the decisive shared-product capabilities.

These totals are not pass thresholds and should not be compared mechanically with other lanes unless they use the same definitions.

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

Repurposing it would require building nearly the entire honeymoon-period data and planning model while paying for an unrelated service. Its capture Shortcut does not materially improve on the existing canonical Shortcut.

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

### Privacy discrepancy

The developer privacy policy says AcmeUp runs no backend, collects no identifiable personal data, stores app data locally or in the user's personal iCloud, and uses no tracking technologies. It also says an anonymized Apple device identifier may be collected for aggregate promotional statistics unless disabled. The current US App Store disclosure, by contrast, says identifiers and usage data may be used to track users across other companies' apps and websites. [Privacy AI privacy policy](https://privacyai.acmeup.com/docs/policy/privacy.html), [Privacy AI US App Store disclosure](https://apps.apple.com/us/app/privacy-ai-powerful-chatbot/id6738392421)

That first-party contradiction is unresolved. It may reflect a stale policy or conservative App Store disclosure, but this is an **unknown**, not evidence that tracking is absent. Any reconsideration would require the developer to reconcile the disclosures before private relationship, location, or calendar data is used. Optional cloud APIs and MCP servers also apply their own privacy policies and receive data directly from the device.

### Elimination

Eliminate Privacy AI as a bake-off product without a hands-on trial. A custom prompt could extract a URL into JSON, rank a Markdown list, and create a calendar event, but that would be an AI-assisted personal workflow rather than a two-person product. The documented architecture deliberately has no user accounts or shared backend, and iCloud sync is described as continuity across one user's devices—not partner collaboration. There is no invitation, shared record, independently owned votes, deterministic urgency formula, or venue identity.

Its features remain useful **pattern evidence** for a future native design: broad Share Extension input, optional on-device extraction, explicit tool permissions, local-first storage, multi-format export, and direct EventKit-style calendar actions.

## Hands-on unknowns

No hands-on trial is recommended because both candidates fail relevance before interaction quality matters. If either is reconsidered, the minimum unresolved checks are:

1. **Posteady:** whether its Shortcut preserves the exact source URL after browser handoff, what is exportable when the trial ends, and whether account deletion removes captured source content.
2. **Privacy AI:** whether Share Extension capture preserves a raw URL without forcing model generation, whether a local model and extension work with no network, and whether a synthetic structured file can be updated deterministically rather than rewritten probabilistically.
3. **Privacy AI:** whether any iCloud mechanism can share app data between two different Apple accounts; no current first-party source reviewed here documents it.
4. **Privacy AI:** why the App Store tracking disclosure conflicts with the developer privacy policy.

Use only synthetic fixtures if these checks are ever approved. Do not connect real social accounts, private calendars, cloud AI providers, or paid plans for this bake-off.

## Recommendation

Close the requested-outlier lane with both candidates eliminated and no replacement. Preserve Posteady's iPhone Shortcut/browser handoff and Privacy AI's local Share Extension plus calendar tooling as feature-pattern evidence, not product finalists.
