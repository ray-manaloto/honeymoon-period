# Adaptive orchestration

Use the repository-local `adaptive-orchestration` skill for long, multi-phase goals
whose plan or tracker projection may change as evidence arrives. This document owns
the durable policy; the skill routes agents through it.

## Goal record

At bootstrap, record the objective, authority sources, prohibited actions, completion
contract, branch/HEAD, dirty-tree ownership, and both research-lane statuses. Keep one
append-only change log in the governing durable artifact. Number entries monotonically
and include:

1. observed event and evidence;
2. assumption or prior state invalidated, or issue completed;
3. replacement decision;
4. effect on objective, scope, plan, tickets, tracker, or acceptance; and
5. any new authority boundary or residual risk.

Append before adapting downstream state. Correct an erroneous entry with a later entry;
never rewrite history. Product decisions still belong in the product specification or
ADR, and tracker mutations still require their own before/after evidence.

## Evidence and dependency gate

Run the two-lane preflight in `research-workflow.md`. Local diagnosis precedes new
research; current primary-source artifacts precede reruns. Use a bounded prototype only
for one unresolved uncertainty and retain the decision, not disposable code.

Prefer a maintained compatible dependency only when a deletion test proves that it
removes meaningful repository ownership while preserving canonical contracts,
provider neutrality, privacy, licensing, offline determinism, tests, and rollback.
Generic validation does not replace product-owned semantics. Reject or remove a pilot
whose custom policy recreates the deleted logic or whose coupling exceeds its deletion.

## Context and task selection

`docs/research/codex-context-lifecycle.md` owns the Smart, Watch, Transition, and unsafe
zones plus their non-numeric overrides. Record percentages only from one runtime event's
active usage and window. Stable Codex 0.144.6 hooks do not expose this percentage, so
zones are an operating policy, not a blocking hook.

Resume for the same objective and assumptions. Use direct children for bounded
independent questions. Fork only genuinely competing approaches whose writes are
isolated. Use a durable handoff plus a fresh task when the phase, objective, assumptions,
authority, acceptance contract, or context quality changes materially.

## Agent allocation

The root owns shared files, integration, Git, tracker mutation, and publication. Use at
most three direct children under `.codex/config.toml`'s four-thread/depth-one ceiling;
children do not delegate. Assign disjoint writing paths and concise evidence contracts.
After material integration, use fresh independent direct children for semantic
`ACCEPT`/`REJECT` and mechanical `PASS`/`FAIL` gates.

Configured capacity is not proof of live availability. Inspect the actual agent roster
before allocating, and adapt optional fan-out to preserve the final gates.

## Autonomous learning loop

Treat an iteration as one controller-admitted revision from reconciliation to a durable
checkpoint. For every material iteration:

1. Reconcile authority, HEAD, owned inputs, research status, budgets, and revision-bound
   evidence before mutation.
2. After material integration, obtain one fresh read-only standards/spec review while
   preserving fresh verifier and validator capacity.
3. Treat findings as evidence. Append the goal change log before adapting downstream
   state. When a finding exposes a durable recurring pattern, promote one focused entry
   under `docs/learning/` and add an enforcing guard in the same repair.
4. Make the smallest repair, add a focused regression, and rerun every invalidated gate.
   A shared revision change invalidates prior verifier and validator verdicts.
5. Continue automatically while the controller returns `run`, a distinct repair remains,
   and time, retry, repair-cycle, and direct-child budgets remain. Plans, handoffs, prior
   verdicts, and model confidence are evidence, never execution authority.
6. Before downstream state changes, record the iteration retrospective as `promoted`,
   `linked`, or `no-new-lesson`. Routine success may use `no-new-lesson` with a concrete
   reason; do not manufacture documentation for a non-recurring event.

