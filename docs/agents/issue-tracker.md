# Issue tracker: GitHub

Issues and PRDs for this repository live as GitHub issues. Use the `gh` CLI
for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a
  heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by
  `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json
  number,title,body,labels,comments --jq '[.[] | {number, title, body, labels:
  [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label`
  and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply/remove labels**: `gh issue edit <number> --add-label "..."` or
  `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.

Infer the repository from `git remote -v`; `gh` does this automatically inside
the repository.

## Pull requests as a triage surface

**PRs as a request surface: no.**

External pull requests are welcome, but `/triage` does not treat them as
feature-request issues. Review PRs separately. The standing autonomous merge gate below
applies only to root-authored pull requests whose active goal explicitly records that
publication authority; it never turns external pull requests into an automatic surface.

GitHub shares one number space across issues and pull requests. Resolve an
ambiguous `#42` with `gh pr view 42`, then fall back to `gh issue view 42`.

## Autonomous merge gate

The repository owner authorizes the root to merge one root-authored goal pull request
without a separate confirmation only when all of these facts are freshly true:

- the pull request is open, ready for review, mergeable, and targets the recorded base;
- every required check succeeds and there are no unresolved review threads or change
  requests;
- fresh independent verifier `ACCEPT` and validator `PASS` records bind the exact remote
  head and active-goal revision;
- a final status read proves that the remote head did not change after those records;
- the diff matches the governing specification, authority, protected-artifact audit, and
  zero-debt gate; and
- the configured merge method succeeds without bypassing branch protections.

Bind the mutation itself to the reviewed SHA with
`gh pr merge <number> --match-head-commit <reviewed-sha> <configured-method>`; a separate
pre-merge read is not a concurrency guard.

After merging, re-read the pull request, issue, base branch, and project state to prove
the recorded postconditions. Any head drift, warning, pending or flaky check, unresolved
feedback, scope mismatch, missing evidence, or protected side effect returns work to the
autonomous learning loop. Only unresolved ambiguity reaches a human interview; credentials,
consent, paid services, private data, signing, deployment, and other separately protected
external effects remain outside this gate.

## Skill mappings

- "Publish to the issue tracker" means create a GitHub issue.
- "Fetch the relevant ticket" means run `gh issue view <number> --comments`.
- Specifications created by `/to-spec` are GitHub issues labeled
  `ready-for-agent` after approval.
- Ticket sets created by `/to-tickets` use one GitHub issue per tracer-bullet
  slice.

## Wayfinding operations

- **Map**: one issue labeled `wayfinder:map`, holding Notes,
  Decisions-so-far, and Fog. Create it with `gh issue create --label
  wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue using the
  sub-issues API. If sub-issues are unavailable, add the child to a task list in
  the map and put `Part of #<map>` at the top of the child. Label it
  `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or
  `wayfinder:task`. Assign it to the driving developer once claimed.
- **Blocking**: use GitHub's native issue dependencies. Add an edge with `gh
  api --method POST
  repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F
  issue_id=<blocker-db-id>`, where the blocker database ID comes from `gh api
  repos/<owner>/<repo>/issues/<n> --jq .id`. If dependencies are unavailable,
  use `Blocked by: #<n>` in the child body. A ticket is unblocked when every
  blocker is closed.
- **Frontier query**: list the map's open children, then drop children with an
  open blocker or an assignee. The first remaining child in map order is next.
- **Claim**: `gh issue edit <n> --add-assignee @me`; this is the session's first
  write.
- **Resolve**: comment with the evidence, close the ticket, then append a gist
  and link to the map's Decisions-so-far section.
