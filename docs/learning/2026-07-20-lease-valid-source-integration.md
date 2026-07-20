# Lease-valid source integration

- Date: 2026-07-20
- Status: accepted
- Scope: controller-governed repository commits

## Observed failure

Two long research/review loops allowed the five-minute work lease to expire. The first
lost late controller mutations; the second proceeded to a source commit after expiry.
Both were locally reproduced in the append-only controller history.

## Correction

Source commits during a non-complete goal require a live lease whose epoch, owner hash,
branch, HEAD, and effective renewal expiry match the active record. State-only commits
remain possible after reconciliation so the controller can persist its durable state.

## Enforcing guard

`.codex/hooks/pre_tool_policy.py` resolves the Git top-level and rejects a source
`git commit` when that live-lease check fails. `tests/test_pre_tool_policy.py` proves
fresh, expired, state-only, subdirectory, `git -C`, and malformed-state cases. The
state-only exemption accepts only command forms that cannot add unstaged paths; `-a`
and explicit pathspecs remain lease-gated. Goal JSON and its state enum are validated
before any exemption; alternate indexes, invalid object shapes, and timezone-less
expiry values fail closed. The controller remains execution authority; the hook is a
fail-closed integration guard, not an alternate admission mechanism.

## Promotion and retirement

Promoted into the repository hook, hook regression suite, `AGENTS.md`, and the
adaptive-orchestration change log. Retire only if source integration moves into an
equivalent atomic controller command whose fault tests cover lease expiry.
