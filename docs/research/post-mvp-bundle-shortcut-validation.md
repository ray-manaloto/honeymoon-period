# Post-MVP bundle budget and signed Shortcut validation

- **Status:** Research complete; constraints implemented
- **Last verified:** 2026-07-16
- **Scope:** GitHub issues [#16](https://github.com/ray-manaloto/honeymoon-period/issues/16) and [#17](https://github.com/ray-manaloto/honeymoon-period/issues/17)
- **Research:** linked — this report (primary/owning sources checked 2026-07-16).
- **Last30Days:** not needed — #16 is decided by measured local Vite output and
  #17 by Apple-owned local tool behavior; no recent practitioner technique or
  recommendation is used as authority.

## Question

What primary-source constraints should govern (1) a Vite 8 production-JavaScript
budget and useful code splitting, and (2) the strongest non-mutating validation
of the repository's Apple-signed `.shortcut` deliverables?

## Verified facts

### #16: Vite build and chunking

1. Vite's documented `build.chunkSizeWarningLimit` default is **500 kB**, and
   it is a *warning limit*, not a build-failure budget. At issue intake the
   project had `build: { target: "es2023" }` only; #16 subsequently added the
   measured chunk strategy and failing budget check described below. [Vite build options](https://vite.dev/config/build-options#build-chunksizewarninglimit)

2. Current Vite documentation says that chunk splitting is configured through
   `build.rolldownOptions.output.codeSplitting`; the Vite 8 migration surface
   must therefore be confirmed against its installed compatibility API before
   changing the config. The repository is pinned to `vite` **8.1.4** in
   [`apps/web/package.json`](../../apps/web/package.json), while current online
   documentation tracks the newer Rolldown-facing interface. [Vite build guide: chunking strategy](https://vite.dev/guide/build#chunking-strategy)

3. Vite supports dynamic imports in its production build and emits a
   `vite:preloadError` event if a dynamically imported chunk cannot load. That
   is the source-owned failure mode to account for when route-level lazy
   loading is introduced. [Vite build guide: load error handling](https://vite.dev/guide/build#load-error-handling)

4. The accepted issue baseline is one minified `index-*.js` at approximately
   **821.85 kB**, **260.59 kB gzip** (issue #16, observed 2026-07-16). Current
   source eagerly imports React-admin and the list, capture, and detail screens
   from [`App.tsx`](../../apps/web/src/App.tsx). The route `/capture` and the
   resource show view are independently addressable, so route-level dynamic
   imports are a real feature boundary rather than an invented package split.

5. No fresh production build or analyzer was run for this research report: the
   assigned scope permits writing only this report, and a Vite build would
   rewrite `apps/web/dist`. Consequently, this report does **not** claim a
   fresh byte-attribution by package. The recorded issue baseline, current
   import graph, and the implementation's before/after build measurement must
   supply that evidence.

### #17: signed Shortcut artifacts

1. Apple documents `shortcuts sign` as a command that signs an already exported
   shortcut. In `anyone` mode it notarizes through iCloud and permits anyone to
   import; the documented command accepts only `--mode`, `--input`, and
   `--output`. [Apple: run shortcuts from the command line](https://support.apple.com/guide/shortcuts-mac/run-shortcuts-from-the-command-line-apd455c82f02/mac)

2. On this macOS toolchain, `/usr/bin/shortcuts --help`, `shortcuts help sign`,
   and `man shortcuts` expose only `run`, `list`, `view`, and `sign`; there is
   no Shortcut-specific `verify`, `validate`, `import`, or inspect/export
   command. The manpage matches the Apple documentation: `sign` has
   output-path semantics and is mutating for a deliverable. This is local,
   reproducible tool evidence collected on 2026-07-16.

3. Apple documents import as a Shortcuts-app UI action (open or drag the
   `.shortcut` file). Import adds the shortcut to the user's collection, so it
   cannot serve as a repository-non-mutating automated validator. [Apple: import shortcuts on Mac](https://support.apple.com/guide/shortcuts-mac/import-shortcuts-apd02bffbaac/mac)

4. The two present deliverables start with `AEA1` followed by a binary-plist
   signature envelope containing `SigningCertificateChain`; both are nonempty
   (`25,757` and `32,651` bytes on 2026-07-16). `file` labels each merely as
   `data`, and `plutil -lint` rejects the wrapped file at byte zero. These are
   local artifact observations, **not** proof that either cryptographic
   signature is valid.

5. At issue intake, `npm run check:shortcuts:readonly` compiled copies of
   canonical Cherri sources into a temporary directory, fixed and validated
   their generated plist structure, then checked only that the two `dist`
   artifacts were nonempty. This was #17's gap; the implemented command now
   includes the AEA verification described below. See
   [`scripts/verify-shortcuts-readonly.sh`](../../scripts/verify-shortcuts-readonly.sh).

6. `codesign --verify`, `spctl`, and `pkgutil --check-signature` are not
   applicable Shortcut signature verifiers on this toolchain: respectively,
   they report no code signature / cannot assess the file / cannot open it as a
   package. Apple documents those tools for code and package signing, not
   `.shortcut` notarization. This is local negative evidence only; it must not
   be presented as an Apple guarantee that no verifier exists on every future
   macOS release.

7. A bounded follow-up found the Apple-owned `/usr/bin/aea` tool on this macOS
   installation. Its local help describes `decrypt -sign-pub` as accepting the
   sender public key “used to verify signature.” Extracting each artifact's own
   `SigningCertificateChain[0]`, converting that DER certificate to a P-256
   public key with bundled `/usr/bin/openssl x509 -pubkey`, and running
   `/usr/bin/aea decrypt -sign-pub` succeeded for both genuine artifacts while
   writing authenticated output only to a temporary directory. This owning-tool
   evidence was collected on 2026-07-16; no Shortcut was imported or run.

8. The same command rejected signature-byte and authentication-data changes
   with `Signature verification`, and rejected payload changes and truncation
   through HMAC/read authentication failures. The authenticated output begins
   with the Apple Archive `AA01` framing. Protected source/deliverable hashes
   and Git status were identical before and after these probes. This establishes
   cryptographic AEA envelope signature verification and authenticated payload
   integrity, but it does not establish Apple notarization or revocation state,
   authorize the certificate identity for this project, or prove Shortcut
   importability and runtime behavior.

## Inferences and recommended constraints

### #16

- Keep Vite's 500 kB warning threshold at its default; raising it would conceal
  the issue rather than enforce the accepted maximum. Add an explicit
  post-build budget script to the aggregate `npm run check` that reads emitted
  JavaScript sizes and fails at **500 kB minified per chunk** and **260.59 kB
  gzip initial-load JavaScript**. The script must define initial-load precisely
  from the built HTML/module-preload graph, rather than summing every lazy
  route.
- First measure the produced chunks and use the installed Vite 8-compatible
  chunk configuration. Prefer lazy boundaries at `capture` and the
  resource-detail route; retain the list route as the initial experience.
  Split a vendor chunk only when the measurements show it reduces the
  initial-load set. Do not hand-edit generated clients and do not create a
  generic `node_modules`-per-package splitting rule without a measured result.
- Add tests for the budget parser with fixtures for pass, oversized chunk, and
  initial-load gzip regression. Record the exact pre/post minified and gzip
  values and emitted chunk composition on issue #16.

### #17

- The strongest supported *automated, repository-non-mutating* assurance now
  available is AEA envelope verification: reject empty files and malformed
  `AEA1`/authentication-data framing, extract the leaf signing certificate,
  derive its public key, and require Apple `aea decrypt -sign-pub` to
  authenticate an `AA01` payload in scratch space. Run it together with the
  existing independent source-structure checks.
- This flow **does verify the cryptographic signature and authenticated payload
  integrity of the AEA envelope**. It does **not** validate Apple notarization,
  certificate revocation or trust policy, signer authorization for this
  project, or Shortcut import/runtime semantics. State that narrower boundary
  exactly in user-facing documentation.
- Automated regressions should copy fixture bytes to a temporary directory,
  validate the genuine file, then reject empty, truncated, altered-magic, and
  malformed-envelope copies. Assert SHA-256 hashes of both `dist/*.shortcut`,
  canonical Cherri sources, and `git status --porcelain` are unchanged before
  and after the command. Those fixtures must stay temporary; no artifact may
  be re-signed, imported, replaced, or committed as a test byproduct.

## Product constraints carried into implementation

- Preserve both canonical sources and signed deliverables; `dist/*.shortcut`
  remains generated/signable output and all rebuild/sign commands require
  separate artifact-mutation authorization.
- Keep the web/API architecture provider-neutral. A bundling change must not
  alter the generated client contract, React-admin behavior, or the eight
  committed Playwright flows.
- Do not use Apple Account credentials, iCloud, Shortcuts UI import, device
  state, browser cookies, paid services, or a physical device to achieve the
  automated validation claim.

## Decisions the root agent must make

1. **#16 route boundary:** approve lazy loading for capture and detail first,
   subject to measured initial-load and navigation behavior, or select a
   different measured boundary after the Vite 8 output analysis.
2. **#16 budget definition:** confirm that the 260.59 kB gzip ceiling applies
   to HTML-reachable initial JavaScript (entry plus Vite preloads), while the
   500 kB ceiling applies to every emitted JavaScript chunk.
3. **#17 assurance wording:** use Apple `aea` for cryptographic signed-envelope
   and payload-integrity verification, while explicitly retaining the separate
   trust/notarization, signer-authorization, importability, and runtime limits.
4. **#17 future platform check:** decide whether a manual, human-owned import
   ceremony belongs in a separate release/readiness checklist. It must not be
   represented as an automated read-only regression.

## Remaining uncertainty

- The current official Vite site describes the newer Rolldown configuration
  surface, while this repository pins Vite 8.1.4. The implementer must inspect
  the installed Vite 8 types/help or run its focused test build before choosing
  `rolldownOptions` versus a compatibility `rollupOptions` setting.
- No public Apple web documentation found on 2026-07-16 specifies the on-disk
  `AEA1` authentication-data schema or the project-specific signer trust
  policy. The local Apple-owned `aea` help and verified behavior support the
  cryptographic integrity claim; parser field choices remain compatibility
  checks, and trust/notarization/import/runtime claims remain out of scope.
