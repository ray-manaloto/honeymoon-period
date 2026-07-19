---
name: adaptive-orchestration
description: Adapt a long-running repository goal as evidence changes. Use for multi-phase goals that require dirty-tree reconciliation, research routing, bounded prototypes, plan or ticket revision, context-lifecycle decisions, direct-child allocation, tracker reconciliation, third-party deletion tests, independent gates, and an append-only goal change log.
---

# Adaptive Orchestration

Treat the goal as a controlled, evidence-revisable program. Read
[`docs/agents/adaptive-orchestration.md`](../../../docs/agents/adaptive-orchestration.md)
completely before acting; it owns the detailed policy and change-record schema.

## 1. Reconcile the bootstrap

Read the instruction chain, governing handoff/spec/ADR, current goal, Git anchors,
tracked changes, and complete in-scope untracked inventory. Prove dirty-file
ownership before editing. Make a recoverable backup before a baseline operation
when the copied tree and Git index disagree.

**Completion criterion:** the active branch/HEAD, authority, prohibited actions,
protected artifacts, and every intentional dirty path are explicit and preserved.

## 2. Open the control loop

Record both research lanes through `docs/agents/research-workflow.md`. Reuse current
artifacts first. Diagnose local contradictions before external research. Prototype
only one named uncertainty, in disposable local state, after its external assumptions
are verified.

Evaluate maintained third-party tools with the deletion test: require compatibility,
offline determinism, privacy, licensing, rollback, and removal of meaningful owned
logic. Reject a candidate when policy merely moves into custom configuration or the
dependency adds more coupling than it removes.

**Completion criterion:** each material decision links evidence, separates fact from
inference, and records an adopt, reject, defer, or bounded-pilot result.

## 3. Adapt without erasing history

After an issue completes or evidence invalidates an assumption, append one numbered
entry to the goal's durable change log before changing the plan, tickets, or tracker.
State the observed event, evidence, invalidated assumption, replacement, and effect on
scope or acceptance. Preserve earlier entries verbatim. Adapt only within the existing
authorization boundary; escalate when the replacement requires new authority.

**Completion criterion:** the current plan and tracker intent are derivable from the
append-only record, with no silent rewrite of an earlier decision.

For greenfield work, apply the repository debt gate after every changed decision: retain
one canonical path and sweep source, tests, generators, docs, project-local skills, agent
guidance, examples, and prototypes. Do not create compatibility shims, duplicate
transports, or artificial migration history without an explicitly approved external
contract. Clearly label historical evidence instead of letting it prescribe obsolete work.

## 4. Manage context and agents

Apply the lifecycle zones and non-numeric overrides in
`docs/research/codex-context-lifecycle.md`. Use percentages only when current usage and
window come from the same runtime event. Resume the same coherent objective; fork only
competing read-isolated approaches; create a durable handoff and fresh task at phase,
assumption, or context boundaries.

Keep shared files, Git, tracker writes, integration, and publication with the root.
Use no more than three direct children, prevent recursive delegation, give writers
disjoint paths, and reserve fresh independent verifier and validator slots after
material integration.

## 5. Reconcile and finish

For authorized tracker writes, capture a fresh complete snapshot, re-read each target
immediately before its serialized mutation, record returned identifiers, and perform a
postcondition read before the next write. Re-read before retrying an uncertain result.

Run focused checks, the repository aggregate, and fresh semantic `ACCEPT` plus
mechanical `PASS` gates. Publish only after both gates and a final dirty-tree audit.
Use `docs/agents/handoff-template.md` whenever the lifecycle policy requires a new task.

**Completion criterion:** every acceptance item has evidence, residual risk is explicit,
protected artifacts are unchanged, external state matches the recorded postconditions,
and no in-scope safe next action remains.
