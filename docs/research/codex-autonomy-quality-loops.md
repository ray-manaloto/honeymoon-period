# Codex autonomy quality loops

- **Question:** What quality-loop controls can safely let an explicitly authorized Codex goal refine bounded local work without turning model persistence into unlimited authority?
- **Status:** Research complete; bounded design adopted by owner decision recorded in goal change-log entry 20.
- **Research:** linked — this primary-source candidate report reuses [autonomous goal continuation](codex-autonomous-goal-continuation.md) and adds the five assigned official OpenAI Cookbook examples.
- **Companion-file audit:** [complete](codex-cookbook-companion-markdown-inventory.md) at `openai/openai-cookbook` commit `9fa55b8cecba8c9c543d11f2cf08339a29112be7`; example `.md` filenames are classified as committed, external, or generated before reuse.
- **Last30Days:** reused — [the retained focused Symphony/Codex report](../../.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md); deliberately not repeated here.
- **Accessed / last verified:** 2026-07-19.

## Current repository decision (2026-07-19)

The owner authorized the bounded quality loop after issue #24 supplied the two comparable
semantic repair incidents required by the adoption gate. Goal change-log entry 20 records
that evidence and the current authority. `docs/agents/adaptive-orchestration.md` is now the
prescriptive source for the autonomous review-repair-validation loop. The historical
“defer implementation” recommendation below is retained as research provenance, not
current policy. Root-authored goal pull requests may use the exact-head autonomous merge
gate in `docs/agents/issue-tracker.md`; protected ceremonies and external-authority
boundaries remain excluded.

## Compact conclusion

Adopt a quality loop only as a **bounded adjunct** to the proposed single-writer active-goal controller: deterministic orchestration selects an already-authorized unit, records a checkpoint, runs independent mechanical validation, and evaluates explicit stop conditions. Codex supplies bounded review, repair, diagnosis, and evidence summarization; it does not select the goal, expand authority, declare its own work accepted, or decide whether an ambiguous product, privacy, or publication question is safe to continue.

The strongest reusable pattern is **review -> focused repair -> independent validation -> persisted record -> stop or next bounded attempt**. A passing deterministic check can close a unit only when the predeclared completion contract says it is sufficient. Model-as-judge feedback is diagnostic evidence, not the sole acceptance oracle. This preserves the repository's existing independent verifier/validator gates and its Reminders baseline.

## Verified primary-source findings

### Common mechanics

