# Verification evidence-bundle module

- **Status:** Research complete; decision required before implementation.
- Question: what module shape can make a local web-MVP completion review
  auditable without turning a green command, a browser observation, or a human
  verdict into stronger proof than it is?
- Accessed: 2026-07-17
- Research: linked — this report contains the new candidate-specific
  primary-source research; the related semantic-audit lesson is local evidence.
- Last30Days: not needed — the root owns that lane and this decision concerns
  stable evidence/provenance formats and already-recorded repository failures,
  not a changing practitioner technique.

## Local evidence and constraints

**Verified local facts.** The clean-checkout aggregate command joins generation,
semantic OpenAPI auditing, static checks, tests, builds, budget, and Playwright
([`package.json`](../../package.json#L15-L26)). It is expressly necessary but
not sufficient: the independent verifier must also inspect status policy,
idempotency/orphan visibility, exactly one `main`, measured phone mutation
behavior, generated-contract neutrality, and documentation alignment
([`docs/testing/web-mvp.md`](../testing/web-mvp.md#L28-L45)). Playwright is the
reproducible rendered authority; Browser/CDP is a local, synthetic smoke and
diagnostic surface, while traces and screenshots are ignored unless a separate
sanitized-evidence decision approves them
([`docs/testing/web-mvp.md`](../testing/web-mvp.md#L47-L61)).

The accepted audit explains why these are distinct claim classes: green checks
preceded findings in error coverage, idempotency, landmarks, and phone layout;
the orphan was a *control-flow risk*, not a locally reproduced interleaving
([`docs/learning/2026-07-16-web-mvp-semantic-audit.md`](../learning/2026-07-16-web-mvp-semantic-audit.md#L7-L35)). The present guards include the operation
matrix/unique-operation-ID audit ([`scripts/check-openapi-responses.mjs`](../../scripts/check-openapi-responses.mjs#L8-L57)), negative fixtures for that
audit ([`tests/tooling.test.mjs`](../../tests/tooling.test.mjs#L100-L156)), and
the post-mutation 390x844 width measurement
([`e2e/web-mvp.spec.ts`](../../e2e/web-mvp.spec.ts#L136-L175)).

The handoff template already requires command side-effect labels, complete
untracked inventory, selected hashes, browser environment/evidence, residual
risk, and two fresh slots for final verifier and validator
([`docs/agents/handoff-template.md`](../agents/handoff-template.md#L21-L62)).
`worktree-manifest` supplies sorted path, Git status, size, SHA-256, branch,
and HEAD ([`scripts/worktree-manifest.mjs`](../../scripts/worktree-manifest.mjs#L47-L66)); it does not certify command execution or a human observation.

Fresh roles must remain independent. The verifier maps criteria to evidence and
returns `ACCEPT`/`REJECT`, while the validator runs reproducible checks and
returns `PASS`/`FAIL`; neither edits
([`docs/product/web-mvp-plan.md`](../product/web-mvp-plan.md#L109-L117),
[`verifier.toml`](../../.codex/agents/verifier.toml#L6-L8),
[`validator.toml`](../../.codex/agents/validator.toml#L6-L8)). The reviewer is
a separate read-only risk review, not a replacement for either verdict
([`reviewer.toml`](../../.codex/agents/reviewer.toml#L6-L8)).

**Inference.** The missing module is a *verification-evidence bundle*: one
deep module at the completion-review seam that records what was run or
observed, exactly what immutable local inputs it was about, and the scope of
each claim. It must not decide MVP acceptance, generate a verifier verdict, or
claim that an interactive browser observation is automated proof.

## Primary-source findings

1. An [in-toto Statement v1](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md)
   binds a predicate type to one or more immutable subjects by digest; subjects
   are matched by digest. **Verified fact.** This is a useful vocabulary and
   shape for binding evidence to a specific worktree snapshot, but it does not
   itself establish truth, runner integrity, or reviewer independence.

2. The approved [SLSA Verification Summary Attestation specification](https://slsa.dev/spec/v1.2/verification_summary)
   models a verifier evaluating a subject plus evidence bundle against a policy.
   Its schema includes verifier identity/version, policy URI and digest, input
   attestations, and a pass/fail result; consumers must establish trust in the
   verifier and validate the subject and policy. **Verified fact.** Its
   separation of subject, policy, verifier, evidence, and result is directly
   applicable. **Inference:** this repository should copy that separation, not
   assert a SLSA level or emit a SLSA VSA, because it has no trusted attestation
   signer/builder or supply-chain-level claim in scope.

3. [SLSA provenance](https://slsa.dev/spec/v1.2/provenance) treats a subject,
   build definition, dependencies, builder identity, invocation metadata, and
   selected byproducts as separate fields. **Verified fact.** In particular,
   SLSA cautions that a build platform identity represents its trust base; a
   local command transcript cannot honestly inherit that assurance. **Inference:**
   retain hashes and tool/version context as reproducibility aids, label them
   `local-observed`, and leave them unsigned unless a later approved trusted
   producer and root of trust are introduced.

4. [Playwright's official reporter documentation](https://playwright.dev/docs/test-reporters)
   supports JSON and blob reports, and describes blob reports as complete test
   run details primarily for merging shards. **Verified fact.** A bundle may
   reference a sanitized Playwright JSON/blob report or its hash as a
   reproducible-check record. **Inference:** do not commit the raw report by
   default: repository policy keeps screenshots/traces ignored and may require
   sanitization; the bundle records a path/hash only when retaining that output
   was explicitly authorized.

## Compared shapes

| Shape | Interface and depth | Benefits | Rejection / risk |
| --- | --- | --- | --- |
| A. One handwritten Markdown handoff per run | Large, variable interface; every author reselects commands, files, evidence classes, and wording. Shallow. | Immediately readable; preserves narrative. | Evidence cannot be mechanically checked for complete subjects, side-effect labels, or claim scope. Existing handoff remains necessary narrative, but is not the evidence module. |
| B. Per-tool reports and ad-hoc screenshots | Multiple hypothetical seams, each tied to a runner/report format. | Native tool output is retained. | Forces verifier/validator to correlate N artifacts and permits gaps; screenshots risk privacy and are not reproducible proof. Fails the deletion test: deleting an index just leaves N callers reconstructing the same matrix. |
| C. Versioned, repository-local bundle manifest plus narrative handoff (**recommended**) | Small interface: `subject`, `policy`, `checks`, `observations`, `artifacts`, `limitations`; deep implementation owns normalization, path containment, hashing, side-effect classification, and schema validation. | Locality for run evidence; maps directly to acceptance criteria without manufacturing a verdict; references native reports rather than re-encoding them. | Must not become an acceptance oracle, auto-create reviewer verdicts, or store unapproved sensitive artifacts. |
| D. Signed in-toto/SLSA-style attestation now | Standardized interface but implies signer identity and a trusted verification procedure. | Future interoperable provenance. | Premature: a local agent/worktree has neither an approved trusted producer nor a verification root. A signature would authenticate an issuer, not prove browser behavior or semantic acceptance. |

## Recommendation and module design

Adopt shape C incrementally as a `verification-evidence` **module**. Its
external **interface** is one versioned JSON document plus its schema and one
read-only validation command. The module's **seam** is between evidence
production (implementer/handoff) and independent consumption
(verifier/validator/reviewer). The interface is also its test surface.

Suggested top-level shape (names illustrative, not an approved contract):

```json
{
  "schemaVersion": 1,
  "subject": { "head": "<commit>", "worktreeManifest": { "path": "<repo-relative>", "sha256": "<digest>" } },
  "policy": [{ "id": "web-mvp-completion", "source": "docs/product/web-mvp-plan.md", "sha256": "<digest>" }],
  "checks": [{ "criterion": "openapi-error-matrix", "command": "npm run check:semantic", "sideEffect": "read-only", "outcome": "passed", "output": { "sha256": "<digest>" } }],
  "observations": [{ "criterion": "browser-smoke", "kind": "human-or-interactive", "status": "observed", "environment": { "viewport": "390x844" }, "limitations": ["not automated proof"] }],
  "artifacts": [{ "path": "<repo-relative>", "sha256": "<digest>", "retention": "tracked|ignored|external" }],
  "limitations": ["No signed provenance or delegated trust claim."]
}
```

`checks` holds only reproducible executions and their exact claim scope;
`observations` holds human/Browser facts and cannot use `passed` or satisfy a
machine-only criterion. No `accepted`, `complete`, `verifierVerdict`, or
`validatorVerdict` field belongs in the implementer-produced bundle. Those
verdicts remain separately authored by fresh agents, retaining independence.
Use repository-relative paths, no raw private URLs/notes/tokens, and hashes of
sanitized allowed artifacts. A check result means only that the recorded command
reported that outcome for the recorded subject; it is not an attestation of
clean checkout, semantic completeness, or runtime behavior beyond its stated
criterion.

The **deletion test** supports this module: deleting it would reintroduce the
same subject/hash/side-effect/claim-scope correlation across every handoff and
all three final roles. It therefore earns its **depth**, **leverage**, and
**locality**. Do not introduce a second adapter yet: a single local manifest
writer/reader makes the internal parsing seam hypothetical. Add an adapter only
when a real second producer exists (for example, approved CI output), and keep
the external interface unchanged.

## Guard and schema implications

- Validate a strict, versioned JSON schema; reject unknown status values,
  absolute or escaping paths, missing subject/policy hashes, duplicate
  criterion IDs, and a `checks` result without command/side-effect/output
  provenance.
- Require each `checks[].criterion` to map to an explicit acceptance criterion,
  not merely to `npm run check`. Allow the aggregate check as one record plus
  focused records for semantic-only claims; this addresses the accepted lesson
  that green aggregate output missed semantic defects.
- Permit an observation only with kind, tester/role, target, date, synthetic
  data declaration, and limitations. Prohibit it from satisfying a
  reproducible-check requirement or being generated by a test command.
- Reuse `worktree-manifest` output as the subject artifact rather than adding a
  competing hash routine. Include the untracked inventory because normal diff
  omits it.
- Make bundle validation read-only and disposable-output-only at most. It must
  not call browser/CDP, sign, upload, rebuild Shortcuts, or replace a
  deliverable. Preserve the existing read-only Shortcut rule.
- Keep the handoff template as the narrative adapter: it links the immutable
  bundle, reports residual risks, and names final independent verdicts. Do not
  have the validator generate the bundle it is asked to validate.

## Incremental adoption

1. Wait for one locally observed post-guard evidence omission; repeated prose
   or reconstruction burden alone is not sufficient evidence to add the Module.
2. Root decides the policy owner and criterion IDs, whether the first subject is
   the whole in-scope worktree or a ticket manifest, and the artifact-retention
   policy; add no signed format.
3. Add schema, a tiny writer/validator implementation, and negative tests for
   path escape, missing hash, duplicate criterion, and claim-class misuse.
4. Produce a bundle only for the next material integrated web/API change after
   the omission and decisions above;
   retain current handoff and fresh independent verifier/validator behavior.
5. Have the verifier consume the bundle as a starting index and independently
   inspect the actual files/commands; have the validator verify the schema and
   run its own prescribed checks. Review whether the module reduced evidence
   omission without making either role defer to it.
6. Consider a second adapter or a signed in-toto statement only after an
   approved CI producer, key/root-of-trust, retention policy, and explicit
   threat model exist.

## Decisions for the root and residual uncertainty

1. **Decide:** approve the unsigned local manifest shape, or retain the present
   handoff-only process. This research recommends the manifest; it does not
   authorize an implementation.
2. **Decide:** name the policy source and ownership. The web-MVP plan is the
   governing completion policy now, but a machine-readable criterion registry
   may be needed before schema validation can prove every mapping is current.
3. **Decide:** artifact retention. Default to hashes and ignored-path references
   for Browser/Playwright output; commit only sanitized, intentionally approved
   evidence.
4. **Uncertain:** whether a future CI system and its identity warrant signed
   attestation. No current repository evidence establishes a trusted producer,
   signer, root of trust, retention service, or threat model, so no signature
   claim is justified.
5. **Uncertain:** exact consumer ergonomics. A one-change pilot is needed to
   measure whether criterion IDs reduce review omissions without adding a
   shallow parallel checklist.
