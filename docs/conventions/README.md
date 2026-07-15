# Repository conventions

## Current source layout

- `shortcut/` — canonical Cherri source for the baseline Share Sheet Shortcut.
- `scripts/` — zsh build orchestration and Python structural verification.
- `dist/` — generated signed Shortcut deliverables.
- `.build/` — disposable compiler checkout and generated intermediates.
- `.codex/` — trusted project configuration, custom agents, and deterministic hooks.
- `docs/` — product context, cited research, decisions, evidence, and setup guides.

## Style

- Zsh scripts use `#!/bin/zsh`, `set -euo pipefail`, quoted paths, and a computed repository root.
- Python uses the standard library unless a dependency is justified, type hints for public helpers, and no writes outside an explicitly assigned path.
- Cherri comments should explain platform workarounds, normalization, and fallbacks rather than restating actions.
- Markdown uses descriptive headings, relative links, concise claims, and evidence status for unstable research.
- Defer Swift/SwiftUI formatting, lint, and target conventions until an Xcode project exists.

## Generated files

Never hand-edit generated plist, processed Cherri, unsigned Shortcut, or `.build` output. Change canonical source or scripts, rebuild, then verify. Commit `dist/*.shortcut` only as a deliberate public deliverable paired with its source change.

## Research contract

Each report states its question, status, last-verified date, primary sources, verified findings, inferences, product impact, open questions, and related decision/spec. Current pricing, availability, APIs, and policies require live revalidation.

## Commits and pull requests

Use small commits with an imperative subject. Link the governing issue when one exists. PRs describe behavior, verification, privacy/data impact, and screenshots for material UI changes. External PRs are reviewed but not placed in the automated issue-triage queue.

## Codex dependency scope

Project behavior must be reproducible from tracked repository configuration.
Install reusable workflows under `.agents/skills`, declare MCP servers and
agent roles under `.codex`, and document vendored upstream versions. Do not
rely on user-global skills, MCP servers, rules, hooks, or enabled plugins.
