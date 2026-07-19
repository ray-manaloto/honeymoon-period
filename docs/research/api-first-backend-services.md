# API-first backend platforms and growth path

- Status: complete; Cloudflare Workers + D1 selected for the fixed-two-participant MVP
- Last verified: 2026-07-15
- Accessed: 2026-07-15
- Region: United States; no account creation or deployment was performed
- Research boundary: current first-party documentation, pricing pages, and source/licensing documentation only
- Question: should the product expose a stable HTTPS API for link capture and shared data, which genuinely usable free backend should provide compute and storage, and which path preserves the most work if it grows beyond a two-person MVP?

## Answer

**An API-first backend is the best next MVP architecture for the newly stated goal, provided the first slice stays deliberately small.** The desired durable asset is no longer a particular list UI; it is a private, queryable record of captures, honeymoon-periods, actor-owned votes/scores, notes, metadata, and ranking inputs. A narrow API separates that domain from the first client (an iOS Shortcut) and permits a web or native UI later without migrating out of a UI vendor first.

This conclusion began as an inference from the product requirements and verified service primitives below. The owner accepted it for implementation in [ADR-0002](../adr/0002-api-first-web-mvp.md) after the local vertical slice proved the core behavior. Preserve the Reminders + Beli Shortcut as baseline evidence while the service is productized.

There are three different winners:

1. **Best fixed-two-person service:** Cloudflare Workers + D1. It is the smallest operational unit, the existing vertical slice already works locally, and the free limits are far above this workload.
2. **Best single-provider foundation for an invite-based product:** Supabase. Standard Postgres, Auth, RLS, Realtime, Storage, and Edge Functions remove identity and authorization work that Cloudflare otherwise leaves to the application.
3. **Best no-regrets architecture while the destination is uncertain:** keep the versioned `/v1` HTTP API and domain model as the client contract, but isolate storage and identity behind adapters. That permits D1 now, Supabase Postgres later, or a Worker-fronted Supabase composition without replacing the Shortcut or future clients.

The cheapest time to choose Supabase is **before** production data and end-user identities exist. If self-service invitations, more than one household, account recovery, or a realtime app are likely in the next year, prefer Supabase now. If this is expected to remain a private couple utility for at least the next year, deploy the current Workers + D1 slice and retain export/contract tests. Do not use ChatGPT Sites as the core API contract in its current public beta; it can become a presentation layer.

## Why an API boundary fits

### Verified inputs

