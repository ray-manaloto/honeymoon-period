# Research-first agent workflow

- **Question:** How should this repository enforce primary-source Research plus
  Last30Days recent-practice discovery across project instructions, skills,
  agent roles, and hooks without forcing irrelevant or duplicative research?
- **Status:** Research complete; project-policy integration applied.
- **Last verified:** 2026-07-16
- **Related decision/spec:** Repository workflow policy; no ADR required unless
  this routing changes an approved product or architecture decision.

## Executive recommendation

Make the root `AGENTS.md` the mandatory router for **material uncertainty** and
put the detailed trigger matrix in one convention document. For material
architecture, product, dependency, provider, platform, test-strategy, security,
privacy, authorization, or unfamiliar-debugging decisions, use the project
`research` skill for owning-source facts and use `last30days` in parallel when
recent community practice, tips, failure modes, adoption, or recommendations can
change the decision. Do not require either skill for deterministic execution of
an already-approved plan, local code inspection, routine test runs, formatting,
index/link maintenance, or a mechanical edit with no external uncertainty.

Keep the roles asymmetric: one `researcher` owns one cited report; the root owns
the Last30Days run and synthesis; implementation agents consume those artifacts
instead of independently repeating searches. Keep Last30Days explicitly
supplemental: community signals can nominate questions and techniques, but every
material factual claim must be verified against the source that owns it.

Do not turn the existing `PreToolUse` hook into a stateful “research completed”
gate. Codex documents hooks as guardrails with incomplete interception, and a
tool-level gate cannot reliably determine whether a particular change contains
material uncertainty. Written routing, focused agent instructions, and review
evidence are the appropriate controls.

## Last30Days supplement

The root ran the pinned Last30Days engine for “research-first AI coding-agent
workflows for API-first web and Apple automation projects” over 2026-06-16
through 2026-07-16. The completed pass found 11 ranked items across X and Hacker
News. They discussed agent task queues over MCP, broad tool catalogs, precision
editing tools, and the gap between code familiarity and team context, but the
engine itself rated the material as generic or weakly grounded in this project's
specific question. No community finding was strong enough to change the primary
recommendation.

An earlier broad pass also reached YouTube, TikTok, and Instagram base results.
This run was authorized by the user's explicit request to use Last30Days with
the previously approved configured sources, but transcript/comment enrichment
exhausted the available ScrapeCreators credits and a Reddit RSS future stalled.
That pass was stopped and is not used as durable evidence. The successful raw
report plus WebSearch supplements is
kept in the disposable project research boundary at
`.build/research/last30days/research-first-ai-coding-agent-workflows-for-api-first-web-and-apple-automation-projects-raw-research-first-v2.md`.

The useful current-practice implication is therefore modest: persistent
repository context, bounded agent roles, deterministic tools, and reviewable
test evidence remain more credible than adding another orchestration service.
Primary OpenAI, Appium, Playwright, and Cloudflare sources were used to verify
the concrete workflow and testing implications.

## Primary sources reviewed

All sources were accessed on 2026-07-16.

