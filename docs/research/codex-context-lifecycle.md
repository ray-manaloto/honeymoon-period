# Codex context lifecycle

**Question.** What evidence-based lifecycle should govern a long-running Codex
task: continue, compact, make a durable handoff and new task/session, or fork?

**Status:** research complete
**Last verified:** 2026-07-18
**Research:** linked — this report records the completed primary-source lane
**Last30Days:** not needed — community anecdotes cannot establish a reliable
model threshold; first-party runtime behavior and long-context evaluations are
the appropriate evidence.

## Verified facts

1. The API model cards currently list a 1,050,000-token window for both
   GPT-5.6 Sol and Terra. The often-mentioned **272K** figure is the price
   boundary for long API prompts, not a Codex desktop context-window limit.
   ([Sol model card](https://developers.openai.com/api/docs/models/gpt-5.6-sol),
   [Terra model card](https://developers.openai.com/api/docs/models/gpt-5.6-terra))
2. The locally installed Codex CLI is `0.144.6`. Its persisted session events
   expose `total_token_usage` and `model_context_window`; inspected historical
   events contained both a 258,400-token and a 950,000-token runtime window.
   Therefore the effective Codex window is runtime/model dependent and must not
   be inferred from the 272K pricing boundary or hard-coded into repository
   policy.
3. Codex supports automatic history compaction. `model_auto_compact_token_limit`
   sets an optional numeric trigger; when unset, the model default is used. Its
   scope can count the total active context (default) or only growth after a
   carried compaction prefix. `tool_output_token_limit` caps each stored tool
   output. ([Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference))
4. Stable, enabled local features include `remote_compaction_v2` and request
   compression. `runtime_metrics` and `token_budget` are under development and
   disabled. The stable CLI help and public command reference expose resume and
   fork, but no stable command/API that gives a live in-turn context percentage
   or triggers a new desktop task at a percentage threshold. The app's
   available context telemetry is consequently diagnostic/session-event data,
   not an enforceable project guard.
5. `PreCompact` runs before auto or manual compaction and may stop it;
   `PostCompact` runs after it and may stop continuation. Both receive the
   trigger (`manual` or `auto`), not documented current/maximum token counts.
   They cannot by themselves choose a percentage threshold or create a durable
   handoff/new desktop task. ([Hooks](https://learn.chatgpt.com/docs/hooks))
6. `codex resume` continues a saved session while retaining its history.
   `codex fork` clones a session into a new chat with a fresh ID, retaining the
   original intact for parallel alternative exploration. Neither is an
   information-reduction mechanism. ([Developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli))
7. OpenAI's subagent guidance explicitly calls noisy intermediate output
   “context pollution”/“context rot” and recommends returning concise summaries
   to keep the main chat focused on requirements and decisions. ([Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents))
8. Long-context evaluation does not establish one universal safe percentage,
   but it does establish the relevant failure mode: performance can degrade
   when important material lies in the middle of a long context; the reported
   retrieval curve is often strongest at the beginning and end. This supports
   an evidence-first handoff before the physical window, rather than treating
   the nominal maximum as usable working memory. ([Liu et al., 2024](https://doi.org/10.1162/tacl_a_00638),
   [Hsieh et al., 2024](https://arxiv.org/abs/2406.16008))

## Policy inference: zones and actions

The percentages below are **project operating thresholds**, not model facts.
They apply only when Codex exposes a current token count and runtime window;
otherwise use the non-numeric triggers below. Compute `usage / window` from
the same telemetry event, never from cumulative session token spend.

| Zone | Approx. active-context use | Required behavior |
| --- | ---: | --- |
| **Smart** | 0–45% | Continue the coherent task. Keep decisions, authority, and current plan concise. Delegate logs, broad exploration, and independent checks; receive only evidence summaries. |
| **Watch** | >45–60% | Do not add broad raw output. Update the plan and durable decision/evidence links at the next natural checkpoint. Inspect whether the task has become a new objective or assumption set. |
| **Transition** | >60–70% | At the next safe boundary, create a durable handoff and start a fresh task/session. Do this before a new material workstream, multi-file integration, a major research result, or a human decision gate. A manual compaction may bridge one bounded step, but is not a substitute for the handoff. |
| **Dumb / unsafe to extend** | >70%, an automatic compaction, or two manual compactions in one objective | Stop broadening the task. Produce the handoff first, then begin a fresh task from it. Resume only to complete a narrowly bounded in-flight command or make the handoff itself. |

The 45% soft ceiling preserves room for focused evidence and an implementation
or verification phase while avoiding the unsupported premise that 70–100% is
equally reliable. The 60–70% transition band makes the decision early enough
that a new task can begin from a clear, reviewed state rather than an emergency
summary. Recalibrate only from retained project evidence (for example, a
reproduced omission or conflicting-decision failure), not a generic model
claim.

## Non-numeric triggers (override the percentage)

Create a durable handoff and new task/session immediately at a safe boundary
when any of these occur:

- the goal, architecture, data model, safety boundary, tracker scope, or
  acceptance contract materially changes;
- a bug invalidates a settled assumption or results in a new workstream;
- a phase completes (reconnaissance/research -> decision/spec -> implementation
  -> independent verification/publication) and the next phase needs a different
  evidence set or agent mix;
- raw tool output, retries, browser diagnostics, or child-agent transcripts
  have displaced the active objective; or
- the current task can no longer state its authoritative goal, decision links,
  dirty-tree ownership, and next test in a compact handoff.

Compaction alone is appropriate only for a still-coherent, bounded objective
whose tracked decision/spec/test state is current. A fresh task is preferred
when the phase or authoritative assumptions change because it restores an
explicit beginning/end structure and requires the handoff to reconcile the
tree.

## Resume, fork, and new-task decision rule

| Need | Mechanism | Why |
| --- | --- | --- |
| Same objective, same assumptions, short interruption | **Resume** | Preserves the working transcript; no reset needed. |
| Two genuinely competing approaches that can be compared without shared writes | **Fork** (and isolated worktree if either may write) | Preserves a common decision baseline while keeping alternatives separate. It is not a cure for context pollution because it copies history. |
| New phase/objective, assumption change, noisy/compacted history, or handoff threshold reached | **Durable handoff + new task/session** | Carries only reviewed authority, state, evidence, risks, and exact pickup request. Start from a clean worktree when the prior task is dirty or implementation ownership changes. |
| Read-heavy independent question, tests, or review within the same objective | **Subagent** | Keeps intermediate output out of the root task; return concise paths, commands, verdicts, and gaps. |

For the desktop app specifically, create a new project task with a fresh
worktree from the default branch for an independent top-level objective; use a
same-worktree fork only for read-only, short-lived alternatives. The app-level
thread tools currently expose a completed-history fork and a separate handoff
operation; they do not replace the repository's tracked handoff contract.

## Enforcement recommendation

1. Keep `model_auto_compact_token_limit` unset for now. The documented default
   follows the selected model, while the installed runtime shows that effective
   windows vary. Do not copy the old user-layer 900K setting or convert 272K
   into a Codex limit.
2. Add the zone table and non-numeric decision rule to repository workflow
   guidance, not to a hook as a blocking “percentage” guard. Stable metrics do
   not expose a reliable live, programmatic percentage to a project hook.
3. Add a minimal `PreCompact`/`PostCompact` **advisory** only if it can invoke a
   local, privacy-safe reminder to write the existing handoff. It must neither
   create sessions, persist prompts, nor block ordinary compaction. This is a
   convenience, not enforcement.
4. At each handoff record the observed runtime window/usage if available, zone,
   whether compaction occurred, and the selected mechanism (resume/fork/new
   task). Keep the durable source of truth in tracked project artifacts, not
   session telemetry or memory features.

## Local inspection evidence

Read-only commands run on 2026-07-18:

```text
codex --version
codex features list
codex --help
codex debug --help
codex app-server --help
codex resume --help
codex fork --help
codex doctor --help
rg -n -m 12 '"type":"token_count"' ~/.codex/sessions ~/.codex/archived_sessions
```

The last command was used only to inspect runtime metadata fields and numeric
values; no session prompts or user/private task content are reproduced here.

## Remaining uncertainty

- OpenAI does not publish an evaluation-derived “ideal context percentage” for
  Codex, GPT-5.6 Sol, or GPT-5.6 Terra. The zone values are deliberately
  conservative project policy, not a vendor guarantee.
- The stable public docs do not describe a user-visible desktop API for live
  context usage or a hook payload containing it. Recheck after a Codex upgrade
  or if `runtime_metrics`/`token_budget` graduate to stable.
- The exact desktop thread creation/fork/handoff semantics are app-surface
  behavior rather than CLI guarantees; validate them with the current app tool
  schema before automating a future task transition.
