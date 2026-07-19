# OpenAI Cookbook companion-Markdown inventory

- **Question:** Did the eight requested OpenAI Cookbook sources have linked,
  colocated, generated, or external Markdown files whose orchestration guidance
  was omitted from the autonomy research?
- **Status:** Complete source-file inventory; missing implications have been
  integrated into the autonomy research. No implementation, dependency,
  credential, scheduler, Git, or external-system authority follows.
- **Accessed / last verified:** 2026-07-19.
- **Research:** linked — audited `openai/openai-cookbook` `main` at commit
  `9fa55b8cecba8c9c543d11f2cf08339a29112be7` and classified files referenced by
  the eight user-supplied sources.
- **Last30Days:** not needed — this is a deterministic inventory of owning
  OpenAI source files at a pinned commit; community evidence cannot establish
  file existence or provenance.

## Answer

The earlier reports reviewed all eight article or notebook pages, but they did
not include a file-by-file companion ledger. The pinned source audit found no
hidden committed Markdown/MDX bundle behind the notebooks. Most additional
Markdown filenames shown in the articles are **runtime artifacts that the
example creates**, not separately downloadable Cookbook files.

One material committed companion is reused across the set:
[`articles/codex_exec_plans.md`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/articles/codex_exec_plans.md).
It was already reviewed. The audit nevertheless found several implications that
needed to be made explicit in the autonomy synthesis: retain outcomes and
retrospective evidence, bind reviews to an input revision and invalidate stale
work, preserve response `phase` metadata only when reconstructing supported API
history, treat a generated `codex_handoff.md` as evidence rather than authority,
and keep planning/design/validation documents separate from the executable goal
record and lease.

## Pinned source and companion ledger

| Requested source | Pinned owning source | Markdown/MDX companion result |
| --- | --- | --- |
| Building Consistent Workflows | [`building_consistent_workflows_codex_cli_agents_sdk.ipynb`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk.ipynb) | No committed companion. `REQUIREMENTS.md`, `TEST.md`, `AGENT_TASKS.md`, `design_spec.md`, `wireframe.md`, and `TEST_PLAN.md` are generated demo artifacts. Their relevant pattern is named artifact gates between bounded roles. |
| Using PLANS.md | [`articles/codex_exec_plans.md`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/articles/codex_exec_plans.md) | The article itself contains the example `AGENTS.md` instruction and full `PLANS.md` template. Its `AGENTS.md` link redirects to the independent `agentsmd/agents.md` reference repository, not a separate Cookbook orchestration contract. |
| Using Goals in Codex | [`using_goals_in_codex.ipynb`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/using_goals_in_codex.ipynb) | No material Markdown/MDX companion; only embedded image attachments. |
| Iterative repair loops | [`Build_iterative_repair_loops_with_Codex.ipynb`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/Build_iterative_repair_loops_with_Codex.ipynb) | No Markdown companion. Three colocated pre-repair notebooks are copied fixtures, demonstrating isolated repair targets rather than controller policy. |
| Code review with Codex SDK | [`build_code_review_with_codex_sdk.md`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/build_code_review_with_codex_sdk.md) | No committed companion. `review_prompt.md` and generated `codex-prompt.md` are deployment artifacts the reader supplies. The workflow additionally binds work to PR revisions and cancels stale in-progress work. |
| Code modernization | [`code_modernization.md`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/code_modernization.md) | Links the committed PLANS article. `pilot_execplan.md`, overview/design/validation reports, templates, and usage guide are artifacts the tutorial instructs Codex to generate, not source companions. |
| Codex prompting guide | [`codex_prompting_guide.ipynb`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/gpt-5/codex_prompting_guide.ipynb) | No colocated Markdown/MDX companion. `AGENTS.md` names describe injected repository instructions. The linked default model prompt is an external Codex source file, not a Cookbook companion or stable project policy. |
| Agent improvement loop | [`agent_improvement_loop.ipynb`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/agents_sdk/agent_improvement_loop.ipynb) | No committed Markdown companion. Diligence documents and outputs such as `summary_answer.md`, `open_questions.md`, and `codex_handoff.md` are synthetic/generated runtime artifacts. |

## Material implications carried forward

1. **Close living plans with outcomes and retrospective evidence.** The PLANS
   template makes this a first-class section. It belongs in the append-only
   learning/evidence trail, not only in a final chat response.
2. **Bind review evidence to its input revision.** The code-review example uses
   concurrency cancellation and explicit base/head references. A local
   controller should invalidate a review or validation record when the observed
   HEAD or owned input manifest changes.
3. **Keep generated handoffs non-authoritative.** `codex_handoff.md` is a useful
   shape for ranked recommendations, evidence, and validation guidance, but the
   active goal record and lease remain the execution authority.
4. **Preserve API history metadata only at the matching integration seam.** The
   prompting guide's `phase` requirement applies when an Adapter reconstructs
   supported Responses API history. Native Codex task continuation does not
   justify duplicating the conversation in repository state.
5. **Separate planning documents from execution authority.** The modernization
   example's plan, overview, design, and validation split is valuable for large
   work. None of those files should acquire work merely by existing; admission
   still requires the authorized goal and lease.

## Adjacent and external material

- [`secure_quality_gitlab.md`](https://github.com/openai/openai-cookbook/blob/9fa55b8cecba8c9c543d11f2cf08339a29112be7/examples/codex/secure_quality_gitlab.md)
  is an adjacent separate article, not a companion to the requested eight. It
  corroborates structured findings, rule-based detection authority, and
  validate-before-patch, but its credential-bearing full-auto GitLab workflow
  is outside the local pilot.
- The prompting guide links an external Codex default-prompt Markdown file.
  Treat it as version-specific implementation evidence, not a stable policy or
  repository dependency.
- Promptfoo, HALO, Codex Action, Structured Outputs, and Responses compaction
  links are external documentation or third-party systems, not overlooked
  Cookbook Markdown companions.

## Conclusion

No material committed Markdown companion was omitted. The coverage defect was
the absence of an explicit provenance ledger and several file-level
implications, now corrected. Generated example artifacts remain useful schema
patterns but are not dependencies, product contracts, or autonomous authority.
