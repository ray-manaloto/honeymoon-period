# Web MVP verification

- Status: local implementation evidence
- Data boundary: synthetic fixtures only
- Governing contract: [web MVP plan](../product/web-mvp-plan.md)

## Aggregate command

`npm run check` is the clean-checkout acceptance command. It performs:

1. deterministic OpenAPI generation drift detection;
2. a semantic OpenAPI operation/error-response audit;
3. Biome formatting/lint checks and strict TypeScript project references;
4. unit and component tests with at least 90% line/branch coverage;
5. OpenAPI request/response contract and workerd + D1 integration tests with
   migrations applied from zero;
6. repository tooling tests, a dry-run Worker bundle, a Vite production build,
   and the production JavaScript budget; and
7. the eight committed Playwright flows in `e2e/web-mvp.spec.ts`.

The critical normalization, idempotency, participant ownership, authorization,
and ranking branches are exercised explicitly. Generated source and declarative
migrations are excluded from line coverage and instead checked by regeneration,
runtime contract validation, migration integration, uniqueness, and foreign-key
tests. The integration suite also applies the canonical local seed twice and
asserts identical synthetic actors and records after each reset.

## Semantic acceptance checklist

A green aggregate command is necessary but is not sufficient for MVP
acceptance. The independent verifier also confirms:

- every authenticated OpenAPI operation declares `400`, `401`, `429`, and
  `500` through the stable error response, enforced by
  `scripts/check-openapi-responses.mjs` and operation-level contract tests;
- idempotency covers identical and differing payloads, and concurrent reuse of
  one actor-owned request key cannot expose an orphan through the public list;
- every React-admin route has exactly one `main` landmark;
- phone verification compares `scrollWidth` with `clientWidth`, exercises
  capture, ranked list, rank explanations, and detail, then submits a
  preference mutation and remeasures overflow after the server-backed update;
- generated output remains reproducible and provider/framework conventions do
  not enter the public contract; and
- privacy, setup, deployment-readiness, and residual-risk documentation match
  the integrated behavior.

## Rendered QA

Committed Playwright tests are authoritative. They use accessible role/label
locators, one isolated browser worker, deterministic synthetic URLs, no arbitrary
sleeps, and no `networkidle`. The suite covers capture, replay, both participants'
preferences, notes and metadata editing, rank explanations, filtering/sorting,
empty/invalid/unauthorized/offline-retry states, a 390×844 phone viewport,
keyboard-only capture, and reload from server persistence.

The completion audit used the in-app Browser for desktop and 390×844 local
synthetic smoke testing, including page identity, meaningful DOM, console
health, screenshots, capture interaction, and responsive ranked-list review.
Committed Playwright remains the reproducible authority. Failure-only traces and
screenshots remain ignored artifacts and must not be committed without a
separate sanitized-evidence decision.

## Production web bundle budget

`npm run check:bundle` inspects the Vite production output after `npm run build`.
It fails when any emitted JavaScript chunk exceeds 500,000 minified bytes or
when the entry script plus `modulepreload` graph referenced by `index.html`
exceeds 260,590 gzip bytes. Tooling fixtures independently prove the passing,
oversized-lazy-chunk, and initial-load-regression paths.

The #16 baseline was one approximately 821,850-byte minified / 260,590-byte
gzip entry chunk. Route-lazy capture and detail screens plus measured vendor
chunks produced this normal Vite 8.1.4 build on 2026-07-16:

| JavaScript chunk | Minified bytes | Gzip bytes |
| --- | ---: | ---: |
| React-admin | 333,427 | 106,102 |
| MUI and Emotion | 286,999 | 91,226 |
| React runtime | 178,315 | 55,696 |
| Detail route | 10,719 | 3,070 |
| Entry | 8,069 | 2,904 |
| Shared state | 3,418 | 1,448 |
| Capture route | 2,452 | 1,116 |
| Rolldown runtime | 567 | 360 |

The HTML-reachable initial set is 257,736 gzip bytes; capture and detail remain
deferred until navigation. All eight Playwright flows, including the measured
390×844 phone list/detail/mutation workflow, remain the behavior authority.

## Read-only operator checks

- `node scripts/worktree-manifest.mjs <important files-or-directories...>`
  expands directories and records path, tracked state, byte size, and SHA-256
  without changing Git state.
- `scripts/semantic-search.sh PATTERN [PATH ...]` excludes generated validator
  bodies and disposable output from broad semantic searches.
- `npm run check:shortcuts:readonly` compiles canonical Shortcut sources in a
  temporary directory, verifies their generated workflow structure, then
  verifies each existing artifact's AEA ECDSA signature with the public key from
  its embedded leaf certificate. Apple's `aea` authenticates the payload, and
  `aa` must parse the resulting `AA01` archive with exactly one nonempty
  `Shortcut.wflow`; repository deliverables are never replaced. The command
  requires the already-provisioned pinned Cherri binary and the macOS `aea`,
  `aa`, and `openssl` tools.
- Tooling regressions reject empty artifacts, one-byte truncation, invalid
  `AEA1` magic, a malformed authentication-data envelope, and flipped
  authentication-data, ECDSA-signature, or payload bytes. Success and every
  failure case compare SHA-256 for both `dist/*.shortcut` files and both
  canonical Cherri sources plus exact `git status --porcelain=v1` output.
- The cryptographic check proves consistency with the certificate carried in
  the same envelope and authenticated payload integrity. It does not validate
  Apple notarization, certificate-chain trust/revocation, signer authorization,
  UI importability, or runtime behavior.
- `./scripts/verify.sh` and `./scripts/verify-save-date-idea.sh` are mutating
  build/sign workflows, not validator-safe read-only commands.

## Privacy

Fixtures use `example.com` subdomains, synthetic addresses/descriptions, and
obvious local participant tokens. Tests and application logs must not contain
real URLs, relationship details, calendar contents, locations, credentials, or
private notes. Expected client errors use the stable public error envelope;
unexpected server logs contain technical messages only and return a generic
client response.
