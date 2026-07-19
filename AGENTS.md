# Repository guidelines

## Instruction precedence

When instructions conflict, apply them in this order:

1. user authorization and safety boundaries;
2. this repository's `AGENTS.md` plus the governing handoff, spec, and ADR;
3. project-local skills and agent profiles; and
4. generic or globally supplied skills.

Never let a generic skill create a commit, publish, install, rerun research, or
mutate a signed artifact when a higher-priority instruction withholds that
authority.

## Product priorities

- Preserve and extend the accepted local API-first web MVP in `docs/product/web-mvp-plan.md`; the existing-product bake-off is retained evidence, not the active implementation gate, and deployment remains separately authorized.
- Target: iOS Share Sheet capture, shared storage, independent votes/scores, ranking, notes, structured metadata, and calendar planning.
- Keep `/v1` OpenAPI contracts stable and provider-neutral. Generate clients, models, validators, mocks, and routine adapters; never hand-edit generated output.
- Human-authored code is limited to product behavior and the thinnest framework adapter that no maintained generator can emit. Codex/Sites-generated React and SwiftUI presentation code is approved and must pass the same review and test gates as other source.
- Prioritize the source-controlled React-admin + Vite web UI, then platform-native SwiftUI with a generated Swift client. Do not introduce a shared cross-platform UI runtime without a new decision.
- Prefer stable tools with Rust or other native implementations when capability is otherwise equivalent: Vite 8/Rolldown/Oxc and Biome are the web defaults.
- Keep the partner experience to one app installation plus an invitation whenever possible.
- Do not use paid services, physical devices, production credentials, TestFlight, or distribution tooling without explicit approval.
- The standing approval for isolated lab identities, free apps, synthetic external state, fixture-only vendor communication, and physical lab-device testing is recorded in `docs/conventions/lab-identities.md`; its human-only ceremonies and exclusions remain binding.
- Preserve the Reminders + Beli Shortcut as a usable baseline until the web MVP passes its completion contract and replacement is explicitly accepted.

## Read before working

- Read `CONTEXT.md` before product, domain, or architecture work.
- Read relevant ADRs under `docs/adr/` before changing an established decision.
- Route through `docs/README.md`; do not duplicate full research, specs, or decisions.
- Apply the mandatory research preflight in
  `docs/agents/research-workflow.md` before every non-trivial new workstream.
  Always evaluate both lanes: use the project `research` skill for material
  external uncertainty, and also use the project `last30days` skill when recent
  practitioner tips, tricks, techniques, failure modes, or recommendations could
  change the approach. Reuse current artifacts before rerunning either lane.
- Research must prefer primary sources, record access dates, distinguish facts
  from inference, and update `docs/research/README.md`. Last30Days is discovery,
  not authority; verify consequential claims against owning sources and keep its
  reports under `.build/research/last30days`.
- The root coordinates each required research lane once; child agents consume
  the linked artifacts and report gaps rather than duplicating searches. Routine
  execution of an approved, sufficiently researched plan and other mechanical
  work may record `not needed` with a concrete reason.
- Last30Days browser cookies, new or existing paid/PAYG provider quotas,
  credential changes, optional tool installation, user-home writes, and
  publishing require explicit approval for that action.

## Source and artifact policy

- Treat this as a new project: keep one canonical implementation path. Do not add
  compatibility shims, deprecated aliases, duplicate transports, or transitional
  code unless an explicitly approved external compatibility contract requires it.
- A product change is incomplete while source-controlled tests, generators,
  documentation, skills, agent guidance, examples, or prototypes still prescribe
  the superseded path. Update or clearly mark historical research in the same slice.
- "Zero technical debt" means no known avoidable debt is accepted at handoff. Fix it,
  enforce it with an automated guard where practical, or stop and obtain an explicit
  product decision; do not hide debt in a follow-up note.

- `shortcut/Save honeymoon-period.cherri` is the canonical Reminders baseline.
- `shortcut/Save Date Idea API.cherri` is the canonical API-backed candidate source;
  it does not replace the Reminders baseline until explicitly accepted.
- `dist/*.shortcut` contains generated, signable deliverables.
- `.build/`, generated plists, processed Cherri, and unsigned Shortcuts are disposable. Never hand-edit them.
- Real URLs, calendars, addresses, private Notes contents, and relationship data do not belong in public fixtures or logs.

## Verification

