# Repository guidelines

## Product priorities

- Time-box evaluation of existing apps, tools, and services before custom implementation.
- Target: iOS Share Sheet capture, shared storage, independent votes/scores, ranking, notes, structured metadata, and calendar planning.
- Keep the partner experience to one app installation plus an invitation whenever possible.
- Do not use paid services, physical devices, production credentials, TestFlight, or distribution tooling without explicit approval.
- Preserve the Reminders + Beli Shortcut as baseline evidence until a replacement decision is recorded.

## Read before working

- Read `CONTEXT.md` before product, domain, or architecture work.
- Read relevant ADRs under `docs/adr/` before changing an established decision.
- Route through `docs/README.md`; do not duplicate full research, specs, or decisions.
- Research must prefer primary sources, record access dates, distinguish facts from inference, and update `docs/research/README.md`.

## Source and artifact policy

- `shortcut/Save Date Idea.cherri` is canonical source.
- `dist/*.shortcut` is a generated, signable deliverable.
- `.build/`, generated plists, processed Cherri, and unsigned Shortcuts are disposable. Never hand-edit them.
- Real URLs, calendars, addresses, private Notes contents, and relationship data do not belong in public fixtures or logs.

## Verification

- Docs/config only: `git diff --check` and TOML/JSON parsing where applicable.
- Shell/Python: `zsh -n scripts/*.sh` and `PYTHONDONTWRITEBYTECODE=1 python3 -m py_compile scripts/*.py .codex/hooks/*.py`.
- Hook policy: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest tests/test_pre_tool_policy.py`.
- Shortcut: `./scripts/verify.sh`.
- Native iOS: use the focused simulator command for the affected scheme once an Xcode project exists; serialize simulator ownership.

## Project workflow

- Use Research or Grilling to resolve uncertainty, then To Spec, then To Tickets after approval.
- Use Wayfinder when the destination is broad and the route is still unclear.
- Use Prototype only for one named design uncertainty; retain the decision, not disposable code.
- Use Handoff at a context boundary and link existing artifacts instead of copying them.
- GitHub publication requires a configured remote. External pull requests are not an automated triage surface.

## Parallel agents

- Delegate only independent, bounded work when explicitly requested or required by a skill.
- Run at most three child agents concurrently; children do not recursively delegate.
- Give writing agents exclusive, disjoint paths. The root owns shared files, integration, Git, publication, and final verification.
- Prefer `explorer`/`researcher` for read-heavy work, `prototype`/`worker` for isolated writes, `ios-specialist` for difficult Apple work, and `reviewer` after integration.
- Require concise summaries with paths, commands, failures, evidence, and unresolved decisions.

## Matt Pocock skill configuration

- GitHub Issues stores issues and PRDs; see `docs/agents/issue-tracker.md`.
- Use canonical triage labels; see `docs/agents/triage-labels.md`.
- This is a single-context repository; see `docs/agents/domain.md`.

## Project-local Codex dependencies

- User-installed global skills, MCP servers, agents, hooks, rules, and plugins
  are intentionally disabled outside repository configuration.
- OpenAI's Build iOS Apps `0.1.2` skills are vendored under `.agents/skills`;
  see `.agents/skills/BUILD_IOS_APPS.md`.
- The matching `xcodebuildmcp` simulator integration is declared only in
  `.codex/config.toml`.