Agent evidence has two separate controls. The root verifies provenance by copying the
fresh collaboration-agent output exactly and recording its task reference; the controller
then validates its report path, hash, leading verdict, revision, timestamp, and distinct
agent identity. This is an integrity and process boundary, not cryptographic proof of which
cooperating local process authored a caller-writable file. Model reports remain acceptance
evidence alongside deterministic aggregate and artifact checks; they never become execution
authority.

Only request a human interview after local diagnosis, repository evidence, relevant
primary research, and bounded independent agents cannot resolve genuine ambiguity. Ask
one deduplicated question. Credentials, consent, paid services, private data, signing,
deployment, destructive external effects, and designated human ceremonies remain
authority boundaries rather than ambiguity to be guessed through.

## Tracker ceremony

For an authorized reconciliation:

1. capture a fresh complete issue, relationship, label, Project-field, option, and item
   snapshot;
2. identify targets by stable logical marker plus current remote identifiers;
3. serialize writes through the root and re-read each precondition immediately before it;
4. capture every returned issue, database, node, relationship, and Project item ID;
5. perform a postcondition read after every write; and
6. re-read before retrying a timeout or ambiguous response.

Mutate only the authorized delta. Preserve historical items and unrelated issues.

## Greenfield debt gate

Treat the repository as greenfield unless an approved external contract proves otherwise.
Keep one canonical implementation path; do not preserve compatibility shims, aliases,
duplicate transports, artificial migration history, or transitional code for hypothetical
consumers. When a decision changes, sweep source, tests, generators, documentation,
project-local skills, agent guidance, examples, and prototypes in the same controlled
slice. Historical research and this append-only log may retain superseded facts only when
they are clearly labeled as such. Known avoidable debt blocks completion unless the user
explicitly accepts that debt as a product decision.

## Completion contract

Completion requires reconciled local and external state, focused and aggregate checks,
fresh independent verdicts, a protected-artifact audit, a recorded retrospective outcome,
an enforcing guard for every promoted lesson, logical commits, and only the authorized
publication. A green command does not substitute for semantic acceptance.

## Goal change log

This initial rollout log is append-only.

