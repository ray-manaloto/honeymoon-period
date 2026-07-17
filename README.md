# honeymoon-period

honeymoon-period is a product investigation for a shared iPhone workflow that turns links into ranked, actionable plans. The target experience accepts links from the iOS Share Sheet, lets two people vote or score them, stores notes and structured metadata, prioritizes time-sensitive ideas, and helps schedule them.

The project is now building an **API-first web MVP**. Cloudflare Workers + D1 provide the initial service, a versioned OpenAPI contract generates clients and models, and a React-admin + Vite web UI supplies capture review, preferences, notes, metadata, sorting, and ranking. A native SwiftUI client remains the intended iOS destination after the web workflow is proven.

The working Apple Reminders + Beli + Shortcut workflow remains a supported baseline and evidence source during the transition.

## Start here

- [Product context](CONTEXT.md)
- [Stable requirements](docs/product/requirements.md)
- [Approved web MVP plan](docs/product/web-mvp-plan.md)
- [Research index](docs/research/README.md)
- [Architecture decisions](docs/adr/README.md)
- [Local web MVP and baseline setup](docs/SETUP.md)
- [Prototype trial](docs/TWO_WEEK_TRIAL.md)
- [Repository conventions](docs/conventions/README.md)

## Baseline and API prototype

- Apple Reminders is the shared inbox and decision history.
- Beli holds mutually wanted restaurants and post-visit rankings.
- **Save honeymoon-period** captures shared URLs without a backend, analytics, paid API, or account token.
- The local Workers + D1 vertical slice under `prototype/cloudflare-api` proves capture, actor-owned preferences, notes/metadata, deterministic ranking, and authenticated query behavior.

Install and usage details remain in [docs/SETUP.md](docs/SETUP.md). The canonical Shortcut source is `shortcut/Save honeymoon-period.cherri`; `dist/Save honeymoon-period.shortcut` is the generated, signed deliverable.

## Build and verify

Requirements for the web MVP: Node.js 22.18 or later and npm 11.6.2.

```sh
npm ci --ignore-scripts
npm run check
```

The aggregate check validates generated-file drift, Biome, strict TypeScript,
unit/component/contract/Worker integration coverage, production builds, and all
eight committed Playwright flows against a newly migrated local D1 database.
It also runs the repository's semantic OpenAPI response audit, enforces a
500,000-byte ceiling for every production JavaScript chunk and a 260,590-byte
gzip ceiling for HTML-reachable initial JavaScript, and runs read-only tooling
regressions. Use `scripts/semantic-search.sh` for bounded source review and
`node scripts/worktree-manifest.mjs <paths...>` when a handoff needs hashes for
dirty or untracked artifacts.

Requirements for the baseline: macOS, Apple Shortcuts, Git, Go, and Python 3.

```sh
npm run check:shortcuts:readonly
```

The read-only command compiles temporary copies of both canonical Shortcut
sources and verifies their generated workflow structure. For each existing
signed artifact, it parses the `AEA1` authentication-data envelope, derives a
public key from the embedded leaf certificate in temporary storage, and uses
Apple's `aea decrypt -sign-pub` to verify the ECDSA envelope signature and
authenticated payload integrity. It also requires the authenticated `AA01`
Apple Archive to contain a nonempty `Shortcut.wflow` entry.

This is a local, non-mutating consistency check: it proves that the envelope was
signed by the private key corresponding to its embedded certificate and that
the authenticated payload is intact. It does not establish Apple notarization,
certificate-chain trust or revocation, an authorized signer identity, Shortcuts
UI importability, or runtime behavior. The command requires the pinned Cherri
binary already provisioned under `.build/bin` and the macOS `aea`, `aa`, and
`openssl` tools. The mutating `./scripts/verify.sh` and
`./scripts/verify-save-date-idea.sh` commands rebuild and re-sign deliverables
and should be used only when that artifact change is intended.

Local run instructions and the synthetic participant boundary are in
[docs/SETUP.md](docs/SETUP.md). Deployment remains separately authorized; the
readiness and rollback contract is documented in
[docs/deployment/web-mvp-readiness.md](docs/deployment/web-mvp-readiness.md).

## Privacy and cost

Keep real relationship, calendar, location, and private Notes content out of this public repository. No paid service, physical-device action, distribution action, or production credential may be introduced without explicit approval.

Vendored workflow attribution and licenses are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
