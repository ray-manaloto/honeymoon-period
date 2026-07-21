# 2026-07-20: Publication phases and validation ownership

- Status: accepted
- Scope: controlled goals, publication, and shared-worktree validation
- Evidence type: reproduced failure and control-flow risk
- Iteration outcome: promoted
- Goal/revision evidence: adaptive-orchestration goal-log entries 67–69

## Observation

One recovery goal made source completion require the publication result that could only
exist after source completion. In the same iteration, the root and independent agents ran
duplicate heavyweight suites concurrently in one worktree, producing an aggregate
`mutation-contention` failure and preventing an independent validator verdict.

The first terminal-replacement repair then allowed a failed goal to be replaced without
an exact-revision review and retrospective. The guard was added only after the first
successor had already been created through that invalid transition, so that successor's
lineage also had to be failed and recreated through the guarded path.

## Evidence

The publication standards gate traced the circular dependency from
`externalCompletion: required` through the controller completion check to the documented
source-first publication contract. The root aggregate reproduced the differing-input
adoption contention failure while three controller suites overlapped; the isolated suite
had previously passed.

The next standards gate traced the missing iteration check directly to terminal
initialization, and the semantic verifier compared the failed predecessor revision with
its only iteration record to prove they differed. Append-only goal-log entries 68 and 69
retain both the guard repair and the corrective successor transition.

## Correction

Treat source completion and publication as distinct immutable phases. A misconfigured
goal records its exact-revision review and retrospective before checkpointing `failed`;
only then may an explicit terminal transition create a corrected successor without
rewriting history. Treat the shared worktree as a single-owner resource for heavyweight
validation: the root aggregate finishes before the fresh validator starts.

## Enforcing guard

Controller tests require explicit replacement of completed goals, reject unreviewed failed
goals, and allow a failed predecessor only after its exact revision has a durable iteration.
The orchestration checker requires the source-first publication contract and serialized
heavyweight validation instruction. Tooling tests remove each marker and require failure.

## Promoted instructions

Promoted to `AGENTS.md`, the adaptive-orchestration policy and skill, continuation guidance,
the controller CLI, and the orchestration checker.

## Residual risk

Repository-local guidance and checks cannot prevent every manually launched external test
process. Agents must still inspect live runners before starting a heavyweight suite.

## Retirement condition

Retire this lesson only when validation runs in isolated worktrees with independent ports
and state, and publication is represented by a native transactional phase model that
cannot form a source-to-external completion cycle.
