# Handoff template

Use this template at a genuine context boundary. Link durable artifacts instead
of copying their full contents.

## Objective and authority

- Objective:
- Governing plan/ADR/spec:
- Authorized local actions:
- Separately authorized or human-only actions:
- Explicitly prohibited actions, including Git publication or artifact signing:

## Research preflight

```text
Research: linked | reused | not needed — <artifact or concrete reason>
Last30Days: linked | reused | not needed — <artifact or concrete reason>
```

## Bootstrap and dirty tree

- Branch and bootstrap HEAD:
- `git status --short` summary:
- Tracked diff summary:
- Complete in-scope untracked inventory:
- Important artifact manifest command and selected hashes:
- Known user-owned changes that must not be overwritten:

Use `node scripts/worktree-manifest.mjs <important files-or-directories...>`
for important untracked or binary artifacts. Directory inputs expand to their
files. State explicitly that normal `git diff` omits untracked files.

## Implementation and evidence

- Completed behavior:
- Remaining behavior:
- Generated-code provenance and last clean regeneration:
- Focused tests and results:
- Aggregate command and result:
- Browser runtime/version, target URL, viewports, and evidence:
- Known console diagnostics and whether they are expected:
- Residual risks:

Label every command as one of:

- read-only;
- disposable-output-only;
- repository-mutating;
- external-state-changing; or
- human-only.

Shortcut build/sign commands are repository-mutating. Prefer
`npm run check:shortcuts:readonly` for validation when its prerequisite is
already available.

## Agent coordination

- Active/completed children and owned paths:
- Shared resources that must be serialized:
- Two fresh direct-child slots reserved for final verifier and validator:
- Required final verdicts and evidence:

## Pickup

Provide one exact continuation request that starts with reconciliation and
auditing, not rebuilding.