| Seq. | Date | Event and evidence | Goal or plan effect |
| ---: | --- | --- | --- |
| 1 | 2026-07-18 | Adopted `/tmp/honeymoon-period-next-goal-2026-07-18.md` as authority. | Objective, prohibitions, tracker authority, final gates, push, and ready-PR completion contract accepted unchanged. |
| 2 | 2026-07-18 | The copied checkout was detached at `5789642`, not the stated `b684776`; the source worktree at `b684776` proved that only the research index and context-lifecycle report were intentional, with the handoff hashes. | Backed up the copied tree, based the branch on `origin/main` `e7c5543`, recovered only the two verified research changes, and preserved the original backup at `/tmp/honeymoon-reconcile.TMm3Xf`. Scope unchanged. |
| 3 | 2026-07-18 | Codex 0.144.6 local help/features and official docs show unified exec is covered by the `Bash` hook matcher, while stable hooks still expose no live context percentage or slot reservation. | Refresh capability evidence; keep current stable feature flags, depth/thread limits, hook matcher, and unset compaction/tool-output limits. |
| 4 | 2026-07-18 | No Redocly executable was initially installed. An authorized pinned 2.39.0 local pilot parsed deterministically and rejected duplicate operation IDs, but accepted missing operation IDs and required `404`/`500` responses; recommended rules rejected the canonical contract for unrelated policy. | Reject Redocly: it would move the Worker-specific matrix into custom policy and add 367 packages. Removed the dependency and retained the existing semantic checker. |
| 5 | 2026-07-18 | Fresh GitHub reads show #16–#18 already closed and Project `Done`, superseding the 2026-07-17 drift report; only #19–#21 remain open `Todo`. | Remove obsolete #16–#18 reconciliation from the plan. Limit tracker writes to the approved #19 specification/tickets and leave #20/#21 unchanged. |
| 6 | 2026-07-18 | #19 was published as the approved specification, then closed `Completed` and set Project `Done`. Native child tickets #23, #24, and #25 were created `ready-for-agent`/`Todo` with dependency chain #23 → #24 → #25; map #1 was refreshed. | Mark specification/ticketing and tracker reconciliation complete without implementing the product slice. #23 becomes the implementation frontier; #20/#21 remain unchanged questions. |
| 7 | 2026-07-18 | Independent integrated review found missing legacy-write retry semantics, no deterministic same-time replay boundary, the obsolete `codex_fanout` key, and overclaims in the Redocly and tracker evidence. | Specify legacy no-op/event behavior and inclusive sequence snapshots in #19/#23/#24; enforce the actual `enable_fanout` key; correct research metadata and retain an explicit tracker-audit limitation. Final independent gates must evaluate the corrected state. |
| 8 | 2026-07-19 | The delegated Symphony goal arrived in a copied tree detached at `5789642` while current `origin/main` is `2d287d9`. An alternate-index comparison showed the apparent dirty research and implementation set was an older pre-merge projection or files now present upstream, with no newer Symphony/autonomy report; the only extra path was an empty `.artifacts/mde-events.jsonl`. The complete seed is recoverable from stash `seeded-tree-before-symphony-reconcile-2026-07-19` and `/tmp/honeymoon-symphony-reconcile.QGKEkZ`. | Base `codex/symphony-conformance-controller` on `origin/main` `2d287d9`; preserve upstream adaptive-orchestration research as authority, do not reapply obsolete seed contents, and proceed with the authorized Symphony/Cookbook research and smallest local controller. Research and Last30Days lanes remain reuse-first pending their explicit artifact audit; scope and prohibitions are unchanged. |
| 9 | 2026-07-19 | The source delegation worktree at `a8fb` contained six intentional untracked autonomy/Cookbook reports, research-index edits, two goal-log entries, and a fresh matching Last30Days report that were absent from the copied tree inspected for entry 8. | Correct entry 8 without rewriting it: preserve the complete source-worktree research set verbatim, reuse the saved Last30Days evidence without new quota, and use the pinned Symphony/Cookbook synthesis as implementation authority. |
| 10 | 2026-07-19 | OpenAI released Symphony `v0.0.1`, a draft Codex-orchestration specification with tracker-driven scheduling, repository-owned `WORKFLOW.md`, isolated workspaces, process-local single-authority claims, reconciliation, bounded concurrency, and retry. Its preview retains in-memory scheduler/blocked state and supplies no TTL worktree/HEAD lease or semantic acceptance contract. | Treat Symphony as the primary upstream reference for the thin controller and test only the repository-specific authority, lease, durability, and acceptance gaps. Do not install or run the preview, add Linear credentials, or weaken existing approval and independent-verdict gates without separate authority. |
| 11 | 2026-07-19 | A pinned source audit of all eight requested OpenAI Cookbook articles found no hidden committed Markdown companion bundle; most named `.md` files are generated example artifacts. It exposed missing explicit treatment of plan retrospectives, revision-bound review evidence, conditional Responses `phase` preservation, and non-authoritative handoffs. | Add the companion-file provenance ledger and carry those four controls into the autonomy synthesis. Preserve the active goal record and lease as the only execution authority; generated plans and handoffs remain evidence. |
| 12 | 2026-07-19 | The restored research and focused red-green fault tests resolved the controller seam: a tracked active JSON record and append-only redacted JSONL history, an ignored atomic fenced lease directory, and a public Node CLI. The app exposes a same-thread heartbeat automation API, so no cron, daemon, Stop-hook loop, Linear adapter, or Symphony runtime is needed. | Implement the Symphony-derived subset with a 5-minute lease TTL, 30-minute run deadline, two retries, one repair cycle, and at most three direct children. Use a 10-minute same-thread heartbeat only as a wake trigger; the CLI remains execution authority. |
| 13 | 2026-07-19 | Two independent post-integration reviews rejected the first controller revision: the lease assertion was not a compare-and-swap mutation boundary, crash residues and stolen tokens could strand `running`, tracked state retained free-form objective/question and an absolute worktree, completion accepted self-attested hashes/verdicts, owned-input failures collided, numeric budgets lacked maxima, and the heartbeat had no observed-wake evidence. | Preserve the approved scope but strengthen the same thin controller before publication: serialize epoch-conditioned mutations with a crash-expiring mutex, keep the lease owner immutable, reconcile residues and run authority, store only tracked fingerprints, validate bounded in-root files and concrete revision-bound evidence records, add the missing fault injections, and require an automation-registry read plus observed command-first wake before the final gates. |
| 14 | 2026-07-19 | A real Codex Desktop heartbeat resumed the same task after the root yielded. Its first repository command invoked `goal:continue` with a unique wake token; the controller admitted epoch 1 as `running`, and the root checkpointed it as `waiting`. The automation registry was reread after restoring the approved 10-minute cadence, with configuration hash `40c4dcc6fbbdc652c32d1e50a684ef49767234f5b68d9af5a9d2454498991fec`. | Mark native automatic continuation and wake-only admission as observed rather than asserted. Keep the 10-minute heartbeat active through final publication; the remaining plan is final checks, fresh independent gates, controller completion evidence, push, and one ready PR. Scope and prohibitions remain unchanged. |
| 15 | 2026-07-19 | Fresh final verifier and validator gates rejected revision `cabcae3d…79e1`: a crash between mutation-directory creation and owner-file persistence strands an ownerless lock, while checkpoint history is durable before the corresponding active-state commit. The verifier also found that the reused matching Last30Days raw report was retained but not linked from the synthesis. | Keep the implementation objective and acceptance contract unchanged. Before new final gates, recover ownerless mutation locks by bounded age, commit checkpoints through a lease-local journal with startup replay, add crash-point fault injection, and link the reused Last30Days artifact. The rejected verdicts remain evidence and do not authorize completion or publication. |
| 16 | 2026-07-19 | The replacement semantic gate rejected revision `f665a71…fa57ad`: the 30-second mutation mutex could be recovered from a paused-but-live owner, and the former owner's unconditional cleanup could delete a successor lock. The replacement validator's separate `FAIL` was an instruction error that treated the controller fingerprint as a Git object and ran no validation. | Preserve the TTL on the work lease, but bind the short local mutation mutex to a PID start identity and token-checked release so only a dead/reused process or an aged ownerless initialization can be recovered. Add a live-owner stale-time fault test, rerun the aggregate, and obtain fresh gates with both the authority fingerprint and Git commit identified explicitly. |
| 17 | 2026-07-19 | The user approved the recommended next sequence. PR #27 merged cleanly to `origin/main` as `c2302c7`; issue #23 remains open, `ready-for-agent`, and unblocked under the approved #19 contract. The clean branch `codex/preference-history-23` was created from that merge. | Close the Symphony-controller publication phase and start a fresh controlled goal for #23. Reuse the approved specification and existing research before either research lane is rerun; implement only #23's immutable preference-change tracer bullet, retain #24/#25 dependencies, and keep deployment, production data/credentials, paid services, native distribution, and Shortcut rebuild/signing outside authority. |
| 18 | 2026-07-19 | The user explicitly rejected retaining legacy code because this is a new project and required zero avoidable technical debt across source, tests, generated surfaces, project documentation, and Codex guidance. This supersedes #19/#23's earlier compatibility requirement for `PUT /v1/honeymoon-periods/{id}/preference`; append-only historical records remain intact as evidence rather than being rewritten. | Deliver one canonical client-request-ID preference-change mutation and remove the obsolete endpoint, schemas, provider methods, tests, and prescriptive documentation. Update the GitHub issue contracts and repository authority before integration; do not preserve shims, aliases, dual-write paths, or stale Codex instructions. All other #23 scope limits and prohibitions remain unchanged. |
| 19 | 2026-07-19 | Fresh final semantic review found that #23's required two-lane research preflight was only implicit in entry 17, not recorded as the two explicit issue-scoped status lines required by `research-workflow.md`. Research: not needed — #23 is deterministic execution of the approved #19/#23 contract and canonical API-first architecture in `docs/product/web-mvp-plan.md`, with no unresolved external fact. Last30Days: not needed — no recent practitioner recommendation could change this bounded contract, local persistence, generated-client, or regression-test implementation. | Correct the process record before downstream completion state. Do not rerun either lane or consume browser cookies, provider quota, credentials, or external research because the repository-owned specification, existing architecture evidence, and locally reproduced tests fully determine the implementation. Invalidate the prior verifier verdict, bind the explicit preflight to the active goal, rerun the current-revision aggregate, and obtain fresh independent gates. |
| 20 | 2026-07-19 | Issue #24 required two semantic repair passes after green mechanical checks: a two-axis review found recorded-policy, detail-consistency, duplicated-explanation, and phone-list evidence gaps, then a fresh verifier found the remaining split-read snapshot risk. The user directed that independent subagents own review, the loop learn from every iteration, autonomous work continue until `/goal` completion, and human interviews occur only when research and bounded agent approaches cannot resolve genuine ambiguity. Research: reused — `docs/research/codex-autonomy-quality-loops.md` and `docs/research/codex-autonomous-goal-continuation.md` already define the bounded review-repair-validation and persisted-learning pattern. Last30Days: reused — the retained root-owned autonomy report already covers current practitioner failure modes. | Start `codex/self-learning-autonomy-loop` from `origin/main`. Promote the observed recurrence into the learning registry, adaptive-orchestration guide and skill, continuation instructions, checker, and tests. Make fresh revision-bound subagent review the default on every material loop; automatically repair and rerun while authority and budgets remain. Adopt a conditional autonomous merge gate for exact reviewed PR heads, while credentials, consent, paid services, private data, signing, deployment, destructive external effects, and other human-only ceremonies remain explicit boundaries. |
| 21 | 2026-07-19 | The first fresh standards review of the self-learning slice found that prose markers did not make controller completion require its own reviewer record or classified retrospective, the merge mutation was not atomically head-matched, the new lesson was absent from owned inputs, exhausted attempts could noop before goal completion, research-index statuses were stale, and the previously named Last30Days file was absent. The present retained report is `.build/research/last30days/openai-symphony-codex-orchestration-release-adoption-reliability-limitations-raw.md`. | Retrospective: `promoted`. Extend the controller schema and fault tests, require three distinct fresh review agents, add a serialized owned-input adoption action, emit one interview question only after bounded exhaustion, use `gh pr merge --match-head-commit`, correct the research links/index, and invalidate all prior gates. Entry 20 remains historical and is corrected by this entry rather than rewritten. |
| 22 | 2026-07-19 | The first post-repair validator passed the focused controller/tooling, protected-artifact, shell, Python, and hook checks but `npm run check` stopped at Biome because the new owned-input event call was not canonically wrapped. The paired verifier rejected the same revision on that independently reported aggregate failure; its overlapping controller-test run was stopped after the validator had already completed the same suite successfully. | Retrospective: `linked` to the zero-debt and automated-guard policy. Apply the mechanical formatter-only repair, commit it, reconcile to a new revision, and rerun all three fresh gates. Do not reuse the otherwise favorable semantic evidence from the rejected revision. |
| 23 | 2026-07-19 | The fresh semantic verifier for the formatted revision found that automatic conversion of any unchanged failure or exhausted repair/retry budget into an interview manufactured a question without proving genuine ambiguity or exhausted diagnosis, research, and bounded-agent approaches. | Retrospective: `promoted` into the current lesson and controller tests. Keep terminal failures explicit and non-complete, but silent. Use the existing `blocked` checkpoint only when the root supplies one evidence-backed genuine-ambiguity question; retain its deduplication. Invalidate all gates for the corrected revision. |
| 24 | 2026-07-19 | The same fresh verifier found that controller completion accepted a bare retrospective enum, so `no-new-lesson` could omit its concrete reason and other outcomes could omit their durable evidence reference. | Retrospective: `promoted`. Require a revision-bound retrospective evidence record whose outcome matches the checkpoint, whose evidence reference is safe and non-empty, and whose `no-new-lesson` outcome carries a concrete reason code. Persist only its hash and enumerated outcome in tracked evidence; extend focused rejection tests and invalidate all gates. |
| 25 | 2026-07-19 | The parallel standards reviewer confirmed that removing automatic exhaustion-to-question also removes its stale-writer/double-emission race, and found that `adopt-input` reused an identifier validator that rejected leading-dot repository paths such as `.agents/` and `.codex/`. | Retrospective: `promoted` into the controller regression suite. Add a path-specific validator that permits safe relative dot-prefixed files while rejecting absolute paths and parent traversal; prove adoption and revision invalidation with a `.agents/` fixture. Invalidate all gates. |
| 26 | 2026-07-19 | The next fresh verifier found that completion records still reduced independent gate results to caller-asserted agent IDs, freshness booleans, and verdict strings. Although the root had real subagent reports, the controller did not bind those reports as inspectable artifacts. | Retrospective: `promoted`. Require every reviewer/verifier/validator record to name a collaboration-agent source, task reference, in-root report path, and SHA-256 report hash; verify the report file hash and leading verdict before completion. Keep root-owned integration and acknowledge that repository-local controls prevent accidental self-certification but cannot create a cryptographic OS trust boundary between cooperating Codex processes. Invalidate all gates. |
| 27 | 2026-07-19 | The focused Biome preflight for the report-binding repair rejected two newly long single-line expressions before commit or fresh gates. | Retrospective: `linked` to entry 22 and the zero-debt formatter guard. Apply only Biome's canonical wrapping, rerun the focused behavioral tests, and keep all prior gates invalidated. |
| 28 | 2026-07-19 | The next verifier correctly observed that local report hashing proves integrity after integration, not cryptographic producer identity, and incorrectly required the active goal to be complete before supplying the verdict that completion itself consumes. | Retrospective: `promoted` into the trust-boundary and verifier instructions. State the achievable split explicitly: the root verifies collaboration-output provenance, the controller binds its artifact and revision, and deterministic checks remain independent. Final agents evaluate a running candidate revision and must not reject merely because their not-yet-recorded verdict is an input to the subsequent complete checkpoint. Invalidate all gates for the clarified revision. |
| 29 | 2026-07-19 | The parallel standards reviewer found that evidence records were bound to the controller's authority revision, whose intentional state-only-commit filtering differs from the exact Git/remote head required by the merge gate. The live example had actual HEAD `a28a313…` while the revision's authority head remained `3abb0df…`. | Retrospective: `promoted`. Require every completion evidence record to carry the exact current Git HEAD in addition to the controller revision fingerprint, reject any mismatch, and retain the lease's existing exact-HEAD fence. Add a stale-head record regression and invalidate all gates. |
| 30 | 2026-07-19 | The next verifier found a pre-existing mutation-mutex initialization race: the canonical `.mutation` directory was published before `owner.json`, so a live initializer paused beyond the ownerless-recovery age could be fenced and later recreate/overwrite a successor lock. | Retrospective: `promoted` into the controller fault suite. Prepare a tokenized candidate directory and durable owner record first, atomically rename the complete directory into the canonical mutex path, and add a paused-initializer concurrency test proving the canonical mutex is never visible ownerless. Invalidate all gates. |
| 31 | 2026-07-19 | The parallel standards reviewer found that `adopt-input` captured active state before acquiring the mutex, so delayed differing payloads could lose the first adopted path, and that SIGKILL before candidate-directory publication left ignored mutation candidates without reconciliation. | Retrospective: `promoted`. Reread active state inside the mutation critical section; sweep dead or aged malformed prepared candidates before acquisition; add concurrent differing-input and pre-publication crash-recovery tests. Invalidate the otherwise favorable ACCEPT/PASS revision. |
| 32 | 2026-07-19 | The next verifier found the same stale-read class in `reconcile`: a reconcile queued with pre-checkpoint `running` state could acquire the mutex after completion, observe no lease, and overwrite `complete` with `ready`. | Retrospective: `promoted`. Reread active state inside every mutation-locked reconcile, acquire, renew, and checkpoint callback; move waiting/retry admission decisions into the locked acquire path; add a reconcile-versus-complete interleaving regression. Invalidate all gates. |
| 33 | 2026-07-19 | The validator for the superseded revision reproduced that concurrent differing `adopt-input` calls could return `mutation-contention`; its aggregate was interrupted while that focused controller suite remained unresolved. The subsequent in-lock-reread repair prevents lost updates but initially left adoption without a bounded local contention retry and introduced formatter warnings before commit. | Retrospective: `linked` to entries 22, 31, and the bounded-retry policy. Give only `adopt-input` a fixed 500 ms maximum mutex-contention retry window, retain in-lock rereads, apply canonical formatting, and rerun focused concurrency/admission tests before fresh gates. |
| 34 | 2026-07-19 | The continuing standards review found the final stale-write path: after claiming blocked-question emission, `wake` set `question.emitted` by writing its pre-mutex goal snapshot, which could restore state invalidated by a concurrent reconcile. | Retrospective: `promoted`. After the filesystem emission claim, acquire the mutation mutex, reread active state, require the same blocked-question fingerprint, and only then persist `emitted`; otherwise discard the claim and return `question-invalidated`. Add a question-emission-versus-revision-change interleaving test and invalidate all gates. |
| 35 | 2026-07-19 | After the fully fenced revision earned semantic `ACCEPT` and mechanical `PASS`, the fresh standards gate rejected broader controller debt: caller-injected production time and missing checkpoint deadline enforcement; raw wake/owner capabilities in tracked state; initialization/completion schemas that did not structurally carry the documented authority, preflight, prohibition, and goal-specific completion requirements; retrospectives enforced only at final completion; read-then-rename stale-mutex recovery; and non-checkpoint state/history pairs without journal replay. | Retrospective: `promoted`. Keep the goal open. Repair these as versioned controller invariants with fault tests, without expanding into external services or protected ceremonies. The favorable ACCEPT/PASS revision remains evidence but cannot authorize completion while the independent standards gate fails. |
| 36 | 2026-07-19 | Replacing the legacy directory mutex exposed two final protocol facts: a lock file inside the tracked goal directory can itself change the authority revision in fixtures, and exactly-once question delivery cannot be proven across a process crash without consumer acknowledgement. | Retrospective: `linked` to entries 30, 34, and 35. Put the OS lock in the worktree-specific Git metadata path, retain only ephemeral session files under the ignored goal directory, retry the same fingerprinted question after its TTL, and require an explicit fingerprint-bound resolution after operator input. Add behavioral guards and remove every legacy mutex path and test. |
| 37 | 2026-07-19 | The first schema-v2 standards review returned `FAIL` on revision `54515c0…`: owned-input adoption could bypass the iteration baseline; branch and external authority were echoed rather than enforced; ambiguity resolution omitted the operator decision reference; some reconcile pairs remained outside the journal; configuration retained a legacy raw wake token; evidence references were syntactic; final completion omitted the iteration ledger; and failed lock-helper startup could leave sessions. The root copied the exact report, bound its hash, and successfully recorded the revision's `linked` retrospective through `record-iteration` before the repair. | Keep the scope unchanged. Enforce branch and evidence postconditions, require real in-root authority references and not-needed reasons, bind operator resolution to a revision record, journal reconcile transitions, delete legacy capability fields during configuration, advance adoption baselines, populate the final ledger, sweep dead sessions, and rerun every gate on the repaired revision. |
| 38 | 2026-07-19 | The repaired schema revision passed focused behavioral checks, but the aggregate stopped at one Biome quote-format diagnostic in the orchestration checker. A fresh bounded standards agent reproduced exactly that issue and found no other scoped concern; its `FAIL` and `linked` retrospective were recorded before repair. | Apply only canonical formatting, rerun the aggregate, and invalidate the revision's prior focused evidence. This is linked to entries 22, 27, and 33 rather than promoted as a new lesson. |
| 39 | 2026-07-19 | The exact-head revision passed the aggregate and mechanical gate, but fresh semantic and standards agents rejected remaining authority gaps: required references could be nonexistent; the detached helper, rather than the mutator, held the OS lock; leases omitted branch/revision; legacy `configure` could rewrite completed authority; retry/question transitions bypassed the generic journal; and the merge policy lacked a stable final-state sequence. The exact standards report and a `promoted` retrospective were recorded through the controller before repair. | Replace the helper protocol with `flock` inherited directly by the exec'd mutator; bind leases to the complete revision; delete `configure`; use one existing in-root reference validator; journal every tracked transition; add negative/fault tests; and define a two-phase source-completion then immutable exact-head publication ceremony. Invalidate the favorable aggregate/PASS evidence and rerun all gates. |
| 40 | 2026-07-19 | During entry 39's repair, a scheduled wake reconciled the intentionally dirty root worktree after the lease expired. The controller first adopted the intermediate owned-input manifest, then blocked for dirtiness, and later demanded an iteration review for that never-admitted fingerprint. | Retrospective: `promoted` within the already recorded entry 39 repair. Check dirty conflicts before revision adoption and apply the learning transition gate only to revisions that received a durable `run-started` admission. Add a regression proving dirty work cannot become an iteration baseline. |

