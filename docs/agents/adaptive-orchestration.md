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

## Completion contract

Completion requires reconciled local and external state, focused and aggregate checks,
fresh independent verdicts, a protected-artifact audit, logical commits, and only the
authorized publication. A green command does not substitute for semantic acceptance.

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
