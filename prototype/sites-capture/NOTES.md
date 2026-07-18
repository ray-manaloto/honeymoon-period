# Prototype findings

## Question

Can the Share Sheet capture path be reduced to a Shortcut-to-service contract
before choosing native iOS or production backend architecture?

## Answer so far

Yes for the transport and record semantics. Hosted access control and provider
deployment remain a separate authorization checkpoint.

Verified locally with synthetic reserved-domain fixtures on 2026-07-15:

- A JSON POST retains the exact original URL and derives the actor from a bearer
  token rather than trusting a client-supplied label.
- Conservative normalization provides an exact-link dedupe key without
  overwriting provenance.
- The first capture returns `201 created`; replaying its request ID returns `200
  replayed`; an equivalent URL under a new request ID returns `201 existing`;
  malformed URLs return `400`.
- Authenticated query APIs return the captured state and deterministic rank
  components without enrichment, calendar access, an AI model call, or a UI.
- The separate Cherri source compiles and signs as a Share Sheet Shortcut with
  URL/text inputs, JSON POST, and import-time endpoint/token configuration.
- The canonical Reminders Shortcut remains unchanged.

The backend-service research in
`docs/research/api-first-backend-services.md` recommends Cloudflare Workers + D1
for the fixed-two-participant API, with Supabase as the explicit identity-heavy
fallback. Current OpenAI Sites documentation establishes that Sites can host web
apps and use D1, but does **not** establish the stable external API lifecycle
needed for the core service. Every deployed Sites URL is a production deployment.

## Productization checkpoint

The provider-local Workers + D1 vertical slice now covers capture, actor-owned
preferences, notes/metadata, and a deterministic ranked query. The remaining
checkpoint is human authorization and provider login before creating a free D1
database, bootstrapping fresh participant-token digests, and publishing a Worker.
Keep Sites as optional visual exploration in `SITES_PROMPT.md`; build the
canonical source-controlled web UI from `docs/product/web-mvp-plan.md`. Do not expose the API
without authentication and deployment controls.

The Build iOS Apps simulator workflow is not needed for this Shortcut-only slice.
It becomes useful if this contract is later wrapped in our own native app. The
current Mac cannot run that workflow yet because full Xcode and an iOS Simulator
runtime are not installed.
