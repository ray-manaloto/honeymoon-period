# Codex features and hooks review

Status: researched 2026-07-15 against current official OpenAI documentation and the locally installed `codex-cli 0.144.4`.

## Executive recommendation

The project already has the important multi-agent foundation: a high-capability coordinator, lower-cost specialist workers, direct-child-only delegation, four total threads, project-local custom agent profiles, and stable hooks/multi-agent/shell execution enabled. Keep those settings.

Make only two immediate configuration changes:

1. Change top-level `web_search = "cached"` to `web_search = "live"` while the existing-app bake-off is active. Product capabilities, pricing, App Store listings, and APIs are time-sensitive, and the configuration reference explicitly supports `live` as a top-level mode. Do not use the deprecated feature-level web-search toggles. ([Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference))
2. Add one small project-local `PreToolUse` command hook as a defense-in-depth warning/blocker for destructive Git/file commands and physical-device or distribution commands. Keep the policy narrow and auditable; hooks do not intercept every execution path and are not a security boundary. ([Hooks](https://learn.chatgpt.com/docs/hooks))

Do not enable every visible feature flag. Stable defaults already activate many capabilities, while beta/experimental flags have higher churn and can increase token use, latency, or failure surface. The correct goal is a small explicit project policy, not a snapshot of every flag in `codex features list`.

## Verified current state

### Installed runtime

Local commands run:

```text
codex --version
# codex-cli 0.144.4

codex features list
```

The installed version matches the latest changelog entry reviewed on 2026-07-15. OpenAI describes 0.144.4 as a patch with no user-facing changes. ([Codex changelog](https://learn.chatgpt.com/docs/changelog))

The local feature catalog reports these relevant capabilities as stable and enabled: Apps, browser/computer use, fast mode availability, goals, hooks, multi-agent, plugins, remote plugins, shell snapshot, unified exec, request compression, skill MCP dependency installation, tool suggestions, and workspace dependencies. This local catalog is the authoritative statement of what this installed binary exposes; it does not imply that every feature needs a project-local override.

### Project configuration already correct

`.codex/config.toml` currently configures:

- `gpt-5.6-sol` with medium reasoning for the root coordinator.
- `gpt-5.6-terra` with low or medium reasoning for exploration, research, prototypes, and bounded implementation.
- `gpt-5.6-sol` with high reasoning for difficult iOS work and final review.
- `agents.max_threads = 4`, which means the root plus at most three workers.
- `agents.max_depth = 1`, preventing recursive fan-out.
- `agents.job_max_runtime_seconds = 1800` and interruption messages.
- stable Apps, goals, hooks, multi-agent, shell snapshot, and unified execution.
- `workspace-write` with on-request approvals.

These match OpenAI's guidance that `max_threads` caps concurrent open threads and that the default/recommended depth of one permits direct children while avoiding repeated fan-out, excess token use, latency, and local resource consumption. ([Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents))

Custom agent profiles are correctly project-local under `.codex/agents/`. Separating inexpensive read-heavy agents from a high-reasoning iOS specialist and reviewer is preferable to giving every worker the coordinator's model and reasoning budget. OpenAI explicitly notes that higher reasoning effort can improve difficult work but costs more time and tokens. ([Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents))

The Matt Pocock skills are correctly installed under `.agents/skills`, which is an officially documented repository scope discoverable from the working directory and repository root. ([Build skills](https://learn.chatgpt.com/docs/build-skills))

## Recommended project-local config change

Apply this minimal change to `.codex/config.toml`:

```toml
# Current-app and service research must not rely on a stale index.
web_search = "live"
```

Keep the existing `[features]` and `[agents]` values. It is reasonable, but not necessary, to add explicit stable intent flags such as `plugins = true`, `remote_plugin = true`, `fast_mode = true`, and `enable_request_compression = true`; all four are already enabled in the installed runtime. Adding them would document intent but would not add current capability. Leaving default-on features unset reduces config churn.

Do not set these yet:

- `service_tier = "fast"`: Fast mode is useful interactively, but making it the project default spends Fast credits for every eligible turn. Use `/fast on` selectively for latency-sensitive loops. OpenAI documents the persistent setting as `service_tier = "fast"` plus `[features].fast_mode = true`. ([Speed](https://learn.chatgpt.com/docs/agent-configuration/speed))
- `model_auto_compact_token_limit`: the documented default follows the model. An arbitrary project threshold could compact too early or too late as models change. ([Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference))
- `tool_output_token_limit`: do not tune before observing real Xcode log truncation. Prefer focused `xcodebuild` invocations, result bundles, and agent summaries instead of retaining huge logs in parent context. ([Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference))
- Memories or Chronicle as the source of project truth: tracked `CONTEXT.md`, ADRs, research reports, specs, and issues are more reviewable and portable. The local CLI marks Memories experimental.
- `multi_agent_v2`, code mode, token/rollout budgets, fan-out, network proxy, or other under-development flags: none is required for the current workflow, and no official stability guarantee supports pinning them for this project.

## Hooks plan

### What hooks can reliably do

Hooks run deterministic command scripts at lifecycle events and can inject context, scan prompts, check tool requests/results, or request another continuation at turn stop. Project hooks can live in either `.codex/hooks.json` or inline in `.codex/config.toml`; if both representations occur in the same layer, Codex merges them and warns, so use one representation. Project hooks run only after the project configuration is trusted, and every non-managed command hook requires a trust review. ([Hooks](https://learn.chatgpt.com/docs/hooks))

For maintainability, use `.codex/hooks.json` plus scripts under `.codex/hooks/`; keep hook definitions out of `config.toml`. The current `features.hooks = true` is sufficient to load that file.

### Add now: narrow pre-tool policy

Add a `PreToolUse` hook matching Bash commands. Its script should parse the JSON object from standard input and deny only clearly out-of-policy operations:

- destructive repository/file commands such as `git reset --hard`, `git clean -fd`, and unscoped recursive deletion;
- physical-device tooling such as `xcrun devicectl` while simulator-only development is the recorded policy;
- archive/upload/distribution commands such as App Store or TestFlight submission unless a future project decision authorizes them.

The script should otherwise exit successfully with no output. A denial should return the documented `PreToolUse` JSON shape with `permissionDecision: "deny"` and a concise reason. Do not log complete prompts, command inputs, tokens, URLs, calendar details, or restaurant notes.

This is defense in depth only. OpenAI states that `PreToolUse` currently intercepts Bash, `apply_patch`, and MCP calls only on supported paths; interception is incomplete with the newer unified execution mechanism, and web search is not intercepted. The project must retain its written policies and normal approval controls. ([Hooks: PreToolUse](https://learn.chatgpt.com/docs/hooks#pretooluse))

### Defer until an Xcode project exists: verification-at-stop

After a native app has a stable, fast simulator test command, consider a guarded `Stop` hook that checks whether Swift/project files changed and whether the focused verification evidence is present. It may request one continuation to run the missing check. It must inspect `stop_hook_active` to prevent continuation loops and must skip research-only or docs-only turns.

Do not add this hook during the app bake-off. A `Stop` hook can automatically create a continuation prompt, so premature or slow validation logic would waste tokens and block non-code tasks. ([Hooks: Stop](https://learn.chatgpt.com/docs/hooks#stop))

### Hooks not recommended

- A `SessionStart` hook that repeats `AGENTS.md` or `CONTEXT.md`: Codex already loads repository instructions, and repeated developer context consumes tokens every session. Session hooks are appropriate only for small dynamic facts that cannot live in tracked docs. ([Hooks: SessionStart](https://learn.chatgpt.com/docs/hooks#sessionstart))
- A `SubagentStart` hook duplicating each profile's instructions: custom agent files already provide bounded roles and output contracts.
- A broad `PostToolUse` formatter/test runner: the tool has already caused its side effects, and unconditional checks after each edit/command create latency. ([Hooks: PostToolUse](https://learn.chatgpt.com/docs/hooks#posttooluse))
- Prompt or agent hook handlers: the documentation says they are parsed but skipped; only command handlers run today. Asynchronous command hooks are also parsed but unsupported. ([Hooks](https://learn.chatgpt.com/docs/hooks))
- Hook-based secret logging or analytics: this is a personal app handling relationship, location, link, and calendar data. Avoid creating a second sensitive transcript store.

## Parallel work and worktrees

Use in-thread subagents for read-heavy research, reviews, test execution, and isolated changes with explicitly disjoint file ownership. Keep `max_threads = 4` and `max_depth = 1`.

Use ChatGPT desktop worktrees for truly independent top-level implementation tasks that would otherwise edit overlapping working state. OpenAI documents worktrees as desktop-only isolated checkouts for parallel tasks; ignored setup files must be listed in `.worktreeinclude`, while tracked files are already present. Worktrees also duplicate dependencies and build caches and can consume substantial disk space. ([Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees))

For a future iOS project:

- Prefer one simulator-owning build/test task at a time unless each worker receives a distinct simulator and Derived Data path.
- Keep secrets and device-specific settings out of Git. Add only necessary ignored setup files to `.worktreeinclude`.
- Use Handoff to move a worktree task to Local before interactive Xcode debugging.
- Remember that the same Git branch cannot be checked out in two worktrees simultaneously. ([Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees))

There is no verified project-local configuration setting in the reviewed official docs that automatically places spawned in-thread subagents into separate Git worktrees. Treat desktop worktree tasks and in-thread subagents as distinct orchestration mechanisms.

## Plugins, tools, and simulator workflow

Keep the installed `build-ios-apps` plugin and use its simulator, debugger, App Intents, SwiftUI, and performance skills only when their task matches. Keep the Matt Pocock skills as repo-scoped source-controlled workflows. Build a project-specific plugin only after repeated project behavior cannot be expressed cleanly through `AGENTS.md`, scripts, or one focused skill. Official plugin guidance supports a repo-local marketplace, but a plugin adds packaging/versioning overhead and is not required to begin the bake-off. ([Build plugins](https://learn.chatgpt.com/docs/build-plugins))

Use Apps/connectors only when they remove real integration work. The July 2026 changelog notes richer app approval modes, including a `writes` mode that permits declared reads while prompting for writes; prefer that posture for calendar or issue-tracker integrations where available. ([Codex changelog](https://learn.chatgpt.com/docs/changelog))

For simulator development, preserve the current role split:

- `ios-specialist` owns difficult Share Extension, App Intents, EventKit, CloudKit, simulator, and performance work.
- `worker` owns small specified vertical slices.
- `reviewer` performs read-only correctness/privacy/accessibility review after integration.
- Root coordinates shared files, Git, GitHub, and final verification.

## Context and token efficiency

1. Keep agent requests bounded and assign a concrete output path or question. Ask for concise summaries rather than raw logs.
2. Keep root `AGENTS.md` short; route durable detail to `CONTEXT.md`, ADRs, research reports, and specs. `project_doc_max_bytes` exists, but increasing it is not a substitute for concise instructions. ([Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference))
3. Use `gpt-5.6-terra` at low/medium reasoning for repository mapping, primary-source research, and disposable prototypes; reserve `gpt-5.6-sol` high reasoning for Apple-platform ambiguity and final review.
4. Do not recursively delegate. OpenAI warns that depth greater than one increases usage, latency, and resource consumption. ([Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents))
5. Run focused commands and have workers return file paths, the exact command, status, and only the relevant diagnostic excerpt.
6. Preserve research as cited Markdown and decisions as ADRs or tracker links; do not repaste full research into specs and tickets.
7. Use `/fast on` only for latency-sensitive interactive iteration, not as a project-wide default. ([Speed](https://learn.chatgpt.com/docs/agent-configuration/speed))

## Changelog features that materially help this project

Verified useful and available now:

- Codex is integrated into the ChatGPT desktop app, with Markdown/code editing, PR review, multi-repository projects, improved progress visibility, and faster Computer Use on GPT-5.6. ([Codex changelog](https://learn.chatgpt.com/docs/changelog))
- Remote plugins are enabled by default, MCP tools use tool search by default, and plugin skill loading has recent performance improvements. These reduce startup/context pressure; they do not justify installing unrelated plugins. ([Codex changelog](https://learn.chatgpt.com/docs/changelog))
- Hooks are generally available and have an in-app trust-review flow. ([Codex changelog](https://learn.chatgpt.com/docs/changelog))
- Desktop worktrees support isolated parallel tasks, including scheduled-task worktrees. ([Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees))
- The ChatGPT mobile app can connect to the Mac host and use the same projects, files, credentials, plugins, skills, and configuration. This is useful for monitoring long builds or research, not for replacing simulator verification. ([Codex changelog](https://learn.chatgpt.com/docs/changelog))

Available but not needed now:

- Fast mode as a persistent service tier; use it per task if latency is worth the additional credit usage.
- Repo-local plugin marketplace; wait until a repeated honeymoon-period workflow warrants packaging.
- Scheduled worktree automations; consider later for a monthly competitor/changelog refresh after the first research baseline is approved.

## Undocumented or unavailable behavior

The following were not verified in current official documentation and must not be assumed:

- spawned subagents automatically receiving separate worktrees;
- a project-local allowlist that prevents all globally installed skills from entering discovery;
- prompt or agent hook handlers executing today;
- asynchronous hook commands executing today;
- complete shell interception by `PreToolUse`/`PostToolUse` while unified execution is enabled;
- hooks intercepting native web search;
- a simulator instance being safely shared across concurrent writing/build agents;
- Beli or restaurant-service integrations being provided automatically by an OpenAI plugin.

## Concrete setup sequence

1. Switch project `web_search` to `live` for the bake-off.
2. Finish `/init`-style tracked project docs: concise root instructions, `CONTEXT.md`, conventions, research index, ADR index, and verification commands.
3. Add the narrow project `PreToolUse` hook and test allow/deny cases after accepting the trust review.
4. Run the existing-app research and save each lane as a cited report.
5. Use Wayfinder to map the decision, To Spec only after the bake-off decision, and To Tickets only after the spec is approved.
6. When a native Xcode project exists, establish one fast simulator verification command before adding a guarded Stop hook or running concurrent simulator work.
7. Revisit the official changelog/config reference at major project milestones rather than pinning experimental flags preemptively.
