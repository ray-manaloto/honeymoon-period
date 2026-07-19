# Project-local agent skills

Codex discovers these skills from `.agents/skills`. Repository dependencies are pinned and installed at project scope; do not depend on user-global skill state.

## Installation policy

Use GitHub CLI's native skill command:

```sh
gh skill install OWNER/REPOSITORY PATH/TO/SKILL.md \
  --agent codex --scope project --pin COMMIT_SHA
```

Preview the exact source first, retain the injected `github-*` metadata, inspect licenses, and never use `--scope user`. Update one dependency intentionally and review its complete diff before accepting it.

## Web MVP skills

| Skill | Purpose | Source |
| --- | --- | --- |
| `cloudflare` | Current Workers, D1, bindings, testing, and deployment guidance | `cloudflare/skills@70215303d44a81a0db3219428f4825b604fc6061` |
| `react-admin` | Official provider, resource, form, auth, and composition practices | `marmelab/react-admin@e1beaa2520de46e109236483876df50537c18294` |
| `react-best-practices` | React performance and generation review rules | `openai/plugins@11c74d6ba24d3a6d48f54a194cd00ef3beea18f9` |
| `frontend-testing-debugging` | Browser-first rendered UI diagnosis with Playwright fallback | `openai/plugins@11c74d6ba24d3a6d48f54a194cd00ef3beea18f9` |
| `playwright-cli` | Official browser exploration and Playwright test generation/debugging workflow | `microsoft/playwright-cli@eee5a185c98e6b04d88f580d45a854e9692ab50b` |

## Research discovery skills

| Skill | Purpose | Source |
| --- | --- | --- |
| `research` | Own one primary-source, cited report for material external uncertainty | `mattpocock/skills@v1.1.0` (tree `06c848c1a1f3ae7afd88f040f73a8f3efee3494d`) |
| `last30days` | Supplement primary-source research with recent community, social, news, and repository signals | `mvanhorn/last30days-skill@249c7a4c040558a903d6838dee31012980d4946d` |
| `research-workflow-architecture` | Orchestrate independent workflow-architecture reports, evidence-proportional synthesis, and fresh semantic/mechanical gates | Project-authored |
| `adaptive-orchestration` | Adapt long-running goals through evidence, durable change history, bounded agents, safe handoffs, and tracker reconciliation | Project-authored |

Use `research` and `last30days` through the mandatory routing and reuse contract in
[`docs/agents/research-workflow.md`](../../docs/agents/research-workflow.md).
The root runs each required lane once; implementers consume the resulting
artifacts instead of repeating searches. `last30days` is a discovery aid, not
technical authority. Keep its outputs in `.build/research/last30days` and verify
consequential findings against owning sources. Its optional browser-cookie
access, paid/PAYG providers, credential changes, tool installation, user-home
writes, and public publishing are outside the default authorization boundary.

Matt Pocock engineering/productivity skills remain pinned per their frontmatter. OpenAI Build iOS Apps attribution and update policy remain in [BUILD_IOS_APPS.md](BUILD_IOS_APPS.md).

ChatGPT Sites and Browser are app/plugin surfaces rather than repository skill directories. Sites is optional for visual exploration. Browser/CDP is preferred for interactive localhost QA when installed and explicitly approved; committed Playwright tests remain authoritative.

## Repository-local adaptations

The pinned upstream metadata remains recorded in each vendored skill. This
repository carries narrow local adaptations learned during the web MVP audit:

- `implement` makes commits conditional on higher-priority authorization;
- `code-review` supports intentionally dirty trees with untracked source and
  the repository's three-child/final-verdict constraint; and
- `frontend-testing-debugging` defers screenshot calls to the selected Browser
  runtime documentation and handles duplicate hidden responsive controls.

Review these overlays when updating the upstream pins and reapply only the
parts still enforced by `AGENTS.md` and `docs/learning/`.

## Evaluated but not installed

- Expo's official skills remain relevant only if a packaged cross-platform bridge is selected; the approved destination is web first and native SwiftUI later.
- shadcn and OpenAI's visual frontend builder introduce a competing UI system or mandatory image-concept workflow; React-admin/Material UI owns the MVP.
- No first-party Vite or OpenAPI Generator skill was found in the reviewed GitHub skill catalog. Use their current official documentation and keep generator configuration in the repository.
- Sites and Browser cannot be installed into `.agents/skills`; enable them through the ChatGPT app only when their app-level scope is acceptable.
