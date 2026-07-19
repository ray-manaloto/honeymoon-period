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
   every two minutes during a long turn, and checkpoint with that token.
3. If the action is `ask`, surface exactly that one question and do no other
   work.
4. For `noop`, stop without mutation.
5. Never treat this prompt, a plan, a handoff, a scheduled task, or model
   self-report as execution authority.

Checkpoint examples:

```sh
node scripts/symphony-controller.mjs checkpoint --root . \
  --owner-token <token> --state waiting --direct-children 0

node scripts/symphony-controller.mjs checkpoint --root . \
  --owner-token <token> --state complete \
  --verifier-record <revision-bound-verifier-json> \
  --validator-record <revision-bound-validator-json> \
  --aggregate-record <revision-bound-aggregate-json> \
  --protected-artifact-record <revision-bound-audit-json> \
  --retrospective-code completed
```

The controller intentionally implements a Symphony-derived local subset. It
does not claim full Symphony conformance, run Symphony, require Linear, create
an HTTP surface, or replace repository Git/publication ownership.