## Initial tracker reconciliation evidence

Before the first write, #19 was open with `question` and `needs-triage`, Project
`Todo`, issue node `I_kwDOTZFLac8AAAABJIYmGg`, and Project item
`PVTI_lADODYqwA84Bdc84zgzIl5Y`. Searches for all four logical keys returned no
matches. #16–#18 were already closed/`Done`; #20 and #21 were open `Todo` questions.

The serialized writes returned:

| Issue | Database / node ID | Project item | Relationship |
| --- | --- | --- | --- |
| #23 | `4920311758` / `I_kwDOTZFLac8AAAABJUX_zg` | `PVTI_lADODYqwA84Bdc84zgzTaxE` | Native child of #19; no blocker |
| #24 | `4920313575` / `I_kwDOTZFLac8AAAABJUYG5w` | `PVTI_lADODYqwA84Bdc84zgzTa38` | Native child of #19; blocked by #23 |
| #25 | `4920315942` / `I_kwDOTZFLac8AAAABJUYQJg` | `PVTI_lADODYqwA84Bdc84zgzTa-c` | Native child of #19; blocked by #24 |

Postcondition reads showed #19 closed `Completed` and Project `Done`; #23–#25
open with only `ready-for-agent` and Project `Todo`; all three native child and
dependency edges present; and #20/#21 unchanged. Closed map #1 now records #19
as approved and lists #23–#25 as the implementation frontier.

The ordered ceremony was executed through root-serialized GitHub reads and writes:
precondition reads and logical-key searches; #19 body/title/label update and reread;
one-at-a-time issue creation with returned IDs; one-at-a-time Project insertion/status
update and reread; native child and dependency writes with relationship rereads; #19
closure/Done transition; map #1 update; and final #19–#25/#20/#21/Project reads. The
individual raw command responses were not retained as a tracked transcript, so this
summary and the identifiers above do not prove every intermediate postcondition after
the fact. The final remote state is re-readable, but historical preconditions cannot be
reconstructed from current GitHub state alone.
