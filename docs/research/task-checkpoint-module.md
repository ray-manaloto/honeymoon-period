# Read-only task-checkpoint module

- **Question:** Should the repository add a deep read-only module that assembles
  task-start and handoff evidence without becoming a second tracker, authority,
  or workflow engine?
- **Status:** Research complete; decision required before implementation.
- **Accessed / last verified:** 2026-07-17.
- **Research:** linked — this report contains the candidate-specific
  primary-source lane.
- **Last30Days:** reused —
  [Research-first agent workflow](research-first-agent-workflow.md#last30days-supplement)
  already evaluated current agent-workflow practice and found no
  project-specific signal that changes the local evidence/authority split.

## Recommendation

If the root observes repeated checkpoint omissions, add one **read-only
`task-checkpoint` module** behind a single CLI seam, for example:

```text
node scripts/task-checkpoint.mjs --scope <path> [--issue <n>] [--phase <id>]
```

It should emit a versioned JSON document to stdout containing only
machine-observable facts: Git branch/HEAD, porcelain status including complete
untracked inventory, scoped SHA-256 manifest, configured thread/depth capacity,
and declared document anchors. It must never write, invoke `gh` by default,
claim authorization, or decide whether research, an issue, a human ceremony, or
final-verifier slots are current. The root pastes or links this output in the
existing handoff/issue workflow and supplies the required human attestations.

This is a small but deep module: callers learn one command while its
implementation centralizes path validation, Git status parsing, manifest
creation, TOML reading, and deterministic output. It complements—not replaces—
the handoff template, GitHub issues, ADRs, research index, or the root's
completion judgment.

Do **not** implement it merely because the concept is attractive. Current
records are already sufficient for the accepted local MVP. Adopt only after two
locally observed omissions or reconciliation failures that the module would have
prevented (for example, an untracked in-scope file absent from a handoff, or a
false assertion about available final-agent capacity).

## Verified facts

### Existing repository authority and records

- `AGENTS.md` makes the root responsible for shared files, integration, Git,
  publication, and final verification; it requires preserving dirty work and
  two fresh direct-child slots for the final verifier and validator
  ([AGENTS.md](../../AGENTS.md#L82-L103)). The web-MVP plan gives the same
  ownership and says the verifier and validator must be fresh and independent
  ([web-mvp plan](../product/web-mvp-plan.md#L109-L117)).
- The handoff template already names the required facts: scope and authority,
  two research lanes, complete untracked inventory, selected manifest hashes,
  command side-effect labels, serialized resources, and the two reserved slots
  ([handoff template](../agents/handoff-template.md#L6-L67)). It also explicitly
  states that normal `git diff` omits untracked files
  ([handoff template](../agents/handoff-template.md#L21-L32)).
- `scripts/worktree-manifest.mjs` is a read-only local primitive: it invokes
  `git status --porcelain=v1 -z --untracked-files=all`, rejects paths outside the
  repository (including resolved symlink escapes), recursively expands directory
  inputs, then returns branch, HEAD, status, size, and SHA-256
  ([worktree manifest](../../scripts/worktree-manifest.mjs#L8-L67)). Its
  manifest on the examined inputs reported branch
  `codex/complete-web-mvp-followups`, HEAD
  `a47a239ddd2f63de918dfec9108bf13f320fed19`, and no changes before this report
  was written.
- Research routing deliberately separates a cited primary-source report from
  the root-owned Last30Days run, requires reuse before re-searching, and says
  hooks cannot prove appropriate evidence was consulted
  ([research workflow](../agents/research-workflow.md#L8-L29),
  [research workflow](../agents/research-workflow.md#L31-L67)). The current
  policy integration likewise rejected both a wrapper skill/custom MCP and a
  semantic hook gate ([research-first workflow](research-first-agent-workflow.md#L264-L273)).
- GitHub Issues are the tracker authority; issue creation, claim, comment, and
  close are external writes, while listing/viewing is read-only
  ([issue tracker](../agents/issue-tracker.md#L1-L22),
  [issue tracker](../agents/issue-tracker.md#L44-L66)). A read-only `gh issue
  list` on 2026-07-17 found only open #19–#21, all unassigned and labeled
  `question`/`needs-triage`. The plan calls #16–#18 post-MVP maintenance and
  says #19–#21 are not implementation-ready
  ([web-mvp plan](../product/web-mvp-plan.md#L143-L177)).
- The current product phase is *accepted local web MVP; local only*. Deployment,
  provider credentials, and publication remain separately authorized
  ([web-mvp plan](../product/web-mvp-plan.md#L1-L8),
  [ADR-0002](../adr/0002-api-first-web-mvp.md#L10-L25)). A human checkpoint
  requires a named owner action and safe resumption state, not just a boolean
  ([lab identities](../conventions/lab-identities.md#L52-L82)).
- Project configuration enables goals, hooks, and multi-agent work, sets
  `max_threads = 4` and `max_depth = 1` ([config](../../.codex/config.toml#L11-L39)).
  OpenAI defines those settings as a cap on concurrently open threads and on
  spawned nesting depth; a root begins at depth zero and the default depth of
  one permits only direct children ([OpenAI subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)).
  This proves the configured ceiling, **not** how many slots are free during a
  live run.
- Current OpenAI documentation confirms that persisted goals/automatic
  continuation are enabled by `features.goals`; it does not make goals a
  substitute for repository evidence or user authorization
  ([OpenAI configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)).
  The repository configuration enables it, but the present task rules also
  restrict goal creation to an explicit request.
- `PreToolUse` can block local shell/edit/MCP/local-function paths, but hosted
  tools such as WebSearch do not traverse that hook path; OpenAI calls hooks a
  guardrail rather than a complete enforcement boundary
  ([OpenAI hooks](https://learn.chatgpt.com/docs/hooks#pretooluse)). The current
  hook appropriately targets narrow destructive/device/distribution commands
  ([pre-tool policy](../../.codex/hooks/pre_tool_policy.py#L12-L90)); it cannot
  certify phase, authority, research adequacy, or slot freshness.

## Facts versus inference

### Facts

The preceding claims are directly supported by the cited local sources and the
official OpenAI documents, accessed 2026-07-17. Codex also loads `AGENTS.md`
before work and applies nearer project guidance later in the instruction chain
([OpenAI AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)).

### Inference

A read-only evidence assembler can reduce repeated mechanical omissions but
cannot make a task safe or complete. Treating any of its outputs as an approval,
a claim that final-agent slots are available, proof of research quality, or the
live tracker state would create a false authority and conflict with the existing
root-owned workflow.

## Proposed module shape

| Concern | Proposed interface result | Implementation responsibility | Authority |
| --- | --- | --- | --- |
| Dirty tree | `worktree` record: branch, HEAD, tracked changes, untracked paths, scoped manifest | Reuse/absorb manifest path validation, deterministic Git parsing and hashing | Machine-validated snapshot only |
| Configured capacity | `agentConfig`: `maxThreads`, `maxDepth`, computed `maxDirectChildren` | Parse `.codex/config.toml`; reject malformed/missing expected values | Machine-validated configuration, not live slot availability |
| Documents | `anchors`: fixed source paths and line/heading references for phase/authority/research template | Keep one explicit source map; fail closed if an anchor vanishes | Existence/version can be checked; meaning needs review |
| Tracker | optional `trackerHint`: issue number supplied by caller, no network request | Validate positive integer only | Issue status/claim/blockers must be separately read and attested |
| Human facts | omitted from JSON; handoff template carries them | None | Root/human attestation only |

The external **interface** is one command and stable JSON schema, with no
required network, credentials, repository mutation, or live-agent inspection.
The **implementation** may use small private adapters for Git, filesystem,
manifest, and TOML, but callers do not select those adapters. There is currently
only one needed adapter per local source; avoid a public adapter framework.

The **seam** belongs in `scripts/task-checkpoint.mjs`, adjacent to the existing
`worktree-manifest.mjs`, rather than in a hook, a skill, the GitHub tracker, or a
new durable state directory. This maximizes **locality**: Git and config
interpretation change in one implementation. It has **depth** only if callers
avoid reimplementing all of that interpretation in handoffs, tickets, and final
reviews. The deletion test is decisive: deleting it should force each caller to
repeat safe path handling, complete untracked enumeration, hash selection, and
capacity derivation. If usage merely prints `git status`, delete rather than
maintain it.

## Two plausible shapes

### A. Read-only evidence assembler — recommended, conditionally

The script emits a snapshot to stdout and has no persistence. A handoff embeds
the output or a selected manifest hash; a root separately adds the authority,
research, tracker, phase, and slot-attestation fields already required by the
template. This preserves the canonical sources and gives high leverage across
handoffs, independent verification, and dirty-tree review.

### B. Persistent `checkpoint.json`/Markdown ledger — reject

A ledger could contain phase, issue, research status, slots, approvals, and
handoff state. It is shallow: callers must still understand stale-state rules,
who may write it, concurrency, synchronization with GitHub, and when to delete
or refresh it. It duplicates the tracker, research index, plan/ADR, and handoff,
adds shared-file conflicts, and risks recording sensitive/private task context.
No existing source calls for a second durable authority.

### C. Hook or automatic-goal gate — reject

An automatic `PreToolUse`/`Stop` checkpoint gate would be broader than its
observable facts. Hosted web research is not hook-covered, and a hook cannot
decide material uncertainty or human authorization. Likewise, an active Codex
goal is session state, not audited repository state. Keep the current narrow
safety hook and create goals only when explicitly requested.

## Authorization, preservation, and attestations

The module must label itself **read-only** and execute no `git` mutation,
`gh` request, browser, credential, provider, signing, deployment, or artifact
build. It may inspect only repository-relative paths and must retain the
manifest's symlink/outside-root safeguards. Its stdout must contain no source
URLs, notes, addresses, calendar details, credentials, tokens, or relationship
data.

Machine validation can establish a snapshot's branch/HEAD, actual changed and
untracked path set, selected file hashes, file/schema presence, configured
thread/depth limits, supplied identifier syntax, and (if explicitly asked by
the root) a point-in-time read of GitHub issue JSON. It cannot establish:

- whether an action is authorized or a human-only ceremony is satisfied;
- whether a research report answers the actual material uncertainty;
- whether an issue's labels, dependencies, or assignee make it the right next
  task without a current tracker read and root judgment;
- current active-agent count, freshness/independence of verifier/validator, or
  that two slots remain available; or
- semantic phase truth where plan, ADR, issue, and user direction conflict.

Require the root to attest those four categories in the existing handoff
template, with timestamp and evidence links. Phase must be read from the
governing plan/ADR and reconciled with the tracker, never inferred from a
directory name or goal status.

## Incremental adoption and guards

1. Record two real missed-checkpoint examples before implementation.
2. Add the script as a pure stdout program with a `--format json` default and a
   documented schema version; no new dependency or config flag.
3. Unit-test pure parsing/validation through injected command/filesystem
   adapters. Integration-test a temporary Git repository containing tracked,
   modified, staged, and untracked files; reject outside-root and symlink-escape
   input; snapshot deterministic JSON after normalizing volatile time fields.
4. Add a read-only test that malformed TOML, absent mandated paths, and invalid
   issue syntax exit nonzero with a concise diagnostic. Do not test an issue
   state with a live GitHub write.
5. Add one handoff-template example showing which fields are generated and which
   remain root attestation. A reviewer/verifier checks its presence but does not
   treat a green checkpoint as semantic acceptance.

No hook should require the module. Do not add a persistent file, update the
research index automatically, or auto-create/claim/comment/close tracker items.

## Product constraints, decisions, and uncertainty

This module is workflow-only: it must not touch the `/v1` contract, generated
outputs, Shortcut artifacts, or local-MVP acceptance. It must preserve the
Reminders+Beli baseline and all explicit no-deploy/no-paid/no-production
boundaries. The root must decide:

1. Has repeated local evidence justified the maintenance cost, or is the current
   handoff plus manifest sufficient?
2. If adopted, should `--issue` be syntax-only (recommended), or may an explicit
   root command request a time-stamped read-only GitHub lookup?
3. Which phase/plan anchors are stable enough to be emitted as hints without
   turning them into machine authority?

Residual uncertainty: no public OpenAI source reviewed here specifies a stable
API for querying live in-thread agent occupancy or verifier freshness. The
current runtime can expose agent state to the root, but a repository script must
not infer it from `max_threads`. Re-evaluate this narrow claim only if a future
official Codex agent-state interface becomes available.
