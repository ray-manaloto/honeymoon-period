# Composing free backend services: verified capabilities and community experience

- Status: research complete; Cloudflare-native MVP selected, Supabase growth trigger retained
- Last verified: 2026-07-15
- Accessed: 2026-07-15
- Region: United States; no account creation, deployment, or paid service was used
- Question: can several modern free services be combined into a durable backend for capture, independent preferences, notes, metadata, ranking, and later clients without forcing a rewrite?
- Evidence boundary: quotas, pricing, guarantees, and product behavior come from first-party documentation. Blogs, Reddit, Hacker News, and GitHub discussions are used only for practitioner themes and are explicitly anecdotal.

## Answer

**Yes, but compose by stable responsibility, not by collecting free tiers.** A small stack can combine an API gateway, relational source of truth, identity, queue, object storage, email, and observability. The durable assets are the versioned `/v1` HTTP contract, domain model, SQL schema, idempotency rules, ranking semantics, and provider-neutral acceptance tests. Every extra vendor adds credentials, dashboards, quotas, privacy agreements, incidents, network hops, and failure modes.

For this product there are two sensible paths:

1. **Minimal private utility:** Cloudflare Workers + D1, adding Queues only if asynchronous enrichment is selected and R2 only when binary attachments exist. Keep the current two actor-bound tokens. This is the smallest system and preserves the existing local prototype almost completely.
2. **Growth path:** use Supabase Postgres + Auth + RLS as the relational and identity core, expose the same `/v1` contract from a Supabase Edge Function, and add Resend only when invitations/recovery email are required. Retain or add a Cloudflare Worker only after edge rate limiting, Cloudflare Queues/R2, or measured gateway value justifies the second core provider. This preserves the client/API contract while avoiding both a future identity rewrite and needless early composition.

If multiple households, invitation/recovery flows, a native/web client, database-enforced tenant isolation, or richer analytics are probable within a year, **start with the growth path now**. If this remains one couple and one Shortcut, the Cloudflare-native stack is lower risk. Do not assemble Clerk/Auth0/Descope, Supabase Auth, a separate database, a separate queue, and a separate compute platform merely because each has a free tier.

## How to interpret community evidence

Reddit and Hacker News are self-selected, often anonymous, workload-dependent, and disproportionately populated by people with either a problem or a strong preference. Vote counts are not reliability measurements. Vendor subreddits also select for users of that vendor. The community material below therefore establishes **questions to test and recurring themes**, not service-level facts or representative failure rates. No community post is used to establish quotas or prices.

## Composition matrix

| Composition | Durable core | What it does well | Main costs and failure coupling | Current-prototype preservation | Verdict |
| --- | --- | --- | --- | --- | --- |
| **Workers + D1; optional Queues/R2** | SQLite-compatible D1 behind `/v1` | One account and deployable; fast capture; native bindings; async enrichment and storage can be added later | Custom identity; D1 limits/semantics; Cloudflare-wide incident can affect the stack; Queue Free retention is 24 hours when used | **Highest:** routes, D1 queries, schema, tests, Shortcut | Best private utility |
| **Workers + Supabase Postgres/Auth** | Standard Postgres and Supabase identities behind Worker | Stable edge API, Worker rate limiting, Postgres/RLS, invites/recovery, future direct realtime clients | Two vendors and network hop; must preserve JWT/RLS context; either provider can break writes; two bills after growth | Shortcut/routes/domain/tests stay; D1 adapter and auth bootstrap change | Add only when gateway/queue value is measured |
| **Workers + Turso + Better Auth** | libSQL/SQLite plus app-owned identity tables | SQLite continuity, database forks/replicas, auth data ownership, Worker portability | Three operational components counting email; application owns auth patching and incidents; cross-vendor latency | Most schema/query intent stays; D1 binding becomes libSQL client | Credible, but more ownership than Supabase buys |
| **Supabase core + Resend + optional external queue/edge** | Postgres/Auth/RLS/Storage | One relational security boundary; realtime; generated APIs; conventional exports | Free project pausing; production email is separate; adding external compute can duplicate gateway/queue concerns | `/v1` contract and domain stay if implemented in Edge Functions or a thin API | Best consolidated growth stack |
| **Vercel Functions + Neon + auth/email/jobs** | Standard Postgres behind conventional functions | Strong portability, preview DB branches, broad Node ecosystem | Four or more vendors for complete product; cold starts; Vercel Hobby is personal/non-commercial; quotas fail independently | `/v1`, tests, model stay; storage adapter changes | Good web stack, unnecessary for Shortcut-first MVP |
| **Deno Deploy + Neon/Supabase** | Standard Postgres behind Deno HTTP handlers | Portable TypeScript, OpenTelemetry, generous compute free tier | Newer platform; database still external; identity/email/jobs still separate | HTTP/domain logic portable; D1 adapter changes | Viable experiment, not the lowest-risk choice |
| **Nhost** | Postgres + Hasura GraphQL + Auth | Integrated GraphQL, realtime, permissions, storage, functions | Free project pauses; GraphQL/Hasura metadata is added coupling; `/v1` still needs wrapper | Domain/schema mostly stay; API and auth adapter change | Strong only if GraphQL is a requirement |

