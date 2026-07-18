# API-first Workers + D1 seed prototype

This provider-local prototype proved the recommendation now accepted in
`docs/adr/0002-api-first-web-mvp.md`. It remains the behavior-preserving seed
for promotion into the production workspace. It is not deployed and uses only
obvious fixture bearer tokens loaded from `fixtures/local-actors.sql` by the
smoke script. Production migrations contain no credentials. Never apply that
fixture file or reuse those tokens outside local development.

Run the complete local vertical slice:

```sh
cd prototype/cloudflare-api
npm install
npm run smoke
```

The smoke flow exercises capture creation, idempotent replay, normalized-URL
dedupe, two independently actor-owned preferences, notes, structured metadata,
a deterministic ranked query with visible components, URL validation, and
rejection of an unauthenticated query.

The Worker caps JSON bodies at 16 KiB, accepts only `http` and `https` capture
URLs, compares actor token digests with the runtime's timing-safe primitive, and
limits each actor to 120 authenticated requests per minute. A deployed database
must be bootstrapped with fresh random participant-token digests through a
separate, non-repository ceremony.

The seed intentionally omits accounts/invitations, enrichment, calendar
access, AI calls, a UI, and production deployment. The Reminders + Beli Shortcut
baseline remains unchanged.

Do not expand this directory into the final workspace piecemeal. Promote behavior
through the tracer bullets in `docs/product/web-mvp-plan.md`, preserving the
smoke flow as a compatibility test.
