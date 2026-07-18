# Non-mutating local toolchain doctor

- **Status:** Research complete; recommendation pending root decision
- **Last verified:** 2026-07-17
- **Scope:** Candidate 3 — a local diagnostic for prerequisites of the existing
  web MVP checks and Shortcut read-only check. It does not change the product
  toolchain or authorize an installation.
- **Research:** linked — this report; local source and owning documentation
  checked 2026-07-17.
- **Last30Days:** reused —
  [Research-first agent workflow](research-first-agent-workflow.md#last30days-supplement)
  already evaluated current agent-workflow practice; no project-specific
  community signal changes this repository-contract question.

## Question

What is the smallest useful, repository-local, non-mutating **Module** for
reporting whether a contributor can run the already-defined verification
commands, without turning environment detection into a second installer,
package manager, test runner, or Shortcut artifact workflow?

## Evidence and verified facts

### Repository evidence

1. The root workspace is npm workspaces with a committed lockfile, declares
   `packageManager: npm@11.6.2`, and requires Node `>=22.18`; its current
   aggregate check already sequences generation, static checks, tests, builds,
   the bundle budget, and Playwright ([`package.json`](../../package.json#L6-L33),
   [`package-lock.json`](../../package-lock.json#L4-L36)). `apps/web` pins Vite
   8.1.4 and the lock resolves Rolldown ~1.1.4
   ([`apps/web/package.json`](../../apps/web/package.json#L3-L25),
   [`package-lock.json`](../../package-lock.json#L109-L126)).
2. Setup requires Node 22.18+ and npm 11.6.2, uses `npm ci --ignore-scripts`,
   and describes `npm run check` as the web-MVP acceptance command
   ([`docs/SETUP.md`](../SETUP.md#L3-L12), [`docs/SETUP.md`](../SETUP.md#L32-L35)).
   npm documents that `npm ci` requires a lockfile, errors when it disagrees
   with `package.json`, removes an existing `node_modules`, and never writes the
   manifest or lockfile; `--ignore-scripts` suppresses lifecycle scripts but
   does not suppress an explicitly requested `npm run` script.
   [npm ci](https://docs.npmjs.com/cli/commands/npm-ci/)
3. npm documents `engines` as advisory unless `engine-strict` is configured.
   It also documents `optionalDependencies` as dependencies npm may skip when
   they cannot be installed; therefore their absence is not itself a general
   install failure. npm 11 adds `devEngines`, which runs before `install`, `ci`,
   and `run` and can set `onFail` to `warn`, `error`, or `ignore`.
   [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
4. This checkout's read-only probe found Node **v26.5.0**, npm **12.0.1**,
   active developer directory `/Library/Developer/CommandLineTools`, and
   installed `aea`, `aa`, `plutil`, and Playwright **1.61.1**. The pinned
   `.build/bin/cherri` executable was absent. These are local observations on
   2026-07-17, not assertions about another developer's machine. Node satisfies
   the root lower bound; npm does not equal the repository pin. No install,
   build, signing, import, or browser download was performed to obtain this
   evidence.
5. The committed Playwright configuration has one Chromium project and launches
   disposable local API/web servers; the API server command first calls the
   explicitly destructive local-only `db:reset`
   ([`playwright.config.ts`](../../playwright.config.ts#L3-L31),
   [`apps/api/package.json`](../../apps/api/package.json#L5-L10)). Playwright
   documents that each release needs matching browser binaries and `playwright
   install` downloads them; browser installation uses an OS cache by default.
   [Playwright browsers](https://playwright.dev/docs/browsers)
6. Vite documents a production build based on Rolldown and documents
   `build.rolldownOptions`/`output.codeSplitting` for current chunk control.
   The repository intentionally uses the installed Vite 8 compatibility
   configuration under `build.rollupOptions` with measured chunks, and its
   checked budget reads emitted output after a build
   ([`apps/web/vite.config.ts`](../../apps/web/vite.config.ts#L11-L37),
   [`scripts/check-web-bundle-budget.mjs`](../../scripts/check-web-bundle-budget.mjs#L7-L10),
   [`docs/testing/web-mvp.md`](../testing/web-mvp.md#L63-L88)).
   [Vite build guide](https://vite.dev/guide/build),
   [Vite 8 announcement](https://vite.dev/blog/announcing-vite8)
7. Apple states that Command Line Tools (CLT) includes the macOS SDK, man pages,
   and toolchain binaries, while `xcodebuild` is supplied only by full Xcode.
   Thus a doctor may report the selected developer directory and individual
   executable capabilities, but must not claim CLT is a full Xcode installation.
   [Apple: installing command-line tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools)
8. The Shortcut read-only check fails early with exit 2 when the pinned Cherri
   executable is absent, compiles only temporary copies when it is present, and
   validates existing `dist` artifacts without replacing them
   ([`scripts/verify-shortcuts-readonly.sh`](../../scripts/verify-shortcuts-readonly.sh#L4-L15),
   [`scripts/verify-shortcuts-readonly.sh`](../../scripts/verify-shortcuts-readonly.sh#L18-L47)).
   The canonical mutating scripts clone Cherri at commit
   `68f3f3feaf00768f7943f650b2230605355936ed`, invoke Go, delete/recreate
   deliverables, and call `shortcuts sign`
   ([`scripts/build-shortcut.sh`](../../scripts/build-shortcut.sh#L8-L24),
   [`scripts/build-shortcut.sh`](../../scripts/build-shortcut.sh#L26-L44)).
   Apple documents `shortcuts sign` as signing an exported shortcut to an output
   path, so it is not a diagnostic operation.
   [Apple: run Shortcuts from the command line](https://support.apple.com/guide/shortcuts-mac/run-shortcuts-from-the-command-line)
9. The existing non-mutating verification is already deliberately narrow: it
   calls `/usr/bin/openssl`, `/usr/bin/aea`, and `/usr/bin/aa` only with
   temporary paths ([`scripts/verify-signed-shortcut.py`](../../scripts/verify-signed-shortcut.py#L75-L141)); it proves envelope/payload integrity, not
   notarization, trust/revocation, authorization, UI importability, or runtime
   ([`docs/research/post-mvp-bundle-shortcut-validation.md`](post-mvp-bundle-shortcut-validation.md#L132-L150),
   [`docs/testing/web-mvp.md`](../testing/web-mvp.md#L97-L115)). Tests already
   assert unchanged protected artifacts and Git status for success and corrupted
   fixtures ([`tests/tooling.test.mjs`](../../tests/tooling.test.mjs#L228-L300)).

## Capability-state semantics

The Module should produce a stable, machine-readable per-capability result and
a concise human summary. Its **Interface** is a read-only report, not an
instruction to repair the machine. Each capability has one of these states:

| State | Meaning | Aggregate consequence |
| --- | --- | --- |
| `ready` | Required executable/file/version/derived probe is present and meets the stated contract. | The dependent command may be attempted. |
| `mismatch` | Present but fails an exact pin, supported range, or repository compatibility rule. | Block the dependent reproducibility claim; report observed and required values. |
| `missing` | Required executable, repository file, browser binary, or pinned binary is absent. | Block only dependent capability; never install it. |
| `unverified` | A safe probe cannot establish the needed behavior (for example, valid signed artifact semantics beyond cryptographic envelope verification). | Do not convert this to `ready`; retain its documented human/release ceremony. |
| `not-applicable` | The selected command does not require this capability on this platform. | Neutral; do not treat as success for another command. |
| `error` | The doctor itself could not execute a read-only probe. | Conservative block with command/error category, not private command output. |

`ready` means *prerequisite observed*, not that `npm run check`, browser E2E,
or Shortcut validation has passed. The doctor must keep these predicates
separate: Node range; npm pin; lock/manifests; installed workspace dependencies;
Playwright runner/browser availability; web-toolchain resolution; macOS Shortcut
read-only prerequisites; and optional platform packages. In particular,
`optionalDependencies` must not become a universal required-capability list.

## Compared shapes

### A. A single deep diagnostic Module — recommended

One repository-owned Module exposes one interface such as “inspect selected
check prerequisites” and returns the capability states above plus dependent
commands. Its implementation may have internal seams for Node/npm, lockfile,
Playwright, Vite/Rolldown, Apple tools, and Cherri. Callers (setup docs, a
future CI preflight, and humans) learn one report format; no caller decides
whether a missing Cherri binary should be repaired or whether a Playwright
browser check may download one.

This is **deep**: it centralizes version parsing, executable discovery,
platform qualification, and safe error normalization behind a small interface.
It creates **leverage** for every existing check and **locality** for future
toolchain drift. The deletion test passes: deleting it would repeat coupled
version/path/side-effect reasoning across setup, E2E, and Shortcut callers.

### B. Add ad-hoc preflight snippets to each existing command — rejected

This makes each script a shallow Module: `check`, `e2e`, and
`check:shortcuts:readonly` would each learn versions, paths, message wording,
and policy distinctions. It duplicates the distinction between missing Cherri,
uninstalled Playwright browser, incompatible npm, and unavailable Apple tools.
Deleting one helper would make little complexity disappear because it has
already spread to N callers; the deletion test fails. It also risks converting a
read-only check into an installer by accident.

### C. An installer/bootstrapping manager — rejected now

It could make a fresh machine convenient, but has a large interface: package
manager selection, downloads, browser-cache path, CLT/Xcode prompts, Go/Cherri
bootstrap, trust, cleanup, and artifact repair. Its side effects conflict with
the current authorization boundary. npm's `ci` removes `node_modules`,
Playwright installs browser downloads, Apple CLT installation presents a system
dialog, and current Cherri provisioning clones/builds then can lead to signing.
This is a separate future workstream requiring explicit installation and
artifact-mutation authority, not an Adapter of the doctor.

## Recommendation and incremental adoption

Adopt shape A as a local Module only after the root selects its strictness:

1. Start with a **report-only** command that reads tracked manifests/lockfile,
   queries local versions/paths, and performs no builds, test-server starts,
   database reset, browser download, Cherri compilation, Shortcut import/run,
   signing, or user-home write. It should discover existing files only.
2. Report profiles for `web-check`, `e2e`, and `shortcuts-readonly`, rather than
   one global green state. `e2e` needs an installed Playwright Chromium binary;
   `shortcuts-readonly` needs the already-provisioned `.build/bin/cherri` plus
   `plutil`, Python 3, and the absolute Apple-tool paths used by the verifier.
3. Preserve the current scripts as the behavior authority. Initially link the
   report from setup and failures; do not make `npm run check` depend on it.
4. After observed use, add deterministic fixtures and only then decide whether a
   `ready` profile is a required precondition for a specific CI/local command.
   Do not introduce `devEngines` merely to implement the report: it would change
   npm's install/ci/run behavior, whereas this candidate is diagnostic.

## Guard and test matrix

| Guard | Required evidence | Must not do |
| --- | --- | --- |
| Manifest/lock guard | Exact root `packageManager`, Node range, workspaces, lockfile version and resolved Vite/Playwright presence. Fixtures cover absent/malformed lock and package disagreement. | Run `npm install`, `npm ci`, or modify lockfiles. |
| Runtime guard | Parse Node/npm versions; distinguish range-valid Node from exact-pinned npm. Fixtures cover `ready`, `mismatch`, and command failure. | Change PATH, activate a version manager, or install a runtime. |
| Workspace guard | Detect whether already-installed local executables needed by a selected profile resolve. | Build Vite/Rolldown output or generate source. |
| E2E guard | Confirm configured Chromium profile and whether the matching browser is already discoverable; report `missing` when absent. | `playwright install`, `install-deps`, browser launch, server start, or `db:reset`. |
| macOS Shortcut guard | Check selected developer directory and exact paths/tools consumed by the existing verifier; check Cherri is executable without invoking it. | `xcode-select --install`, full-Xcode install, Cherri build, `shortcuts run/view/sign`, or any artifact read/write beyond metadata/executable discovery. |
| Privacy/error guard | Normalize to tool name, state, required constraint, and safe path class; tests ensure no environment dump, home path, URL, credential, calendar, device, or Shortcut content is printed. | Read Apple account state, browser profile/cookies, calendars, or device data. |
| Non-mutation regression | Snapshot protected `dist/*.shortcut`, canonical Cherri sources, manifest/lockfiles, and `git status --porcelain=v1` before/after doctor fixtures, following the existing read-only test pattern. | Re-sign, replace, import, or run Shortcuts; create `.build` or user-home state. |

## Product constraints and authorization boundary

- The baseline Shortcut remains usable and is not replaced by this diagnostic.
- The doctor is not evidence that a Shortcut is importable, runnable, notarized,
  trusted, or authorized; it reports only prerequisites for the existing
  repository checks.
- No optional dependency, Playwright browser, CLT/Xcode package, Go toolchain,
  Cherri binary, or npm version may be installed by this candidate. A report may
  name the owning documented remediation and state that it needs separate
  approval.
- It must not inspect user-home browser caches beyond a presence probe, Apple
  account, Shortcuts collection, devices, calendars, private URLs, or
  relationship data. Existing source-controlled paths and synthetic local web
  configuration are the maximum scope.

## Root decisions required

1. Is npm **11.6.2** an exact reproducibility gate (`mismatch` blocks
   `web-check`) or a documented preferred pin with a warning while npm 12 is
   evaluated? Current local evidence makes this decision concrete.
2. Which profile(s) deserve initial support: all three recommended profiles, or
   only `shortcuts-readonly` where the missing pinned Cherri case is already a
   common actionable prerequisite?
3. May a doctor make an existence-only Playwright browser-cache probe, or should
   it report the runner as `unverified` and leave browser discovery entirely to
   Playwright's own future execution? The former is more actionable; both avoid
   downloads.
4. Should full Xcode be `not-applicable` until a native project exists, while
   CLT/Apple executable checks remain scoped solely to current Shortcut
   verification? This report recommends yes.

## Remaining gaps

- No Cherri release/install specification was found that supersedes the
  repository's pinned source commit; the current canonical provisioning script
  is the authoritative local contract. Consequently the doctor should check
  executable presence only, not invent a Cherri version parser.
- `packageManager` is repository metadata, while npm's documented enforcement
  mechanism is `devEngines`; whether to make the npm pin hard is a project
  decision, not a fact established by the field alone.
- The source record establishes Vite 8.1.4's resolved Rolldown dependency, but
  an existence/version doctor cannot prove a production chunk configuration is
  semantically correct. `npm run check:bundle` remains the authority.