## Composition 1: Cloudflare-native

### Verified capability

- Workers Free provides the HTTP runtime; the current pricing page documents the free plan and a $5/month Workers Paid minimum. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- D1 supplies the relational store and SQL export/recovery described in the broader backend comparison. Its SQLite semantics fit the present tables and rank query.
- Since February 2026, Queues is on Workers Free with 10,000 operations/day and guaranteed delivery, but Free retention is only 24 hours. A delayed or broken consumer can therefore lose the opportunity to process a message after that window unless D1 also records durable enrichment state. [Queues Free announcement](https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/)
- R2 Free includes 10 GB-month storage, one million Class A operations, ten million Class B operations monthly, and no egress charge for Standard storage. R2 operations are still metered; “zero egress” does not mean “all reads are free.” [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- Workers has a binding-based Rate Limiting API. Counters are local to a Cloudflare location, so it is an abuse-smoothing control rather than a globally exact quota. Cloudflare recommends actor/resource identifiers over IP addresses. [Workers Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- Workers Logs is included on Free and Paid. [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)

### Pros

- One account, one deployment tool, native service bindings, and no database network credentials in application code.
- The capture transaction can save immediately and enqueue enrichment after durable state exists.
- R2 can be deferred until photos, menus, or exported artifacts are real requirements.
- Free limits are far beyond a two-person workload, and the paid floor is low.
- The current Worker/D1 vertical slice is already implemented and tested locally.

### Cons

- Consumer identity, invitation, account recovery, household membership, session revocation, and authorization remain application work.
- D1 is not ordinary Postgres. Tooling, transaction semantics, extensions, concurrency, and cross-database analytics differ.
- Concentration reduces glue but increases correlated failure: a broad Cloudflare incident can affect API, database, queue, files, rate limiting, and logs simultaneously.
- Free Queue retention is too short to be the source of truth. The database needs an outbox/enrichment status and a replay process.
- R2 and Queues add bindings and local-test configuration even before their features are used.

### Community themes, not facts

- Positive reports emphasize the “write, deploy, done” Worker experience, low cost, and native bindings for small services. A December 2025 Reddit thread includes practitioners who like Workers as APIs/microservices while being less enthusiastic about full framework workloads. [Reddit, 2025-12-17](https://www.reddit.com/r/CloudFlare/comments/1pp3fbo/anyone_else_actually_enjoying_cloudflare_workers/)
- A June 2026 MVP discussion reports positive D1/R2 experiences and recommends a data-service boundary if a later database move is plausible. The thread is small and self-selected. [Reddit, 2026-06-27](https://www.reddit.com/r/CloudFlare/comments/1ugqzy0/choosing_workers_d1_r2_for_my_saas_mvp_what_am_i/)
- Negative reports recur around D1 long-tail latency, transient errors, dashboard/tooling, transaction limitations, and the need to design access patterns deliberately. A February 2025 thread is especially negative; a January 2026 thread reports 500–1500 ms single-query request times for one workload. These are anecdotes, not an incident rate. [Reddit, 2025-02-16](https://www.reddit.com/r/CloudFlare/comments/1iqne1i/why_cloudflares_database_not_popular/), [Reddit, 2026-01-22](https://www.reddit.com/r/CloudFlare/comments/1qk6z8q/anyone_hosted_saas_fully_on_cloudflare_mine_slow/)
- A January 2026 Hacker News degradation thread includes a Cloudflare engineering response acknowledging elevated long-tail latency. This supports testing latency/retry behavior, not rejecting D1 categorically. [Hacker News, 2026](https://news.ycombinator.com/item?id=46734283)
- Billing-anxiety posts object to the absence of a desired hard cap on some paid serverless usage. Workers, D1, and Queues Free reject or stop work at their documented limits, but R2 is usage-billed after its allowance once enabled; cost controls must therefore be checked per product. [Reddit, 2026-03-26](https://www.reddit.com/r/CloudFlare/comments/1s4jwms/i_decided_not_to_go_into_paid_worker_cloudflare/)

### Fit here

Use this now if there are exactly two manually provisioned actors. Persist `enrichment_status`, job payload, attempts, and next retry in D1; treat Queue delivery as an accelerator. Do not add R2 until binary content exists. Export D1 on a schedule before real private data accumulates.

## Composition 2: Worker gateway + Supabase Postgres/Auth

### Verified capability

- Supabase Free currently includes two active projects, 500 MB database, 50,000 MAU, 5 GB egress, 1 GB file storage, and unlimited API requests; inactive Free projects pause after one week. Pro begins at $25/month and adds daily backups and log retention. [Supabase pricing](https://supabase.com/pricing)
- Cloudflare documents a Supabase integration. `supabase-js` uses HTTP/PostgREST rather than a direct database connection; a service-role key bypasses RLS and must not be treated as ordinary client authorization. [Cloudflare Workers integration](https://developers.cloudflare.com/workers/databases/third-party-integrations/supabase/), [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- Cloudflare Hyperdrive can connect Workers directly to Supabase Postgres and pool connections. Cloudflare recommends a least-privilege database user; the guide's broad example grant is not appropriate production authorization. [Hyperdrive with Supabase](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/)
- Supabase Edge Functions provide a Deno-compatible gateway, JWT validation, logs, and global execution if the separate Worker is later removed. [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Two safe authorization patterns

1. **User JWT through PostgREST:** the Shortcut or app sends a Supabase user JWT to the Worker; the Worker validates it and invokes Supabase with that user context. Postgres RLS remains the final tenant/actor boundary.
2. **Worker-owned authorization:** the Worker validates identity and connects with a narrowly privileged database role. It enforces every household/actor check itself. This preserves a custom API but gives up much of RLS's defense in depth.

Do not casually combine Hyperdrive/direct Postgres, a service-role credential, and an assumption that Supabase RLS still knows the end user. Direct connections do not automatically inherit the request JWT context. That design requires explicit transaction-scoped claims/roles or application authorization and dedicated tests.

### Pros

- The Worker keeps `/v1`, rate limiting, idempotency, validation, response shapes, and future client independence.
- Postgres is a stronger long-term fit for households, membership, preferences, notes, ranking, reporting, calendar metadata, and geospatial extensions.
- Supabase supplies invitation/recovery/session identity and RLS without exposing provider tables directly to the Shortcut.
- The database is conventional enough to dump and migrate to another Postgres host.
- Cloudflare can still own Queue/R2 features where they are materially better.

### Cons

- Each request crosses providers, adding latency and a second availability dependency.
- There are two secret systems, logs, deploy pipelines, status pages, privacy relationships, and eventual bills.
- Supabase Free pausing is awkward for an intermittently used couple utility.
- A split-brain authorization design is easy: Worker checks can diverge from RLS policies.
- If the Worker merely proxies all Supabase calls without stable domain behavior, it is pure complexity.

### Community themes, not facts

- Supabase users consistently praise fast delivery of Postgres, Auth, Storage, RLS, and a useful dashboard. A June 2026 comparison post describes the integrated “boring parts” as its core advantage. It is one user's synthesis, not a benchmark. [Reddit, 2026-06](https://www.reddit.com/r/Supabase/comments/1tp3e3y/i_evaluated_supabase_vs_convex_vs_planetscale_vs/)
- Recurring concerns are Edge Function ergonomics/latency, RLS mistakes, free-to-paid price discontinuity, connection strategy, and self-hosting complexity. An April 2025 Hacker News discussion says data+auth is strong but server-side logic can feel less polished; a 2024 GA discussion recounts one team's Function and remote-database latency problems. [Hacker News, 2025-04-22](https://news.ycombinator.com/item?id=43763225), [Hacker News, 2024-04-15](https://news.ycombinator.com/item?id=40039191)
- Community discussion distinguishes “Supabase all the way” from “Postgres++ behind your own API.” That distinction supports retaining `/v1` and treating Supabase as an adapter, not making clients dependent on table APIs. [Reddit, 2025](https://www.reddit.com/r/Supabase/comments/1pl3v9h/supabase_vs_your_own_api/)
- A January 2026 side-project thread objects to the jump from $0 to $25. That is a budget preference, not evidence that the paid plan is overpriced. [Reddit, 2026-01](https://www.reddit.com/r/Supabase/comments/1qgny6k/love_supabase_but_the_25mo_pricing_tier_killed_my/)

### Fit here

This is the best two-provider composition when growth is credible **and** the Worker earns its place through edge policy, queue ownership, R2, or measured portability value. It is not automatically better than a Supabase Edge Function exposing the same provider-neutral `/v1`. Prefer PostgREST/user JWT for RLS continuity initially. Choose the nearest appropriate Supabase region, evaluate Cloudflare Smart Placement if needed, and measure p50/p95 capture latency before committing.

## Composition 3: Workers + Turso + Better Auth

### Verified capability

- Turso/libSQL supplies a remote SQLite-compatible database and Cloudflare-compatible clients; its current free/paid allowances are documented in the broader comparison. Database portability is stronger than a proprietary document database, but libSQL service behavior is still provider-specific.
- Better Auth is a library, not a hosted identity service. It supports standard request handlers, SQLite/Postgres/MySQL, OAuth, organization/invitation plugins, and Cloudflare Workers. As of Better Auth 1.5 it natively accepts a D1 binding; D1 lacks interactive transactions, so it uses `batch()` for atomicity. [Better Auth installation](https://better-auth.com/docs/installation), [Better Auth 1.5](https://better-auth.com/blog/1-5), [organization plugin](https://better-auth.com/docs/plugins/organization)
- Better Auth's own adapter guidance warns that databases without transactions have weaker rollback/error handling. [Better Auth adapter guidance](https://better-auth.com/docs/guides/create-a-db-adapter)

### Pros

- Auth records remain in a database we control; there is no per-user hosted identity bill.
- Existing SQLite schema/query intent is easier to carry than a move to a document database.
- Better Auth can later move with the application to Postgres.
- Turso offers database capabilities some users want beyond D1, while Workers remains the API.

### Cons

- “Free auth library” means the project owns upgrades, cookie/session configuration, OAuth-provider setup, abuse defense, email delivery, recovery correctness, and incident response.
- Turso is another network and credential boundary; edge placement does not eliminate database latency.
- Organizations/invitations make auth writes more transaction-sensitive. Validate the exact adapter/runtime combination.
- For this product, Supabase Auth+Postgres may provide more security capability with less custom ownership.

### Community themes, not facts

- A July 2026 Cloudflare subreddit comparison favors D1's integration while acknowledging Turso features such as database forks; another commenter reports higher latency with a remote Turso cluster. The thread has very few participants. [Reddit, 2026-07-04](https://www.reddit.com/r/CloudFlare/comments/1un6utp/turso_better_than_d1_thoughts/)
- Better Auth community discussions value keeping auth and domain records in one database and avoiding a hosted-auth boundary; others report Worker integration friction. Both themes are implementation-dependent. [Reddit, 2025](https://www.reddit.com/r/nextjs/comments/1mzl34w/clerk_vs_betterauth/), [Reddit, 2025](https://www.reddit.com/r/CloudFlare/comments/1j90836/best_modern_method_for_build_auth_with_workers/)
- Better Auth's GitHub production thread contains self-reported deployments, including Workers, but it is effectively a showcase request and has strong positive-selection bias. [GitHub discussion, 2025](https://github.com/better-auth/better-auth/discussions/2581)

### Fit here

Choose this only if owning identity code/data is an explicit product decision, not a tactic to remain at $0. It is a sound modular stack, but it transfers risk from vendor lock-in to maintenance and security ownership.

## Composition 4: Supabase core plus selective external services

### Queue and jobs

Supabase Queues is Postgres-native `pgmq`: durable, pull-based, visibility-timeout delivery with archival and RLS controls. It keeps the job and domain transaction close, but a consumer still has to poll/process messages. [Supabase Queues](https://supabase.com/docs/guides/queues), [queue quickstart](https://supabase.com/docs/guides/queues/quickstart)

Alternatives:

- Cloudflare Queues is a good choice when a Worker already owns capture and enrichment. Do not duplicate every job into both systems.
- Upstash QStash Free currently allows 1,000 messages/day, three-day DLQ/log retention, 1 MB messages, and ten active schedules. Each delivery attempt, including retries, counts as a message. [QStash pricing](https://upstash.com/pricing/qstash)
- Inngest Hobby currently includes 50,000 executions/month and five concurrent executions; a run plus each step consumes executions, and Hobby pauses at quota. It adds durable workflows, retries, tracing, and a useful local server, but Pro starts at $99/month. [Inngest pricing](https://www.inngest.com/pricing)

For simple URL enrichment, use a transactional outbox plus one queue. Inngest becomes valuable only when the workflow has multiple durable steps, long waits, or human checkpoints.

### Email

Supabase's built-in Auth mailer is demonstration-grade and rate-limited; production invitations and recovery need custom SMTP. Resend Free currently includes 3,000 transactional emails/month, 100/day, one custom domain, and 30-day retention. [Resend pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing)

Email is a sensible separate provider because delivery reputation, bounce handling, DKIM/SPF/DMARC, suppression, and webhooks are specialized. It also creates a hard dependency for invitations and recovery. The application must show “email delayed” states, make invites idempotent, and allow resend/recovery without corrupting membership.

### Storage

Use Supabase Storage when RLS-integrated user files and one security boundary matter. Use R2 when public/served objects and egress economics matter. Do not mirror every file across both on day one. Store object metadata and ownership in Postgres; hide provider URLs behind signed URLs or an application endpoint so a later move does not rewrite clients.

### Observability

Start with provider-native structured logs plus request IDs and redaction. Sentry Developer is free for one user and includes 5,000 errors, 5 GB logs/metrics, five million spans, one uptime monitor, and email alerts. It becomes useful when cross-provider traces or client crash reporting are needed. [Sentry pricing](https://sentry.io/pricing/)

Observability must not ingest source URLs with sensitive query parameters, notes, calendar data, auth headers, or email bodies. A free external logger is not a reason to export private payloads.

## Composition 5: Vercel or Deno compute + Neon Postgres

### Verified capability

- Neon is standard Postgres with serverless connection options and Vercel integrations, including preview branches. [Neon–Vercel integration](https://neon.com/docs/guides/vercel-overview)
- Neon documents integrations with Clerk, Auth0, and Auth.js. [Neon integrations](https://neon.com/docs/guides/integrations)
- Deno Deploy is GA as of February 2026; Free includes one million requests/month, 20 GB egress, and 15 CPU hours. It can link external Postgres and automatically creates environment-specific logical databases. [Deno Deploy GA](https://deno.com/blog/deno-deploy-is-ga), [Deno Deploy pricing](https://deno.com/deploy/pricing), [Deno databases](https://docs.deno.com/deploy/reference/databases/)
- Deno KV remains a developing key-value product, and its newer Deploy integration has lacked queues/read replication/manual backups in the documented transition. Postgres is the safer source of truth for this relational product. [Deno Deploy changelog](https://docs.deno.com/deploy/changelog/)

### Pros

- Ordinary TypeScript HTTP handlers and Postgres provide the cleanest host-exit story.
- Neon branching is valuable for migration testing and preview environments.
- Compute and database can scale independently.
- Auth.js/Better Auth can keep identity records in Postgres; Clerk/Auth0 can externalize identity.

### Cons

- A complete stack commonly becomes compute + Neon + auth + email + queue + object storage + observability.
- Neon scale-to-zero can produce a user-visible first-request delay after idle periods.
- Vercel Hobby is personal/non-commercial; it is not the no-cost commercial production plan.
- Separate providers produce independent quotas and multiply operational ceremonies.
- This stack buys web-framework ergonomics that the Shortcut API does not need.

### Community themes, not facts

- An April 2026 Vercel practitioner report praises integrated deployment and free primitives but flags metering at scale and roughly 500 ms observed Neon idle wake-up in that workload. [Reddit, 2026-04-28](https://www.reddit.com/r/vercel/comments/1syex4x/i_built_an_app_on_the_entire_vercel_ecosystem/)
- Another May 2026 thread reports 350 ms typical and occasional multi-second idle spikes in a self-published benchmark. It is not controlled provider telemetry. [Reddit, 2026-05-18](https://www.reddit.com/r/sveltejs/comments/1tgt8mm/includes_self_promo_sveltekit_vercel_neon_db/)
- Hacker News experiences split between strong praise for Neon “just worked” behavior and criticism of serverless Postgres latency. That divergence reinforces a workload-specific latency test. [Hacker News, Neon GA](https://news.ycombinator.com/item?id=40040593), [Hacker News, 2025](https://news.ycombinator.com/item?id=44640618)

## Nhost as a consolidated alternative

Nhost Starter is $0 with one active project, 1 GB Postgres, 1 GB storage, 5 GB egress, unlimited users, OAuth, realtime APIs, and ten Functions; it pauses after a week of inactivity. Pro starts at $25 and adds backups, managed Grafana, and more resources. Its core API is Hasura GraphQL with role permissions. [Nhost pricing](https://nhost.io/pricing)

Nhost is less a composition than a Supabase-class consolidation. It is attractive if GraphQL subscriptions and Hasura permissions are positive requirements. For an iOS Shortcut sending one REST capture, a wrapper Function is still needed, and Hasura metadata/claims become migration surface. Recent independent community evidence is sparse; the prominent Hacker News discussions are older launch threads, so confidence should rest on a prototype and current docs, not community popularity. [Hacker News launch, 2022](https://news.ycombinator.com/item?id=30074306)

## Separate auth providers: help or harm?

| Option | Verified free entry | Advantage | Cost/lock-in | Recommendation here |
| --- | --- | --- | --- | --- |
| **Supabase Auth** | 50,000 MAU within Supabase Free | JWT+RLS integration, same dashboard/data boundary | Supabase auth schema/API coupling; external SMTP | Use with Supabase data |
| **Better Auth** | Open-source library; infrastructure costs remain | Auth data in our DB; organizations/invites/plugins; portable | We operate and secure it; migrations/upgrades/email | Use only when ownership is intentional |
| **Clerk** | 50,000 monthly retained users and 100 retained organizations on Hobby | Fast hosted UI, sessions, organizations, broad SDK support | Identity/domain split, hosted lock-in, per-retained-user/org economics later | Good UX accelerator, unnecessary for two users |
| **Auth0** | Up to 25,000 external active users, five organizations, one enterprise connection | Mature CIAM, attack protection, standards | More platform and pricing complexity than needed | Overpowered unless enterprise identity becomes real |
| **Descope** | 7,500 MAU; 50 B2B tenants or five with SAML SSO | Flexible passwordless/passkey flows and visual orchestration | Separate identity store/workflow coupling | Evaluate only for complex auth journeys |

Sources: [Clerk pricing](https://clerk.com/pricing), [Auth0 pricing](https://auth0.com/pricing), [Descope product limits](https://www.descope.com/product), [Better Auth installation](https://better-auth.com/docs/installation).

Hosted auth improves the stack when polished sign-up, recovery, passkeys, organizations, and security operations would otherwise consume product time. It worsens the stack when Supabase Auth already supplies the needed identity, or when the Shortcut still uses manually issued credentials. If Clerk/Auth0/Descope fronts Supabase, map external `sub` values to internal actors and design RLS/JWT integration explicitly; do not trust a user ID sent in JSON.

Community comparison themes are predictable: hosted-auth users praise speed and UI, while Better Auth users value database ownership and avoiding a separate user store. Reports also mention friction when joining hosted identity to domain/organization data. These are architecture preferences with strong selection bias, not proof of universal cost or reliability. [Reddit Clerk vs Better Auth, 2025](https://www.reddit.com/r/nextjs/comments/1mzl34w/clerk_vs_betterauth/), [Hacker News Better Auth launch, 2025](https://news.ycombinator.com/item?id=44030492)

## Free-tier failure modes

| Failure | Example | Required design response |
| --- | --- | --- |
| Hard quota rejection/pause | Workers operations, Inngest Hobby, Deno Free overage behavior | Return retryable errors; alerts before threshold; never silently drop captures |
| Inactivity suspension | Supabase and Nhost Free after about one week | Accept wake/restore friction during evaluation; pay before claiming production availability |
| Short retention | Cloudflare Queue Free 24 hours; QStash Free logs/DLQ three days | Database outbox and replay; queue is not source of truth |
| Idle cold path | Neon scale-to-zero | Measure p95 after five-plus idle minutes; preserve fast local save/retry UX |
| Email limit/deliverability | Supabase demo mailer; Resend 100/day Free | Idempotent invites, resend flow, bounce state, domain authentication |
| Missing backups | Supabase/Nhost Free lack paid automatic backup guarantees | Scheduled encrypted logical export and tested restore |
| Cross-provider outage | Worker available but database/auth/email unavailable | Timeouts, circuit breaker, durable pending state, degraded read/write semantics |
| Correlated single-vendor outage | Cloudflare-native API+DB+queue+files fail together | Offline client retry, exports outside provider, status-aware operations |
| Surprise paid usage | Enabling pay-as-you-go across several vendors | Explicit spend caps where supported; budget alerts; one owner and cost runbook |
| Credential sprawl | Five dashboards and CI secret stores | Inventory, least privilege, rotation, separate environments, no client admin keys |

## Cost and failure coupling

“All free” is not one budget. It is a vector of independent ceilings. A request through Worker → hosted auth → database → queue → email may succeed partially and consume quota in several places. Retried deliveries can multiply queue and compute usage. Provider A's free tier can force an architectural move even while the other providers remain free. At paid scale, several low minimums can cost more than one integrated $25 plan and require more operator time.

Use these rules:

1. One authoritative relational database.
2. One identity authority.
3. One queue for each job class, with a database outbox.
4. One public API contract.
5. Object storage only for binaries, not a second metadata database.
6. External email and observability are optional adapters.
7. Every adapter has timeout, idempotency, redaction, and replacement tests.

## What each recommended stack preserves

| Asset | Cloudflare-native | Worker + Supabase | Supabase-only | Worker + Turso/Better Auth |
| --- | --- | --- | --- | --- |
| Share Sheet Shortcut | Unchanged | Unchanged | Unchanged if `/v1` retained | Unchanged |
| `/v1` JSON and endpoints | Unchanged | Unchanged | Reimplemented in Edge Functions | Unchanged |
| Validation/idempotency/ranking | Unchanged | Unchanged | Domain logic ported | Unchanged |
| Domain IDs and terminology | Unchanged | Unchanged | Unchanged | Unchanged |
| SQLite schema/queries | Unchanged | Ported to Postgres | Ported to Postgres | Mostly retained |
| Current D1 repository | Unchanged | Replaced | Replaced | Replaced with libSQL client |
| Manual token auth | Retained initially | Replaced/bridged to Supabase Auth | Replaced | Replaced by Better Auth when UI exists |
| Local smoke expectations | Retained | Run against Postgres adapter | Run against Edge/Postgres | Run against Turso adapter |

## Recommended staged stacks

### Minimal stack now

**Workers + D1; no Queue, R2, hosted Auth, email, or external observability yet.**

- Keep two revocable actor tokens for the Shortcut.
- Save captures transactionally. If asynchronous enrichment is later selected, add durable outbox state before introducing a Queue.
- Add an export/restore rehearsal.
- Use structured, redacted Worker logs and a health endpoint.
- Preserve a repository interface and provider-neutral contract suite.

This is not pretending to be consumer identity. It is a bounded private utility.

### Growth stack

**Supabase Postgres/Auth/RLS + Edge Function `/v1` + one queue + Resend.**

- Prefer Supabase Queues if jobs should transact with Postgres and a scheduled/long-running consumer already exists.
- Add or retain a Cloudflare Worker only if it owns a measured edge concern. Then prefer Cloudflare Queues when that Worker owns enrichment and 24-hour Free retention is acceptable because the Postgres outbox can replay.
- Use Supabase Storage by default for private, RLS-integrated attachments; choose R2 for high-serving/egress use cases.
- Add Sentry only when native logs cannot correlate API, queue, and client failures.
- Keep provider subjects in `identity_links(provider, subject, actor_id)` and domain actors independent.

The default composition has one core backend vendor plus replaceable email. It becomes two core vendors only when Cloudflare supplies a capability the measured system actually needs.

### Consolidated growth alternative

**Supabase Postgres/Auth/RLS/Storage/Queues + Edge Functions + Resend.**

Choose it when one operational console and tight RLS integration matter more than preserving Cloudflare gateway independence. Keep `/v1` and acceptance tests so the API remains portable.

## Triggers to consolidate, split, or switch

### Move from D1/manual tokens to Postgres/Auth before

- opening self-service registration or invitations;
- supporting more than one household;
- needing recovery, logout-all-sessions, OAuth/passkeys, or native/web sessions;
- storing meaningful private production data without a tested migration;
- needing database-enforced household RLS, complex analytics, or geospatial queries.

### Add a separate queue/workflow provider when

- enrichment must retry beyond the native queue retention;
- workflows wait for multiple external events or human approval;
- concurrency/rate control is a product requirement;
- native queue observability is insufficient and the paid workflow cost is justified.

### Add external auth when

- built-in identity cannot provide a required passkey, enterprise, organization, or branded flow;
- the team explicitly accepts external identity mapping and pricing;
- an integration test proves JWT, actor mapping, and RLS behavior end to end.

### Consolidate services when

- on-call debugging requires visiting more than two core status/log consoles;
- cross-provider latency is material to capture UX;
- minimum paid plans exceed one integrated provider's price;
- authorization logic exists in more than one place and drifts;
- backup/restore requires coordinating multiple stores.

### Switch database when

- measured D1 contention, latency, transaction needs, database size, or analytics—not hypothetical scale—fails acceptance thresholds;
- Supabase pausing or paid floor is unacceptable for the actual usage pattern;
- Neon cold-start p95 breaks the Shortcut experience;
- a provider-neutral dump and contract test pass against the destination.

## Decision

Combining free services can avoid a premature rewrite **only when the API and domain remain independent of them**. For the immediate two-person Shortcut, the existing Cloudflare-native slice is the smallest deployment candidate once provider deployment is authorized; keep an explicit Postgres/Auth migration trigger. If the stated ambition already includes multiple households or polished invitation/recovery, skip that migration and use the consolidated Supabase growth stack now. Preserve `/v1`; add a Worker gateway later only when it has a demonstrated job.

The services should not be selected by the largest combined headline quota. Select the smallest set whose failure boundaries are understood:

- Cloudflare for stable HTTP gateway, rate limiting, async edge jobs, and optional egress-friendly files.
- Supabase for relational source of truth, identity, RLS, and realtime growth.
- Resend for production transactional email when needed.
- One queue, not several.
- Native logs first; Sentry when cross-system correlation justifies another data processor.

No account, deployment, external identity, or production data is required to decide between these two paths. The next evidence-producing step is a local/ephemeral adapter spike that runs the current `/v1` contract suite against Supabase Postgres and measures the authorization and latency boundary—not a broad multi-service build.
