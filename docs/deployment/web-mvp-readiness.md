# Web MVP deployment readiness

- Status: local-ready; deployment not authorized
- Governing decision: [ADR-0002](../adr/0002-api-first-web-mvp.md)
- Provider scope: Cloudflare Workers + D1 is the current replaceable adapter

## Configuration and secrets

The repository contains no production credentials. `apps/api/fixtures` holds
only obvious local bearer tokens and is never part of migrations. A future
operator must create two independently delivered random participant tokens,
store only their SHA-256 digests in D1, keep plaintext values out of shell
history/logs/source, and configure deployment-specific bindings. Provider login,
account security, production identity selection, and secret delivery are
human-only ceremonies under the [lab identity convention](../conventions/lab-identities.md).

The public `/v1` contract is provider-neutral. Cloudflare binding names, D1 SQL,
React-admin query conventions, and local fixture tokens are not public API
fields.

## Migration, export, rollback

Before any separately authorized deployment:

1. export the target D1 database with schema and data to an access-controlled,
   non-repository location;
2. review pending migrations and apply them with Wrangler to the explicit target;
3. run authenticated health, capture, replay, query, preference, note, and
   metadata smoke checks using synthetic records; and
4. retain the prior Worker version and export identifier until acceptance.

Rollback means restoring the prior Worker version first, then restoring/exporting
data only when the migration is not backward compatible. The current initial
migration is additive from an empty database; future migrations must document
forward compatibility, export format, and tested rollback steps before approval.
Never run the local seed against a remote database.

## Abuse limits and observability

The Worker limits each authenticated participant to 120 requests per minute and
caps JSON bodies at 16 KiB; metadata is capped at 8 KiB. A public deployment must
re-evaluate these reversible local defaults, CORS origin policy, token rotation,
and provider-level rate limiting before exposure.

Local logs record technical unexpected-error messages without request bodies,
tokens, source URLs, notes, metadata, or actor details. A deployed environment
needs retention limits, access controls, error-rate/latency/5xx monitoring, and
an alert owner before accepting production data.

## Exact human checkpoint

No checkpoint is required to complete or verify the local MVP. Deployment would
require one new batched authorization: the repository owner signs in to the
intended Cloudflare account, selects or creates the target Worker/D1 resources,
reviews billing and terms, provisions production participant secrets without
sharing them with the agent, approves the exact public origin/CORS policy, and
explicitly authorizes migration plus publication. After that checkpoint, local
verification must be rerun before any remote command.
