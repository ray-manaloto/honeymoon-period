# 2026-07-16: Green checks need an independent semantic completion gate

- Status: accepted
- Scope: API-first web MVP completion workflow
- Evidence type: reproduced failures, control-flow risk, and workflow friction

## Observation

The aggregate check was green before independent review found incomplete
OpenAPI error coverage, an idempotency orphan risk, nested primary landmarks,
and insufficient phone-layout evidence. Workflow friction also came from
untracked implementation files, a generic commit instruction, Browser API
drift, noisy generated searches, and Shortcut verification that re-signed a
tracked artifact.

## Evidence

- Operation-level contract coverage failed when required error responses were
  asserted.
- Component tests observed duplicate `main` landmarks before the UI correction.
- The original phone test did not compare document width or exercise the
  ranked/detail surfaces.
- `git diff` omitted the untracked MVP implementation.
- The documented Browser screenshot call was absent from the selected runtime.
- The mutating Shortcut verifier changed a previously clean signed deliverable.
- The idempotency orphan was classified as a control-flow risk; the local
  scheduler did not reproduce the bad interleaving before the atomic D1 fix.

## Correction

The implementation added complete error responses, atomic capture arbitration
with cleanup, one-landmark UI structure, and stronger phone E2E coverage. The
workflow now includes semantic response auditing, read-only dirty-tree
manifests, generated-aware search, non-mutating Shortcut source verification,
explicit instruction precedence, and reserved final verification agents.

## Enforcing guard

- `scripts/check-openapi-responses.mjs`
- `tests/tooling.test.mjs`
- API differing-payload concurrency regression
- component one-landmark assertions
- Playwright document-width/list/detail/form assertions
- `npm run check`
- fresh verifier `ACCEPT` plus validator `PASS`

## Promoted instructions

The lesson is promoted into `AGENTS.md`, `docs/testing/web-mvp.md`, the handoff
template, project-local implementation/review/frontend skills, and the
explorer/reviewer/verifier/validator/worker agent briefs.

## Residual risk

Static audits can drift if Worker error behavior or operation identities change
without updating the required status policy and explicit operation matrix.
Reviewers must continue comparing emitted behavior and operation IDs with the
canonical public contract.

## Retirement condition

Retire or replace this entry when a stronger generated operation/runtime
contract validates both response policy and unique non-empty operation IDs, and
all referenced instructions have migrated to that authority.
