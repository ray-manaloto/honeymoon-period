# MCP and Agent Skills ecosystem for project automation

- **Question:** Which existing MCP servers, tools, services, and skills should
  the proposed `honeymoon-period-automation` plugin reuse, pilot, or reject;
  does any missing capability justify a custom MCP server; and does the planned
  four-skill structure follow the Agent Skills specification?
- **Status:** Research complete; recommendations require incorporation into the
  approved plan before implementation.
- **Last verified:** 2026-07-16

## Conclusion

Do not build a custom MCP server for version 1.

Keep the already-pinned **XcodeBuildMCP** server, and pilot the official
**Appium MCP** server after the full-Xcode checkpoint. Those are the only two
MCP integrations that add a justified stateful tool surface. The remaining
lanes are better served by capabilities already selected by the project:

- `/usr/bin/shortcuts`, Cherri, and Appium Mac2 for Shortcut runtime and UI;
- the pinned Playwright CLI skill plus committed Playwright Test for browser
  proof and recording;
- the official OpenAI Screenshot skill plus a thin ScreenCaptureKit command for
  exact-window Mac evidence;
- Wrangler, the Workers Vitest integration, D1 migrations, generated OpenAPI
  validators, and contract tests for the local API;
- Dependabot, GitHub Actions, the `gh` CLI, and the installed GitHub skill for
  update automation; and
- project skills, hooks, scripts, and agent profiles for orchestration.

