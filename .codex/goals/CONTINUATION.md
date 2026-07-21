# Symphony-derived goal continuation

This repository uses `scripts/symphony-controller.mjs` as the only admission
authority for automatic continuation. A Codex Desktop heartbeat is only a wake
trigger; it does not authorize work, infer completion, or override the active
goal record.

On each wake:

1. Run `npm run goal:continue -- --wake-token <unique-wake-id>`.
2. If the JSON result is `{"action":"run",...}`, continue only the already
   authorized objective referenced by `.codex/goals/active.json`, remain inside
   its authority and budgets, renew with the returned `ownerToken` at least
   every two minutes during a long turn, follow the repository autonomous learning loop,
   and checkpoint with that token. Review findings require a retrospective, focused
   repair with a guard, and fresh revision-bound subagent gates. Before changing a
   reviewed revision, persist its standards review and retrospective with
   `record-iteration`; an unrecorded material revision is not admissible.
   Initialize a successor goal only from a clean tree after its append-only goal-log and
   bootstrap authority documents are committed. Initialization and input adoption do not
   count as execution admission; only a durable `run-started` event starts the mandatory
   revision-review baseline.
   Before spawning any direct child, call `claim-child` with the owner token, stable
   task reference, and exact role; give the returned claim only to that child brief, then call
   `settle-child` after it finishes. The controller derives live delegation usage from
   these lease/revision-bound claims and rejects checkpoints with active children.
   Final standards, verifier, and validator evidence must use three distinct completed
   claims whose admission roles match their evidence kinds.
3. If the action is `ask`, surface exactly that one question and do no other
   work. After the user answers, append the decision to an authorized durable
   artifact and call `resolve-question` with its revision-bound resolution record
   and the recorded fingerprint before requesting another run. Unacknowledged delivery is retried
   after the bounded TTL so a crash cannot silently suppress the only question.
4. For `noop`, stop without mutation.
5. Never treat this prompt, a plan, a handoff, a scheduled task, or model
   self-report as execution authority.

Request a human interview only after local diagnosis, repository evidence, relevant
primary research, and bounded independent agents cannot resolve genuine ambiguity.
Credentials, consent, paid services, private data, signing, deployment, destructive
external effects, and designated human ceremonies remain authority boundaries.

Checkpoint examples:

```sh
node scripts/symphony-controller.mjs checkpoint --root . \
  --owner-token <token> --state waiting

node scripts/symphony-controller.mjs checkpoint --root . \
  --owner-token <token> --state complete \
  --reviewer-record <revision-bound-standards-review-json> \
  --verifier-record <revision-bound-verifier-json> \
  --validator-record <revision-bound-validator-json> \
  --aggregate-record <revision-bound-aggregate-json> \
  --completion-record <revision-bound-goal-completion-json> \
  --protected-artifact-record <revision-bound-audit-json> \
  --retrospective-record <revision-bound-retrospective-json> \
  --retrospective-code <promoted|linked|no-new-lesson>
```

The versioned active record also binds the branch, objective, prohibitions,
completion contract, both research-lane statuses, and whether external
postconditions are required. The goal-completion record proves the logical
commit, research preflight, zero-debt audit, branch, and required external-state
postcondition; prose or model self-report cannot substitute for it.

The controller intentionally implements a Symphony-derived local subset. It
does not claim full Symphony conformance, run Symphony, require Linear, create
an HTTP surface, or replace repository Git/publication ownership.

A failed goal remains immutable evidence. When its authority or phase contract is itself
invalid, record the exact-revision review and retrospective before checkpointing `failed`,
then use only the explicit `--replace-terminal true` initialization transition for the
corrected successor goal. An unreviewed failed revision cannot be replaced.
Source completion and publication remain separate goals when publication would otherwise
make source completion depend on its own downstream external result.
