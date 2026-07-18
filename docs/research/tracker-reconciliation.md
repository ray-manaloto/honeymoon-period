# Declarative tracker reconciliation

- **Question:** What shape can reconcile this repository's durable backlog with
  GitHub Issues and its GitHub Project without silently changing product intent?
- **Status:** Research complete; reconciliation intent and any implementation
  require a root/user decision.
- **Accessed / last verified:** 2026-07-17
- **Scope:** design research only. No GitHub write, Project mutation, or
  implementation was performed.
- **Research:** linked — this report; GitHub-owned facts below were checked
  against current official documentation, the live GitHub schema, local `gh`
  help, and a read-only live snapshot.
- **Last30Days:** not needed — this is an authoritative GitHub-contract and
  repository-state question; the root owns any Last30Days run and no recent
  practitioner recommendation is needed to establish a safe interface.

## Local evidence and observed drift

The durable plan says the repository plan is the source of truth while the
tracker is stale ([`docs/README.md:23`](../README.md#L23)). It names #16--#18
as *open* maintenance work ([`docs/product/web-mvp-plan.md:143-159`](../product/web-mvp-plan.md#L143-L159)), and #19--#21 as deferred,
not-ready questions ([`docs/product/web-mvp-plan.md:161-171`](../product/web-mvp-plan.md#L161-L171)). The tracker guide separately establishes GitHub Issues as the issue/PRD
location and `gh` as its operational tool ([`docs/agents/issue-tracker.md:1-4`](../agents/issue-tracker.md#L1-L4)). These are not the same claim: the
plan supplies intent; GitHub is the remote projection and work record.

**Verified, live read-only snapshot (2026-07-17).** `gh issue list --state all
--limit 100 --json ...` found #16, #17, and #18 closed at 03:52 UTC, but
`gh project item-list 1 --owner ray-manaloto --limit 100 --format json` found
their Project Status as `In Progress`. #19--#21 are the only open issues, are
labelled `question` and `needs-triage`, and have Project Status `Todo`. The
Project has 14 issue items, including the closed historical #1--#8 map and
children. The `gh issue list` extended JSON confirms those historical
sub-issue/dependency relationships, including #1's seven children and #8 being
blocked by #7. This is a **locally observed control-flow risk**, not a product
failure: a broad “make the board match open/closed state” rule could erase the
intentional historical map.

The plan's description of #16--#18 as open is therefore stale relative to the
read-only GitHub snapshot. The report makes no claim that GitHub is wrong: the
plan itself says it is the durable source, so a human/root decision is needed
before choosing whether to amend the plan, reopen an issue, or merely change
the Project statuses.

## Verified GitHub constraints

1. GitHub's REST issue resource uses a repository issue number in its path but
   returns an `id`; GitHub also warns that issues and pull requests share the
   number space. The local guide already requires resolving ambiguous numbers
   through `gh pr view` then `gh issue view` ([`docs/agents/issue-tracker.md:32-33`](../agents/issue-tracker.md#L32-L33)). A REST dependency *write* takes the
   blocker **database ID** (`issue_id`), whereas GraphQL's documented Project
   and sub-issue mutations use `ID` inputs. Do not substitute a number,
   database ID, GraphQL node ID, Project ID, Project-item ID, field ID, or
   option ID for another. [Issues REST reference](https://docs.github.com/en/rest/issues/issues?apiVersion=latest), [issue-dependencies REST reference](https://docs.github.com/en/rest/issues/issue-dependencies?apiVersion=2026-03-10), [Issues GraphQL schema](https://docs.github.com/en/graphql/reference/issues).

2. Current live GraphQL introspection confirms `addProjectV2ItemById` needs
   `projectId` and `contentId`, while `updateProjectV2ItemFieldValue` needs
   `projectId`, `itemId`, `fieldId`, and a value. The Project schema defines
   `ProjectV2Item` as the project membership object and documents both adding a
   content item and updating a single-select field. [Projects GraphQL schema](https://docs.github.com/en/graphql/reference/projects).

3. GitHub supports native sub-issues and shows their progress in Projects; the
   CLI supports `gh issue create --parent`, `gh issue edit --add-sub-issue`,
   and removal flags. A parent can contain at most 100 sub-issues and nesting
   is limited to eight levels. Native issue dependencies have read endpoints
   for both directions and a write endpoint that takes the blocking issue's
   database ID. [GitHub sub-issues documentation](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues), [issue-dependencies REST reference](https://docs.github.com/en/rest/issues/issue-dependencies?apiVersion=2026-03-10).

4. Local `gh` 2.96.0 help confirms `gh project item-list` is read-only,
   supports a limit and project query, and `gh project item-add`,
   `item-edit`, and `item-delete` are separate write commands. `gh issue create`
   and `edit` can combine labels, parent/sub-issue and dependency flags. These
   conveniences do not make a multi-call desired-state change atomic.
   [GitHub CLI project-item list manual](https://cli.github.com/manual/gh_project_item-list), [project-item add manual](https://cli.github.com/manual/gh_project_item-add).

5. A reconciler must treat reads, writes, and transient failures as part of its
   **Interface**. GitHub documents 403/429 rate limiting; honor `Retry-After`
   when present, otherwise `x-ratelimit-reset` when remaining is zero, otherwise
   wait at least a minute for a secondary limit, then use bounded exponential
   backoff. GitHub says continued requests while limited can lead to a ban.
   [GitHub rate-limit guidance](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2026-03-10).

## Two shapes considered

### A. Imperative GitHub command wrapper — rejected

Expose `createIssue`, `editIssue`, `addToProject`, `setStatus`,
`linkSubIssue`, `addDependency`, and `deleteItem` directly to callers. This is
a shallow **Module**: every caller must learn remote ID kinds, operation order,
partial-failure recovery, rates, and audit logging. On the deletion test, that
complexity reappears at every caller. It also encourages an accidental “repair
everything” run from stale prose.

### B. Declarative reconciliation Module with a pure planning seam — recommended

Define one deep **Module** whose public **Interface** is conceptually:

```text
reconcile(declaration, observedSnapshot, now) -> reconciliationReport
```

`declaration` is a small, source-controlled description keyed by a stable
logical key (not a GitHub number): intended lifecycle, title/body fingerprint,
labels, optional parent/dependency logical keys, desired Project membership,
and desired Status name. `observedSnapshot` contains the fetched remote facts
and all opaque identifier mappings. The result is an ordered, deterministic
report of `unchanged`, `conflict`, `blocked`, and proposed operations, each with
preconditions, a stable operation key, before/after summary, and evidence
links. It does not execute a GitHub mutation.

This places the **Seam** between declared intent plus observed facts and remote
effects. Its **Implementation** absorbs canonicalization, matching, ID
translation requirements, dependency ordering, stale-document conflicts,
dry-run rendering, idempotence classification, and audit records. That gives
callers **Leverage** and maintainers **Locality**. It satisfies the codebase
design deletion test: if removed, all of that complexity would reappear in
every maintenance and release workflow. This use of Module, Interface,
Implementation, Seam, Depth, Adapter, Leverage, and Locality follows the
repository-required vocabulary ([`.agents/skills/codebase-design/SKILL.md:19-33`](../../.agents/skills/codebase-design/SKILL.md#L19-L33),
[`...:65-70`](../../.agents/skills/codebase-design/SKILL.md#L65-L70)).

Keep acquisition outside the pure Module: a read-only GitHub **Adapter** obtains
a full paginated snapshot, and an explicitly authorized mutating GitHub
**Adapter** may later apply an approved report. Initially there is only one
adapter, so the seam is deliberately limited to the pure planner; do not invent
an alternate tracker adapter until it actually varies.

## Recommended incremental adoption

1. **Read-only inventory first.** Add no GitHub writes. Build a snapshot using
   `gh issue list --state all` plus complete per-issue parent/sub-issue and
   dependency relations, and Project field/item pagination. Record fetch time,
   remote repository, `gh --version`, GraphQL/REST request class, opaque IDs,
   and response rate-limit metadata. Omitted pagination is a correctness bug,
   not an optimization.
2. **Declare only the known active surface.** Do not infer desired state from
   arbitrary Markdown. Start with the eight historical items #1--#8 and #16--#21
   explicitly represented, with an `authoritative`/`advisory` source tag. A
   mismatch between an authoritative declaration and a currently stale plan is
   `conflict`, never an automatic close/reopen/delete.
3. **Dry-run is the product.** Render a stable JSON and concise Markdown audit
   report. Group by logical backlog key, include source paths/lines, remote
   number and opaque IDs (only as audit data), field/options, preconditions,
   and the reason for every non-no-op. A dry run must cause zero external
   writes and be repeatable against the same snapshot.
4. **Add a write adapter only with explicit authorization.** It consumes a
   reviewed report, refuses an old snapshot, serializes one run, re-reads each
   target immediately before mutation, applies one operation at a time, and
   records returned IDs and postcondition reads. Never delete/archive an issue
   or Project item as cleanup; preserve historical evidence unless separately
   authorized.
5. **First intended repair, if approved.** Limit it to setting the existing
   Project items for closed #16--#18 to `Done`; do not delete them. This is
   contingent on the root deciding that closed issue state, rather than a
   deliberate “In Progress” review convention, is authoritative. Separately
   update the stale repository plan only after that decision; this report does
   not authorize either change.

## Idempotence, failure, and audit rules

- A no-op must be a first-class operation: same declaration plus a fresh equal
  observed state returns no writes. Status comparison is by current option ID
  resolved from the current Project field, not by a hard-coded option ID.
- Creating an issue is not demonstrated here to have a GitHub idempotency key.
  Treat create as at-least-once: serialize it, search by an immutable
  reconciliation marker/logical key before creating, and after a timeout or
  unknown result re-read before retrying. Surface duplicate candidates for
  review; never auto-delete one. This is an inference from the documented
  multi-operation interfaces, not a claim of GitHub exactly-once semantics.
- Treat 401/403, 404/410, 422, 429, schema/field drift, pagination failure, and
  unexpected content type as distinct terminal report states. Retry only
  explicitly transient transport/rate-limit cases under the documented policy;
  do not retry authorization, validation, or stale-precondition conflicts.
- Store an append-only local audit record with declaration digest, normalized
  snapshot digest, operation key, expected and actual remote IDs, before/after
  values, response/request IDs where available, timestamps, actor, result, and
  error classification. Redact tokens and never record private product data;
  this follows the repository privacy invariant ([`CONTEXT.md:35-42`](../../CONTEXT.md#L35-L42)).

## Guards and tests implied by the recommendation

- Pure Module: fixture tests for stable ordering, no-op, stale-plan conflict,
  historical-map preservation, duplicate logical keys, missing/changed Project
  fields/options, opaque-ID type separation, sub-issue/dependency ordering,
  and deterministic audit/dry-run output.
- Read-only Adapter: recorded fixture tests for pagination, Project and Issue
  identity joins, GraphQL/REST error mapping, rate headers, and no write command
  invocation. The existing task's dirty-tree policy requires a read-only
  manifest for untracked evidence; normal `git diff` omits it
  ([`AGENTS.md:63-72`](../../AGENTS.md#L63-L72)).
- Mutating Adapter (future): fake-adapter tests for precondition mismatch,
  re-read-after-timeout, bounded retry, partial completion/resume, idempotent
  no-op rerun, and an explicit test that duplicate candidates and historical
  items are never auto-deleted. Integration tests must use a disposable
  repository/Project, never this production tracker.

## Root decisions required

1. Is `docs/product/web-mvp-plan.md` the authoritative desired state for
   lifecycle, or should a new small declaration be the authoritative backlog
   model while the plan remains narrative evidence?
2. Does closure of #16--#18 mean their existing Project items should be `Done`,
   or is `In Progress` intentional pending a separate review/merge convention?
3. Which GitHub effects, if any, are authorized after a reviewed dry run:
   Project Status only; labels/assignees; hierarchy/dependencies; issue body;
   creation; or never deletion/archive?
4. Where may a local audit record live, what retention/redaction policy applies,
   and who may invoke the mutating Adapter?

## Residual uncertainty

- The read-only snapshot establishes current state, not the intent behind the
  `In Progress` statuses on closed work.
- The current Project has standard fields only. A future Project template,
  renamed Status field, or changed option changes the declaration-to-Project
  mapping and must become a reported conflict.
- REST dependency writes use database IDs whereas GraphQL uses opaque node IDs;
  the suggested split is deliberately conservative until a future implementation
  has fixture-backed request/response evidence for every selected mutation.
- No Last30Days evidence was consulted, by assignment and because no recent
  practice claim determines the proposed design.