The search found one real missing implementation capability: strict,
single-window Mac **video**. It does not justify MCP. A deterministic command
owned by one workflow has a smaller privilege and schema surface than a
long-lived server. Search results from the official MCP Registry contained no
server matching `ScreenCaptureKit`, `screen recording`, or `window recording`
on the verification date. The Registry itself cautions that it authenticates
namespaces and hosts metadata but delegates code security assessment to package
registries and downstream curators; a listing is discovery evidence, not an
approval. [MCP Registry trust model](https://modelcontextprotocol.io/registry/about)

## Recommendation matrix

| Capability | Recommendation | Reason |
| --- | --- | --- |
| XcodeBuildMCP `2.6.2` | **Keep** | Already pinned project-locally and supplies Xcode, Simulator, semantic UI, logs, debugging, and Simulator video. |
| Appium MCP `1.87.6` | **Pilot, then promote only after the approved stability gate** | Maintained by Appium; supplies stateful sessions and locators for iOS and can reach Mac2 through a project-local Appium server. |
| Viticci Shortcuts Playground `1.2.1` | **Pilot its Codex skill as a pinned, project-only advisory** | Its action/AppIntent corpus, examples, validator, and signer can catch plist compatibility risks, but Cherri and the repository verifier remain canonical. |
| Microsoft Playwright MCP `0.0.78` | **Do not add** | It now has trace/video/chapter tools, but Microsoft explicitly recommends CLI + skills for coding agents; the project already pins that CLI and committed Playwright Test. |
| Apple Shortcuts MCP wrappers | **Do not add** | Current servers wrap the same `shortcuts list`, `view`, and `run` commands and do not import, configure, build, sign, or prove the Shortcut. |
| Broad macOS computer-use MCP servers | **Do not add** | They overlap Appium/Computer Use, expose wider shell and desktop privileges, and weaken the exact-window privacy boundary. |
| Cloudflare API MCP | **Defer** | It is for an authenticated Cloudflare account and can call the full remote API; local Workers/D1 testing already has purpose-built tools. |
| GitHub MCP Server | **Optional future read-only operator aid; do not bundle** | It can inspect Actions, PRs, repositories, and Dependabot alerts, but it does not replace Dependabot configuration or the existing `gh` workflows. |
| MCP Inspector | **Use transiently only when an MCP handshake/tool schema needs diagnosis** | It is an official development inspector, not a runtime dependency or acceptance authority. |
| Custom exact-window recorder MCP | **Do not build** | The approved ScreenCaptureKit command is deterministic and single-owner; server state adds no present value. |
| Custom orchestration MCP | **Do not build** | Skills, hooks, scripts, leases, and specialized agents already express the workflow and authorization boundaries. |

## MCP servers to reuse or pilot

### Keep XcodeBuildMCP

The repository already declares `xcodebuildmcp@2.6.2` with only the
`simulator,ui-automation,debugging,logging` workflows. The upstream package at
the inspected `2.6.2` revision contains Simulator build/test/run tools,
accessibility snapshots and interactions, logging/debugging, and
`record_sim_video`; its workflow filter exists specifically to keep the MCP
surface small. [XcodeBuildMCP source at
`60cfdc3`](https://github.com/getsentry/XcodeBuildMCP/tree/60cfdc357ea6e91744ad85fe3bbe9d037a84d675),
[tool manifests](https://github.com/getsentry/XcodeBuildMCP/tree/60cfdc357ea6e91744ad85fe3bbe9d037a84d675/manifests/tools),
[project MCP configuration](../../.codex/config.toml)

No second Xcode or Simulator MCP should be installed. Continue serializing
Simulator ownership. Because upstream enables internal Sentry runtime-error
telemetry unless opted out, the implementation plan should add
`XCODEBUILDMCP_SENTRY_DISABLED=true` to the project MCP environment for this
privacy-sensitive repository. Upstream documents that switch in its setup and
runtime configuration. [Telemetry implementation](https://github.com/getsentry/XcodeBuildMCP/blob/60cfdc357ea6e91744ad85fe3bbe9d037a84d675/src/utils/sentry.ts)

### Pilot Appium MCP

At inspected commit `d16c952520d32529f26cf0a66ae0cfebd4d45dce`,
Appium MCP is version `1.87.6`, requires Node `>=22 <26`, bundles local iOS and
Android drivers, and supports a `general` platform through an explicitly
provided remote Appium/WebDriver server. Its documented `general` example uses
`platformName: mac` and `automationName: mac2`. This matches the approved
architecture: embedded XCUITest for Simulator work when appropriate, and a
project-local Appium server plus Mac2 for Shortcuts/Safari. [Appium MCP
README](https://github.com/appium/appium-mcp/blob/d16c952520d32529f26cf0a66ae0cfebd4d45dce/README.md),
[package manifest](https://github.com/appium/appium-mcp/blob/d16c952520d32529f26cf0a66ae0cfebd4d45dce/package.json)

Use the narrowest pilot configuration:

- pin the package exactly and run it with the approved project Node 24;
- set `NO_UI=true` and keep `AI_VISION_ENABLED` unset;
- keep Appium documentation/RAG and OpenTelemetry disabled;
- enable structured action evidence only if it remains sanitized;
- direct screenshots to `.build/review/` and retain no session persistence by
  default;
- pass `sessionId` explicitly whenever more than one session could exist;
- use the complete pinned `appium/skills` repository through the previously
  approved adapters rather than downloading its optional embeddings package;
- keep real-device preparation behind the recorded human-only checkpoint; and
- never use Mac2's display recording as privacy-safe review evidence.

Appium MCP's own documentation says AI vision is opt-in and requires an
external model endpoint/key, while documentation search is a separate optional
ML dependency and OpenTelemetry is disabled by default. Those defaults align
with the project's no-paid-service, minimal-data, and existing-capability-first
rules. [Appium MCP configuration](https://github.com/appium/appium-mcp/blob/d16c952520d32529f26cf0a66ae0cfebd4d45dce/README.md#configuration)

### Use MCP Inspector only as a diagnostic

The official Model Context Protocol Inspector can connect to a server, expose
its tools/resources/prompts, and execute calls interactively. It is useful if
the Appium pilot fails during initialization or schema negotiation, but the
project should invoke a pinned version transiently rather than add it to the
plugin. Codex/Appium forward tests remain the reproducible authority. [MCP
Inspector at `638f2bf`](https://github.com/modelcontextprotocol/inspector/tree/638f2bfa5b90f790e89dfb0a2c48feef7af226e4)

### Pilot Shortcuts Playground as an advisory skill

The search found a directly relevant existing Codex plugin that is more useful
than any Shortcuts MCP wrapper. `viticci/shortcuts-playground-plugin` `1.2.1`
at inspected commit `2de03bffe4ce8802e06d184931d9e4ec366a2ef2` is MIT-licensed and ships a
self-contained Codex skill, action and AppIntent catalogs, target-gated ToolKit
snapshots, golden XML examples, a plist validator, signing helper, and optional
`PostToolUse` validation hook. Its Codex skill passes the Agent Skills reference
validator. [Shortcuts Playground
README](https://github.com/viticci/shortcuts-playground-plugin/blob/2de03bffe4ce8802e06d184931d9e4ec366a2ef2/README.md),
[Codex skill](https://github.com/viticci/shortcuts-playground-plugin/tree/2de03bffe4ce8802e06d184931d9e4ec366a2ef2/codex/skills/shortcuts-playground),
[validator](https://github.com/viticci/shortcuts-playground-plugin/blob/2de03bffe4ce8802e06d184931d9e4ec366a2ef2/codex/skills/shortcuts-playground/scripts/validate_shortcut.py)

It should not replace Cherri authoring or become an immediate pass/fail gate.
The upstream README says generated shortcuts still need human inspection and
calls out occasional variable/wiring gaps. More importantly, its validator
applies authoring conventions that this repository never adopted. Against the
current generated `.build/save-date-idea/Save Date Idea API.plist`, it failed
on mandatory leading/section comments and also reported potentially substantive
issues: a missing `WFInput` on Count and empty `WFInput` values on two Trim
Whitespace actions. The comment failures demonstrate incompatibility with the
current acceptance contract; the wiring reports are useful hypotheses that
must be checked against the Cherri source, imported Shortcut behavior, and the
repository verifier before being treated as defects.

After plan approval, pilot only the exact Codex skill through project-scoped
`gh skill` selection, for example:

```text
gh skill preview viticci/shortcuts-playground-plugin \
  codex/skills/shortcuts-playground/SKILL.md@2de03bffe4ce8802e06d184931d9e4ec366a2ef2
```

Use its knowledge base and validator as compatibility/advisory evidence inside
`author-shortcut`; do not enable its hook until a wrapper can classify
project-inapplicable style findings separately from wiring/signing findings.
Do not use its default user-home output directory. Cherri source, the existing
build pipeline, and `./scripts/verify.sh` remain authoritative.

## MCP servers not to add

### Playwright MCP

Microsoft's Playwright MCP at inspected commit
`55679f5f3d4b4f3e2534ec0ce2fc5683ba2eaf3f` is capable: version `0.0.78`
supports accessibility snapshots, isolated profiles, traces, video start/stop,
chapter cards, and action overlays. Its own README nevertheless distinguishes
the two products and recommends the more token-efficient CLI + skills path for
coding agents, reserving MCP for persistent exploratory or self-healing loops.
[Playwright MCP comparison](https://github.com/microsoft/playwright-mcp/blob/55679f5f3d4b4f3e2534ec0ce2fc5683ba2eaf3f/README.md#playwright-mcp-vs-playwright-cli),
[video tools](https://github.com/microsoft/playwright-mcp/blob/55679f5f3d4b4f3e2534ec0ce2fc5683ba2eaf3f/README.md#tools)

This repository already has the Microsoft Playwright CLI skill pinned at
`eee5a185c98e6b04d88f580d45a854e9692ab50b` and authoritative committed
Playwright Test coverage. Adding the MCP would produce a third browser-control
surface without improving reproducibility. Keep Browser/CDP for interactive
localhost diagnosis and the CLI/review driver for local recordings.

### Apple Shortcuts MCP wrappers

The most complete inspected community implementation,
`artemnovichkov/shortcuts-mcp-server` at
`c29d8e5de274edef9c112598dc72d7ab52f98cae`, exposes only `run`, `list`, and
`view`, implemented by spawning Apple's `shortcuts` executable. It has no tool
for importing a signed artifact, answering setup questions, enabling Share
Sheet/Services, assigning a keyboard binding, inspecting action configuration,
or verifying persistence. [Shortcuts MCP README](https://github.com/artemnovichkov/shortcuts-mcp-server/blob/c29d8e5de274edef9c112598dc72d7ab52f98cae/README.md),
[implementation](https://github.com/artemnovichkov/shortcuts-mcp-server/blob/c29d8e5de274edef9c112598dc72d7ab52f98cae/Sources/main.swift)

Other discovered Shortcuts servers offer the same or a smaller wrapper. One
current official Registry entry exists for Mindstone's list/run server, but
the Registry does not security-scan its code. None closes the project's UI
configuration gap. Use `/usr/bin/shortcuts` directly for deterministic runtime
and Appium Mac2 for the UI.

### Broad macOS MCP servers

`CursorTouch/MacOS-MCP` at inspected commit
`bf4b9d4e5717a1fb77c5582fb84ec4f2d1d15d96` is a representative maintained
candidate. It provides Accessibility snapshots, coordinate input, window
management, arbitrary shell/AppleScript execution, whole-desktop screenshots,
and optional network transports. Its telemetry is enabled by default, and its
security guide warns that it runs without sandboxing, can make irreversible
changes, and should be used only on isolated systems with valueless data.
[macOS-MCP README](https://github.com/CursorTouch/MacOS-MCP/blob/bf4b9d4e5717a1fb77c5582fb84ec4f2d1d15d96/README.md),
[tool and telemetry implementation](https://github.com/CursorTouch/MacOS-MCP/tree/bf4b9d4e5717a1fb77c5582fb84ec4f2d1d15d96/src/macos_mcp)

That is broader than this task and conflicts with the fail-closed window
recording boundary. Appium supplies semantic cross-app automation without also
granting a generic shell tool; Computer Use remains available for consented
exploration. Do not add a general Mac-control MCP.

### Cloudflare MCP

Cloudflare now hosts a first-party, token-efficient whole-API MCP at
`https://mcp.cloudflare.com/mcp`. At inspected source commit
`fe731a8babb9dfef8816904bdd4e2c840d70af4c`, it exposes three code-mode tools
(`docs`, `search`, `execute`), defaults its OAuth consent template to read-only,
and can call about 2,500 Cloudflare API endpoints after OAuth or API-token
authentication. D1, Workers, Builds, observability, DNS, and other account
products are within that remote surface. [Cloudflare MCP
README](https://github.com/cloudflare/mcp/blob/fe731a8babb9dfef8816904bdd4e2c840d70af4c/README.md),
[scope templates](https://github.com/cloudflare/mcp/blob/fe731a8babb9dfef8816904bdd4e2c840d70af4c/src/auth/scopes.ts)

It is not needed for the local MVP. The repository already exercises generated
OpenAPI contracts, Worker behavior, migrations, and D1 through
`@cloudflare/vitest-pool-workers`, Miniflare/workerd, Wrangler dry runs, and
Playwright. [Local test contract](../testing/web-mvp.md),
[Worker test configuration](../../apps/api/vitest.config.ts)

Defer Cloudflare MCP until an explicitly authorized deployment or remote
observability task exists. If that day comes, start with OAuth's read-only
template and only the required account; do not bundle the server or credentials
into this plugin. The existing comprehensive Cloudflare skill remains the
documentation and implementation guide.

### GitHub MCP Server

GitHub's official server at inspected commit
`870f3c710a644b21e87118c06b1a8721fae3ca31` is mature and relevant in the
abstract. It offers toolset allowlists, a hard read-only mode, repositories,
pull requests, Actions inspection/triggering, and a Dependabot toolset. The
Dependabot toolset reads security alerts; it does not configure version-update
schedules or replace Dependabot-generated submodule PRs. [GitHub MCP
README](https://github.com/github/github-mcp-server/blob/870f3c710a644b21e87118c06b1a8721fae3ca31/README.md),
[server configuration](https://github.com/github/github-mcp-server/blob/870f3c710a644b21e87118c06b1a8721fae3ca31/docs/server-configuration.md)

Do not bundle it. Dependabot and Actions execute in GitHub; the existing `gh`
skill/CLI already configures and diagnoses those workflows without another
token-bearing server. If repeated CI diagnosis later demonstrates a real gap,
pilot only the official server in read-only mode with `repos,actions,pull_requests`
and the minimum OAuth scope. That is an operator convenience, not a completion
dependency.

### Local orchestration and custom MCP

MCP is warranted when a model needs a structured, stateful boundary to an
external capability. It is not a better wrapper for every command. Project
scripts can already reset fixtures, start servers, invoke a Shortcut, verify
the API, record a window, sanitize a manifest, run Playwright, and enforce
retention. Hooks can enforce project-scope policy before mutation; skills
provide the procedure; agents provide bounded ownership.

Build a custom MCP only if all of these become true after real execution:

1. a repeated workflow needs live state across multiple tool calls or clients;
2. no maintained server, CLI, library, skill, or ordinary project API exposes
   that state safely;
3. wrapping a command would not be sufficient;
4. the tool surface can be narrower than the underlying OS privileges; and
5. forward tests show the server improves reliability enough to justify its
   lifecycle and security cost.

The exact-window recorder currently fails conditions 1 and 3. If future
multi-client recording actually crosses that threshold, the maximum acceptable
server would be a local **stdio-only** server with exact-window inventory,
`start`, and `stop`; no shell, no whole-display capture, no audio, no network
transport, and writes restricted to `.build/review/`. MCP's security guidance
recommends stdio for local servers and warns that local MCP commands execute
with the client's privileges. [MCP security best
practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)

## `last30days` discovery-aid evaluation

The repository was inspected at commit
`249c7a4c040558a903d6838dee31012980d4946d` (`3.16.0`). It is a substantial
multi-source research product, not a small passive discovery skill. It searches
Reddit, X, YouTube, TikTok, Instagram, Hacker News, Polymarket, GitHub, and web
providers; can read browser cookies after consent; stores briefs and optional
SQLite state outside the project; can publish a public library; accepts many
provider credentials; and its first-run setup can execute `brew install yt-dlp`
and pinned `npx` installers that write user-local binaries. [last30days
README](https://github.com/mvanhorn/last30days-skill/blob/249c7a4c040558a903d6838dee31012980d4946d/README.md),
[setup implementation](https://github.com/mvanhorn/last30days-skill/blob/249c7a4c040558a903d6838dee31012980d4946d/skills/last30days/scripts/lib/setup_wizard.py),
[security contract](https://github.com/mvanhorn/last30days-skill/blob/249c7a4c040558a903d6838dee31012980d4946d/skills/last30days/SKILL.md#security--permissions)

It includes useful safeguards: a non-mutating preflight, cookie access off
without configuration/consent, keychain support, secret redaction promises,
and explicit publication. Those controls do not make it appropriate for this
repository's version-1 bundle:

- social engagement is useful for discovering candidate tips, not for proving
  technical claims; every recommendation would still need tracing to the
  owning project;
- automatic Homebrew/npm installation and default writes under the user's home
  directory conflict with project-only dependency and artifact policy;
- optional paid/PAYG providers and browser-session extraction expand the
  credential and privacy surface without a present requirement; and
- the 2,148-line, roughly 30,000-word `SKILL.md` is far beyond the Agent Skills
  recommendation of fewer than 500 lines and 5,000 tokens.

The inspected skill also does not pass the official reference validator. This
command:

```text
skills-ref validate skills/last30days
```

reports invalid frontmatter at `metadata.openclaw.requires.env: []` because the
reference parser rejects that flow-style value. The Agent Skills project calls
`skills-ref` its reference validator, although its README also labels the
library demonstrational rather than production-ready. [Agent Skills validation
guidance](https://github.com/agentskills/agentskills/blob/38a2ff82958afee88dadf4831509e6f7e9d8ef4e/docs/specification.mdx#validation),
[last30days frontmatter](https://github.com/mvanhorn/last30days-skill/blob/249c7a4c040558a903d6838dee31012980d4946d/skills/last30days/SKILL.md)

**Decision after research:** the user explicitly approved installing
`last30days` as a pinned project dependency to supplement `/research` with
recent trend discovery. It is not copied into the automation plugin and does
not replace primary-source verification. Repository policy confines its report
artifacts to `.build/research/last30days` and requires separate approval for
browser-cookie access, paid/PAYG provider use, credential changes, optional
tool installation, user-home writes, or publication. The compatibility and
maintainability concerns above remain acceptance evidence for every update.

## Agent Skills specification audit

The proposed skill names—`author-shortcut`, `configure-shortcut-macos`,
`prove-apple-ui-flow`, and `record-web-mvp-review`—all satisfy the current name
grammar. The four-way split is also coherent: each name maps to a user intent
and a distinct mutation/evidence boundary rather than one oversized skill.

One structural change is required. The provisional plugin layout places all
helper programs in `plugins/honeymoon-period-automation/scripts/`, outside each
skill directory. The Agent Skills specification resolves skill resources from
the skill root, recommends one-level relative references, and treats
`scripts/`, `references/`, and `assets/` as resources of that skill. A skill
that reaches up to a shared plugin directory is less portable and cannot be
validated or installed independently. [Agent Skills directory and reference
rules](https://github.com/agentskills/agentskills/blob/38a2ff82958afee88dadf4831509e6f7e9d8ef4e/docs/specification.mdx)

Revise the layout without duplicating logic:

- keep canonical product build/verify/test commands in the repository and have
  skills call them directly;
- put each new helper under the single skill that owns it—for example Mac
  configuration helpers under `configure-shortcut-macos/scripts/`, the
  ScreenCaptureKit command under `prove-apple-ui-flow/scripts/`, and web-review
  manifest code under `record-web-mvp-review/scripts/`;
- retain plugin-wide policy enforcement under `hooks/`, because it is plugin
  infrastructure rather than a skill resource; and
- avoid a shared script unless repeated implementation proves a genuine common
  module. If one becomes necessary, make it an ordinary tested project module
  with an explicit API rather than a cross-skill relative include.

Each skill should also meet these gates before acceptance:

1. `SKILL.md` frontmatter has a directory-matching `name` and a concise
   intent-and-trigger `description`; use `compatibility` for macOS, Xcode,
   Node 24, network, or permission requirements.
2. Keep the loaded instructions below 500 lines and 5,000 tokens. Route
   platform/tool detail into focused, one-level `references/` files and say
   exactly when to read each.
3. Keep host-specific MCP dependency declarations and implicit-invocation
   policy in OpenAI/plugin metadata. Do not rely on the Agent Skills
   `allowed-tools` field for authorization because the spec marks it
   experimental and client support varies.
4. Prefer a prescribed default and a named fallback, not a menu of equivalent
   tools. Preserve human-only ceremonies in the core procedure.
5. Include plan-validate-execute and validation loops around import,
   configuration, recording, and cleanup; destructive stale-copy cleanup
   remains separately authorized.
6. Run the reference validator and the OpenAI plugin/skill validators.
7. Evaluate each description with about 20 realistic trigger queries including
   near-miss negatives, and evaluate workflow output with concrete assertions,
   execution traces, and blind comparisons where useful. OpenAI Plugin Eval is
   supplemental, not the sole gate.

These changes follow the specification's progressive-disclosure limits and its
official guidance to ground skills in real execution, keep coherent units,
provide defaults, inspect traces, and compare with-skill versus without-skill
results. [Agent Skills best
practices](https://github.com/agentskills/agentskills/blob/38a2ff82958afee88dadf4831509e6f7e9d8ef4e/docs/skill-creation/best-practices.mdx),
[evaluation guide](https://github.com/agentskills/agentskills/blob/38a2ff82958afee88dadf4831509e6f7e9d8ef4e/docs/skill-creation/evaluating-skills.mdx),
[description evaluation](https://github.com/agentskills/agentskills/blob/38a2ff82958afee88dadf4831509e6f7e9d8ef4e/docs/skill-creation/optimizing-descriptions.mdx)

## Existing-capability-first discovery gate

The durable plan should make this sequence mandatory before any new MCP,
skill, service, or helper is proposed:

1. inspect the live repository, installed project skills/plugins, standard OS
   tools, and package dependencies;
2. search the owning vendor's docs/repositories and the official MCP Registry;
3. use community indexes and recent social discussion only to nominate
   candidates;
4. trace every candidate to a pinned owning revision and inspect its actual
   tool surface, writes, network calls, credentials, telemetry, license, update
   model, and project-scope installation path;
5. choose the smallest existing abstraction in this order when capabilities
   are equivalent: existing project command/library, maintained CLI + skill,
   maintained MCP, then custom code; and
6. record why rejected candidates do not meet the requirement, so later agents
   do not repeat the same search without a changed trigger.

MCP Registry metadata is not a security review, and local servers execute with
the client's privileges. Exact pins, stdio for local servers, tool allowlists,
telemetry-off defaults, project-local state, and explicit human consent remain
required even for vendor-owned entries. [Registry security
boundary](https://modelcontextprotocol.io/registry/about#trust-and-security),
[local server security](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices#local-mcp-server-compromise)

## Inspected revisions and verification

| Source | Inspected revision |
| --- | --- |
| `agentskills/agentskills` | `38a2ff82958afee88dadf4831509e6f7e9d8ef4e` |
| `mvanhorn/last30days-skill` | `249c7a4c040558a903d6838dee31012980d4946d` (`3.16.0`) |
| `appium/appium-mcp` | `d16c952520d32529f26cf0a66ae0cfebd4d45dce` (`1.87.6`) |
| `appium/skills` | `91884b938fe89a40d1301b2a0300ec82fbe9e23a` |
| `getsentry/XcodeBuildMCP` | `60cfdc357ea6e91744ad85fe3bbe9d037a84d675` (`2.6.2`) |
| `microsoft/playwright-mcp` | `55679f5f3d4b4f3e2534ec0ce2fc5683ba2eaf3f` (`0.0.78`) |
| `microsoft/playwright-cli` | `eee5a185c98e6b04d88f580d45a854e9692ab50b` |
| `viticci/shortcuts-playground-plugin` | `2de03bffe4ce8802e06d184931d9e4ec366a2ef2` (`1.2.1`) |
| `cloudflare/mcp` | `fe731a8babb9dfef8816904bdd4e2c840d70af4c` |
| `cloudflare/mcp-server-cloudflare` | `e1b9c17936b903d3e336ebf84c58ab8403e67c1a` |
| `github/github-mcp-server` | `870f3c710a644b21e87118c06b1a8721fae3ca31` |
| `artemnovichkov/shortcuts-mcp-server` | `c29d8e5de274edef9c112598dc72d7ab52f98cae` |
| `CursorTouch/MacOS-MCP` | `bf4b9d4e5717a1fb77c5582fb84ec4f2d1d15d96` (`0.3.11`) |
| `modelcontextprotocol/registry` | `29e32c39dcb5e0e2b43974089d959fcc4794eb6d` |
| `modelcontextprotocol/inspector` | `638f2bfa5b90f790e89dfb0a2c48feef7af226e4` |

Initial verification was performed without installing or configuring a project
dependency:

- inspected the live project MCP config, package scripts, Worker integration
  tests, web test contract, installed skill inventory, and existing research;
- resolved upstream `main` revisions with `git ls-remote`, then inspected
  pinned source checkouts;
- queried the official MCP Registry API for Appium, XcodeBuildMCP, Playwright,
  GitHub, Cloudflare, Shortcuts, macOS, and screen/window-recording candidates;
- ran the Agent Skills reference validator against the inspected
  `last30days` skill; and
- checked this report with `git diff --no-index --check` because it is a new
  untracked file.

After the report, explicit user approval changed the adoption decision. The
exact inspected revision was installed with `gh skill --agent codex --scope
project --pin 249c7a4c040558a903d6838dee31012980d4946d`; its safe preflight passed
with browser cookies off and project-local report output configured.
