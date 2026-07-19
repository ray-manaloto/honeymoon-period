# 2026-07-19: Autonomous review-repair loop

- Status: accepted
- Scope: repository goal orchestration, review, verification, and merge readiness
- Evidence type: reproduced failure
- Iteration outcome: promoted
- Goal/revision evidence: issue #24 integration and goal change-log entry 20

## Observation

Green aggregate checks did not close issue #24 semantically. One standards review found
recorded-policy replay, detail consistency, duplicated explanation, and phone-list evidence
gaps; after repair, a fresh verifier found a remaining split-read snapshot risk.

## Evidence

Two distinct semantic repair passes were required after mechanical checks were green. The
second defect was visible only after the first shared revision changed, proving that prior
review evidence could not safely be reused for the repaired revision.

The first application of this lesson also found that prose-only markers did not make the
controller require a standards-review record or classified retrospective, and that a
pre-merge status read did not atomically bind the merge mutation to the reviewed SHA.
Its next semantic gate found that budget exhaustion alone is not genuine ambiguity and
must not manufacture a human-interview question.
It also found that an enum alone is not a retrospective: the outcome must bind a durable
evidence reference, and `no-new-lesson` must include a concrete reason.
The standards pass additionally showed that repository input adoption needs path semantics,
not identifier semantics, because leading-dot project paths are intentional authority.
The next verifier required gate records to bind the collaboration-agent report artifact
and hash, not merely IDs, freshness flags, and verdict strings. Repository-local hashing
protects integrity after root integration; collaboration-output provenance remains a root
process check because cooperating local processes have no cryptographic identity boundary.
Gate records also carry the exact reviewed Git HEAD as well as the controller revision;
the latter intentionally filters state-only commits and cannot substitute for merge-head binding.
The fault review also required mutation-lock initialization to publish the directory and
owner atomically; an ownerless canonical mutex is never a valid live intermediate state.
All state-changing commands must reread authoritative state inside that mutex, and dead
prepared-lock candidates must be reconciled so crash safety does not create hidden residue.
The in-lock reread applies to reconcile, acquire, renew, and checkpoint as well as input
adoption; mutex ownership does not make a snapshot captured before the mutex authoritative.
Blocked-question emission follows the same rule: the filesystem claim deduplicates delivery,
while an in-mutex active-state reread decides whether that question is still valid.
The final hardening pass replaced recoverable directory ownership with an OS-backed
worktree-local file lock, journals every state/history transition, stores capability hashes
instead of raw tokens, and retries an unacknowledged ambiguity delivery after its TTL.

## Correction

Every material controller-admitted iteration now uses a fresh read-only standards/spec
review, a focused repair with a regression guard, and fresh revision-bound final gates.
The append-only goal record classifies its retrospective as `promoted`, `linked`, or
`no-new-lesson`. The versioned controller schema binds authority and completion requirements,
and `record-iteration` prevents a reviewed material revision from being silently skipped.
Exact-head merge readiness is evaluated deterministically.

## Enforcing guard

`scripts/check-adaptive-orchestration.mjs`, `tests/tooling.test.mjs`, and
`tests/symphony-controller.test.mjs` enforce the durable policy and evidence schema. Fresh
independent reviewer/verifier/validator records, `--match-head-commit`, and remote
postcondition reads guard semantic acceptance and publication.

## Promoted instructions

The detailed policy lives in `docs/agents/adaptive-orchestration.md`. `AGENTS.md`, the
project adaptive-orchestration skill, controller continuation guide, issue-tracker guide,
learning registry, checker, and tests route to and enforce that policy.

## Residual risk

Independent agents can agree on the same mistaken interpretation. Deterministic checks,
primary-source evidence, explicit specifications, bounded retries, and revision binding
reduce but do not eliminate that risk.

## Retirement condition

Retire this entry when its controller guards are replaced by an equally strict maintained
native mechanism and the repository no longer owns this orchestration boundary.
