# Codex autonomy workflow primitives

- **Question:** What do the assigned official OpenAI Cookbook sources establish about autonomous repository-goal continuation, and which workflow primitives are worth carrying into a durable repository design?
- **Status:** Candidate research complete; no implementation, schedule, configuration, Git, or external-system authorization granted.
- **Accessed / last verified:** 2026-07-19.
- **Research:** linked — this primary-source candidate report; it reuses and refines [Autonomous Codex goal continuation](codex-autonomous-goal-continuation.md).
- **Last30Days:** reused — [the retained focused Symphony/Codex report](../../.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md); discovery is not authority.
- **Evidence boundary:** the three assigned OpenAI Cookbook sources only. **Verified** means directly stated/shown there; **inference** is a proposed repository design, not a supplied product contract.
- **Companion-file audit:** [complete](codex-cookbook-companion-markdown-inventory.md) at `openai/openai-cookbook` commit `9fa55b8cecba8c9c543d11f2cf08339a29112be7`; filenames produced by the examples are generated artifacts unless the inventory identifies a committed source.

## Answer and recommendation

Adopt the Cookbook material as a **workflow-contract refinement**, not as a new automation platform: a thread-scoped Codex Goal is the bounded inner continuation loop; a living self-contained execution plan and append-only evidence record are fresh-session recovery inputs; deterministic admission/verification gates wrap bounded agentic investigation or implementation phases.

**Recommendation category: conditional pilot candidate.** It is valuable only after the root explicitly approves the active-goal record, single-writer lease, authority envelope, recovery states, budgets, isolation, and question-notification semantics already identified by the governing report. It does not justify an Agents SDK/Codex-MCP controller, a scheduler, permissive approvals, new credentials, CI/GitHub wiring, or publication.

## Current local evidence and status quo

The governing report already recommends a desktop same-chat scheduled-task pilot, with a tracked repository record as authority, a TTL single-writer lease, reconcile-before-phase discipline, bounded idempotent units, and evidence-based completion. It correctly distinguishes a thread Goal from the repository objective and leaves controller/record/authority/cadence/isolation/question handling as decisions. [Governing report](codex-autonomous-goal-continuation.md)

The status quo therefore has the right outer boundaries but lacks a written phase contract for: no-tool-call continuation suppression; explicit execution-plan recovery content; named deterministic artifact gates around agentic stages; and privacy-safe phase-level observability. The assigned Cookbook sources supply patterns for these gaps, not a ready-made runtime.

## Verified facts

