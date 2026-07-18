# Generated-source provenance manifest

- **Status:** Research complete; root decision required before implementation.
- Question: what is the smallest reviewable provenance record that explains how
  the repository's generated TypeScript source was produced and lets reviewers
  detect source, generator, or output drift?
- Accessed: 2026-07-17
- Research: linked — this report contains the new candidate-specific
  primary-source research. The related
  [verification-evidence bundle](verification-evidence-bundle.md) is reused for
  its subject/hash and unsigned-attestation constraints, not duplicated here.
- Last30Days: not needed — the question is about the checked-in deterministic
  generator and stable owning specifications, not a recent practitioner
  technique. The root owns any broader Last30Days lane.

## Local facts and constraints

**Verified local facts.** `openapi/v1.json` is an OpenAPI 3.1 document
([`openapi/v1.json`](../../openapi/v1.json#L1-L6)); `openapi/ui-metadata.json`
is the second current input ([`openapi/ui-metadata.json`](../../openapi/ui-metadata.json#L1-L8)).
The one generator module fixes those inputs, output directory, and generated
header ([`scripts/generate.mjs`](../../scripts/generate.mjs#L8-L14)), invokes
`openapi-typescript`, Ajv 2020 plus `ajv-formats`
([`scripts/generate.mjs`](../../scripts/generate.mjs#L16-L29)), and owns exactly
nine source outputs ([`scripts/generate.mjs`](../../scripts/generate.mjs#L127-L150)).
`npm run check:generated` compares each expected content string with the
checked-in source and exits nonzero when any differs
([`scripts/generate.mjs`](../../scripts/generate.mjs#L138-L151)); it passed on
2026-07-17. The aggregate check runs that guard before semantic, static, test,
build, budget, and browser checks ([`package.json`](../../package.json#L14-L29)).

The tool identity is currently a locked repository toolchain: npm 11.6.2 and
Node >=22.18 ([`package.json`](../../package.json#L6-L9)),
`openapi-typescript` 7.13.0, Ajv 8.20.0, and ajv-formats 3.0.1
([`package.json`](../../package.json#L35-L50),
[`package-lock.json`](../../package-lock.json#L21-L28)). Generated source lives
under `packages/generated/src`; the package exports that source and validators
([`packages/generated/package.json`](../../packages/generated/package.json#L1-L10)).
`packages/generated/dist` is TypeScript build output, not an input to
`generate.mjs`, and should not be reported as a generated-source subject.

The governing plan requires one canonical OpenAPI document, deterministic
generation, explicit generated directories and headers, no hand edits, and a
named review exception for every handwritten source
([`docs/product/web-mvp-plan.md`](../product/web-mvp-plan.md#L42-L63)). The
repository convention explicitly extends that rule to OpenAPI-derived clients,
models, validators, mocks, fixtures, and routine adapters
([`docs/conventions/README.md`](../conventions/README.md#L23-L48)). The ADR
reserves handwritten source for product behavior and a minimal adapter a
maintained generator cannot emit ([`docs/adr/0002-api-first-web-mvp.md`](../adr/0002-api-first-web-mvp.md#L10-L14)).

**Inference.** The current nine-file set is sufficiently narrow and stable to
make a manifest useful now. It should describe one generation *module*, not
become another generator or a generic supply-chain claim.

## Primary-source findings

1. OpenAPI defines a language-agnostic HTTP interface description so consumers
   can understand a service without its source; its OpenAPI Object is the root
   document. **Verified fact.** This supports treating the checked-in v1
   document as the contract input, rather than treating emitted TypeScript as
   canonical. [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0.html)
   (accessed 2026-07-17).

2. `openapi-typescript` 7.x supports OpenAPI 3.0/3.1 and its Node interface
   accepts an in-memory JSON object and returns a TypeScript AST, which callers
   can render with `astToString`. **Verified fact.** That is the exact mode
   used here, so the manifest must record the package version and the owning
   generator-script digest/options, not pretend a stock CLI configuration alone
   explains `types.ts`. [openapi-typescript introduction](https://openapi-ts.dev/introduction),
   [Node API](https://openapi-ts.dev/node) (accessed 2026-07-17).

3. Ajv supports build-time standalone validation source; the emitted functions
   can validate at runtime without initializing Ajv. **Verified fact.** The
   manifest must include Ajv and ajv-formats identities because they materially
   determine `validators.ts`; `// @ts-nocheck` is a generated-output detail,
   not a handwritten exception. [Ajv standalone validation](https://ajv.js.org/standalone.html)
   (accessed 2026-07-17).

4. npm defines `devDependencies` as project build/tool dependencies and
   lifecycle hooks can execute build tasks implicitly during install/pack.
   **Verified fact.** Keep this repository's explicit `generate` and
   `check:generated` scripts as the provenance invocation; do not move
   generation to `prepare` merely to obtain metadata, because that would add
   implicit lifecycle execution and reduce review clarity. [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/),
   [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/) (accessed
   2026-07-17).

5. An in-toto Statement binds immutable subjects by digest and a predicate
   type; SLSA provenance separately models subject, build definition,
   dependencies, builder, invocation, and byproducts. **Verified fact.** Those
   are useful field concepts. **Inference:** do not emit in-toto/SLSA claims or
   signatures: local generation has no approved trusted producer, signer,
   verification root, or supply-chain threat model. [in-toto Statement v1](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md),
   [SLSA provenance v1.2](https://slsa.dev/spec/v1.2/provenance) (accessed
   2026-07-17).

## Shapes compared

| Shape | Interface, depth, and review result | Decision |
| --- | --- | --- |
| A. Headers plus `check:generated` only | Small existing interface, but no record joins the canonical inputs, generator identity, output inventory, and clean-diff run. Reviewers reconstruct that matrix from several paths. | Retain as the guard, but insufficient alone. |
| B. Versioned repository-local manifest plus existing check (**recommended**) | One small interface: declared inputs, generator script/toolchain, ordered outputs, policy, and clean-diff evidence. Its implementation owns path containment, hashing, ordering, lockfile lookup, and schema validation. | Adds provenance locality without changing generation. |
| C. Per-output sidecars or an in-toto/SLSA attestation | Sidecars scatter the same facts across nine files; a signed attestation implies producer trust not present locally. Both add a shallow or misleading interface. | Reject now. |

## Recommendation

Adopt B incrementally as a `generated-source-provenance` **module**. Its
external **interface** is one versioned JSON manifest and one read-only
validator. Its **seam** is generation/review: the generator writes or validates
facts about a known source set, while reviewers consume one concise inventory.
The interface is the test surface.

Illustrative—not yet approved—shape:

```json
{
  "schemaVersion": 1,
  "generation": {
    "command": "node scripts/generate.mjs",
    "script": { "path": "scripts/generate.mjs", "sha256": "..." },
    "runtime": { "node": ">=22.18", "packageManager": "npm@11.6.2" },
    "tools": [
      { "name": "openapi-typescript", "version": "7.13.0" },
      { "name": "ajv", "version": "8.20.0" },
      { "name": "ajv-formats", "version": "3.0.1" }
    ]
  },
  "inputs": [
    { "path": "openapi/v1.json", "role": "canonical-contract", "sha256": "..." },
    { "path": "openapi/ui-metadata.json", "role": "versioned-ui-metadata", "sha256": "..." }
  ],
  "outputs": [{ "path": "packages/generated/src/types.ts", "sha256": "..." }],
  "policy": { "generatedHeader": "// @generated from openapi/v1.json; DO NOT EDIT.", "handwrittenExceptions": [] },
  "cleanDiff": { "command": "npm run check:generated", "outcome": "passed" }
}
```

The manifest must reject absolute/escaping paths, duplicate input/output paths,
an output outside `packages/generated/src`, missing SHA-256s, unknown output
roles, a tool version not resolved by the lockfile, and a clean-diff claim
without the exact guard command. `handwrittenExceptions` must be empty today;
when a non-generated routine-adapter exception is approved, it belongs in
ordinary reviewed source and its review reference belongs in this field—not in
the generated directory.

The **deletion test** passes: delete this module and the same input/tool/output/
clean-diff correlation reappears in each implementation review and final
verification. It creates **depth**, **leverage**, and **locality**, rather than
a pass-through inventory. It must not create an adapter seam around the
generator: there is only one generator implementation. Per the project
vocabulary, one adapter means a hypothetical seam; add a second adapter only
when a second real generator target/implementation exists. In particular, do
not reserve Swift-generator fields: native work is deferred and no Swift
adapter exists ([`docs/product/web-mvp-plan.md`](../product/web-mvp-plan.md#L43-L46)).

## Interaction with verification evidence

The provenance manifest answers only “which checked-in source generation
produced these outputs?” The evidence-bundle candidate answers “what commands
or observations supported an integrated review?” It may reference the
provenance manifest hash and a `check:generated` record, but must not duplicate
the output inventory, produce a verifier/validator verdict, or upgrade local
hashes to signed provenance. Keep their modules and interfaces separate.

## Incremental adoption and guard implications

1. Root decides whether the manifest is tracked canonical metadata regenerated
   by `npm run generate`, or a read-only report calculated during
   `check:generated`. Recommendation: tracked metadata, regenerated with the
   source, because review can inspect the exact inventory/digests in a diff.
2. Add a strict schema plus a tiny writer/validator inside the existing
   generation module's implementation; keep the external `generate` and
   `check:generated` interface unchanged.
3. Extend the existing stale-output guard so the manifest itself is checked,
   and add negative tooling tests for changed input, generator-script digest,
   tool version, output deletion/addition, path escape, duplicate path, and a
   handwritten exception without review reference.
4. In review, inspect the manifest diff alongside canonical inputs and ordinary
   handwritten source. A clean manifest never replaces OpenAPI semantic tests,
   runtime contract tests, or independent verifier/validator inspection.
5. Reassess a generator **adapter** only after native work introduces an actual
   second generation implementation. Reassess signed in-toto/SLSA only after
   approved CI identity, signing/root-of-trust, retention, and threat model.

## Root decisions and residual uncertainty

1. **Decide:** approve the unsigned local manifest, or retain headers plus
   `check:generated` only. This report recommends the manifest.
2. **Decide:** make it tracked regeneration metadata (recommended) or an
   ephemeral validation artifact; the former is better review evidence, the
   latter avoids one committed file but weakens review ergonomics.
3. **Decide:** what review reference format qualifies a handwritten exception;
   use an issue/ADR/path reference that stays repository-local.
4. **Uncertain:** whether exact lockfile integrity hashes should be included.
   Package names/versions plus a package-lock digest are enough for the current
   local reproducibility goal; add resolved/integrity fields only if a future
   threat model needs them.
5. **Uncertain:** whether `openapi/ui-metadata.json` should remain a generator
   input as web screens evolve. It is verified current input, but its ownership
   and versioning policy need a separate product decision before it becomes a
   broader UI-generation contract.
