# Autonomous Codex goal continuation

- **Question:** How can this repository autonomously resume and refine an explicitly authorized long-running goal across fresh Codex desktop or CLI sessions, allocate bounded subagents, continue when unambiguous, and stop only at real ambiguity or authority boundaries?
- **Status:** Research complete; thin scheduled-task controller and bounded learning loop adopted and implemented under the recorded goal authority.
- **Accessed / last verified:** 2026-07-19.
- **Research:** linked — this root synthesis plus [workflow primitives](codex-autonomy-workflow-primitives.md), [quality loops](codex-autonomy-quality-loops.md), and [release/capability inventory](codex-autonomy-release-capability-inventory.md).
- **Last30Days:** reused — [the retained focused Symphony/Codex report](../../.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md); discovery is not authority.

## Current repository decision (2026-07-19)

The owner authorized and the repository implemented the thin scheduled-task controller,
then authorized its bounded self-learning review-repair-validation loop after the repeated
issue #24 evidence recorded in goal change-log entry 20. The active goal record and lease
remain the only execution authority. Earlier statements in this report that implementation,
scheduling, or loop adoption still require a decision are retained as historical analysis
and are superseded by the recorded repository policy. Publication, exact-head autonomous
merge, and protected external ceremonies remain governed by their current explicit gates.

## Recommendation

Use a **desktop scheduled task inside the active goal chat** as the first
delivery mechanism. Give it a durable, repository-scoped controller prompt that
reconciles a small tracked goal record, takes a local lease, continues only
pre-authorized deterministic work, asks a single focused question when a listed
decision gate is reached, and delegates only bounded independent work. Keep the
goal chat as the execution engine, but keep its authoritative state in the
repository—not in a chat goal, a transcript, or a hook.

