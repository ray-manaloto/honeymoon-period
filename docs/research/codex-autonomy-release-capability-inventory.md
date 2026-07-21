# Codex autonomy release and capability inventory

- **Status:** Candidate report; no configuration, installation, scheduler, or deployment change authorized.
- **Research:** linked — this primary-source release and local-inventory candidate report.
- **Last30Days:** reused — [the retained focused Symphony/Codex report](../../.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md); not rerun by this agent.
- **Accessed / last verified:** 2026-07-19.
- **Question:** Does the current Codex release and project-local inventory alter the proposed autonomous-goal orchestration approach?

## Executive finding

**Recommendation category: retain status quo, then run a bounded controller pilot only after the root chooses its authority envelope.** The installed CLI is `codex-cli 0.144.6`, which is the latest *stable* Codex release as of the access date. Its release only refreshes GPT-5.6 model instructions/context metadata; it adds no autonomous-goal, scheduler, lease, or new stable multi-agent mechanism. [OpenAI Codex changelog](https://learn.chatgpt.com/docs/changelog), [0.144.6 release](https://github.com/openai/codex/releases/tag/rust-v0.144.6)

GitHub also lists `0.145.0-alpha.24` and other prereleases newer than the stable tag. That is a verified release-list fact, but no adoption recommendation: they are prereleases with generic release notes and their behaviour has not been validated in this repository. [Codex releases](https://github.com/openai/codex/releases)

## Evidence and method

**Verified local evidence (2026-07-19).** Ran `codex --version` and `codex features list`; read `.codex/config.toml`, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/hooks/pre_tool_policy.py`, `.agents/skills/README.md`, and the three existing Codex research reports. The source tree contains no checked-in scheduler/controller, durable active-goal record, session-id registry, lease, plugin marketplace, or additional MCP declaration outside the single configured server.

**Verified primary-source release facts.** OpenAI's changelog and the official GitHub release both identify `0.144.6` (published 2026-07-18) as stable and say it refreshes bundled Sol/Terra/Luna instructions and corrects their context window to 272,000 tokens. The immediately preceding `0.144.5` expands dangerous-command detection; it is already included in the installed version. The 0.144 release line also includes interactive MCP authentication and app-server authentication support, while 0.143 introduced app-server descendant-thread listing and fork-at-turn. These are already present in 0.144.6; none provides repository-wide goal arbitration. [0.144.6](https://github.com/openai/codex/releases/tag/rust-v0.144.6), [0.144.5](https://github.com/openai/codex/releases/tag/rust-v0.144.5), [0.144.0](https://github.com/openai/codex/releases/tag/rust-v0.144.0), [0.143.0](https://github.com/openai/codex/releases/tag/rust-v0.143.0)

**Inference.** Because the installed release is current and no release change adds durable coordination, upgrading cannot substitute for the proposed repository controller record and single-writer lease. The corrected context window may improve long goal turns, but it does not remove the need for the existing context-lifecycle/handoff policy.

**Unverified behaviour.** This lane did not start Desktop scheduled tasks, `codex exec`, App Server, an MCP server, or a plugin. Their actual local authentication, trust prompts, unattended behaviour, and interaction with the repository hook remain pilot questions, not established facts.

## Current capability inventory

| Capability | Verified state | Reuse decision for autonomous orchestration |
| --- | --- | --- |
| Goals, hooks, multi-agent | Stable and enabled locally; `goals`, `hooks`, and `multi_agent` are explicitly enabled. | Reuse goals as thread-local execution state and hooks as narrow guardrails; neither is the durable controller. |
| Agent limits/profiles | `max_threads = 4`, `max_depth = 1`, 1,800-second job ceiling; nine project roles: explorer, researcher, prototype, worker, web/iOS specialists, reviewer, verifier, validator. | Reuse bounded, direct-child delegation and fresh verifier/validator slots. Do not enable fanout or recursive delegation. |
| Hook | One project `PreToolUse` command hook matches `Bash` and denies forced destructive Git/file operations, physical-device operations, and distribution tooling. | Retain as defense in depth. It cannot decide research completeness, choose work, lock a goal, or replace approval/authority policy. |
| Skills | Project-local `adaptive-orchestration`, handoff, research/research-workflow, Last30Days, Wayfinder, Grilling, To Spec/Tickets, TDD, code review, test/browser/web, Cloudflare, Playwright, and vendored Build iOS skills. | Reuse `adaptive-orchestration` for lifecycle record/hand-off discipline, research routing before material decisions, and Handoff at context boundaries. |
| MCP | Only `xcodebuildmcp@2.6.2`, enabled for simulator/UI automation/debugging/logging. | Irrelevant to a goal controller until a native Xcode project and simulator exist; do not repurpose it as an orchestration service. |
| Apps/plugins | Apps feature is enabled; no repository plugin marketplace, project plugin, or plugin declaration is present. Runtime lists plugins as stable/default-on. | No new plugin is justified for the controller pilot. Existing plugin report's Computer Use/Record & Replay are discovery aids, not durable coordination. |
| CLI release/features | `codex-cli 0.144.6`; development flags including `multi_agent_v2`, fanout, `runtime_metrics`, and `token_budget` are disabled. | Keep stable surface only; do not rely on prerelease or under-development flags. |

The relevant documented platform boundaries remain: a Codex goal is thread-scoped; CLI resume is a session mechanism; `AGENTS.md` supplies instructions rather than mutable state; and hooks can guard a running turn but do not start one. [Long-running work](https://learn.chatgpt.com/docs/long-running-work), [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [Hooks](https://learn.chatgpt.com/docs/hooks), [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)

## Options and architecture test

| Option | Interface / implementation / seam | Deletion test | Depth, leverage, locality | Result |
| --- | --- | --- | --- | --- |
| **Status quo: manual resumption plus existing goal chat** | Interface is the chat/goal and tracked docs; implementation is a human-triggered turn; seam is Handoff plus `codex resume`. | Delete no new code; existing policy remains sufficient for ordinary, authorized work. | Lowest depth and locality risk; no unattended repetition. | Keep now. |
| **Bounded same-chat scheduled-task pilot** | Interface: one durable repository goal record and one controller prompt. Implementation: Desktop same-chat schedule. Seam: schedule reads/reconciles record, takes lease, then runs only listed deterministic work. | If one-controller resumption and clean stopping are not demonstrably better than manual resume, delete the pilot record/prompt and leave no daemon, service, or plugin. | High leverage for unattended cadence but desktop/machine availability creates a local-operational dependency. | Preferred first pilot, subject to authority choice. |
| **Headless `codex exec resume` local controller** | Interface: durable record with explicit session id, lease, authority envelope, and evidence pointers. Implementation: local scheduler invokes the CLI. Seam isolates scheduler/credential policy from repository work. | If the desktop pilot cannot prove value, do not build it; if built but not superior, remove only controller assets. | More operational depth: scheduler, authentication, unattended approval mode, crash recovery. Locality is still local but broader than a chat schedule. | Defer; separately authorize. |

The project has already chosen the correct architectural split: a durable record must outlive a thread, while Codex goals/sessions provide execution continuity. The missing controller is a small **adapter** from a schedule to that record; it should not become a new MCP, plugin, or product service. A record plus lease is the **seam** that lets the Desktop and headless implementations share the same authorization contract without sharing scheduler internals.

## Product constraints, guards, and test contract

- **Authority:** automated continuation may perform only explicitly pre-authorized, deterministic work. A change in scope, external write, installation, credential, paid service, publication, destructive operation, or unresolved product choice stops for one focused question.
- **Privacy/locality:** do not place private relationship data, real URLs, credentials, calendar data, or raw browser state in a goal record, hook log, or scheduler output. Preserve the local-only `.build`/fixture boundary and existing repository-first policy.
- **Preservation:** retain the Reminders baseline and do not run signing, distribution, physical-device, or deployment commands as controller work.
- **Guards:** retain the narrow `PreToolUse` policy and its unit test; do not add a broad Stop/SessionStart loop. The authoritative source explicitly limits hooks to lifecycle guardrails, and existing research warns that a Stop continuation is not an infinite-loop engine. [Hooks](https://learn.chatgpt.com/docs/hooks), [existing autonomy report](codex-autonomous-goal-continuation.md).
- **Pilot tests:** prove lease contention rejects/defers a second runner; stale lease recovery is explicit; resume uses a recorded session id rather than `--last`; every stop/ask reason is persisted; an out-of-envelope command is not run; and a handoff/compaction restart reaches the same record without duplicating a mutation. The normal hook-policy unit test and applicable repository checks remain mechanical gates, not proof of semantic autonomy.

## Prerequisites and recurrence triggers

Before any implementation, root must approve: (1) the controller option, cadence, and maximum consecutive runs; (2) the exact durable-record schema and location; (3) lease owner, TTL/recovery, and conflict behaviour; (4) a bounded allowlist of autonomous actions; (5) the stop/ask matrix and notification surface; and (6) whether Desktop availability is an acceptable dependency.

Refresh this report if a newer stable Codex release changes goals, scheduled tasks, CLI non-interactive resume, hooks, agent depth/concurrency, App Server, or plugin/MCP policy; when a controller pilot exposes a local trust/authentication constraint; or before promoting a Desktop pilot to headless execution. Do not refresh merely for a new prerelease.

## Residual decisions for the root

1. Approve status quo or one explicitly bounded Desktop scheduled-task pilot.
2. Select the durable record owner/path and whether it is tracked or a local-only operational artifact.
3. Define the autonomous-action envelope and the single-question escalation channel.
4. Decide the lease/recovery semantics and how pilot evidence will be retained.
5. Decide whether a demonstrated recurring failure warrants the headless controller; absent that evidence, do not add a scheduler, plugin, MCP server, or new feature flag.

## Sources

- [OpenAI Codex changelog](https://learn.chatgpt.com/docs/changelog) — accessed 2026-07-19.
- [OpenAI Codex GitHub releases](https://github.com/openai/codex/releases) and [stable 0.144.6 release](https://github.com/openai/codex/releases/tag/rust-v0.144.6) — accessed 2026-07-19.
- [OpenAI long-running work](https://learn.chatgpt.com/docs/long-running-work), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [hooks](https://learn.chatgpt.com/docs/hooks), and [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) — accessed 2026-07-19.
- Local evidence: `.codex/config.toml`, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/hooks/pre_tool_policy.py`, `.agents/skills/README.md`, and the linked reports above — inspected 2026-07-19.
