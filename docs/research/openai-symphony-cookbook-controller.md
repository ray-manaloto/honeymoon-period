# Repository-local Symphony controller: primary-source constraints

**Question.** What is the smallest safe repository-local controller that can
apply the requested Symphony-like lifecycle without installing Symphony,
requiring Linear, or becoming a second authority for Git, tracker writes, or
publication?

**Status:** research complete (implementation decision pending)
**Accessed:** 2026-07-19
**Research:** new primary-source lane; no existing Symphony/Cookbook report was
listed in `docs/research/README.md`.
**Last30Days:** reused the matching retained raw report at
[`../../.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md`](../../.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md);
no new search or quota use was needed.

## Sources and evidence boundary

The primary authority is OpenAI's pinned Symphony specification, not the moving
`main` branch or its experimental Elixir implementation:

1. [Symphony `SPEC.md` at pinned commit `7af5a7648c9fbffa08825fe0c0b18be00100aff3`](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md), especially §§4.1, 7–10, 14–18 (accessed 2026-07-19).
2. [Pinned Symphony README](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/README.md) (accessed 2026-07-19). It calls Symphony a low-key engineering preview and offers implementing from the specification as an alternative to its reference implementation.
3. [OpenAI Codex Automations](https://openai.com/academy/codex-automations/) (accessed 2026-07-19). This is the current first-party source for thread automations/scheduled return to a Codex conversation.
4. [OpenAI Codex hooks documentation](https://learn.chatgpt.com/docs/hooks) and [worktrees documentation](https://learn.chatgpt.com/docs/environments/git-worktrees) (accessed 2026-07-19). These support lifecycle-hook limits and Desktop worktree isolation respectively.

No official OpenAI Cookbook example was found that adds a durable local lease,
goal record, or a repository-declarative Codex scheduled task. That absence is
a gap, not a license to infer an API. Existing repository research
[`codex-features-and-hooks.md`](codex-features-and-hooks.md) and
[`codex-context-lifecycle.md`](codex-context-lifecycle.md) was reused for the
already verified local Codex capability boundary.

## Verified facts

1. Symphony assigns one authoritative orchestrator to mutable scheduling state.
Its state machine separates unclaimed, claimed, running, retry-queued, and
released; it requires `claimed` and `running` checks before launch, and
reconciliation before every dispatch. [§§4.1.8, 7.1, 7.4](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L280-L318).
2. A normal worker completion is not permanent completion: Symphony rechecks
active work and schedules a short continuation retry; failures use bounded
exponential backoff. A retry refreshes the particular work item and releases
the claim when it is missing, terminal, inactive, or unroutable.
[§§7.1, 8.4](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L640-L819).
3. On each tick Symphony reconciles active work before dispatch. It detects
stalls, stops work that becomes terminal/non-active, and deliberately leaves
workers running when a state refresh itself fails. Startup also sweeps terminal
workspaces. [§§8.1, 8.5–8.6](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L735-L851).
4. Restart recovery is intentionally tracker- and filesystem-driven: in-memory
retry timers and live sessions are not recovered; a fresh poll and preserved
workspace establish useful progress. [§14.3](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L1688-L1704).
5. The specification requires a documented approval, sandbox, and
operator-input posture. Input/approval events must not stall indefinitely;
they may be surfaced, resolved, or failed under that policy.
[§10.5](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L1065-L1141).
6. Symphony's required core conformance is much broader than the requested
local controller: it includes `WORKFLOW.md` parsing/reload, tracker adapters,
per-issue workspaces/hooks, and a Codex app-server client. Its optional HTTP
and durable-retry features are not core requirements. [§§17–18](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L2047-L2248).
7. Codex Automations can return to the same conversation on a schedule; the
official guidance says local automations work best while the laptop is awake
and Codex is running. The source describes creating an automation from the
Codex conversation, not a checked-in task-definition API. [Automations](https://openai.com/academy/codex-automations/).
8. Codex hooks are deterministic lifecycle scripts, but a Stop hook needs a
loop guard and is unsuitable as a general scheduler or execution authority;
the repository's prior official-doc review records this capability boundary.
[Hooks](https://learn.chatgpt.com/docs/hooks),
[`codex-features-and-hooks.md`](codex-features-and-hooks.md#hooks-plan).

## Conformance implications (inference, bounded by the facts above)

The requested controller should be described as **a Symphony-derived local
controller implementing the stated subset**, not as full §18.1 Symphony
conformance. It intentionally has one repository goal rather than a tracker
adapter, no Linear, no per-issue workspaces, no app-server client, and no HTTP
server. Calling that whole system "conformant" would be unsupported by the
pinned checklist.

Implement the smallest durable state machine with these transitions:

| Local state | Entry / allowed outcome | Controller requirement |
| --- | --- | --- |
| `ready` | initialized or reconciled safely | may acquire lease and schedule one bounded run |
| `running` | lease acquired with current revision | renew only while owner, deadline, and revision still match |
| `waiting` | next automatic wake/backoff | deduplicate wakeups; retain due time and reason |
| `blocked` | one redacted operator question | no automatic execution until answer/revision clears it |
| `failed` | changed failure fingerprint with retry budget left | bounded repair/retry, recorded as evidence |
| `complete` | acceptance evidence current for the revision | never schedule new work |

Recommended tracked records are one active-goal JSON/JSONL-derived record plus
append-only redacted JSONL evidence/history. The active record contains only
goal ID, state, revision fingerprint, budgets, lease epoch/expiry, wake token,
one ambiguity-question fingerprint, and references/hashes to evidence. Keep
commands, prompts, URLs with query strings, credentials, relationship data,
and raw tool output out of both records. This is an implementation inference
that preserves Symphony's single-authority/structured-observability intent
without storing sensitive agent transcripts.

Use an atomic, repository-local directory creation (or another filesystem
primitive with equivalent atomic create semantics) for the lease; include a
random owner token, monotonically increasing fencing epoch, absolute expiry,
canonical worktree root, `HEAD`, and an owned-input manifest hash. Every
renewal and mutation must re-read and compare owner token, epoch, expiry,
worktree, `HEAD`, and manifest. A changed `HEAD`, owned input, or worktree is
a lost lease/revision change: stop the old owner, invalidate revision-bound
evidence, and reconcile to `ready` or `blocked`; never overwrite the new
owner's record. TTL alone is not safe against a paused former writer, so the
epoch is the needed fencing check. This is a local crash-safety inference; the
spec requires serialized state and restart reconciliation but does not prescribe
a durable TTL lock.

At startup, atomically reconcile instead of trusting a prior `running` marker:
expired/malformed/foreign-worktree lease -> append a redacted event and release
or fence it; live matching lease -> no-op; revision mismatch -> invalidate only
evidence bound to the former revision; `complete` with current evidence ->
remain complete. Treat duplicate scheduled wakeups as the same wake token, not
as extra attempts. Stop after bounded wall time, retries, and repair cycles;
an unchanged failure fingerprint must consume no new repair cycle and settle
to `failed`/`blocked` according to the recorded policy.

For continuation, prefer one project-local Codex Desktop thread automation
whose prompt invokes a deterministic **reconcile-and-act** command. The command
must decide whether a lease is obtained and whether work remains; the scheduled
task, a generated plan, and a model self-report are triggers/evidence only, not
execution authority. Do not add cron, a daemon, an unsupported Desktop API, or
a Stop-hook loop merely to claim autonomy. The root must create/authorize the
Desktop scheduled task interactively if no supported repository-native task
mechanism is discovered during implementation.

## Test contract implied by this research

Unit plus fault-injection tests should prove: atomic contention allows one
writer; crash/restart reconciliation; expired, stolen, and lost lease fencing;
changed `HEAD`/owned input and dirty-tree conflict behavior; duplicate wake
coalescing; one question for one ambiguity fingerprint; blocked input; changed
versus unchanged failure fingerprints; retry/time/repair exhaustion;
revision-bound evidence invalidation; and immutable completion. These are the
requested local safety properties, with Symphony's reconciliation/retry matrix
as the closest primary-source analogue. [§17.4](https://github.com/openai/symphony/blob/7af5a7648c9fbffa08825fe0c0b18be00100aff3/SPEC.md#L2120-L2139).

## Decisions and gaps for the root

1. **Decide the durable path and format** (recommended: a small dedicated
`.codex/` controller directory with one active JSON and append-only JSONL) so
it does not collide with the root-owned adaptive goal change log.
2. **Define owned inputs and exact budgets** in repository evidence: files that
bind a revision, TTL, maximum runtime, retries, and repair cycles. These are
product policy, not Symphony defaults.
3. **Set the blocked-input response policy:** retain the one question and wait
for a human answer/revision; never infer consent or retry indefinitely.
4. **Confirm Desktop task creation in the currently installed app.** First-party
documentation verifies the feature but not a checked-in configuration or CLI
for creating it. If unavailable, record the gap and use only the narrowest
supported native mechanism after root authorization; do not substitute an
unapproved OS scheduler.
5. **Do not install/run Symphony or its Elixir reference implementation, use
Linear, expose a network control surface, or pass credentials to children.**
Those are outside the stated scope and the pinned spec's own trust-boundary
warning reinforces the restriction.
