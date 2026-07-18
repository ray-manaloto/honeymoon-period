# Agent-allocation ledger and planning module

- **Question:** Should this repository add a small module to plan and audit
  in-thread Codex-agent allocation without changing runtime configuration?
- **Status:** Research complete; implementation requires a root decision.
- **Last verified:** 2026-07-17
- **Research:** linked — this report; primary-source lane owned here.
- **Last30Days:** reused — [Research-first agent workflow](research-first-agent-workflow.md#last30days-supplement) found no project-specific community evidence that changes the primary-source recommendation. No duplicate root-owned run.

## Recommendation

Adopt, only after approval, a versioned repository-local **agent-allocation
ledger** as one deep **Module** at the coordination **Seam** between root
planning and agent spawning. Its one small **Interface** is a declarative plan
for a named phase: owner, role, bounded objective, owned paths or explicitly
read-only scope, dependencies, serialized resources, and an explicit
`reserved_final_slots: 2` commitment whenever material integration is planned.
The **Implementation** may validate capacity and sequencing, but it must not
spawn agents, decide acceptance, or claim that a role was actually independent.

This is a recommendation, not authorization to add a schema, script, config
change, hook, or agent profile. The root continues to own shared files,
integration, Git, publication, and final verification
([AGENTS.md](../../AGENTS.md#L76-L107)).

## Verified facts

1. The configured ceiling is `agents.max_threads = 4` and `max_depth = 1`
   ([.codex/config.toml](../../.codex/config.toml#L32-L40)). Therefore at most
   three children can be open while the root is active, and only direct
   children are permitted by the project configuration. OpenAI defines
   `max_threads` as the concurrent open-thread cap and confirms that depth one
   permits root-spawned children but prevents descendants; it advises retaining
   that default absent a specific need because deeper recursion increases token,
   latency, and local-resource risk ([OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)).

2. The project requires a maximum of three child agents, two *fresh direct-child
   slots* reserved for the final independent verifier and validator on material
   integration, and a fresh rerun after a correction that changes shared
   integration/evidence ([AGENTS.md](../../AGENTS.md#L76-L107);
   [handoff template](../agents/handoff-template.md#L57-L62)). The verifier is
   read-only and returns `ACCEPT`/`REJECT`; the validator does not edit source
   or documentation and returns `PASS`/`FAIL`
   ([verifier profile](../../.codex/agents/verifier.toml#L1-L9);
   [validator profile](../../.codex/agents/validator.toml#L1-L9)).

3. Role and reasoning guidance is already concrete: `explorer` is Terra/low;
   `researcher`, `prototype`, `worker`, `web-specialist`, and `verifier` are
   Terra/medium; `validator` is Terra/low; `ios-specialist` and `reviewer` are
   Sol/high (the nine profiles are under [`.codex/agents/`](../../.codex/agents/)).
   This matches OpenAI guidance: Terra fits read-heavy scans and distilled
   parallel work; medium is the balanced default; high fits complex logic and
   edge cases, while higher effort costs more time and tokens
   ([OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)).

4. Current Codex supports custom agent files under `.codex/agents/`, applies
   their role instructions, model/reasoning, and sandbox settings, and lets
   project profiles override built-in names. Children inherit the parent
   permission mode and live runtime sandbox overrides
   ([OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)).
   This means a ledger can plan the chosen role, but cannot prove the effective
   permission/runtime environment solely from its own contents.

5. OpenAI recommends parallelism chiefly for independent, read-heavy work and
   warns that parallel writing can conflict and add coordination overhead
   ([OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)).
   The repository already requires disjoint writing paths and serialized shared
   resources ([AGENTS.md](../../AGENTS.md#L88-L107)).

6. A `SubagentStart` hook can receive the agent type and append developer
   context, but `continue: false` cannot stop the subagent from starting;
   matching hooks can also start concurrently. It is consequently unsuitable
   as an allocation/reservation gate ([OpenAI: Hooks](https://learn.chatgpt.com/docs/hooks)).
   `AGENTS.md` remains an instruction source, not a live scheduler
   ([OpenAI: AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)).

## Inference and proposed interface

**Inference.** A single ledger earns **Depth** because it hides capacity
arithmetic, phase sequencing, path-conflict checks, and final-slot reservation
behind a small declarative **Interface**. It provides **Leverage** to the root
and **Locality** for handoffs/reviews. Its Interface is its test surface.

Illustrative (not approved) fields:

```text
version, run_id, phase, tasks[] { role, objective, ownership, depends_on,
resource_locks }, reserved_final_slots, final_roles, serial_fallback
```

`ownership` must say either an exclusive path set or `read-only`; a phase must
not contain overlapping writable sets. `resource_locks` names resources that
are not file paths (for example, one simulator/Derived Data owner). A final
phase is planned only after all implementation tasks finish and closes the
earlier worker slots before spawning fresh `verifier` and `validator` children.
The ledger records intent and a checkable schedule; the handoff remains the
narrative adapter and runtime evidence record.

### Candidate shapes

| Shape | Interface, seam, and deletion test | Decision |
| --- | --- | --- |
| A. Prompt-only checklist in each task/handoff | Large, repeated Interface: every root prompt redoes capacity math, role selection, phase order, and conflict wording. Deleting a checklist leaves those responsibilities scattered across callers. Shallow; weak Locality. | Reject as the primary Module. Keep the existing handoff narrative. |
| B. Versioned allocation ledger plus read-only validator (**recommended**) | Small Interface at the root-planning-to-spawn seam. Its Implementation owns deterministic capacity, dependency, ownership, and reservation checks. Delete it and the same complexity reappears in every orchestration prompt/handoff, so it passes the deletion test. | Adopt incrementally if the root approves. |
| C. Runtime scheduler/hook that launches or blocks agents | Broad, side-effecting Interface that would need authoritative live thread state, permission awareness, conflict resolution, and exception policy. Hooks cannot reliably prevent subagent start; a scheduler would duplicate Codex orchestration and create another authority. | Reject now. |

### Phase ownership and serial fallback

For any material integration, plan at most **one** optional child before final
review capacity: root + one bounded explorer/researcher/reviewer/worker equals
two open threads, leaving the two required fresh final children within the
four-thread cap. If two or three support tasks are useful, they must finish and
their threads close before the final pair is allocated. A task with an
overlapping writable path, the same simulator, or a dependency on unfinished
output runs serially. If any prerequisite, capacity, freshness, or ownership
check fails, the deterministic fallback is: root performs/finishes the blocked
phase serially, records why, then reserves/spawns the two fresh final roles.

This is stricter than maximum raw capacity but directly preserves the repository
completion contract. It does not prevent a non-material exploration-only run
from using all three available children, provided no final-pair promise is
made.

## Deterministic validation scenarios

These are contract tests for a future read-only validator, not claims that
runtime behavior is enforceable.

1. **Reserved capacity:** root + one active support task, material final phase
   planned with `reserved_final_slots: 2` → valid; root + two active support
   tasks with the same reservation → invalid.
2. **Freshness:** a final-role task references an earlier implementer/reviewer
   identity, or is planned before integration is marked complete → invalid;
   new verifier and validator task IDs after integration → valid.
3. **Independence:** verifier and validator share an identity, report path, or
   writable ownership → invalid; distinct IDs with read-only/validation-only
   ownership → structurally valid (but not proven independent in fact).
4. **Ownership:** two active writable tasks claim an overlapping canonical path
   or the same `simulator` lock → invalid; disjoint paths/read-only scans →
   valid.
5. **Dependencies/serial fallback:** a dependent task is scheduled before its
   producer completes → invalid unless its explicit `serial_fallback` moves it
   after completion; a no-capacity condition resolves to root-serial, never
   silently drops a required final role.
6. **Profile policy:** normal web work assigned `ios-specialist`, or complex
   privacy review assigned `explorer`, is a policy error; assignments matching
   the local profile matrix are valid. This checks declared selection, not model
   availability or actual quality.

## What cannot be runtime-enforced by this module

- That a spawned agent is genuinely fresh/independent in reasoning, did not see
  prior conclusions, or did not merely repeat the implementer. This requires
  separate threads, distinct prompts, profile rules, and review of the returned
  evidence.
- That Codex will preserve a ledger's reservation while other sessions/turns
  create agents, or that the current tool/runtime exposes every open thread.
  `max_threads` is a global cap, not a project phase scheduler.
- Actual absence of write conflicts, simulator contention, dirty-tree changes,
  or external side effects after scheduling. Those need disjoint assignments,
  resource serialization, worktree evidence, and normal checks.
- Effective permissions, sandbox state, model availability, or tool access:
  children inherit parent live settings and runtime overrides can supersede
  profile defaults.
- Semantic acceptance. The ledger must never emit verifier/validator verdicts
  or replace their independent inspection.

## Incremental adoption

1. Root decides whether planning omissions justify the Module; retain the
   current prompt/handoff-only process if not.
2. If approved, add one schema and a pure read-only validator with only the six
   scenarios above; do not alter `.codex/config.toml`, hooks, or agent profiles.
3. Use it for one material web/API integration while preserving the handoff's
   required active-child, serialized-resource, reserved-slot, and verdict
   fields ([handoff template](../agents/handoff-template.md#L57-L67)).
4. Have fresh verifier and validator consume it only as a planning index, then
   independently inspect the actual worktree and run their prescribed checks.
5. Apply the deletion test after that slice: keep it only if deleting it would
   reintroduce capacity/ownership/freshness logic across multiple root callers.

## Residual uncertainty and root decisions

1. **Decide:** authorize this narrow planning Module or retain the existing
   handoff-only process. This research does not authorize implementation.
2. **Decide:** define the unit of `fresh` (new agent ID after integration versus
   a new child spawned after a specific worktree manifest). The source/platform
   documents do not define reviewer independence semantics.
3. **Decide:** whether the first ledger subject is a whole material integration
   or one tracer-bullet ticket. The latter is the lower-risk adoption step.
4. **Gap:** current official documentation verifies thread caps, profile
   configuration, hooks, and inheritance, but does not document a queryable
   cross-turn reservation API or automatic independent-review enforcement.
   Do not infer either capability.

## Sources and local evidence

External sources accessed 2026-07-17:

- [OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [OpenAI: Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [OpenAI: Hooks](https://learn.chatgpt.com/docs/hooks)
- [OpenAI: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

Local evidence reviewed:

- [AGENTS.md](../../AGENTS.md#L76-L107)
- [.codex/config.toml](../../.codex/config.toml#L1-L40)
- [all local agent briefs](../../.codex/agents/)
- [Handoff template](../agents/handoff-template.md#L1-L67)
- [Codebase-design vocabulary](../../.agents/skills/codebase-design/SKILL.md)
- [Code-review capacity overlay](../../.agents/skills/code-review/SKILL.md#L18-L36)
- [Research-first workflow](research-first-agent-workflow.md#L1-L33)
- [Codex features and hooks](codex-features-and-hooks.md#L1-L170)