| Primitive | Verified fact | Direct implication |
| --- | --- | --- |
| Goal scope/state | Goals are persisted thread state—not global memory or project instructions—and include objective, lifecycle, budget, and progress accounting. [Goals architecture](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex#how-goals-are-designed-in-codex) | A repository still needs its own canonical goal/authorization record for fresh threads and arbitration. |
| Continuation | Continuation is event-driven at safe idle boundaries: active Goal, within budget, no running/pending work, no queued user input, idle thread. Plan-only work does not continue; interruption pauses; a no-tool-call continuation suppresses the next automatic continuation to avoid spin. [Goals architecture](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex#how-goals-are-designed-in-codex) | The controller needs a deterministic `waiting`/`blocked` transition for no-progress turns. |
| Evidence and lifecycle authority | Completion is evidence-based; budget exhaustion stops substantive work and yields progress/blockers/next step rather than success. The model may start a Goal and complete it when evidence supports it; pause/resume/clear/budget transitions remain user/system-controlled. [Goals overview](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) | Goals are bounded completion contracts, not authority to continue indefinitely or perform newly sensitive work. |
| Good Goal contract | Strong Goals state outcome, verification surface, constraints, allowed boundaries, iteration policy, and blocked stop condition. [Writing a Goal](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex#how-to-write-a-goal) | These are required fields for any active-goal record. |
| Execution-plan recovery | The `PLANS.md` article presents a living, self-contained plan, decision log, progress/next-step updates, retry-safe/idempotent steps, and observable validation. It calls this one way to prompt Codex and calls `ExecPlan` an arbitrary term. [PLANS.md article](https://developers.openai.com/cookbook/articles/codex_exec_plans) | Carry the recovery mechanics, not an asserted product feature or mandatory format. |
| Outcomes and retrospective | The embedded `PLANS.md` template requires outcomes, remaining gaps, and lessons at major milestones or completion. [Pinned PLANS article source](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/articles/codex_exec_plans.md) | Persist this as privacy-safe append-only evidence and learning input; do not let a retrospective authorize new work. |
| Gated delegation | The multi-agent example has a manager create requirements/task/test artifacts, verify named outputs before each handoff, fan out frontend/backend only after design, return outputs to the manager, then test. [Gated handoffs](https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk#orchestrating-multi-agent-workflows) | Artifact and test gates can be deterministic even when the phase itself is agentic. |
| Bound and observability | The example runs the manager with `max_turns=30`; its trace view includes prompts, tool calls, handoffs, MCP/Codex calls, timings, file writes, errors, and warnings. [Example bound](https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk#add-in-your-task-list), [tracing](https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk#tracing-the-agentic-behavior-using-traces) | Use explicit local budgets and privacy-reviewed evidence fields; `30` is illustrative, not a safe default. |

## Proposed control-loop contract (inference)

```text
approved tracked goal + self-contained phase plan + append-only evidence
  -> acquire one-writer lease -> reconcile worktree/authority/evidence
  -> deterministic admission gate -> bounded agentic phase
  -> deterministic artifact/test/proof gate -> record -> continue/wait/complete
```

- **Deterministic stages:** lease/release; branch/worktree/dirty-tree reconciliation; authority/path/privacy gates; input-artifact checks; explicit command/turn/time/retry budgets; acceptance commands; state transitions; evidence recording; de-duplicated question notification.
- **Agentic stages:** choose the next permitted experiment; investigate within the iteration policy; implement a phase-owned artifact; classify research or test evidence as confirmed/approximate/blocked.
- **Recovery:** a new session rehydrates only from the approved record, self-contained plan, append-only ledger, and actual worktree/verification evidence, then repeats admission. It never treats a transcript, Goal, or previous “done” assertion as sufficient.
- **Stop conditions:** authority/scope conflict, unapproved credential/payment/publication/destruction, privacy-risking input/output, missing prerequisite, lease contention/loss, exhausted retry/budget, failed acceptance, explicit user question, or no-tool-call continuation. These become `waiting`/`blocked`, not silent retry or success.

## Architecture-contract analysis

| Lens | Assessment |
| --- | --- |
| **Interface** | One small, reviewed active-goal contract: objective; authorization reference; six Goal fields; allowed paths/operations; worktree/branch; phase input/output; acceptance commands; retry/budget; explicit stop gates; state; controller/session/lease identity. The interface reports evidence and a single blocking question, never invented authority. |
| **Implementation** | Repository-controlled controller does deterministic reconciliation/gating and invokes the existing Codex Goal/thread for one bounded phase. It may use native subagents only under the existing direct-child/ownership policy. An ExecPlan-like document is a recovery artifact, not executable authority. |
| **Seam** | The clean seam is between `admit/verify/record` (deterministic code/policy) and `investigate/implement` (Codex). This permits future desktop same-chat, `codex exec`, or other approved runner replacement without moving authority into a prompt or thread. |
| **Deletion test** | If controller code vanished, the goal record, plan, evidence ledger, and declared acceptance commands still enable a human or fresh Codex session to continue safely. If the plan vanished, a thread Goal alone cannot reconstruct authorization, ownership, or recovery—so it fails. If a generic orchestration MCP vanished, ordinary repository files plus the existing Codex runtime still work—therefore do not add it. |
| **Depth** | Keep a thin controller, one contract, and ordinary file/command gates. Do not create an orchestration framework, second tracker, dynamic scheduler abstraction, agent registry, or generic semantic-ambiguity engine before a repeated failure proves the need. |
| **Leverage** | Reuses native Goals, repository instructions, existing adaptive-orchestration log, worktree manifest, verification gates, and existing bounded subagent policy. The strongest new value is durable reconciliation, not more agents. |
| **Locality** | State lives in one tracked goal/plan/evidence area within the repository; phase evidence stays adjacent to the work. Avoid remote controller state, transcript scraping, browser state, or a global user-home daemon as authority. |
| **Adapters** | Desktop scheduled same-chat and a future `codex exec` runner are adapters at the invocation boundary. Agents SDK + Codex-as-MCP is a tutorial topology and should remain optional/outside the core. Traces are optional observability adapters, subject to privacy approval. |

## Alternatives

| Option | Assessment | Decision |
| --- | --- | --- |
| **Status quo: governing scheduled-chat candidate only** | Retains correct outer authority/lease stance but does not yet formalize phase artifacts, no-progress transition, or plan-recovery contract. | Improve with the proposed contract before any pilot. |
| **Recommended: thin repository controller + Goal/plan/ledger** | Separates deterministic authority/proof from bounded agentic execution; portable across approved runners; survives fresh session. | Conditional pilot after explicit prerequisites. |
| **Agents SDK + Codex MCP manager topology** | Official tutorial demonstrates useful artifact gates and traces, but it requires API-key/dependency/runtime choices and does not solve repository authority or locking. | Do not adopt now; reuse only the gated-handoff pattern. |
| **Goal-only/autonomous loop** | Native Goal continuation preserves thread objective and budget, but is not repository state, concurrency control, semantic governance, or cross-session authorization. | Reject as insufficient. |

## Preconditions, recurrence triggers, and safeguards

### Preconditions for a pilot

1. Explicit owner authorization for the named active-goal record, state schema, clear/activate roles, and its relationship to the existing append-only orchestration log.
2. Explicit authority envelope separating locally permitted read/edit/test work from actions that always stop: credentials, consent, paid quota, GitHub writes, merge, deployment, signing/distribution, destructive cleanup, product/architecture/scope changes, and private-data risk.
3. Atomic single-writer lease design with stale-takeover reconciliation, local worktree/branch choice, bounded budgets/retries/backoff, exact notification surface, and acceptance evidence.
4. A privacy/retention decision before trace collection; local ledger must omit secrets, real relationship data, private URLs/calendars/addresses, and raw browser state.

### Recurrence trigger

An explicitly authorized, disposable one-goal scheduled Adapter pilot may test
the user's requested unattended continuation without prior recurrence. Promote
it into a reusable controller Module only after a recorded recurrence shows
that the existing adaptive-orchestration log plus manual Goal/handoff discipline
fails to preserve a phase, duplicates work, loses a stop condition, or produces
unreviewable recovery evidence. A single long task does not prove a framework
is warranted.

### Preservation, authority, guards, and tests

- Preserve the Reminders + Beli baseline, stable `/v1` contracts, source-controlled code, existing research workflow, and the root's ownership of shared files/Git/publication.
- Guard every state transition with the lease, record schema validation, worktree reconciliation, allowed-path check, and declared acceptance command; fail closed on disagreement.
- Tests for any approved implementation must cover duplicate controller admission, stale lease takeover, crash/restart recovery, already-complete idempotence, retry exhaustion, no-tool-call stop, user-question de-duplication, failing acceptance, private-data redaction, and refusal of forbidden authority transitions.
- Treat an LLM claim, a Goal's existence, an agent handoff, or a trace alone as insufficient proof of completion.

## Concrete corrections to the governing report

1. Add a required no-tool-call continuation guard: record the reason and transition to `waiting`/`blocked`; do not spin or complete.
2. Expand the active-goal record with outcome, verification, constraints, boundaries, iteration policy, and blocked stop condition.
3. Define each phase as explicit inputs, owned paths, expected artifacts, deterministic prerequisite/output checks, declared acceptance command, retry/budget, and evidence entry.
4. Require the recovery document to be self-contained and decision-logged. Do **not** inherit the PLANS example's instruction to resolve ambiguity autonomously: this repository must stop at ambiguity/authority boundaries.
5. Do not copy tutorial choices—`approval-policy: never`, `workspace-write`, `npx -y`, `.env`/API key, web search, Jira/GitHub/CI connections, deployment, or the `max_turns=30` value—into repository policy. They are example code, not an OpenAI product contract or authorization.

## Residual decisions and gaps

- The sources supply no repository-level goal schema, scheduler, session registry, lock/lease protocol, duplicate-run prevention, durable question queue, semantic ambiguity classifier, worker-capacity API, or authority model.
- Decide desktop same-chat versus later headless runner only after the contract/prerequisites above; neither is authorized by this report.
- Decide exact phase budget, backoff, stale-lease expiry, external-tracker reconciliation, and trace retention/redaction.
- Validate any future scheduler/desktop behavior against the installed build and a separately authorized local pilot; this report performed no stateful setup.

## Sources

1. OpenAI Cookbook, [Using Goals in Codex](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex), published 2026-05-09; accessed 2026-07-19.
2. OpenAI Cookbook, [Using PLANS.md for multi-hour problem solving](https://developers.openai.com/cookbook/articles/codex_exec_plans), published 2025-10-07; accessed 2026-07-19.
3. OpenAI Cookbook, [Building Consistent Workflows with Codex CLI & Agents SDK](https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk), published 2025-10-01; accessed 2026-07-19.
