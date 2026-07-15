# Issue tracker: GitHub

Issues and PRDs for this repository live as GitHub issues. Use the `gh` CLI for all operations after the repository remote is configured.

## Conventions

- Create an issue with `gh issue create --title "..." --body "..."`.
- Read an issue and its discussion with `gh issue view <number> --comments`.
- List issues with `gh issue list` and request JSON fields when filtering programmatically.
- Comment with `gh issue comment <number> --body "..."`.
- Apply or remove labels with `gh issue edit`.
- Close with `gh issue close <number> --comment "..."`.

Infer the repository from `git remote -v`; `gh` does this automatically inside the repository.

## Pull requests as a triage surface

**PRs as a request surface: no.**

External pull requests are welcome, but `/triage` does not treat them as feature-request issues. Review PRs separately and never merge them without the repository owner's approval.

GitHub shares one number space across issues and pull requests. Resolve an ambiguous `#42` with `gh pr view 42`, then fall back to `gh issue view 42`.

## Skill mappings

- "Publish to the issue tracker" means create a GitHub issue.
- "Fetch the relevant ticket" means run `gh issue view <number> --comments`.
- Specifications created by `/to-spec` are GitHub issues labeled `ready-for-agent` after approval.
- Ticket sets created by `/to-tickets` use one GitHub issue per tracer-bullet slice.

## Wayfinding operations

- A map is one issue labeled `wayfinder:map` containing Notes, Decisions-so-far, and Fog.
- Each map ticket is a child issue labeled `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- Prefer GitHub sub-issues and native issue dependencies. If unavailable, use a task list in the map, `Part of #<map>` in children, and `Blocked by: #<n>` in blocked tickets.
- Claim a ticket by assigning it to the driving developer before work begins.
- Resolve a ticket by commenting with the evidence, closing it, and linking the result from the map.