- Apple documents that Shortcuts' `Get Contents of URL` action can issue `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests and can send JSON bodies for write methods. That is sufficient to prototype capture and mutation without a native app. [Apple Shortcuts web API guide](https://support.apple.com/en-au/guide/shortcuts/apd58d46713f/ios)
- Workers accepts ordinary HTTPS requests and D1 supplies SQL storage through a Worker binding. D1 supports indexed queries, migrations, local development, and SQL import/export. [Workers runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/), [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/), [D1 indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/), [D1 import/export](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- Supabase, Convex, Firebase, and Vercel/Neon can all expose HTTP-accessible data or functions, but their free-plan and operational tradeoffs differ materially. The comparison below does not assume that a client-visible administrative key is secret.

### Inference

The smallest useful vertical slice is:

1. A Share Sheet Shortcut sends the exact source URL and a client-generated idempotency key in a JSON `POST` body.
2. The server authenticates the participant, validates and size-limits the URL, stores the capture before enrichment, and returns the canonical record ID.
3. Separate endpoints let each participant update only their own vote/score and let authorized participants edit notes or structured metadata.
4. A query endpoint returns stable JSON with explicit sort inputs and a computed rank explanation.
5. Any future web, Sites, or native UI consumes this API rather than becoming the source of truth.

This keeps capture fast when enrichment fails, preserves the exact source URL and provenance, and makes ranking inspectable. It also creates custom code, schema migration, authentication, backup, abuse-control, and operations obligations; the MVP should therefore time-box only this slice before expanding.

## Security boundary for an iOS Shortcut

An internet-reachable API should be **publicly addressable, not anonymously writable**.

- A token distributed with or entered into a Shortcut is a client credential and can be recovered by the device user. It must never be a database administrator key, provider service-role key, or one shared server secret.
- For a fixed two-person prototype, issue one random, revocable, least-privilege token per participant. Store only a one-way token digest server-side, associate it with an actor ID, compare in constant time, and authorize each vote/score write against that actor ID. Cloudflare Workers implements Web Crypto and a timing-safe comparison extension. [Workers Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- Send the credential in an authorization header if the target Shortcuts version exposes header configuration; otherwise send it in the JSON body. **Hands-on verification is still required** because the cited Apple guide documents HTTP methods and JSON bodies but not the current header editor. Never put credentials or source URLs containing sensitive query data into the API endpoint's query string.
- Keep deployment/provider credentials only in encrypted server-side secret bindings. Cloudflare explicitly distinguishes encrypted Worker secrets from ordinary configuration and warns not to store sensitive values in Wrangler variables. [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/), [Workers environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- Apply request-body limits, URL-scheme allowlisting (`https`, optionally `http` only by explicit decision), rate limits, idempotency, prepared statements, generic error responses, and log redaction. Do not fetch arbitrary private-network destinations during enrichment; URL fetching needs a separate SSRF-focused design.
- A two-token bootstrap is appropriate only while the participants are known and tokens can be manually revoked. It is not a substitute for end-user authentication, session expiry, account recovery, or invitation flows.

## Minimal domain and API shape

This is a research-level shape, not an approved specification.

| Resource | Minimum durable fields |
| --- | --- |
| `actors` | opaque ID, display role, token digest, status, timestamps |
| `honeymoon_periods` | opaque ID, status, title, kind, normalized URL, metadata JSON, timestamps |
| `captures` | opaque ID, honeymoon-period ID, actor ID, exact source URL, source app/provenance when supplied, idempotency key, enrichment status, timestamp |
| `preferences` | honeymoon-period ID, actor ID, categorical vote, numeric score, timestamp; unique on honeymoon-period + actor |
| `notes` | opaque ID, honeymoon-period ID, author actor ID, body, timestamps |
| `ranking_inputs` | explicit urgency, special deadline, availability or other configured values used by a deterministic rank expression |

Suggested first endpoints:

- `POST /v1/captures` with `{ "source_url": "…", "client_request_id": "…" }`
- `GET /v1/honeymoon-periods?status=active&sort=rank`
- `GET /v1/honeymoon-periods/{id}`
- `POST /v1/honeymoon-periods/{id}/preference-changes` with a client request ID
  for the authenticated actor only (this supersedes the exploratory non-idempotent
  preference route; no compatibility endpoint is retained)
- `POST /v1/honeymoon-periods/{id}/notes`
- `PATCH /v1/honeymoon-periods/{id}` for allowed shared metadata

Return rank components, not just a number. Save first and mark enrichment `pending`; never make third-party parsing a prerequisite for a successful capture. Normalize only for duplicate checks and always retain the exact source URL.

## Service comparison

All free-tier facts below were verified on 2026-07-15 from first-party sources. “Free” means a persistent $0 plan with documented hard allowances, not expiring promotional credits. Availability means the provider documents US operation or a US region; it does not imply an SLA on a free plan.

| Candidate | API and data fit | Current free allowance most relevant here | Auth/security fit for Shortcut | Local development and portability | Assessment |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare Workers + D1** | Custom Fetch API routes plus SQLite-compatible relational queries, indexes, constraints, transactions/batches, and deterministic sorting. One vendor and one deployable. | Workers: 100,000 requests/day, 10 ms CPU/invocation, 128 MB memory. D1: 5 million rows read/day, 100,000 rows written/day, 500 MB/database, 5 GB/account, 10 databases, seven-day Time Travel; D1 has no data-transfer charge. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) | No product-specific end-user auth is required or supplied. A Worker can implement two scoped token digests now; server secrets remain in bindings. This is small but custom security code. | Wrangler runs a local Worker and the same D1 engine, applies migrations, and exports schema/data as SQL. D1 is SQLite-based, improving data/schema portability, though Worker bindings and runtime APIs are Cloudflare-specific. [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/), [D1 import/export](https://developers.cloudflare.com/d1/best-practices/import-export-data/) | **Primary choice.** Best fit for a tiny fixed-user HTTP API; unlike Supabase's pricing page, the reviewed Cloudflare free-plan docs do not describe inactivity suspension. The 10 ms free CPU ceiling argues against synchronous heavy HTML parsing, not against simple validation and SQL. |
| **Supabase** | Dedicated Postgres, auto-generated REST API, Auth, RLS, Edge Functions, Realtime, and SQL sorting/aggregation. [Supabase platform](https://supabase.com/docs/guides/platform), [Data REST API](https://supabase.com/docs/guides/api) | $0: two active projects, unlimited API requests, 50,000 MAU, 500 MB database, 5 GB egress plus 5 GB cached egress, 1 GB file storage; 500,000 Edge Function invocations. Free projects pause after one week of inactivity. [Supabase pricing](https://supabase.com/pricing), [Edge Function pricing](https://supabase.com/docs/guides/functions/pricing) | Strongest built-in fit: JWT Auth plus Postgres RLS. The publishable/anonymous key is not authorization; policies must constrain rows. Service-role keys bypass RLS and must never enter a Shortcut. [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Securing the API](https://supabase.com/docs/guides/api/securing-your-api) | Full local stack via CLI/Docker, SQL migrations, standard Postgres, and `db dump`; free projects need owner-managed off-site exports because automatic daily backups are paid-plan behavior. [Local development](https://supabase.com/docs/guides/local-development/overview), [Backups](https://supabase.com/docs/guides/platform/backups) | **Fallback.** Excellent when account lifecycle and RLS matter. For an intermittently used couple app, the one-week inactivity pause and larger local stack are meaningful friction. |
| **Convex** | TypeScript queries, transactional mutations, actions, indexes/reactivity, and explicit HTTP Actions at a `.convex.site` URL. [Functions](https://docs.convex.dev/functions/overview), [HTTP Actions](https://docs.convex.dev/functions/http-actions) | $0 hard caps include 1,000,000 function calls/month, 20 GB-hours/month of action compute, 0.5 GB database/index storage, 1 GB/month database I/O, and 1 GB file storage/egress. [Convex limits](https://docs.convex.dev/production/state/limits) | HTTP Actions accept bearer JWTs through an auth provider, or custom HTTP handling can implement prototype tokens. Request parsing/validation for HTTP Actions is the application's responsibility. | Local deployments run without an account; exports include data/files. The backend is source-available under FSL Apache 2.0 and can be self-hosted, but the data model, generated API, reactive query semantics, and functions are more Convex-specific than SQL. [Local deployments](https://docs.convex.dev/cli/local-deployments), [Export](https://docs.convex.dev/cli/reference/export), [Self-hosting](https://docs.convex.dev/self-hosting) | Fastest for a reactive TypeScript UI, but extra platform semantics provide little advantage to a Shortcut-first REST API and increase migration work. |
| **Firebase (Firestore + Functions)** | Firestore supports document queries, ordering, indexes, Auth, Security Rules, and HTTP Functions. It is mature for native clients but less natural for relational actor-owned preferences and ad hoc ranking. | Spark needs no payment method and Firestore includes 1 GiB, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, and 10 GiB outbound/month. [Firebase plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firestore pricing](https://firebase.google.com/docs/firestore/pricing) | Firebase Auth and Rules are strong for signed-in app clients. REST/server access has separate IAM implications and server libraries bypass Rules. [Rules and queries](https://firebase.google.com/docs/firestore/security/rules-query), [Rules conditions](https://firebase.google.com/docs/firestore/security/rules-conditions) | The Emulator Suite covers Auth, Firestore, Functions, and Rules. Firestore managed export/import requires billing and Blaze, weakening free portability. [Emulator Suite](https://firebase.google.com/docs/emulator-suite), [Firestore export/import](https://firebase.google.com/docs/firestore/manage-data/export-import) | **Eliminated for this no-billing compute requirement:** deploying Cloud Functions requires the Blaze plan and a linked billing account, even though local emulation and Firestore's Spark quota are free. [Functions get started](https://firebase.google.com/docs/functions/get-started) |
| **Vercel Functions + Neon Postgres** | Conventional HTTP functions plus standard Postgres; Neon also offers Auth/Data API and RLS. The composition is flexible and highly portable. | Vercel Hobby: up to 1 million function invocations, 4 CPU-hours, and 360 GB-hours provisioned memory; personal/non-commercial use only. Neon Free: 100 CU-hours/project/month, scale-to-zero after five minutes, 0.5 GB/project, 5 GB egress/month, 100 projects, 10 branches/project, and 60,000 Auth MAU. [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Neon plans](https://neon.com/docs/introduction/plans) | Custom function auth works; Neon Data API/Auth can enforce Postgres RLS. Database credentials remain server-only. [Neon RLS](https://neon.com/docs/guides/row-level-security) | Standard Postgres and ordinary function handlers are the strongest portability story. Serverless code must use an appropriate connection strategy; Neon supports pooled connections on Free. [Neon connection pooling](https://neon.com/docs/connect/connection-pooling) | **Sensible composable alternative, not the first choice.** It adds a second provider, two quota/failure surfaces, connection management, and cold starts without buying needed MVP capability. Hobby is appropriate only while this remains personal/non-commercial. |

## Expanded long-term comparison

Headline free quotas are not the primary architecture criterion. A real multi-user product will eventually need a paid availability tier, production email delivery, backups, logging, and support. The more durable comparison is what the platform makes the application own.

| Platform | What it gives us | Main advantages | Main disadvantages | Best fit here | Lock-in / exit cost |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare Workers + D1** | Edge HTTP compute, SQLite-compatible relational data, Cron Triggers, free Queues allowance, and optional R2/KV/Durable Objects | One deployable; low paid floor; no bandwidth charge for Workers/D1; strong HTTP, abuse-control, asynchronous-enrichment, and global-edge story; local Wrangler workflow; SQL export | No integrated consumer identity/invitation product; authorization and token lifecycle are custom; D1 is single-threaded per database and capped at 500 MB/database on Free and 10 GB on Paid; realtime collaboration is custom; 10 ms Free CPU ceiling | Private couple utility, capture API, background enrichment, or a sharded-per-household design | **Medium.** API/domain code and SQLite schema travel; D1 bindings, SQL details, auth middleware, Queues/R2/Durable Objects do not. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) |
| **Supabase** | Managed Postgres, generated REST/GraphQL access, Auth, database RLS, Realtime, Storage, Edge Functions, cron/extensions, local stack | Strongest relational model; standard SQL/Postgres tooling; built-in identity and recovery; database-enforced household/actor ownership; direct native/web clients are possible; easiest analytics/geospatial/calendar evolution | Free projects can pause after low activity; production begins around a $25/month project; free backups must be self-managed; default auth email service is demonstration-grade and limited to two messages/hour; production email needs external SMTP; full local stack requires Docker | Invite-based product, native/web app, multiple households, richer queries, and a team that wants one application backend | **Low-to-medium.** Tables/data are standard Postgres; Auth schema, RLS policies, Realtime, Storage, and Edge Functions are Supabase-specific. [Supabase pricing](https://supabase.com/pricing), [database overview](https://supabase.com/docs/guides/database/overview), [Auth limits](https://supabase.com/docs/guides/auth/rate-limits), [backups](https://supabase.com/docs/guides/platform/backups) |
| **Nhost** | Dedicated Postgres, Hasura GraphQL and realtime subscriptions, Auth, role-based authorization, Storage, Functions, events and IaC | Closest Supabase-class alternative; 1 GB Free Postgres, unlimited users, OAuth, realtime APIs and ten functions; standard Postgres access/export; Hasura permissions are powerful and mature; Pro includes automated backups and Grafana | Free project pauses after one week; only one active project/member; GraphQL-first surface is less natural for the Shortcut unless wrapped by a Function; Hasura metadata/permissions and Nhost Auth are platform-specific; Pro starts at $25 and PITR is a separate $100 add-on | GraphQL-first product whose team already wants Hasura, or a strong Supabase alternative when GraphQL is a positive requirement | **Low for tables, medium for application services.** Postgres data travels; Hasura metadata, GraphQL operations, Auth claims, Functions and Storage integration need migration. [Nhost pricing](https://nhost.io/pricing), [Nhost Auth](https://docs.nhost.io/products/auth) |
| **Convex** | Reactive document database, transactional TypeScript queries/mutations, HTTP actions, realtime subscriptions, files, cron and durable scheduled functions | Excellent TypeScript developer experience; realtime is automatic; scheduled mutations have strong execution guarantees; local backend and downloadable logical backups exist | Non-SQL data/query model; authorization remains application logic; analytics and ad-hoc relational ranking are weaker; function/data model is highly platform-specific; periodic backups require Pro | A realtime TypeScript-first collaborative UI where rapid frontend iteration outweighs portability | **High.** Stable HTTP clients can remain, but schema, queries, mutations, scheduling, subscriptions, and backend code need rewriting. [Convex limits](https://docs.convex.dev/production/state/limits), [scheduled functions](https://docs.convex.dev/scheduling/scheduled-functions), [backups](https://docs.convex.dev/database/backup-restore) |
| **Firebase** | Firestore, Firebase Auth, Security Rules, realtime/offline client SDKs, Storage, analytics/crash tooling, and Cloud Functions on Blaze | Mature iOS/mobile SDKs; excellent offline/realtime behavior; broad Google ecosystem and operational maturity | Document model is awkward for relational actor-owned preferences and ranking; custom HTTP compute and managed export require Blaze/billing; budget alerts do not cap charges; server libraries bypass client Security Rules; high ecosystem lock-in | Mobile-first product where offline sync and Firebase-native clients dominate, and billing linkage is acceptable | **High.** Shortcut API can survive behind Functions, but data, Rules, queries, auth integration, and offline client code become Firebase-specific. [Firebase plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firestore pricing](https://firebase.google.com/docs/firestore/pricing), [export/import](https://firebase.google.com/docs/firestore/manage-data/export-import) |
| **Appwrite Cloud** | Auth, teams/permissions, relational-style databases, REST/GraphQL, Functions, Realtime, Storage, Messaging, Sites, and an open-source self-host path | Broad integrated BaaS; many auth methods; teams map naturally to households; managed cloud and self-hosted product surface are related; plain REST is available | Free projects pause after one week; one database, one bucket, two functions/project, 500k reads and 250k writes/month; no free backups; only one organization member on Free; self-hosting transfers upgrades/backups/availability to us; data/API model is Appwrite-specific | Team/permission-heavy app when Appwrite's all-in-one model or eventual self-hosting is an explicit priority | **Medium-high.** HTTP contract survives; database permissions, documents/relationships, functions, Auth, and operational tooling migrate poorly to another BaaS. [Appwrite pricing](https://appwrite.io/pricing), [Free plan](https://appwrite.io/docs/advanced/billing/free), [platform overview](https://appwrite.io/docs) |
| **Vercel Functions + Neon** | Conventional web/serverless functions plus standard Postgres, branching, Auth/Data API, and scale-to-zero | Strongest conventional web/Postgres portability; familiar frameworks; database branching; no-credit-card Neon Free; easy migration to another Postgres host | Two vendors and two control planes; Vercel Hobby is personal/non-commercial only; production Vercel normally starts at Pro while Neon is separately metered; connection strategy and cross-provider latency matter; less integrated than Supabase | A web-first product already standardized on Vercel/Next.js, or when standard Postgres is the overriding constraint | **Low for data, medium for runtime/auth.** Postgres and ordinary handlers travel; Vercel runtime and Neon Auth/Data API features do not. [Vercel pricing](https://vercel.com/pricing), [Neon pricing](https://neon.com/pricing) |
| **Workers + Turso** | The current Worker API paired with remote libSQL/SQLite rather than D1 | Very generous no-card Free database tier: 5 GB, 500M rows read/month, 10M written/month, 100 databases, and one-day PITR; current SQLite schema is close; serverless client works in Workers, Vercel, and Deno | Still requires a compute and end-user-auth provider; two vendors; remote database round trips replace a binding; Turso-specific sync/branching/token operations; production security features and longer recovery windows are paid | A future D1 capacity/portability escape hatch that wants to remain SQLite-like | **Low-to-medium.** Most SQL/schema survives; database client, credentials, operations, and any Turso-specific sync features change. [Turso pricing](https://turso.tech/pricing), [TypeScript serverless client](https://docs.turso.tech/sdk/ts/quickstart), [PITR](https://docs.turso.tech/features/point-in-time-recovery) |
| **Deno Deploy + Deno KV** | Deno/TypeScript HTTP runtime, KV, cron, branch timelines, observability | One TypeScript runtime; 1M requests/month and 20 GB egress on Free; built-in cron and OpenTelemetry-oriented observability | KV is not relational; the new platform does not support the former KV queue API, manual backups, read replication, or primary-region choice; Deploy Classic and its subhosting API shut down July 20, 2026; current transition risk is unusually high | Small Deno-native service after the new platform stabilizes, not a relational product decision today | **High for data, medium for HTTP code.** Fetch handlers are portable; KV schema/transactions and platform timelines are not. [Deno pricing](https://deno.com/deploy/pricing), [migration guide](https://docs.deno.com/deploy/migration_guide/), [Deploy changelog](https://docs.deno.com/deploy/changelog/) |

### Comparable first paid / production step

These are advertised starting points, not total-cost forecasts. Per-project, per-developer, usage, email, domains, backup, and support charges are not interchangeable.

| Platform | First paid or production-oriented step | Important cliff |
| --- | --- | --- |
| Cloudflare | Workers Paid has a **$5/month account minimum** and higher Workers/D1/Queues allowances | Identity remains custom; each D1 database still has a 10 GB hard cap. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| Supabase | Pro starts at **$25/month**, with the first project included | Production SMTP is separate; custom domains are $10/month; PITR starts at $100/month; additional projects add cost. [Supabase pricing](https://supabase.com/pricing) |
| Nhost | Pro starts at **$25/month** and includes $15 compute credits, 10 GB database, seven-day backups, Grafana and support | PITR starts at an additional $100 for seven days; custom domains are $10/project/month. [Nhost pricing](https://nhost.io/pricing) |
| Convex | Starter is **$0 minimum, pay as you go** beyond Free allowances; Professional is **$25/developer/month** | Daily backups, log streaming, exception reporting, custom domains and support begin at Professional. [Convex pricing](https://www.convex.dev/pricing) |
| Firebase | Blaze is **pay as you go with a billing account**, with no general monthly minimum documented | A payment method is required; budgets are alerts rather than hard caps; export and custom compute cross the billing boundary. [Firebase plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) |
| Appwrite | Pro starts at **$25/month** for one dedicated project | Daily backups, custom SMTP, organization roles and overages begin on Pro. [Appwrite pricing](https://appwrite.io/pricing) |
| Vercel + Neon | Vercel Pro and Neon Launch are separately billed; Neon describes a typical Launch workload around **$15/month** | Two bills and usage surfaces; Hobby cannot be the commercial production plan. [Vercel pricing](https://vercel.com/pricing), [Neon pricing](https://neon.com/pricing) |
| Workers + Turso | Workers Paid can start at **$5/month** while Turso remains Free; Turso Developer is **$4.99/month** when its paid features/allowances are needed | Still two vendors and no end-user identity product. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Turso pricing](https://turso.tech/pricing) |
| Deno Deploy | Pro starts at **$20/month** | The current platform transition and missing queue/backups features matter more than the price. [Deno pricing](https://deno.com/deploy/pricing) |

### Options that are not durable free-backend contenders

- **Render and Railway** are useful application hosts, but they are not durable $0 source-of-truth choices. Render explicitly says Free services are previews rather than production and deletes a Free Postgres database after its 30-day term plus grace period. Railway's no-card trial provides $5 for 30 days and its continuing Free plan then costs $1/month. Re-evaluate both as paid hosting choices. [Render Free](https://render.com/docs/free), [Railway pricing](https://railway.com/pricing)
- **PocketBase** is an excellent single-binary SQLite BaaS and local prototype tool, but it is self-hosted software, not a free managed backend. A free VM still leaves backups, upgrades, TLS, monitoring, and availability with us. [PocketBase production guidance](https://pocketbase.io/docs/going-to-production/)
- **Supabase/Appwrite self-hosting** improves control and theoretical exit options but does not make operations free. It exchanges vendor fees for patching, backups, mail, monitoring, incident response, and capacity management.
- **AWS, Google Cloud, and Azure primitives** can be inexpensive and include scattered free allowances, but account/billing complexity and the number of services needed for identity, HTTP compute, storage, and observability make them worse for this small project. Firebase is the relevant integrated Google option and is compared above.
- **ChatGPT Sites** remains a UI/demo surface, not the durable external API contract, for the reasons documented below.

## Capability details that change the decision

### Identity, invitations, and authorization

- Cloudflare can verify OAuth/JWTs and has infrastructure access products, but it does not provide a turnkey consumer sign-up, invitation, recovery, and household-membership backend. Keeping D1 means owning that application code or adding a separate auth vendor.
- Supabase Auth plus Postgres RLS lets the database enforce `household_id` and actor ownership even if a client query is malformed. A service-role key bypasses RLS and must remain server-only. Production email still requires an SMTP decision; the built-in provider is limited and not a reason to call identity “free.” [Securing Supabase data](https://supabase.com/docs/guides/database/secure-data), [production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- Appwrite Auth and Teams are the closest integrated alternative, but their permissions/data APIs are less portable than Postgres policies.
- Nhost Auth and Hasura role permissions provide the other serious Postgres-centered alternative. It is compelling when GraphQL is wanted, but wrapping GraphQL in a stable HTTP Function adds work for this Shortcut-first API and its Hasura metadata creates more exit surface than ordinary Postgres plus RLS.
- Convex supports external auth providers, while authorization checks remain in application functions. Firebase Auth + Rules is strong but couples the client/data model to Firebase.

**Inference:** identity—not storage—is the first credible reason to choose Supabase. Two manually issued Shortcut tokens do not justify an identity platform; multiple households and account recovery do.

### Relational queries, ranking, and analytics

The domain contains captures, canonical candidates, two or more actor-owned preferences, notes, specials, plans, and calendar references. Postgres is the most forgiving long-term model for joins, constraints, geospatial extensions, reporting, and evolving rank expressions. D1 handles the current workload well, but a single D1 database executes queries serially and has a hard per-database size ceiling. Convex, Firestore, Deno KV, and Appwrite can represent the records, but cross-entity ranking and future analytics become more platform-shaped.

### Background enrichment and scheduling

- Cloudflare has the cleanest incremental path for asynchronous URL enrichment: capture in D1, enqueue after commit, retry in a Queue consumer, and use Cron/Workflows for periodic refresh. Workers Free currently includes 10,000 Queue operations/day with 24-hour retention; heavier consumers move to Workers Paid. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- Supabase can combine Edge Functions, database webhooks, `pg_cron`, and Postgres-backed queues. This keeps state relational, but durable workflow semantics require deliberate design rather than emerging automatically from Auth/Postgres.
- Convex scheduled mutations are especially attractive for application-state jobs, but third-party side-effect actions have at-most-once behavior unless the application adds retry/idempotency logic.
- Deno's former KV queue is not supported on the new Deploy platform, which weakens it for this enrichment workload today.

### Realtime and offline clients

Supabase, Convex, Firebase, and Appwrite provide first-class realtime subscriptions. Firebase adds the strongest mature offline-first client behavior. Cloudflare requires custom WebSockets/Durable Objects or polling. That difference matters only after there is a native/web collaboration UI; it does not improve the Share Sheet POST.

### Backups and recovery on free plans

- D1 Free includes seven-day Time Travel and SQL export.
- Turso Free includes a one-day PITR window.
- Supabase Free requires owner-managed `db dump` exports; downloadable managed backups are paid.
- Convex supports manual logical backups; periodic backups require Pro.
- Appwrite Free lists no backups.
- Nhost Starter lists no automated backups; Pro includes seven days of daily backups, while PITR starts at an additional $100 for seven days.
- Firestore PITR, backup, restore, clone, and managed export/import require billing.

**Inference:** before storing real relationship or calendar data, automate an encrypted logical export outside the provider regardless of platform. A provider dashboard restore window is not the only copy.

## Migration preservation from the current prototype

No remote database or real identity exists yet, so this is the lowest-cost decision point.

| Destination | Preserved without client changes | Work that changes |
| --- | --- | --- |
| **Stay Workers + D1** | Shortcut, `/v1` routes, JSON contract, idempotency, normalization, ranking behavior, local smoke flow, schema | Production bootstrap, backups, observability, token lifecycle, later identity/invitations |
| **Supabase-only** | Shortcut and `/v1` contract if Edge Functions expose the same routes; domain terminology; most tables, keys, constraints, tests, validation and ranking intent | D1 calls become Postgres/Data API calls; SQLite time/`INSERT OR IGNORE` syntax changes; token auth becomes Supabase Auth/identity links; deployment and rate limiting move; RLS policies and auth tests are added |
| **Nhost-only** | Shortcut and `/v1` contract if Functions expose the same routes; domain terminology; Postgres tables and most relational constraints | D1 calls become Postgres/GraphQL calls; Hasura metadata and role permissions replace RLS/application checks; Auth claims, deployment and Functions tests are added |
| **Worker API + Supabase Postgres/Auth** | Entire public Worker route surface and Shortcut; validation, normalization, response JSON, rate limits; Postgres data is portable | D1 binding becomes pooled Postgres or Supabase HTTP access; JWT forwarding/verification and RLS context must be designed; two vendors, latency and failure modes are added |
| **Workers + Turso** | Shortcut, Worker routes, almost all SQLite schema/query intent, tests and domain code | D1 binding replaced by Turso client; remote credentials, latency and transaction behavior; identity remains custom |
| **Convex/Firebase/Appwrite/Deno KV** | Shortcut only if the same HTTP contract is deliberately recreated; high-level domain rules and fixture expectations | Storage adapter, schema/query model, authorization, migrations, backend tests, deployment and operational playbooks |

The current prototype is therefore not wasted even if Supabase wins. The durable assets are the HTTP contract, domain boundaries, fixtures, idempotency behavior, validation, and ranking explanation. The least portable part is the direct `env.DB.prepare(...)` access embedded in route functions.

### No-regrets changes before any public deployment

1. Treat `/v1` JSON and contract tests as the product boundary; do not let the Shortcut or future app call D1/PostgREST tables directly.
2. Separate route/validation/domain services from a `Repository` interface so D1 and Postgres adapters can run against the same acceptance suite.
3. Add `households`, `household_members`, and `identity_links(provider, subject, actor_id)` before introducing managed Auth. Keep domain actor IDs independent of provider user IDs.
4. Use UUID/text IDs, explicit timestamps, ordinary constraints, and portable SQL where practical. Keep provider-specific DDL in adapter migrations.
5. Keep enrichment behind an outbox/job interface. A Queue, Supabase queue, or scheduled function is infrastructure, not the domain contract.
6. Maintain export/import scripts and test a restore with synthetic data before storing private data.
7. Keep a stable client credential flow for the Shortcut even if a native/web UI later uses OAuth sessions; never embed an admin/service key.

These changes are smaller now than a provider migration later and preserve the option to deploy the current local slice after the comparison decision.

## One-, two-, and five-year scenarios

| Horizon / observed reality | Best path | Why |
| --- | --- | --- |
| **Year 1: one household, two Shortcut users, hundreds or low thousands of links** | Workers + D1 | Minimal surface and cost; custom two-token auth remains bounded; D1 limits are irrelevant; Queues fit enrichment |
| **Year 1: native/web app, invitations, recovery, or several households are already planned** | Supabase now | There is no production data to migrate; Auth/RLS/Postgres avoid building disposable identity and permissions |
| **Year 2: dozens to thousands of households, realtime collaboration, search/geospatial metadata, internal reporting** | Supabase/Postgres, with Edge Functions or the retained Worker API | Relational/RLS/analytics benefits dominate; pay for a non-pausing tier, SMTP, backups and monitoring |
| **Year 2: still private but enrichment traffic grows** | Workers + D1/R2/Queues; consider Turso only for a measured D1 constraint | Cloudflare's infrastructure strengths grow without adding product identity complexity |
| **Year 5: consumer product with multiple clients and a team** | Standard Postgres-centered architecture; Supabase is a credible managed starting point, not an irrevocable endpoint | Postgres offers the widest hiring/tooling/analytics/host-exit path; clients remain insulated by the API |
| **Year 5: very large multi-tenant edge workload** | Re-evaluate sharded D1 versus managed Postgres based on measured contention, cross-tenant queries, residency and cost | D1's database-per-tenant model may be excellent, but cross-household analytics and custom identity operations may favor Postgres |

## Weighted decision matrix for this product

Scores are an **inference** from the verified capabilities above: 5 is strongest. Weights reflect this repository's requirements, not a universal ranking.

| Criterion | Weight | Cloudflare | Supabase | Nhost | Convex | Firebase | Appwrite | Vercel + Neon | Workers + Turso | Deno + KV |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Relational model and query growth | 20 | 4 | 5 | 5 | 3 | 2 | 3 | 5 | 4 | 2 |
| Identity, invitations, row ownership | 18 | 2 | 5 | 5 | 3 | 5 | 4 | 3 | 2 | 2 |
| API/Shortcut fit | 14 | 5 | 5 | 4 | 4 | 3 | 4 | 5 | 5 | 4 |
| Portability and recoverability | 14 | 4 | 5 | 4 | 2 | 2 | 3 | 5 | 4 | 2 |
| Background enrichment/scheduling | 10 | 5 | 4 | 4 | 5 | 4 | 4 | 3 | 4 | 2 |
| Realtime/native growth | 8 | 3 | 5 | 5 | 5 | 5 | 5 | 3 | 2 | 3 |
| Free evaluation and low paid floor | 8 | 5 | 3 | 3 | 4 | 3 | 3 | 3 | 4 | 4 |
| Local testing/operations simplicity | 8 | 5 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 4 |
| **Weighted total / 5** | **100** | **3.96** | **4.58** | **4.30** | **3.52** | **3.36** | **3.58** | **3.96** | **3.62** | **2.68** |

Supabase wins the growth-weighted matrix; Nhost is the serious GraphQL/Postgres runner-up; Cloudflare wins the current fixed-user slice. Vercel + Neon scores well on portability but loses the one-provider simplicity and integrated product backend that Supabase provides.

### United States availability

- D1 supports Eastern and Western North America location hints; a hint is not a residency guarantee. [D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/)
- Supabase lists AWS regions in Northern Virginia, Ohio, Northern California, and Oregon. [Supabase regions](https://supabase.com/docs/guides/platform/regions)
- Convex lists US East (Northern Virginia) as a deployment region. [Convex regions](https://docs.convex.dev/production/regions)
- Firestore lists multiple US regional and multi-region locations. [Firestore locations](https://firebase.google.com/docs/firestore/locations)
- Neon's official regional status documentation includes AWS US East (Northern Virginia). Vercel offers its Hobby account plan, but the plan source reviewed does not establish selectable function placement; that is a residual deployment detail for this composition. [Neon regional status](https://neon.com/docs/introduction/status), [Vercel plans](https://vercel.com/docs/plans)

## Is ChatGPT Sites suitable as the service?

### Verified

Sites is a **public beta** whose availability depends on plan, region, and workspace settings. It creates and hosts websites/web apps, can persist structured data in a D1 binding and files in R2, supports workspace or authentication-enabled access shapes, and stores binding names in `.openai/hosting.json`. Site creation, deployment, sharing, and settings are managed through ChatGPT web or desktop; there is no standalone Codex CLI or IDE-extension management view, and every deployed URL is a production deployment. [ChatGPT Sites documentation](https://learn.chatgpt.com/docs/sites?surface=cli)

The current page does **not** document a stable external API product contract, endpoint/version management, API-specific quotas, an uptime commitment, or a headless deployment/rollback workflow for arbitrary Shortcut clients.

### Inference

Sites is well suited to a fast dashboard, internal tool, or disposable end-to-end demonstration, including one backed by D1. It is not yet the best source of truth or core public API for this MVP. Choosing Workers + D1 directly keeps the same underlying data/compute family while preserving an ordinary repository-driven deploy path and a stable custom API contract. A later Site can call that API or present data, but the API should not depend on Sites-only lifecycle controls.

## Recommendation and explicit fallback threshold

### Fixed-two-person path: Workers + D1

Time-box a single vertical slice with:

- one Worker;
- one D1 database and versioned SQL migrations;
- exact-source capture plus idempotency;
- two revocable actor tokens with server-side digests;
- actor-owned preference writes;
- notes/metadata writes;
- one deterministic ranked query with returned rank components;
- fixture-only local tests and a documented SQL export command.

Do not add AI enrichment, calendar access, general registration, push notifications, a full web UI, or native iOS code to prove this slice. Basic synchronous “processing” should mean validation, exact-source preservation, conservative normalization, dedupe lookup, and durable storage. Any network enrichment must be asynchronous and failure-tolerant.

### Switch to Supabase before broadening identity

Choose Supabase **before public deployment**, or migrate at the next schema checkpoint, if any of these become near-term requirements:

1. more than the fixed two manually provisioned participants;
2. self-service invitation, sign-in, token refresh, logout, password/account recovery, or multiple households;
3. database-enforced row ownership must be delivered without maintaining custom authorization middleware; or
4. a realtime multi-client UI is required before the HTTP slice has proved value.

Remain on Workers + D1 unless one of those thresholds is crossed. Storage and traffic limits are not credible near-term switch triggers for a two-person text-and-URL dataset. If the service approaches D1's 500 MB per-database limit, needs sustained queries beyond one database's serialized throughput, or requires heavy synchronous compute that cannot fit Workers Free, perform a fresh cost/architecture review rather than silently upgrading.

## Residual uncertainties and prototype checks

These facts cannot be established from public documentation alone:

1. Whether the current target iPhone's Shortcuts editor can set the desired authorization header cleanly and retain it through Shortcut sharing/import. If not, test a body credential without logging it.
2. Whether `Get Contents of URL` reliably receives arbitrary shared URLs from each actual source app and preserves them byte-for-byte.
3. Cloudflare account creation, US dashboard availability for this owner, deployment latency, and actual free-plan behavior for the intended account; no account was created in this research.
4. Whether 10 ms CPU is sufficient for the chosen normalization code and response serialization. A local benchmark and one fixture-only remote smoke test can answer this; do not infer it from quota size.
5. Exact independent-vote visibility and edit semantics, note ownership, ranking formula, duplicate merge behavior, and metadata schema remain product/spec decisions.
6. URL enrichment sources, terms, robots behavior, SSRF controls, redirects, and canonicalization require separate research before the backend fetches user-supplied URLs.
7. Free-tier terms and limits are temporally unstable; recheck them before deployment or any provider decision.

No paid service, production credential, private data, physical-device action, or external publication was used for this report.