- Docs/config only: `git diff --check` and TOML/JSON parsing where applicable.
- Web/API: run the repository aggregate check plus focused TypeScript, Biome, unit, component, contract, Worker integration, production-build, and Playwright commands defined by the affected package. A green aggregate check proves mechanical health, not semantic MVP acceptance.
- Semantic web/API review must confirm the common `400`/`401`/`429`/`500` error responses on every authenticated OpenAPI operation, `404` on every resource-addressed operation, any additional Worker-emitted statuses, differing-payload idempotency races cannot expose orphan records, React-admin routes render exactly one primary landmark, and phone tests measure real overflow while exercising list/detail/mutation behavior.
- Generated code: regenerate from the canonical OpenAPI/UI metadata and require a clean generated diff; never repair generated output manually.
- Browser QA: use the project `frontend-testing-debugging` skill and Browser/CDP for interactive localhost diagnosis when available. Committed Playwright tests remain the reproducible E2E authority.
- Shell/Python: `zsh -n scripts/*.sh` and `PYTHONDONTWRITEBYTECODE=1 python3 -m py_compile scripts/*.py .codex/hooks/*.py`.
- Hook policy: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest tests/test_pre_tool_policy.py`.
- Shortcut: prefer the non-mutating `npm run check:shortcuts:readonly` when the pinned local Cherri binary exists. `./scripts/verify.sh` and `./scripts/verify-save-date-idea.sh` rebuild and re-sign deliverables and therefore require explicit artifact-mutation intent.
- Dirty-tree evidence: use `node scripts/worktree-manifest.mjs <paths...>` for a read-only size/hash manifest. Normal `git diff` does not include untracked implementation files.
- Semantic searches: prefer `scripts/semantic-search.sh PATTERN [PATH ...]` so generated validators and disposable output do not flood or truncate review evidence.
- Native iOS: use the focused simulator command for the affected scheme once an Xcode project exists; serialize simulator ownership.

## Project workflow

- Use the repository `adaptive-orchestration` skill for long, multi-phase goals.
  Reconcile the bootstrap and complete dirty tree before editing, maintain the
  append-only goal change log in `docs/agents/adaptive-orchestration.md` or the
  governing durable artifact, and apply the context-lifecycle and tracker
  ceremonies linked there.
- Complete the two-lane research preflight, then use Grilling to resolve
  remaining preference or design uncertainty, then To Spec and To Tickets after
  approval.
- Use Wayfinder when the destination is broad and the route is still unclear.
- Use Prototype only for one named design uncertainty; retain the decision, not disposable code.
- Use Handoff at a context boundary and link existing artifacts instead of copying them.
- Handoffs follow `docs/agents/handoff-template.md`, including dirty-tree and artifact hashes, mutating-command labels, reserved final-agent slots, and Browser runtime evidence.
- GitHub publication requires a configured remote. External pull requests are not an automated triage surface.
- Implement the approved web MVP as vertical tracer bullets. Each slice begins with failing tests, includes the smallest API-to-UI behavior, and leaves all checks green.
- Prefer maintained stable dependencies only when an evidence-gated deletion
  test proves they remove meaningful repository ownership without weakening
  canonical contracts, privacy, provider neutrality, deterministic offline
  verification, licensing, or rollback.

## Parallel agents

- Delegate only independent, bounded work when explicitly requested or required by a skill.
- Standing goal authorization includes one fresh read-only standards/spec review after
  material integration on every material iteration; preserve the separate final verifier
  and validator slots.
- Run at most three child agents concurrently; children do not recursively delegate.
- For material integration, reserve two fresh direct-child slots for the final independent verifier and validator. Adapt optional review fan-out rather than consuming those slots.
- Give writing agents exclusive, disjoint paths. The root owns shared files, integration, Git, publication, and final verification.
- Prefer `explorer`/`researcher` for read-heavy work, `prototype`/`worker` for isolated writes, `ios-specialist` for difficult Apple work, and `reviewer` after integration.
- Prefer `web-specialist` for React-admin/Vite/Browser/Playwright work after a ticket and owned path are explicit.
- Keep the root on GPT-5.6 Sol. Prefer the lower-model `verifier` for independent acceptance/evidence checks and `validator` for reproducible mechanical checks; use both after material integration when their work is independent.
- Verification agents must be fresh, independent from implementers and from each other, and must not edit source or documentation. Verifiers return `ACCEPT`/`REJECT`; validators return `PASS`/`FAIL`. Both report exact commands or inspected evidence, paths and lines, failures, residual risks, and unverified behavior.
- When either rejects or fails, give a bounded correction to a worker. Re-run the affected pass with a fresh agent; re-run both when the correction changes shared integration or evidence used by both passes.
- Escalate to the Sol `ios-specialist` only for difficult Apple-platform behavior and to the Sol `reviewer` only for material security, privacy, data-loss, concurrency, architecture, disagreement, or persistent-failure risk. Keep routine implementation, source extraction, formatting, and mechanical validation on Terra unless Terra is unavailable or has failed to converge.
- Require concise summaries with paths, commands, failures, evidence, and unresolved decisions.
- Broad scans must exclude generated validator bodies, coverage, `.build`, and other disposable output unless the assigned question requires them. Label concurrency findings as either locally reproduced failures or control-flow risks.

## Learning loop

- Run the autonomous learning loop until the active `/goal` reaches its completion
  contract. Exhausted bounded approaches must produce the controller's one deduplicated
  human-interview question; a failed or exhausted attempt is not goal completion.
- Record durable, repository-specific lessons under `docs/learning/` using its template.
- Every accepted lesson names the observed failure, evidence, correction, and the regression test or automated guard that now enforces it.
- Before downstream state changes, record every material iteration as `promoted`,
  `linked`, or `no-new-lesson`; routine green work should use a concrete
  `no-new-lesson` reason instead of creating documentation sediment.
- Promote recurring stable lessons into `AGENTS.md`, conventions, skills, agent briefs, generators, or checks; retire entries when their guard or underlying constraint becomes obsolete.
- Only request a human interview after local diagnosis, repository evidence, current
  primary research, and bounded independent agents cannot resolve genuine ambiguity.
- Never place prompts, private product data, credentials, Browser state, or raw relationship content in learning records.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues; external pull requests are not a
triage request surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical Matt Pocock triage labels without aliases. See
`docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with `CONTEXT.md` at the root and ADRs
under `docs/adr/`. See `docs/agents/domain.md`.

## Project-local Codex dependencies

- User-installed global skills, MCP servers, agents, hooks, rules, and plugins
  are intentionally disabled outside repository configuration.
- OpenAI's Build iOS Apps `0.1.2` skills are vendored under `.agents/skills`;
  see `.agents/skills/BUILD_IOS_APPS.md`.
- The matching `xcodebuildmcp` simulator integration is declared only in
  `.codex/config.toml`.
- Framework and test skills installed by `gh skill --agent codex --scope project`
  are inventoried in `.agents/skills/README.md` and pinned in each skill's
  frontmatter. Use `gh skill` for project additions and updates; never install
  repository dependencies at user or system scope.
