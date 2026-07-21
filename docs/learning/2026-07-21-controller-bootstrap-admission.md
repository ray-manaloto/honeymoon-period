# 2026-07-21: Controller bootstrap admission

- Status: accepted
- Scope: controlled-goal initialization and revision review
- Evidence type: reproduced failure
- Iteration outcome: promoted
- Goal/revision evidence: adaptive-orchestration goal-log entries 70–71

## Observation

A replacement goal initialized while its newly owned goal-log entry was dirty. Startup
correctly blocked on the dirty tree, but after the bootstrap commit the controller treated
the earlier `goal-initialized` event as an admitted execution revision and demanded an
iteration review. A blocked goal cannot acquire the lease required to record that review,
creating a circular recovery dependency. Root used a narrow state-only rebound, which was
preserved in history but was not a supported controller action.

## Evidence

The live sequence is retained in `.codex/goals/history.jsonl`: initialization, dirty-tree
conflict, and `iteration-review-required` occurred without an intervening `run-started`.
Fresh exact-revision standards review reproduced the control-flow contradiction with the
run-started-only rule recorded by goal-log entry 40.

## Correction

Make learning review mandatory only for revisions that received a durable `run-started`
admission. Let an unadmitted bootstrap commit reconcile atomically
to the committed revision through the ordinary controller transition; never hand-author
active goal state or append synthetic controller events as a supported workflow.

## Enforcing guard

The controller regression initializes against a dirty owned bootstrap file,
commits it before admission, and proves reconciliation advances to `ready` without an
iteration-review deadlock. Retain the existing regression proving a revision admitted by
`run-started` cannot advance without review. The orchestration checker and negative tooling
fixture require the run-started-only predicate.

## Promoted instructions

Promoted to the controller, its tests, adaptive-orchestration checker, and continuation
guidance.

## Residual risk

The repository guard cannot prevent an operator from manually editing controller state.
Append-only history therefore retains the unsupported recovery as evidence, while current
guidance explicitly prohibits treating it as a supported path.

## Retirement condition

Retire this lesson only if goal initialization and admission become one atomic revision-bound
transaction that cannot observe a bootstrap commit between those phases.