- [OpenAI: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [OpenAI: Hooks](https://learn.chatgpt.com/docs/hooks)
- [Agent Skills specification](https://agentskills.io/specification)
- [Agent Skills creator best practices](https://agentskills.io/skill-creation/best-practices)
- [Matt Pocock `research` skill at the installed v1.1.0 commit](https://github.com/mattpocock/skills/blob/d574778f94cf620fcc8ce741584093bc650a61d3/skills/engineering/research/SKILL.md)
- [Last30Days `SKILL.md` at the repository-pinned commit](https://github.com/mvanhorn/last30days-skill/blob/249c7a4c040558a903d6838dee31012980d4946d/skills/last30days/SKILL.md)
- Current repository instructions and implementation:
  [`AGENTS.md`](../../AGENTS.md),
  [`docs/conventions/README.md`](../conventions/README.md),
  [`.agents/skills/README.md`](../../.agents/skills/README.md),
  [`.codex/agents/researcher.toml`](../../.codex/agents/researcher.toml), and
  [`.codex/hooks/pre_tool_policy.py`](../../.codex/hooks/pre_tool_policy.py).

## Verified findings

### `AGENTS.md` is the correct mandatory routing layer

OpenAI states that Codex reads `AGENTS.md` before doing work, constructs an
instruction chain from the project root toward the working directory, and lets
closer files override earlier guidance. It also stops loading project guidance
at a configured byte budget, 32 KiB by default. Therefore the root file should
contain a short trigger rule and point to one detailed convention instead of
duplicating a long matrix in every agent and skill. ([OpenAI `AGENTS.md`](https://learn.chatgpt.com/docs/agent-configuration/agents-md))

The current root policy already requires primary sources, access dates,
fact/inference separation, and the research index. It already describes
Last30Days as a discovery supplement only when a request explicitly needs
current community trends. The missing behavior is broader but still scoped:
material work should proactively check whether recent practice could affect the
decision, even if the user did not use the word “trends.” This is an extension
of an existing rule, not a new research system.

### Skill activation should be precise, not universal

Codex initially sees a skill's name, description, and path, then loads its full
`SKILL.md` only when the skill is selected. It activates skills explicitly or by
matching the task to the skill description, and OpenAI recommends descriptions
with clear scope and boundaries. The Agent Skills specification likewise makes
the description responsible for saying what the skill does and when to use it.
([OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills),
[Agent Skills specification](https://agentskills.io/specification))

The Agent Skills authors recommend keeping a skill focused on a coherent unit,
cutting instructions the agent would handle correctly without them, and avoiding
overly comprehensive skills because irrelevant instructions can drive
unproductive work. ([Agent Skills best practices](https://agentskills.io/skill-creation/best-practices))

The installed `research` skill already defines the authoritative lane: delegate
to a background agent, use primary sources, write one cited Markdown report, and
follow the repository's report convention. No wrapper should restate or fork
that procedure. ([Pinned `research` skill](https://github.com/mattpocock/skills/blob/d574778f94cf620fcc8ce741584093bc650a61d3/skills/engineering/research/SKILL.md))

The pinned Last30Days skill is a specific engine-backed recent-signal workflow,
not a generic web-search prompt. Its contract requires running the engine and
uses web search as a supplement; it can call external services and optionally
use credentials or write outside the repository. That makes it valuable for
recent community evidence but unsuitable as an unconditional prerequisite for
mechanical tasks. ([Pinned Last30Days skill](https://github.com/mvanhorn/last30days-skill/blob/249c7a4c040558a903d6838dee31012980d4946d/skills/last30days/SKILL.md))

### One research owner avoids duplicated source work

OpenAI recommends subagents for independent, read-heavy work and notes that each
subagent consumes its own tokens. It also recommends returning distilled results
instead of raw intermediate output and warns that parallel write-heavy work can
cause conflicts. ([OpenAI Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents))

The repository's current `researcher` profile already assigns primary-source
research, fact/inference separation, access dates, an exclusive output path, and
a compact synthesis. This aligns with both OpenAI's guidance and the installed
Research skill. Requiring every worker, specialist, verifier, and validator to
rerun both research lanes would duplicate effort and undermine the existing
exclusive-path model.

### Hooks cannot prove that appropriate research occurred

OpenAI documents project hooks as deterministic lifecycle scripts, but explicitly
says `PreToolUse` is a guardrail rather than a complete enforcement boundary. It
does not intercept every shell path and does not intercept web search or other
non-shell, non-MCP tools. Changed project hooks also require renewed trust.
([OpenAI Hooks](https://learn.chatgpt.com/docs/hooks))

The current project hook blocks a narrow set of objectively unsafe commands. A
“research required” decision depends on semantic task context, existing evidence,
and whether the work is mechanical; forcing that judgment into regex or tool
state would be both incomplete and noisy. A hook may remind an agent about a
specific, objectively detectable boundary, but it should not block normal tools
because no research marker exists.

## Facts versus inference

### Facts

- Codex loads root project instructions before work and supports scoped nested
  overrides.
- Skill descriptions drive implicit activation; full instructions load only
  after activation.
- The installed Research skill requires one background research owner and one
  cited report based on primary sources.
- Last30Days is an engine-backed, multi-source recent-signal workflow with
  optional external services, credentials, and user-home writes.
- Subagents cost more tokens than a comparable single-agent run; read-heavy,
  independent delegation is the recommended starting point.
- `PreToolUse` interception is incomplete and does not cover web search.
- This repository already has primary-source research rules, a Last30Days
  discovery policy, an exclusive-path researcher, and a narrow safety hook.

### Inferences

- “Always use Research and Last30Days” should mean **always evaluate and route
  material uncertainty through the appropriate lanes**, not run both tools before
  every command. Literal universal execution would conflict with the skill
  authors' focus guidance, duplicate existing evidence, spend external quota,
  and slow mechanical work without improving correctness.
- The root coordinator should own routing and synthesis. A researcher should not
  recursively invoke additional agents, and implementers should consume the one
  report plus the saved recent-signal artifact.
- Policy compliance is best reviewed at planning/review boundaries by checking
  linked evidence and documented skip reasons, not inferred from a hidden marker
  in a pre-tool hook.

## Concrete routing contract

### Run primary-source Research when any of these is true

- A new or changed architecture, ADR, product behavior, authorization boundary,
  privacy/security posture, provider, service, library, plugin, skill, MCP server,
  platform API, or test strategy requires external facts.
- A material claim depends on current pricing, limits, support, compatibility,
  policy, terms, release behavior, or maintenance status.
- The work is unfamiliar, disputed, niche, or remains uncertain after local
  source and test evidence.
- The user explicitly asks to research, compare, verify, or avoid duplicating an
  existing capability.

### Also run Last30Days when any of these is true

- Recent tips, workflows, failure modes, adoption, community sentiment, or
  practitioner recommendations could change the proposed approach.
- The task selects among fast-moving tools or asks what people are doing now.
- The user explicitly asks for trends, recent discussion, community experience,
  or Last30Days.

### Do not start new research for these cases

- Executing an approved, sufficiently detailed plan or ticket whose evidence is
  still current.
- Formatting, generated-file regeneration, deterministic refactoring, routine
  tests, build reruns, local source inspection, or documentation link/index
  maintenance with no new claim.
- Fixing a locally reproduced defect when repository code, logs, and tests fully
  establish the cause and remedy.
- Reusing an existing current report that already answers the same question.

If an apparent exception still contains a new external assumption, route only
that assumption through Research and, when recent practice matters, Last30Days.

## Recommended repository integration

1. Add a compact **Research routing** block to root `AGENTS.md` with the trigger
   categories above, the exemptions, and the rule that consequential Last30Days
   signals require primary-source verification.
2. Put the full matrix in one convention page and link it from `AGENTS.md`,
   `docs/README.md`, and the research index. Do not repeat the matrix across all
   documents.
3. Keep upstream `research` and `last30days` skill bodies unchanged. Update only
   the project skill inventory to describe their complementary roles and
   authorization boundaries.
4. Update the `researcher` profile to say it owns the primary-source report and
   must not duplicate a Last30Days run already owned by the root. Give worker and
   specialist profiles one short instruction to consume linked research and
   flag uncovered material uncertainty back to the root rather than launching
   overlapping searches.
5. Make reviewers check that material decisions link either current evidence or
   a concise reason research was unnecessary. Keep validators mechanical.
6. Leave `pre_tool_policy.py` focused on deterministic safety boundaries. Do not
   add a research marker, research timestamp, or blanket network gate.
7. For a task needing both lanes, start the Research background agent and the
   Last30Days engine concurrently when safe. Save one primary report under
   `docs/research/` and keep raw Last30Days output under the existing ignored
   `.build/research/last30days/` boundary; merge only verified implications into
   durable plans or decisions.

## Product and workflow impact

This routing gives the API-first web MVP current provider, framework, browser,
Apple-platform, Shortcut, Appium, Playwright, and security evidence when those
choices are being made. It does not make every vertical-slice edit wait on social
research. The durable chain stays reviewable: community discovery nominates a
technique or risk; owning sources verify material facts; an ADR or approved plan
records the decision; implementation and tests supply local evidence.

The existing authorization boundary remains binding. Last30Days should default
to already-approved, credential-free or already-configured sources. Browser
cookies, new credentials, paid/PAYG quota, optional installations, user-home
writes, and publishing still require the repository's specified approval even
when recent-practice research is otherwise required.

## Integration decisions

- Plans, tickets, handoffs, and agent briefs use standardized `Research` and
  `Last30Days` preflight lines so review can distinguish linked, reused, and
  concretely unnecessary work.
- No wrapper skill or custom MCP was added. The existing skills remain the
  execution units; `AGENTS.md`, the research workflow document, the skill
  inventory, and role profiles coordinate them without copying their bodies.
- No semantic hook gate was added. If observed tasks still skip the written
  routing rule, collect examples before considering a narrow reminder.