This is the closest supported answer to “continue automatically with no human
intervention while unambiguous”: the desktop app can schedule a task in an
existing chat at minute intervals, reuse that chat's context, use skills and
plugins, operate in a local project or isolated worktree, and run unattended
under its configured sandbox. It requires the computer to stay on, the desktop
app to remain running, and the project to be available on disk. It does **not**
turn a scheduled task, goal, or hook into an unlimited-authority agent.
([Scheduled tasks](https://learn.chatgpt.com/docs/automations#schedule-a-task-inside-a-chat),
[Long-running work](https://learn.chatgpt.com/docs/long-running-work))

Historically, this was a recommendation for a first disposable one-goal Adapter pilot,
not evidence that a reusable controller Module should already exist. The owner later
authorized the pilot and its scheduled continuation; controller fault injection and the
issue #24 recurrence then supplied the promotion evidence recorded in the goal change log.
The paragraph is retained as design provenance, while the current decision above governs.

For robust headless or CI execution, use a deliberately separate controller
around `codex exec` / `codex exec resume` (or the official Codex GitHub Action),
not the desktop App Server. The App Server is an integration protocol for rich
clients; OpenAI specifically directs automation and CI users to the Codex SDK.
That is a heavier, separately authorized architecture, particularly if it needs
credentials, a runner, scheduling, GitHub writes, or publication.
([App Server](https://learn.chatgpt.com/docs/app-server),
[Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode))

## Cookbook and capability synthesis

The [companion-Markdown inventory](codex-cookbook-companion-markdown-inventory.md)
pins the eight requested Cookbook sources and distinguishes committed source
files from generated example artifacts. It adds four controller requirements:
record outcomes/retrospective evidence, invalidate review proof when its input
revision changes, preserve Responses `phase` metadata only for a direct API
history integration, and never treat generated plans or `codex_handoff.md` as
execution authority.

Three independent candidate reviews were completed on 2026-07-19. They do not
change the recommended first runner. They refine the controller contract and
reject several tempting but unnecessary expansions.

- [Workflow primitives](codex-autonomy-workflow-primitives.md) reviewed Goals,
  `PLANS.md`, and the Codex CLI/Agents SDK multi-agent example.
- [Quality loops](codex-autonomy-quality-loops.md) reviewed the Codex SDK code
  review and modernization examples, Codex prompting guidance, iterative repair
  loops, and the Agents SDK improvement loop.
- [Release and capability inventory](codex-autonomy-release-capability-inventory.md)
  reviewed the current Codex changelog/releases and every project-local agent,
  skill family, hook, feature flag, and MCP declaration relevant to autonomy.

### Decision effect

The evidence supports a thin scheduled-task **Adapter**, not a new orchestration
framework. The repository remains the authority. A Goal is the thread-local
inner loop; a self-contained phase plan plus append-only evidence enables
recovery; deterministic code or policy admits, verifies, records, and stops a
bounded agentic phase.

At the time of this research, no locally reproduced failure proved that a reusable
controller **Module** was necessary. The then-current gap was an architectural hypothesis plus known
control-flow risks: duplicate writers, stale state, no-progress spinning,
authority drift, and self-certification. The Cookbook examples demonstrate
useful patterns, but their API keys, dependencies, trace stores, external
publishing, permissive approval examples, and fixed turn counts are tutorial
choices rather than repository authorization or platform guarantees.

### Refined control-loop contract

```text
approved active-goal record + self-contained phase plan + append-only evidence
    -> acquire atomic TTL lease
    -> reconcile authority, HEAD, dirty tree, tracker, and prior proof
    -> deterministic admission gate
    -> bounded review or implementation phase
    -> deterministic artifact/test/proof gate
    -> persist checkpoint and normalized remaining delta
    -> complete | retryable | waiting | blocked | failed_budget
```

Each phase declares its input HEAD, owned paths, expected artifacts, acceptance
commands, retry/time/turn budget, privacy constraints, and stop conditions.
Review should be read-only where possible. Repair is focused and isolated.
Validation is independent from the repair step, and failures become structured
input to the next attempt. A model judge may explain or rank evidence but is
never the sole acceptance oracle.

Continue only while the lease is live, the next unit is already authorized,
the prior state is `retryable`, the remaining delta has materially changed (or
an explicit staged milestone remains), and every budget is available. Stop
without mutation on lease loss, stale HEAD, dirty-tree conflict, malformed
structured output, unchanged failure fingerprints, missing proof, exhausted
budget, or a question that changes scope or authority.

Native Goals add one important no-progress guard: automatic continuation occurs
only at safe idle boundaries, pauses for queued user work or interruption, and
suppresses the next continuation after a no-tool-call continuation to avoid a
spin. The repository controller should persist that condition as `waiting` or
`blocked`; it must not convert it into silent success or an unbounded Stop-hook
loop. ([Using Goals in Codex](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex))

### Architecture contract and deletion test

| Lens | Synthesized decision |
| --- | --- |
| **Interface** | One versioned active-goal/phase/checkpoint contract: objective and authorization reference; outcome, verification, constraints, boundaries, iteration policy, blocked condition; phase inputs/outputs; allowed paths/actions; acceptance commands; budgets; state; lease/controller/session identity; one de-duplicated question. |
| **Implementation** | Deterministic reconciliation, lease, state transitions, command evidence, no-progress detection, and redaction remain repository-owned. Codex performs only the admitted bounded investigation, review, repair, or implementation. |
| **Seam** | `admit -> bounded agentic work -> verify -> record` separates authority/proof from model judgment and lets Desktop scheduling or a later `codex exec` runner invoke the same contract. |
| **Depth** | Keep the first pilot to a prompt/record/lease and existing verification commands. Do not add an agent registry, generic scheduler abstraction, trace platform, second tracker, semantic-ambiguity engine, or orchestration MCP. |
| **Leverage** | Reuse native Goals, scheduled same-chat context, project instructions, direct-child agents, worktree manifests, adaptive-orchestration log, research routing, and fresh verifier/validator gates. Durable reconciliation creates more value than additional fan-out. |
| **Locality** | Keep authority and redacted evidence in the repository near the phase. Do not make transcripts, browser state, user-home daemons, remote traces, or plugin state authoritative. |
| **Adapter** | Desktop same-chat scheduling is the first invocation Adapter. A separately authorized explicit-session `codex exec resume <SESSION_ID>` controller may replace it later without changing the contract. |
| **Deletion test** | Removing the Adapter must leave ordinary repository files, the Goal/plan/evidence record, and manual Codex continuation usable. If the pilot cannot demonstrate safer resumption and stopping than the status quo, delete it without leaving another authority or service. |

### Existing capabilities to reuse

| Need | Existing project capability | Use |
| --- | --- | --- |
| Goal lifecycle and recovery | `adaptive-orchestration`, `handoff`, Goals, tracked plan/change log | Canonical routing and durable recovery; a Goal alone is not repository authority. |
| External uncertainty | `research`, `last30days`, `research-workflow-architecture` and `researcher` | Root routes each lane once; children consume retained evidence. |
| Preference/design ambiguity | `grilling`, `grill-with-docs`, `domain-modeling`, `wayfinder` | Ask one dependent decision at a time; never use Grilling for routine operational choices. |
| Approved execution | `implement`, `tdd`, `diagnosing-bugs`, `prototype`, `worker`, specialists | Assign one bounded unit with exclusive paths and focused proof. |
| Review and proof | `code-review`, `reviewer`, `verifier`, `validator` | Separate repair from review; retain fresh `ACCEPT`/`REJECT` and `PASS`/`FAIL` final gates. |
| Web/native validation | web/Playwright skills and `web-specialist`; vendored iOS skills, `ios-specialist`, `xcodebuildmcp` | Invoke only when the admitted phase concerns that surface; simulator MCP is not an orchestrator. |
| Safety | project approval/sandbox policy plus narrow `PreToolUse` hook | Defense in depth for objectively detectable commands, never goal selection or semantic acceptance. |

Do not add a project plugin, new MCP server, prerelease feature flag, recursive
fan-out, or Agents SDK controller for the first pilot. A future plugin may
package a proven routing skill after recurrence, but must not duplicate the
goal record, lease, tracker, authorization, or verdicts.

### Cross-ecosystem convergence

The [comparative orchestration survey](autonomous-agent-orchestration-trends.md)
confirms that the proposed controls follow current platform direction rather
than a repository-only invention:

- OpenAI Symphony is the closest direct reference architecture: a long-running
  tracker-driven scheduler/runner, repository-owned `WORKFLOW.md`, isolated
  issue workspaces, a single process-local scheduling authority,
  reconciliation, bounded concurrency, retries, and Codex App Server. Its
  `v0.0.1` preview does not persist scheduler or blocked-approval state across
  restart and does not provide a TTL worktree/HEAD lease or semantic acceptance
  contract.
- LangGraph persists checkpoints and interrupt state and explicitly requires
  idempotent side effects around replay.
- Microsoft Agent Framework uses typed workflow graphs, deterministic
  supersteps, durable checkpoint stores, resumable approval requests, and
  bounded orchestration patterns.
- Google ADK 2.0 explicitly moves routing, scheduling, and error handling into
  deterministic workflow code while agents own open-ended work; its current
  graph workflows support human gates and durable resume.
- Temporal provides durable histories, retry/timeout policy, de-duplicated
  requests, human signals, and workflow-ID coordination.
- OpenAI Agents SDK, Codex, Claude Code, OpenHands, SWE-agent, and CrewAI expose
  many analogous pieces—sessions, run state, traces, trajectories, permissions,
  retry/turn limits, or constrained children—but not this repository's authority
  record or worktree-aware single-writer lease.

The cross-vendor trend is therefore **durable explicit state + deterministic
control flow + bounded agentic steps + resumable human gates + observable
proof**. Symphony confirms that tracker-driven Codex continuation through a
thin repository-owned controller is now an explicit OpenAI pattern. The
project-specific work remains the durable authority/TTL-lease policy at the Git
worktree boundary plus independent semantic acceptance. This strengthens the
case for using Symphony's specification as the primary pilot reference while
weakening the case for importing its preview or a broad framework: neither
removes the local policy seam, and each adds runtime, dependency, storage, or
credential surface.

## Verified platform facts

### Installed/project state

- **Verified:** this checkout uses `codex-cli 0.144.6` at
  `/Users/rmanaloto/.local/share/mise/installs/codex/0.144.6/bin/codex`
  (`codex --version`, 2026-07-19). Its local feature catalogue reports
  `goals`, `hooks`, and `multi_agent` as stable and enabled; `runtime_metrics`,
  `token_budget`, `multi_agent_v2`, and fanout are under development and
  disabled.
- **Verified:** `0.144.6` is the latest stable release as of 2026-07-19. Its
  material change is refreshed GPT-5.6 Sol/Terra/Luna instructions and corrected
  272,000-token context metadata; `0.145.0` builds listed by GitHub are
  prereleases. No current release adds a repository goal registry, scheduler,
  lease, or stable replacement for the design above.
  ([Codex changelog](https://learn.chatgpt.com/docs/changelog),
  [Codex releases](https://github.com/openai/codex/releases))
- **Verified:** `.codex/config.toml` enables those three stable features, caps
  concurrent threads at four and depth at one. This permits the root plus at
  most three direct children, not recursive fan-out. The configuration is
  consistent with the documented meaning of `agents.max_threads` and
  `agents.max_depth`.
  ([Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents#global-settings))
- **Verified:** the only project hook is a narrow Bash `PreToolUse` policy. No
  session, stop, compaction, or subagent hook currently exists. The App Server
  daemon is not running locally (`codex app-server daemon version` failed because
  its control socket was absent); no automated desktop controller is therefore
  currently installed.

### Goals, sessions, instructions, and agents

- **Verified:** `features.goals` enables persisted goals and automatic
  continuation. Goal mode uses the stated objective as both first prompt and
  completion criteria; it preserves the existing sandbox and approval policy.
  In the desktop app the user can pause, resume, edit, or clear the active goal.
  ([Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference),
  [Long-running work](https://learn.chatgpt.com/docs/long-running-work))
- **Verified:** persisted Codex goal state is **thread-scoped**, not a
  repository-wide durable work queue. The stable App Server exposes
  `thread/goal/set|get|clear` for the same `/goal` state, and a goal update can
  replace the objective/reset usage accounting. A fresh thread therefore needs
  a repository artifact to know which goal is the authorized one.
  ([App Server thread goals](https://learn.chatgpt.com/docs/app-server#manage-a-thread-goal))
- **Verified:** CLI can resume interactive sessions (`codex resume`) and
  non-interactive sessions (`codex exec resume <SESSION_ID>`); fork creates a
  separate thread. These are session mechanisms, not an arbitration or lease
  mechanism. `--last` is inherently race-prone for a scheduler because it picks
  the most recent session rather than the explicitly recorded session id.
  ([Developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli),
  [Non-interactive resume](https://learn.chatgpt.com/docs/non-interactive-mode#resume-a-non-interactive-session))
- **Verified:** `AGENTS.md` is read at session/run start through a root-to-CWD
  instruction chain. This gives each fresh run consistent workflow policy, but
  it is not mutable execution state and cannot itself select, create, or lock a
  goal.
  ([AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md))
- **Verified:** local Codex can spawn custom/built-in subagents when directly
  asked or when applicable `AGENTS.md`/skill instructions require delegation.
  The root collects their results. The documented direct-child depth setting is
  a cap, not a guarantee of currently vacant capacity or exclusive file
  ownership.
  ([Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents))

### What starts or continues work automatically

- **Verified:** a desktop scheduled task may return to an **existing chat** and
  retain its context. It supports minute-based active follow-up loops, skills,
  local-project execution, optional isolated worktrees, and background runs.
  The task prompt must state each run's action, significance test, and stop/ask
  conditions. The desktop app must run and the machine/project must remain
  available. A standalone task instead creates a new chat on each run.
  ([Scheduled tasks](https://learn.chatgpt.com/docs/automations#schedule-a-task-inside-a-chat),
  [Scheduled tasks](https://learn.chatgpt.com/docs/automations#manage-scheduled-tasks))
- **Verified:** `codex exec` is the official non-interactive command for
  scripts, CI, pipelines, and scheduled jobs; it has explicit sandbox/approval
  settings, JSON events, persisted sessions by default, and a resume command.
  For GitHub Actions, OpenAI recommends the Codex GitHub Action rather than
  installing the CLI and exposing an API key in a shell step. Their CI autofix
  example separates a read-only Codex job that emits a patch from a separate
  write-capable job that applies it/opens a PR.
  ([Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode),
  [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action))
- **Verified:** App Server can start, resume, and fork threads and manage their
  goal state. It is documented for embedding Codex in a rich client; it can
  report loaded instruction sources, and its thread protocol supports recorded
  `threadId` resume. The docs explicitly recommend the Codex SDK for automating
  jobs/CI, so App Server should not be the first repository automation choice.
  ([App Server](https://learn.chatgpt.com/docs/app-server#start-or-resume-a-thread))

### Hooks: useful guardrails, not an orchestrator

- **Verified:** `SessionStart` runs on `startup`, `resume`, `clear`, or
  `compact` and can add developer context. `SubagentStart` can add context to a
  child. Neither event can start a session or create a subagent; the root must
  already be running and must choose to delegate.
  ([Hooks](https://learn.chatgpt.com/docs/hooks#sessionstart),
  [Hooks](https://learn.chatgpt.com/docs/hooks#subagentstart))
- **Verified:** `Stop` can block completion and automatically create **one new
  continuation prompt** with a reason; its payload includes
  `stop_hook_active` so a hook can avoid a direct loop. This is appropriate for
  a bounded, machine-checkable missing verification prerequisite, not for a
  semantic “keep iterating until perfect” loop.
  ([Hooks](https://learn.chatgpt.com/docs/hooks#stop))
- **Verified:** `PreCompact` and `PostCompact` only receive the manual/auto
  trigger. They cannot inspect a documented live context percentage, create a
  handoff/new session, or allocate agents. `PostCompact` can stop continuation;
  it cannot safely implement phase transitions by itself.
  ([Hooks](https://learn.chatgpt.com/docs/hooks#precompact),
  [Hooks](https://learn.chatgpt.com/docs/hooks#postcompact))
- **Verified:** hooks have incomplete tool coverage and their transcript path
  is not a stable interface. Treat them as narrow guardrails and context
  injectors, never as the authoritative record of approvals, research, or
  completion.
  ([Hooks](https://learn.chatgpt.com/docs/hooks#tool-coverage))

## Recommended repository pattern (inference)

The following is a proposed design, not a currently supplied Codex feature.
It applies the verified primitives above and the repository's existing
authority/verification policy.

```text
tracked active-goal record + governing plan/ADR
            │  (authorized objective, constraints, proof, decision gates)
            ▼
scheduled same-chat controller / codex-exec controller
            │  acquire TTL lease; reconcile Git, tracker, research, goal record
            ├──> ambiguity/authority gate → record question → stop and notify
            ├──> no runnable deterministic step → mark waiting/complete → stop
            └──> bounded phase → root delegates → integrates → verifies → repeat
                                         │
                                    append-only change log
```

1. **One canonical active-goal record.** Put the current objective, immutable
   authorization reference, allowed operations, allowed branch/worktree,
   acceptance checks, current phase, explicit decision gates, retry policy, and
   terminal state in one reviewed tracked document (or a narrow structured
   companion to the existing adaptive-orchestration log). It must name an
   explicit goal; a scheduler must never infer a new product goal merely from
   an open issue, dirty tree, or failing check.
2. **One controller at a time.** Before any work, acquire a repository-local
   TTL lease keyed by goal id and worktree/branch; include controller/session
   id, PID/host where applicable, start/heartbeat/expiry, and Git HEAD. Fail
   closed if a live lease exists. Expiry must require a recheck of Git state and
   evidence before takeover. Use atomic create/rename or an OS lock, never a
   non-atomic “read then write” check. This prevents duplicate scheduled runs,
   a resumed CLI session, and a desktop chat from writing concurrently.
3. **Reconcile before every phase.** Compare the goal record to current branch,
   complete dirty/untracked inventory, linked plan/ADR, research freshness,
   external tracker snapshot if authorized, and prior verification. If they
   disagree, stop as ambiguity rather than silently redefining the goal.
4. **Bounded idempotent units.** Each loop receives one small phase with a
   declared input commit, owned paths, command budget, retry limit, expected
   artifact, and acceptance command. Check whether its completion evidence is
   already present before retrying. Record every attempt, normalized remaining
   delta/failure fingerprint, and failure class in the append-only orchestration
   change log. Stop on an unchanged delta unless an approved staged milestone
   explains it.
5. **Conservative delegation.** Allocate only independent, bounded children;
   preserve the existing maximum of three direct children, reserve the required
   final verifier/validator slots, and serialize shared writes/simulator usage.
   Children return evidence summaries, never make root-level authority
   decisions. A controller cannot discover live thread occupancy from TOML, so
   it must treat capacity as an in-process fact, not a file-derived fact.
6. **Stop/ask matrix.** Continue automatically only when the next action and
   its authority are explicit. Stop and ask one concise question for a change
   in product/architecture/scope, new credential/consent/payment/publication,
   failing acceptance criteria after bounded retries, conflicting authority,
   destructive operation outside policy, unavailable required resource, or a
   potentially private-data exposure. A fixed question queue is preferable to
   an unbounded “grill” loop; invoke the grilling skill only for unresolved
   preference/design questions.
7. **Proof before terminal success.** Completion requires the goal's declared
   checks, required independent verifier/validator outcomes, and clean
   reconciliation—not an LLM assertion or the end of a scheduled run. Failure,
   budget exhaustion, or lease loss is non-terminal `blocked`/`waiting`, with a
   precise recovery request.
8. **Separate review, repair, and validation.** Prefer structured read-only
   review, a focused isolated repair, and deterministic independent validation.
   Persist a schema-validated checkpoint before another mutation. Model
   confidence, a trace, or a judge result is advisory unless the completion
   contract explicitly pairs it with reproducible proof.

## Architecture options

| Option | Fresh-session behavior | Best use | Material limits | Recommendation |
| --- | --- | --- | --- | --- |
| Desktop scheduled task in active goal chat | Same chat wakes on a minute/custom cadence and retains context; local project or worktree | Interactive local autonomy with existing desktop Codex, skills, and subagents | Mac/app/project must remain available; initial schedule setup is a user-visible configuration; no repository-wide goal registry or lease is supplied | **First pilot** |
| Headless `codex exec` controller under a local scheduler | New or recorded CLI session; resume by recorded id | Reliable local repeated deterministic work | Requires local daemon/scheduler, authentication/secret policy, durable state/lease, and explicit non-interactive approvals | Second pilot after desktop loop proves prompt/record |
| GitHub Action / CI controller | Fresh isolated runner/worktree on a trigger | Read-only inspection, patches, or PR proposals | Needs remote/credentials/GitHub authority; not a license for auto-merge/deploy; repository policy withholds those permissions | Use only for a separately authorized PR/patch workflow |
| Custom App Server client | Controller starts/resumes threads and goals programmatically | A product-grade custom desktop integration | App Server is for rich clients; experimental portions/change risk; implementation/maintenance cost | **Do not start here** |

## Hard boundaries

- A Codex goal is persisted **per thread**, not a canonical repository objective.
- Hooks cannot create sessions, independently dispatch subagents, observe a
  reliable live agent-capacity reservation, or judge semantic ambiguity.
- A `Stop` continuation is a turn-level nudge, not a safe infinite-loop engine.
- Separate desktop chats/worktrees must not both write the same source. The
  official long-running-work guidance likewise says to avoid giving two
  independent chats write access to the same connected source.
- Scheduled desktop tasks run unattended with the default sandbox settings; the
  narrowest access remains necessary. Starting Goal mode does not grant broader
  access or override approvals.
- This repository's existing higher-priority policy still forbids automatic
  paid services, production credentials, deployment, signing/distribution, and
  external GitHub publication without their own authorization.

## Reused-artifact review and changes since the previous reports

- `codex-context-lifecycle.md` remains sound: resume/fork do not substitute for
  a durable handoff, and compaction hooks cannot implement a context-percentage
  transition. This report adds the now-documented desktop scheduled-task route
  for returning to an active chat or starting independent worktrees.
- `codex-features-and-hooks.md` correctly documented stable hooks, goals,
  direct-child limits, and the absence of an automatic subagent-worktree
  setting. Its statement that scheduled worktree automation was only a future
  possibility is stale: current official documentation describes project-local
  scheduled tasks, local/worktree choice, skills, and same-chat continuation.
- `task-checkpoint-module.md` correctly rejects treating a goal or hook as
  repository authority and correctly notes that configured capacity is not live
  capacity. Its conclusion that goals are only useful after an explicit request
  is a repository policy decision, not a product limitation; retain it unless
  the owner authorizes a named active-goal record.
- `research-first-agent-workflow.md` remains applicable: this report is the
  primary-source lane, and the root must retain the single Last30Days run and
  reconcile its non-authoritative discovery signal.
- `codex-plugin-automation-bundle.md` remains correct that a broad Stop hook
  or SessionStart repetition is not the right orchestrator. A plugin can
  package a controller skill and narrow hooks after a proven recurrence, but it
  should not become a second tracker or bypass consent/authority gates.

## Decisions required before implementation

1. **Controller choice:** authorize a desktop same-chat scheduled-task pilot
   (recommended), a headless local controller, or both in sequence.
2. **Canonical record:** approve one tracked active-goal record and its schema,
   including who may activate/clear it and its relationship to the existing
   append-only adaptive-orchestration log.
3. **Authority envelope:** enumerate which actions can be autonomous (read,
   local edit, local tests, branch creation, commit, PR draft) and which always
   stop (credentials, consent, paid quota, GitHub write, merge, deploy,
   signing, destructive cleanup).
4. **Cadence and budget:** choose the maximum continuous duration, per-run
   time/token limit, backoff/retry limit, and stale-lease expiry; no default is
   evidence-backed for this repository.
5. **Isolation:** choose local-project versus dedicated scheduled worktree and
   the branch/merge-back procedure. Worktrees reduce collision risk but create
   cleanup and integration work.
6. **Question handling:** choose the notification surface and the exact
   `waiting` state semantics so a question stops work rather than spawning
   duplicate reminders.
7. **Checkpoint and no-progress policy:** choose the durable phase/checkpoint
   schema, retained evidence/redaction, normalized failure fingerprint, and the
   narrow conditions under which an unchanged delta may continue.
8. **Pilot adoption threshold:** decide whether one scheduled-goal trial is
   enough to justify the Adapter, while requiring at least two comparable
   recurring repair incidents before adding a reusable quality-loop Module.

## Local inspection evidence

Read-only commands run on 2026-07-19:

```text
codex --version
codex features list
codex --help
codex exec --help
codex resume --help
codex fork --help
codex app-server --help
codex app-server daemon --help
codex app-server generate-json-schema --help
codex app-server daemon version
sed -n '1,220p' .codex/config.toml
sed -n '1,120p' .codex/hooks.json
```

## Historical gaps at research time

- This research had not configured or run a scheduled task, a launchd/CI controller, or
  App Server client. The later authorized implementation used the narrower Desktop
  scheduled-task path and recorded observed-wake evidence; launchd/CI and App Server remain
  outside the selected architecture.
- Official documentation does not supply a repository-level active-goal schema,
  lease protocol, semantic ambiguity classifier, automatic subagent allocator,
  or a stable API for live worker occupancy. Those controls must be implemented
  and tested as repository policy if selected.
- The reviewed Cookbooks supply patterns rather than evidence-backed defaults
  for cadence, lease TTL, maximum attempts, trace retention, model judge use,
  failure fingerprinting, or autonomous-action allowlists.
- The later controller goal validated the installed Desktop scheduled-task behavior and
  recorded an observed wake. Revalidate only if the selected native mechanism changes.