- **Verified:** The iterative-repair Cookbook separates read-only structured review, focused repair, and validation; it carries the validation delta to the next pass, writes a per-iteration record, and says a production loop should stop on validation success, a maximum attempt count, unchanged remaining delta, or a human-review decision. Its worked example is documentation maintenance, so those stop rules are a reusable pattern rather than a Codex product guarantee. [Build iterative repair loops with Codex](https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex)
- **Verified:** That example uses JSON schemas for review findings, repair summaries, and validation results. The stated purpose is machine-readable handoffs that are easier to debug, rerun, and adapt; the validator combines notebook execution evidence with a rubric-based model judgment. Therefore execution and judging are deliberately distinct signals. [Build iterative repair loops with Codex](https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex)
- **Verified:** The code-review example uses headless Codex with a structured-output schema, a read-only sandbox, and a concurrency group keyed to a pull request. It parses output before external SCM comment writes; it also calls out secret-isolation concerns for public-repository CI. These are CI-example mechanics, not authorization to write GitHub state from this repository. [Build Code Review with the Codex SDK](https://developers.openai.com/cookbook/examples/codex/build_code_review_with_codex_sdk)
- **Verified:** The modernization example keeps an executive plan as the pilot's home base, records scope/steps/completion proof, updates progress and decision log after meaningful work, narrows work to a pilot flow, and uses parity comparison against common inputs as the proof mechanism. It explicitly leaves engineers to confirm production facts and architectural/business decisions that the agent cannot infer. [Modernizing your Codebase with Codex](https://developers.openai.com/cookbook/examples/codex/code_modernization)
- **Verified:** The prompting guide recommends a harness contract covering autonomy/persistence, exploration, and tools; warns against repeated re-reading/re-editing without clear progress; recommends bounded tool-response truncation; and says integrations must preserve `phase` metadata on assistant items for the documented API model. These are model/harness guidance, not a durable repository state model or a semantic stopping classifier. [Codex Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide)
- **Verified:** The agent-improvement example turns traces plus human/model feedback into rerunnable evals, ranks evidence-backed harness changes, and emits a Codex-facing handoff. It presents developer review of the proposed diff as a common starting point, with deeper automation only as the eval gate becomes trusted; it permits human gates at trace review, eval refinement, PR approval, merge, and deployment. [Build an Agent Improvement Loop with Traces, Evals, and Codex](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)
- **Verified:** The code-review workflow cancels stale in-progress work within its PR concurrency group and retains explicit base/head revision inputs. A repository-local adaptation should bind each review/validation record to its observed HEAD and owned-input manifest, then invalidate it when those inputs change; the CI example does not itself supply the local stale-evidence policy. [Pinned code-review source](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/build_code_review_with_codex_sdk.md)
- **Verified, integration-conditional:** The prompting guide requires preserving assistant `phase` metadata when reconstructing supported API history. This applies only if the Adapter directly reconstructs Responses API items; it does not require repository duplication of native Codex task history. [Pinned prompting-guide source](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/gpt-5/codex_prompting_guide.ipynb)
- **Inference:** The generated `codex_handoff.md` shape usefully combines ranked changes, supporting evidence, and validation guidance, but it remains a handoff artifact. The active goal record and lease remain authoritative, and the modernization article's separate plan/overview/design/validation documents remain documentation rather than automatic work triggers. [Companion inventory](codex-cookbook-companion-markdown-inventory.md)

### Boundaries and failure modes

- **Verified:** The repair-loop example constrains repair to a copied editable artifact and tells the repair agent not to claim validation passed. Its own validator can still include a model judge, so a passing model judgment alone is not independently reproducible proof. [Build iterative repair loops with Codex](https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex)
- **Verified:** The improvement-loop example is live, dependency- and API-key-bearing, deletes/recreates its generated artifact directory, and describes automatic PR/merge/deploy wiring as a developer choice. It is evidence for an improvement-loop shape, not a safe drop-in repository controller. [Build an Agent Improvement Loop with Traces, Evals, and Codex](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)
- **Verified:** The code-review example's external comment publishing occurs only after a separate structured-output-producing read-only review job. It nevertheless needs write credentials for publishing, so read-only model execution does not eliminate the authority of the surrounding integration. [Build Code Review with the Codex SDK](https://developers.openai.com/cookbook/examples/codex/build_code_review_with_codex_sdk)

## Current local evidence

- **Verified locally (2026-07-19):** `.codex/config.toml` sets project-local `workspace-write` and on-request approvals; goals, hooks, and multi-agent support are enabled; `max_threads = 4`, `max_depth = 1`, and `job_max_runtime_seconds = 1800` limit the root plus at most three direct children.
- **Verified locally (2026-07-19):** `docs/agents/adaptive-orchestration.md` already requires a durable goal record, append-only change log, preflight evidence, bounded direct children, and fresh independent semantic and mechanical final gates. It says a green command is not semantic acceptance.
- **Verified locally (2026-07-19):** [autonomous goal continuation](codex-autonomous-goal-continuation.md) already recommends one active-goal record, an atomic TTL lease, reconcile-before-phase, bounded idempotent units, and an explicit stop/ask matrix. This report does not replace that controller design.

## Candidate design

### Deterministic controller versus model judgment

| Concern | Deterministic controller/guard | Bounded Codex judgment |
| --- | --- | --- |
| Authority | Read active-goal record; allowlist operations and paths; acquire/release TTL lease; stop at listed authority gates | Explain why an allowed, concrete repair may address recorded evidence |
| Unit lifecycle | Choose one declared unit; capture input HEAD; command/attempt/time budget; checkpoint records; enforce backoff | Produce structured review, repair summary, or diagnosis inside that unit |
| Validation | Run pinned commands; parse exit status/schema; compare known output; detect no-delta/repeated fingerprint | Triage an observed failure and propose the smallest next repair |
| Completion | Apply declared acceptance contract; require independent verifier/validator where policy says so | Summarize evidence; never self-certify acceptance |
| Ambiguity | Match explicit stop/ask matrix; prevent retries after a terminal condition | Identify a possible conflict or missing fact and surface it as a question |

### Loop contract (repository inference)

Every iteration should persist a small schema-validated checkpoint before the next mutation: goal/unit identifier; input HEAD and owned paths; review findings; proposed/actual patch identity; deterministic command results; optional judge feedback marked non-authoritative; normalized remaining delta/fingerprint; attempt count; and one terminal state: `passed`, `retryable`, `waiting_for_human`, `blocked`, or `failed_budget`.

Continue only when all are true: the lease is live; the next unit and paths are pre-authorized; the last result is `retryable`; no stop/ask condition matched; the retry/command/time budget remains; and the delta differs or an explicitly declared staged milestone remains. Stop without mutation on lease loss, changed HEAD/dirty-tree conflict, missing proof prerequisite, unchanged delta, failed schema/validator, or uncertainty that changes scope/authority.

## Architecture comparison

| Option | Strength | Material limitation | Fit |
| --- | --- | --- | --- |
| **Status quo: existing adaptive controller + final gates, no automatic repair loop** | Already policy-compatible; preserves human ownership and existing evidence gates | Repeated local repair work remains manual and may lose per-attempt diagnostics | Default until a recurrence proves a loop module is worthwhile |
| **Candidate: controller-owned bounded quality loop** | Reuses goal record/lease; produces inspectable review-repair-validation checkpoints; supports local idempotent retries | Requires a small schema, fingerprint/no-progress rule, and focused tests; model judgment cannot be the final oracle | Recommended only after a qualifying recurrence and explicit authorization |
| **Alternative: continuous trace/eval harness improvement flywheel** | Strong for evolving an agent harness from repeated traces and feedback | Needs live model calls, trace retention/governance, eval corpus stewardship, and a separate change-approval path | Defer; it is not necessary for a one-goal repository controller |

## Interface and ownership analysis

- **Interface:** a narrow, versioned checkpoint contract plus stable deterministic validator result (`command`, input hash, exit status, normalized failure fingerprint, artifact references). The controller consumes it; an optional model reviewer/repairer merely produces/consumes schema-validated fields.
- **Implementation:** controller lock/lease, state transitions, command runner, output normalization, patch isolation, and retention policy are repository-owned code. Codex prompts and schemas are replaceable adapters, not the authority source.
- **Seam:** review and judge adapters receive a redacted artifact/diff and return only schemas; repair receives a writable copy or owned worktree and returns a patch reference/summary. The seam prevents transcripts or free-form prose becoming workflow state.
- **Deletion test:** do not add a module merely to replay `git diff`, test commands, or the existing append-only goal log. Adopt only if it removes repeated manual reconstruction of attempt history and stop decisions without reimplementing the active-goal/lease policy in a second tracker.
- **Depth:** moderate only if the repository has a repeated, mechanically measurable repair class. It becomes high coupling if it needs product-semantic completion, external APIs, credentials, or general-purpose agent scheduling.
- **Leverage:** high for repeated deterministic failures whose next repair is local and whose acceptance check is already trusted; low for discovery, architecture, privacy, UX, or cross-system work.
- **Locality:** keep records under the goal's existing durable artifact and bounded worktree; do not introduce cloud traces, external stores, or durable model transcripts by default.
- **Adapters:** Codex CLI/SDK model calls, an optional judge, and future eval runners must sit behind the schema. Replacing a model or dropping the judge must not alter lease, authority, stop-state, or proof semantics.

## Historical recommendation and adoption gate

The following was the pre-adoption recommendation. It is retained to show the gate that
the current decision satisfied, not as current instruction: **conditional candidate;
defer implementation** until all prerequisites hold.

1. At least two documented incidents show repeated manual local repair/validation cycles for the same artifact class, with a trusted deterministic acceptance command.
2. A single owner approves the unit schema, retention period, path allowlist, maximum attempts, no-progress fingerprint, and terminal stop/ask matrix.
3. The pilot is local-only, uses synthetic/non-sensitive fixtures, has no new provider quota/credential/install, and excludes GitHub writes, deployment, signing, distribution, calendar, and partner data.
4. Tests demonstrate lease loss, stale checkpoint/HEAD, malformed model output, validator timeout/nonzero result, unchanged-delta termination, budget exhaustion, and a successful rerun from a persisted checkpoint.
5. The pilot can be deleted cleanly: removing its adapter restores the status quo without leaving a second active-goal authority or weakening existing final gates.

## Guards, preservation, and privacy

- Preserve the active-goal record and append-only orchestration log as the only durable authority; never infer a new goal from a failure, trace, or model recommendation.
- Treat model findings, confidence, rankings, and judge pass/fail as advisory unless the completion contract explicitly names the deterministic validator they complement.
- Redact or avoid real URLs, calendars, addresses, private Notes, relationship data, credentials, and raw Browser state in prompts and checkpoint logs. Keep prompts/diffs minimal to the owned paths.
- Run review read-only where possible; isolate repair to a copied artifact or leased owned worktree; validate before any integration; retain the Reminders + Beli baseline until its accepted replacement condition is met.
- Keep the repository's current authority stops. Standing repository policy may separately
  authorize bounded publication or exact-head merge; credentials/consent, paid quota,
  deployment, signing/distribution, destructive external effects, unapproved product or
  architecture changes, and unresolved privacy questions still require explicit authority.

## Concrete report additions or corrections for the root

- Add this report as a linked candidate in the research index only if the root decides the durable report belongs in the current research set; this child intentionally did not edit the shared index.
- Preserve the conclusion of `codex-autonomous-goal-continuation.md`: a scheduler/goal/hook is not a semantic infinite-loop engine. This report refines its bounded-phase section with review/repair/validation records and no-progress termination.
- Do not import the improvement-loop Cookbook's live trace, Promptfoo, HALO, API-key, artifact-deletion, or automatic merge/deploy example as a repository dependency or default workflow. It is an alternative architecture requiring separate research and authority.

## Historical residual decisions and gaps

These were open when the candidate report was written. Goal change-log entry 20 and the
current orchestration policy resolve adoption, operation scope, and the final-gate shape;
they remain here only as provenance for future policy changes.

1. Which existing recurring failure class, if any, justifies a local pilot? No qualifying recurrence is evidenced in this research.
2. What normalized delta/fingerprint is safe for the chosen validator (test name/error family, snapshot diff hash, or schema violation set), and when is a staged multi-pass exception allowed?
3. What retention/redaction policy protects checkpoints and optional model input/output artifacts while retaining enough auditability?
4. May a model judge be used at all, and if so, what deterministic check or human gate must accompany it?
5. Which exact operations are inside the pilot authority envelope, and which notification/question channel records `waiting_for_human` without rescheduling duplicate work?

## Sources reviewed

All sources below were accessed 2026-07-19. They are official OpenAI Cookbook examples; their executable examples and recommendations are not universal platform guarantees.

- [Build Code Review with the Codex SDK](https://developers.openai.com/cookbook/examples/codex/build_code_review_with_codex_sdk)
- [Modernizing your Codebase with Codex](https://developers.openai.com/cookbook/examples/codex/code_modernization)
- [Codex Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide)
- [Build iterative repair loops with Codex](https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex)
- [Build an Agent Improvement Loop with Traces, Evals, and Codex](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)
