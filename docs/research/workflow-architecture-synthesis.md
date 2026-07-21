# Workflow architecture research synthesis

- **Question:** Which project documentation, agent documentation, skills, and
  workflow modules should change before the next project tasks?
- **Status:** Historical workflow synthesis retained; its Phase 0 reconciliation is
  complete and current product/tracker authority lives in the web MVP plan and
  adaptive-orchestration goal log.
- **Last verified:** 2026-07-17
- **Research:** linked — six candidate-specific primary-source reports listed
  below.
- **Last30Days:** reused — the durable
  [Research-first agent workflow](research-first-agent-workflow.md#last30days-supplement)
  supplement records the recent agent-workflow pass and found no
  project-specific community signal strong enough to change the primary-source
  recommendation. The ignored raw artifact is not required here.

## Executive recommendation

Do not implement six new modules, and do not treat any candidate as immediately
proven. The reports support these actions:

1. **Correct current authority drift first.** Issues #16–#18 are closed, but
   their GitHub Project items remain `In Progress`, and the durable plan still
   describes them as open. Reconcile the plan and Project state through one
   explicitly reviewed ceremony before treating either as the next-task source.
2. **Resolve the doctor decisions, then run a bounded diagnostic pilot only if
   a selected profile has a reproduced usability gap.** Local npm 12.0.1 differs
   from the pin and `.build/bin/cherri` is absent, but Cherri already fails early
   with an actionable message. Decide npm strictness, browser-cache probing, and
   Xcode applicability before treating a doctor as justified.
3. **Treat the verification-evidence bundle as a locality experiment, not a
   semantic-defect guard.** Existing semantic tests and independent review now
   guard the accepted defects. Pilot a bundle only after a post-guard omission
   is observed and after subject scope, policy ownership/criterion IDs, and
   artifact retention are decided. Keep final verdicts outside the bundle.
4. **Consider generated-source provenance independently, or when generated
   review friction recurs.** The proposed manifest has good
   locality, but the current generator already has one implementation, nine
   known outputs, generated headers, and a passing deterministic drift check.
5. **Do not yet build standalone task-checkpoint or agent-allocation modules.**
   The existing worktree manifest, handoff template, agent profiles, and root
   orchestration already cover their facts. Neither candidate can validate
   authorization, semantic research adequacy, live slot availability, or true
   reviewer independence. Reconsider only after two locally observed omissions
   that the proposed Module would have prevented.
6. **Keep tracker reconciliation read-only until recurring scale justifies it.**
   Resolve the current six-item active surface manually from a reviewed dry run.
   Build the declarative Module only if another reconciliation cycle repeats the
   same opaque-ID, pagination, dependency, and Project-field complexity.

This sequence improves the next tasks without creating a second workflow
engine, tracker, evidence authority, or generated-code system.

## Evidence by candidate

| Candidate | Observed problem | Research conclusion | Priority |
| --- | --- | --- | --- |
| [Toolchain doctor](toolchain-doctor.md) | npm pin mismatch and missing ignored Cherri prerequisite are observed, but no late/confusing profile failure is yet reproduced | Decide strictness/scope first; pilot one report-only diagnostic Module only if a selected profile demonstrates added leverage; never install or repair | **Conditional pilot** |
| [Verification evidence bundle](verification-evidence-bundle.md) | Mechanical, semantic, and browser evidence have low locality; current semantic guards already address the accepted defects | After one post-guard evidence omission and prerequisite decisions, pilot one unsigned local manifest; final verdicts remain independent | **Conditional locality pilot** |
| [Tracker reconciliation](tracker-reconciliation.md) | Live drift: closed #16–#18 remain Project `In Progress`; plan calls them open | Review a read-only snapshot and manually reconcile now; retain the researched pure planner plus separately authorized mutating Adapter as a future shape | **Fix drift now; defer Module** |
| [Generated-source provenance](generated-source-provenance.md) | Reviewers reconstruct input/tool/output provenance across several paths | A tracked unsigned manifest is coherent, but existing headers and `check:generated` already provide a strong guard | **Third implementation candidate** |
| [Task checkpoint](task-checkpoint-module.md) | Bootstrap facts are manually assembled, but existing manifest/handoff controls now cover the known dirty-tree failure | Conditional stdout-only evidence assembler; no ledger, hook, goal gate, tracker authority, or live-slot claim | **Wait for recurrence** |
| [Agent allocation](agent-allocation-ledger.md) | Slot reservation and path ownership are narrative; runtime cannot enforce freshness or reservations | A pure planning validator is plausible, but current phase discipline and handoff fields are sufficient at this scale | **Wait for recurrence** |

## Cross-report synthesis

### One source of truth per claim

The reports agree that each claim needs one owner:

- tool readiness belongs to the doctor;
- worktree subject hashes remain owned by `worktree-manifest` and may be
  referenced by an evidence bundle;
- generated input/output inventory belongs to the generation Module and may be
  referenced, not copied, by an evidence bundle;
- acceptance policy remains in the governing plan/specification;
- GitHub lifecycle intent remains a root/user decision projected into the
  tracker;
- `ACCEPT`/`REJECT` and `PASS`/`FAIL` remain separately authored by fresh
  verifier and validator agents;
- authorization and human ceremonies remain human/root attestations.

No proposed Module may infer a stronger claim from a weaker one. In particular,
`ready` is not `passed`; a passed aggregate check is not semantic acceptance; a
hash is not signed provenance; a planned fresh role is not proof of independent
reasoning; and a closed issue does not by itself prove the intended Project
status.

### Consolidate rather than layer

The evidence bundle should consume the current worktree manifest and, if later
approved, the generated-source provenance manifest. It should not add another
hash implementation. The task-checkpoint candidate should not duplicate those
records. Agent allocation remains a handoff concern until multiple root callers
repeat the same scheduling logic. The tracker reconciliation Module stays
separate; its Interface lives at the declared/observed-state-to-effects Seam
because remote desired-state planning and external mutation have different
authorization and failure modes from local verification.

### Keep side effects outside diagnostic Interfaces

All six reports reject automatic installation, signing, deployment, GitHub
mutation, agent spawning, acceptance decisions, or hook enforcement as part of
the diagnostic Modules. A future tracker mutating Adapter must consume a
reviewed, fresh dry-run report and re-read preconditions. The toolchain doctor
must never invoke `npm ci`, `playwright install`, Cherri compilation, Shortcut
signing/import/run, or Apple account/device inspection.

## Historical next-task roadmap (completed or superseded)

> **Historical only — do not execute this roadmap.** The text below preserves the
> former plan as completed context, including its original imperative wording. Follow
> the current implementation order in
> [`docs/product/web-mvp-plan.md`](../product/web-mvp-plan.md) instead.

### Phase 0 — one batched reconciliation decision

Before selecting the next implementation task, review and decide:

- whether closed #16–#18 should move from Project `In Progress` to `Done`;
- whether `docs/product/web-mvp-plan.md` should record them as completed;
- whether #19–#21 remain deferred questions and therefore not
  `ready-for-agent`.

Immediately before any approved write, obtain a fresh complete snapshot,
serialize the ceremony to one owner, and re-read each target and its expected
preconditions. Apply one operation at a time, capture returned identifiers, and
perform a postcondition read before reporting completion. If the snapshot or a
precondition changed, stop and return to review. Apply only the approved
Project/document delta. Do not delete historical issues or Project items.

### Phase 1 — doctor decision and optional tracer bullet

First decide whether npm 11.6.2 is strict, whether an existence-only Playwright
browser-cache probe is acceptable, and whether full Xcode is not applicable
until native work begins. Then reproduce one selected profile where existing
diagnostics are insufficient. Only if that evidence exists, pilot a report-only
doctor for the relevant profiles:

- `web-check`;
- `e2e`;
- `shortcuts-readonly`.

Keep existing commands authoritative. The doctor may explain why a profile
cannot run; it does not become a mandatory prerequisite. Add fixture
tests for version mismatch, missing executable/browser, malformed manifests,
safe error normalization, and non-mutation of protected files/status.

### Phase 2 — conditional evidence-locality pilot

The corrected semantic guards, not an evidence bundle, prevent recurrence of the
accepted defects. Only if a future material integration produces a post-guard
evidence omission should the root first decide subject scope, policy
ownership/criterion IDs, and artifact retention. Then create one unsigned,
versioned local evidence record and measure whether it improves locality while
preserving independent inspection. Repeated prose or reconstruction burden alone
is not a sufficient trigger. Keep browser observations explicitly limited and
privacy-safe. Retain the Module only if the deletion test remains true.

### Phase 3 — provenance decision

If generated-source review remains costly, extend the existing generation
Module with a tracked manifest covering its two current inputs, generator/tool
versions, script digest, and nine outputs. Do not introduce a Swift adapter or
signed in-toto/SLSA claim until a second generator and an approved trusted
producer/root of trust actually exist.

### Phase 4 — recurrence-triggered workflow Modules

Record locally observed failures. Reconsider the following only after two
qualifying instances:

- task checkpoint: omitted in-scope/untracked evidence, misreported configured
  capacity, or repeated anchor reconciliation;
- agent allocation: slot exhaustion, overlapping ownership, or loss of required
  fresh final roles despite following the handoff;
- tracker reconciliation: another cycle requiring repeated opaque-ID mapping,
  pagination, dependency ordering, stale-state conflict handling, and dry-run
  reconstruction.

## Documentation and skill changes implied by adoption

When a Module is approved, simplify callers instead of duplicating it:

- `AGENTS.md`: keep only the invariant and link the owning convention/Module;
- `docs/agents/handoff-template.md`: link evidence records and retain only
  human attestations, residual risk, resource ownership, and final verdicts;
- `.codex/agents/verifier.toml`: consume evidence as an index, then inspect
  independently;
- `.codex/agents/validator.toml`: validate the evidence format and rerun
  prescribed checks without generating its own verdict input;
- `.agents/skills/code-review/SKILL.md`: describe the constrained serial mode
  once, or link the allocation convention if recurrence justifies it;
- `docs/SETUP.md` and testing docs: link the doctor report and documented
  remediation, never duplicate capability detection;
- `scripts/generate.mjs`: remain the sole implementation owner of generated
  provenance if that candidate is approved.

Do not create a broad new skill for these Modules. Skills should route a task
to the small Interfaces; repository scripts and schemas should own deterministic
behavior.

## Decisions still requiring user/root approval

1. Approve the immediate tracker/document reconciliation ceremony and its exact
   desired state.
2. Decide whether npm 11.6.2 is a hard reproducibility requirement or a warning
   while npm 12 compatibility is evaluated, whether browser-cache probing is
   allowed, and whether full Xcode is currently not applicable.
3. Decide whether a selected doctor profile has a reproduced usability gap
   beyond its existing actionable failure.
4. If a post-guard evidence omission occurs, approve subject scope, policy
   ownership/criterion IDs, and retention before an evidence-bundle pilot.
5. Decide whether generated provenance is worth a tracked manifest now or only
   after repeated review friction.

No report authorizes deployment, merge, artifact rebuild/re-signing, provider
credentials, physical-device access, or private-data capture.

## Research reports

- [Read-only task-checkpoint Module](task-checkpoint-module.md)
- [Verification evidence-bundle Module](verification-evidence-bundle.md)
- [Non-mutating toolchain doctor](toolchain-doctor.md)
- [Declarative tracker reconciliation](tracker-reconciliation.md)
- [Agent-allocation ledger and planning Module](agent-allocation-ledger.md)
- [Generated-source provenance manifest](generated-source-provenance.md)
