# Repository-scoped Codex automation plugin

- **Status:** Research complete; decisions remain for grilling
- **Last verified:** 2026-07-16
- **Question:** What should a repository-scoped Codex plugin contain to
  automate Shortcut authoring, installation, Mac execution, Apple-platform UI
  proof, and reviewable Playwright web flows without duplicating project policy
  or weakening privacy and authorization boundaries?

> **Follow-up:** [Appium automation and agent skills](appium-automation-and-skills.md)
> reopens this report's provisional Appium exclusion. Use the follow-up's
> adopt/pilot recommendation and `appium/skills` packaging finding when the two
> reports differ.
>
> **Follow-up:** [MCP and Agent Skills ecosystem](mcp-and-agent-skills-ecosystem.md)
> inventories current servers and skills, evaluates `last30days`, audits the
> planned skill structure, and reopens only the bounded MCP/Shortcuts Playground
> choices recorded below.

## Executive recommendation

**Inference.** Build one repository-local plugin named
`honeymoon-period-automation`, but keep it deliberately thin. It should package
four focused workflow skills, deterministic helper scripts, and one narrow
project-install policy hook. It should not ship an Apps SDK app, a new MCP
server, Maestro, or copies of upstream skills. Keep the approved Appium work as
a pinned project-only pilot whose promotion is evidence-gated.

The durable architecture should have four layers:

1. **Repository policy and source:** `AGENTS.md`, `CONTEXT.md`, ADRs, canonical
   Cherri source, tests, `.codex/config.toml`, and `.codex/agents/*.toml` remain
   ordinary source-controlled project files.
2. **Repository plugin:** focused orchestration skills and their owned helpers
   live under `plugins/honeymoon-period-automation/`; plugin-wide enforcement
   remains under `hooks/`. The plugin is exposed through
   `.agents/plugins/marketplace.json`.
3. **Existing project dependencies:** pinned project skills and the existing
   pinned XcodeBuildMCP remain dependencies rather than being silently copied
   into the new plugin.
4. **Disposable proof:** all recordings, screenshots, traces, manifests, and
   temporary test state go under `.build/review/` and remain uncommitted.

This preserves the user-approved separation between source-controlled tests and
local review artifacts. It also avoids turning a task-specific plugin into a
second architecture and policy layer.

### Keep/add/exclude matrix

| Component | Version 1 decision |
| --- | --- |
| Four project automation skills | **Add to the plugin** |
| Deterministic Shortcut, recording, manifest, and dependency-audit helpers | **Add under their owning skill or plugin hook; do not create a shared plugin script bucket** |
| Narrow project-install `PreToolUse` hook | **Add at the default `hooks/hooks.json` path; omit the manifest `hooks` field** |
| Canonical Cherri source, build/verifier scripts, Playwright tests, project docs | **Keep repository-owned; reference rather than copy** |
| Specialized `.codex/agents/*.toml` profiles | **Keep/add at repository scope; plugin packaging does not document these as a distributable component** |
| Existing `xcodebuildmcp@2.6.2` config and vendored Build iOS Apps skills | **Keep; do not duplicate in plugin** |
| Appium MCP `1.87.6` | **Candidate project-only pilot with strict Codex tool allowlists and privacy-off defaults; subject to resumed grilling** |
| Shortcuts Playground `1.2.1` Codex skill | **Candidate pinned advisory/compatibility pilot; Cherri and project verification stay authoritative; subject to resumed grilling** |
| Existing comprehensive Cloudflare skill | **Keep at its current pin; no update or extra Cloudflare skill is warranted now** |
| Build macOS Apps skills | **Do not add in version 1; the current workflow does not build a macOS app** |
| New MCP server or `.app.json` | **Exclude** |
| Appium and the complete `appium/skills` repository | **Add as a pinned project-only pilot after the full-Xcode checkpoint; promote only after three consecutive green Mac runs and three consecutive green iOS runs, with no manual intervention beyond approved trust/permission checkpoints** |
| Maestro | **Exclude; it does not cover the required native macOS lane** |
| `last30days` | **Installed at a pinned project scope by explicit user decision; use outside the plugin as a guarded trend-discovery supplement, not as technical authority** |
| Full-screen/audio recording | **Exclude** |

## Verified platform facts

### Codex skills and plugins

**Verified.** A skill packages task-specific instructions and supporting
resources. A plugin is an installable bundle that can contain skills, an
MCP-backed app, or both. OpenAI recommends starting with a local skill while a
workflow is still being iterated and using a plugin when distributing multiple
skills, connectors, MCP configuration, or lifecycle hooks. [Skills &
Plugins](https://learn.chatgpt.com/docs/skills-and-plugins), [Build
plugins](https://learn.chatgpt.com/docs/build-plugins)

**Verified.** A plugin requires `.codex-plugin/plugin.json`. Optional content
belongs at the plugin root and can include `skills/`, `hooks/`, `.mcp.json`,
`.app.json`, and presentation assets. Codex looks for
`hooks/hooks.json` by default, so the plugin can bundle hooks without adding a
manifest `hooks` field. [Plugin
structure](https://learn.chatgpt.com/docs/build-plugins#plugin-structure),
[plugin-bundled hooks](https://learn.chatgpt.com/docs/hooks#plugin-bundled-hooks)

**Verified.** A repository marketplace belongs at
`$REPO_ROOT/.agents/plugins/marketplace.json`. The desktop app can discover that
catalog, but an installed local plugin is loaded from a cached copy under the
user's Codex plugin cache rather than directly from the source directory.
Plugin enabled state is also stored in user configuration. [Build your own
curated plugin
list](https://learn.chatgpt.com/docs/build-plugins#build-your-own-curated-plugin-list),
[How the desktop app uses
marketplaces](https://learn.chatgpt.com/docs/build-plugins#how-the-chatgpt-desktop-app-uses-marketplaces)

**Inference.** “Project-only plugin” can therefore mean that the authoritative
catalog and plugin source are in this repository and that the plugin no-ops
outside this repository. It cannot mean that the desktop app never writes its
documented user-level cache or enabled-state record. The plan and guardrails
should use the precise definition instead of promising a physical install scope
the product does not provide.

**Verified.** Skills are progressively disclosed, can carry scripts and
references, and should stay focused. `agents/openai.yaml` can provide UI
metadata, disable implicit invocation, and declare MCP tool dependencies.
[Build skills](https://learn.chatgpt.com/docs/build-skills)

**Verified.** Project custom subagents are standalone TOML files under
`.codex/agents/`, with `name`, `description`, and `developer_instructions` as
required fields. A plugin's `agents/openai.yaml` is plugin UI metadata; it is not
the documented project custom-agent format. [Custom
agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents),
[OpenAI Build iOS Apps plugin
source](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps/agents)

**Inference.** Specialized execution agents should remain in
`.codex/agents/`, while plugin skills may tell the root when to delegate to
them. Do not hide project agent profiles inside the plugin or copy them into the
repository at runtime.

### Hooks and enforceability

**Verified.** Hooks from project configuration and enabled plugins all run;
matching hooks are additive rather than overriding one another. Non-managed
command hooks require a trust review for their current hash. Only command
handlers run today; prompt and agent handlers are parsed but skipped, and
asynchronous command hooks are unsupported. [Hooks](https://learn.chatgpt.com/docs/hooks)

**Verified.** `PreToolUse` can match Bash, `apply_patch`/Edit/Write, and MCP tool
names. It does not establish a universal policy boundary for every desktop UI,
Computer Use action, or web lookup. [Hook matcher
patterns](https://learn.chatgpt.com/docs/hooks#matcher-patterns)

**Inference.** The install hook is defense in depth. `AGENTS.md`, source review,
hook unit tests, explicit verifier evidence, and normal authorization rules
remain necessary because a hook cannot prove that no installation occurred
through an unsupported surface.

### Record & Replay

**Verified.** OpenAI's macOS Record & Replay can observe a demonstrated workflow
and draft a reusable skill. It requires Computer Use, records until the user
stops it, and advises avoiding secrets and sensitive data. The resulting skill
can later use Computer Use, browser actions, and installed plugins. [Record &
Replay](https://learn.chatgpt.com/docs/extend/record-and-replay)

**Inference.** Use Record & Replay once to capture the Mac Shortcuts import and
configuration interaction with synthetic values. Treat its draft as discovery
input: review it, replace fragile coordinates with semantic queries or scripts,
add explicit success checks and consent boundaries, then commit the refined
project skill. A demonstration is not a reproducible test or an authorization
grant.

## Existing repository inventory

**Verified locally.** The repository already has most of the generic foundation
the proposed plugin needs:

- `AGENTS.md` defines product priorities, generated-code policy, authorization
  boundaries, verification commands, and project-only skill installation.
- `.codex/config.toml` pins GPT-5.6 Sol orchestration, four direct threads, hooks,
  and `xcodebuildmcp@2.6.2` with simulator, UI automation, debugging, and logging
  workflows.
- `.codex/agents/` already defines explorer, researcher, worker, prototype,
  web-specialist, iOS-specialist, reviewer, verifier, and validator roles.
- `.codex/hooks/pre_tool_policy.py` already denies destructive Git/file actions,
  unauthorized physical-device tooling, archive/export, notarization, and
  distribution commands, with a project unit-test contract.
- `.agents/skills/` already contains pinned Matt Pocock workflows, the official
  Playwright CLI skill, React-admin guidance, frontend debugging guidance,
  React best practices, the comprehensive Cloudflare skill, and the nine
  vendored Build iOS Apps skills.
- `shortcut/Save Date Idea API.cherri` is canonical candidate source;
  `scripts/build-save-date-idea-shortcut.sh`,
  `scripts/verify-save-date-idea-shortcut.py`, and
  `scripts/verify-save-date-idea.sh` already provide a source-first build,
  signing, and structural verification pipeline.
- `e2e/web-mvp.spec.ts` already has eight authoritative Playwright flows,
  including participant-owned voting, detail viewing/editing, filtering,
  sorting, rank explanations, responsive behavior, and persistence.
- `.build/` is already ignored, matching the approved local-only review-artifact
  policy.

**Verified locally.** `gh skill list --agent codex --scope project` reports the
external skills as project-scoped and pinned. The comprehensive Cloudflare skill
is pinned to commit `70215303d44a81a0db3219428f4825b604fc6061`, which was also
the upstream `main` commit on 2026-07-16.

**Verified locally.** The current Mac has Swift 6.3.3 command-line tools and the
built-in `shortcuts` and `screencapture` commands, but no full Xcode application.
`simctl` and `xcodebuild` simulator workflows are therefore unavailable until a
human installs/selects Xcode. Appium Mac2 and Simulator UI automation cannot be
treated as immediately available prerequisites.

**Decision.** Add a project `.node-version` targeting the Node 24 LTS line,
tighten the root `package.json` engine range to `>=24 <25`, have CI consume the
same version declaration, and make Appium readiness fail outside Node 24. Do not
hard-code Codex's bundled runtime path or impose a new version manager.

## Recommended plugin contents

### Repository layout

```text
.agents/plugins/marketplace.json
plugins/honeymoon-period-automation/
├── .codex-plugin/
│   └── plugin.json
├── skills/
│   ├── author-shortcut/
│   │   ├── SKILL.md
│   │   └── agents/openai.yaml
│   ├── configure-shortcut-macos/
│   │   ├── SKILL.md
│   │   ├── agents/openai.yaml
│   │   └── scripts/configure-shortcut-macos.scpt
│   ├── prove-apple-ui-flow/
│   │   ├── SKILL.md
│   │   ├── agents/openai.yaml
│   │   ├── references/tool-selection.md
│   │   └── scripts/
│   │       ├── check-readiness.zsh
│   │       ├── run-shortcut-fixture.zsh
│   │       ├── record-window/
│   │       └── write-review-manifest.py
│   └── record-web-mvp-review/
│       ├── SKILL.md
│       ├── agents/openai.yaml
│       └── scripts/write-review-manifest.py
└── hooks/
    ├── hooks.json
    ├── project_install_policy.py
    └── verify-project-dependencies.py
```

File names are provisional; the responsibilities are the recommendation.
Do not include a plugin `README.md`, changelog, or duplicated project plan.
Do not duplicate helper logic between skill directories: first reuse an
existing repository command or library, and extract an ordinary tested project
module only after two lane-specific implementations prove the same abstraction.
Keep plugin-wide policy enforcement under `hooks/`; keep workflow helpers under
the skill that owns their execution and authorization boundary.

### Skill 1: `author-shortcut`

**Purpose.** Create or change the canonical API Shortcut from Cherri source and
produce a signed, structurally verified artifact.

**Required behavior.**

1. Read the project context, ADR-0002, canonical-source policy, and the affected
   Shortcut source before editing.
2. Begin with a failing structural or behavioral check when behavior changes.
3. Edit only `shortcut/Save Date Idea API.cherri` and human-authored verifier or
   build code; never hand-edit generated plist, processed Cherri, unsigned
   Shortcut, or signed artifact.
4. Reuse the existing repository build and verifier scripts rather than copying
   their logic into the skill.
5. Verify the Reminders baseline remains byte-for-byte intentional and usable.
6. Stop at signing/import permissions that require a human ceremony.

**Dependencies.** Use the project `tdd`, `implement`, `code-review`, and
`diagnosing-bugs` skills as applicable. Use Build iOS Apps `ios-app-intents`
only for a future native App Intent or App Shortcut, not for editing the current
Cherri workflow.

### Skill 2: `configure-shortcut-macos`

**Purpose.** Import or update the signed candidate, answer synthetic import
questions, enable the documented macOS surfaces, assign a nonconflicting test
keyboard shortcut, identify stale candidate copies, and verify configuration.

**Required behavior.**

1. Confirm the artifact passed structural verification before opening it.
2. Inventory existing Shortcuts with `/usr/bin/shortcuts list`; preserve the
   unnumbered Reminders baseline and never delete a candidate merely because its
   name is similar.
3. Open the signed artifact and drive the Shortcuts UI through semantic
   Accessibility queries where available. Use coordinates only behind a
   versioned, bounds-checked fallback.
4. Use synthetic endpoint/token inputs and redact them from logs.
5. Configure Share Sheet, Receive What's On Screen, Services Quick Action, and
   the reserved test binding Control-Option-Command-D (`⌃⌥⌘D`), then read back
   the visible settings. Refuse the assignment without changing it when that
   binding is already occupied.
6. Pause for all privacy, Accessibility, Screen Recording, network, or Shortcuts
   consent decisions. The human owns those choices.
7. Return exact installed name, configuration result, and any stale copies; do
   not silently clean them up.

Set `policy.allow_implicit_invocation: false` because importing, replacing, and
configuring installed workflows changes external Mac state.

### Skill 3: `prove-apple-ui-flow`

**Purpose.** Run a synthetic end-to-end Shortcut flow on Mac or Simulator and
produce privacy-safe evidence.

It should expose two explicit lanes:

- **Deterministic Mac runtime lane:** reset/start the local API, generate a
  synthetic URL input file, invoke `/usr/bin/shortcuts run` with that input,
  assert the API persisted the exact synthetic source, repeat to verify the
  existing/replayed behavior, and stop the server.
- **Mac UI proof lane:** open a synthetic local page in Safari, invoke the
  configured Services/keyboard flow, verify the API result, and record only the
  intended Safari or Shortcuts window.

When full Xcode becomes available, add a third lane:

- **Simulator lane:** use the pinned Build iOS Apps/XcodeBuildMCP workflows for
  Simulator selection, semantic UI snapshots/actions, logs, and
  `record_sim_video`; use committed XCUIAutomation for stable native regression
  tests when an Xcode project or dedicated UI-test harness exists.

Set implicit invocation to false because the skill owns UI focus, local server
state, and recordings. It must acquire a single Apple-UI lease so no other agent
or test attempts to control the mouse, keyboard, Simulator, or shared ports.

### Skill 4: `record-web-mvp-review`

**Purpose.** Produce a reviewable web demonstration of viewing, voting,
participant ownership, querying, filtering, and sorting without weakening the
authoritative E2E suite.

**Required behavior.**

1. Reset to the canonical synthetic seed and use the committed local API and
   web servers.
2. Reuse accessible role/label locators and assertions from
   `e2e/web-mvp.spec.ts`; do not generate a coordinate or screenshot-based
   parallel test suite.
3. Run the authoritative focused tests first.
4. Record either a dedicated combined review journey or selected existing
   tests under a separate review Playwright configuration with video enabled.
5. Store videos, traces, screenshots, and a sanitized run manifest beneath
   `.build/review/web/`.
6. Keep arbitrary presentation pauses and visual chapter overlays in a
   disposable recording driver, not in authoritative Playwright assertions.
7. Preserve one worker, deterministic fixtures, no `networkidle`, and no real
   user or relationship data.

The official Playwright test generator can record browser interactions and
prioritizes role, text, and test-id locators. Playwright Test can record video,
and Trace Viewer records DOM snapshots, network, console, actions, and source.
The installed official Playwright CLI skill additionally supports scripted
videos with chapter and annotation overlays. [Playwright test
generator](https://playwright.dev/docs/codegen), [Playwright
videos](https://playwright.dev/docs/videos), [Trace
Viewer](https://playwright.dev/docs/trace-viewer), [official Playwright CLI
video workflow](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/references/video-recording.md)

## Specialized agents

**Inference.** Add at most two new project agent profiles; reuse existing roles
for everything else.

### Add `shortcut-specialist`

- Own the Cherri source/build/import/runtime problem assigned by root.
- Use Terra for routine source and structural work; escalate genuinely difficult
  Apple behavior to the existing Sol `ios-specialist`.
- Do not publish, deploy, delete installed workflows, grant consent, or operate
  a physical device without the governing authorization.
- Return source paths, exact commands, runtime evidence, and unresolved
  system-state checkpoints.

### Add `review-recorder`

- Own only disposable recording outputs and focused test execution.
- Serialize browser, Apple UI, shared port, and recording ownership.
- Fail closed if the intended window or Simulator cannot be identified.
- Write only beneath `.build/review/`; do not edit application source or
  documentation.
- Return the artifact manifest and exact verification results, not unsanitized
  screenshots in chat.

### Reuse existing agents

- `web-specialist` authors or corrects Playwright and React-admin behavior.
- `ios-specialist` owns difficult Apple platform and Simulator behavior.
- fresh `verifier` and `validator` independently accept the integrated plugin,
  skills, scripts, policy, and proof.
- `reviewer` is reserved for privacy, security, data-loss, concurrency, or
  architecture risk.

The root must retain shared configuration, Git, marketplace state, and final
verification ownership. No agent should recursively delegate.

## Tool selection

| Tool or surface | Decision | Evidence and reason |
| --- | --- | --- |
| Cherri at the repository-pinned commit | Include through existing scripts | It is already the canonical source compiler and has project structural checks. Do not repackage the binary or generated output. |
| `/usr/bin/shortcuts` | Include in Mac readiness and deterministic runtime scripts | Local help exposes `run`, `list`, `view`, and `sign`, but no import command; import remains a UI workflow. |
| Computer Use + Record & Replay | Use for discovery and interactive proof | Officially supports demonstrating a macOS workflow and drafting a skill; review and harden the result before committing it. |
| Playwright Test and official Playwright CLI skill | Include | Already pinned and authoritative for web E2E; supports code generation, traces, video, and review overlays. |
| Build iOS Apps + pinned XcodeBuildMCP | Retain as existing project dependency | Official plugin covers App Intents, Simulator debugging, previews, performance, and leaks. XcodeBuildMCP 2.6.2 advertises semantic UI automation and Simulator video. [Build iOS Apps](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps), [XcodeBuildMCP tools](https://www.xcodebuildmcp.com/docs/tools) |
| Build macOS Apps | Do not install for version 1 | The official plugin covers building, debugging, and packaging macOS application source, but explicitly does not cover desktop UI automation. Appium owns cross-app control and the thin Rust helper owns exact-window recording; reconsider these skills only if this repository adds a Swift/Xcode macOS app. [Build macOS Apps](https://github.com/openai/plugins/tree/main/plugins/build-macos-apps) |
| XCTest/XCUIAutomation | Preferred committed native regression framework once Xcode exists | Apple supports UI automation on its platforms, keyboard/mouse interactions on macOS, and interaction with any app installed on the selected device or Simulator. Xcode can record interaction code and test-result video. [Apple testing overview](https://developer.apple.com/documentation/xcode/testing), [XCUIElement](https://developer.apple.com/documentation/xcuiautomation/xcuielement), [Recording UI automation](https://developer.apple.com/documentation/XCUIAutomation/recording-ui-automation-for-testing), [WWDC25 record, replay, and review](https://developer.apple.com/videos/play/wwdc2025/344/) |
| ScreenCaptureKit | Preferred implementation for strict Mac window-only recording | Apple provides a desktop-independent single-window content filter and fine-grained stream capture. It requires human-granted Screen Recording permission. [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit), [Apple sample](https://developer.apple.com/documentation/screencapturekit/capturing-screen-content-in-macos) |
| Built-in `screencapture` | Keep as a bounded fallback | Local macOS 26.5.2 help supports video, fixed duration, clicks, display, and rectangle capture. Rectangle capture needs preflight and continuous bounds checks; it is weaker than a single-window ScreenCaptureKit filter. |
| Appium Mac2 | Run the approved project-only pilot after full Xcode is installed | It is an Appium-maintained macOS driver backed by XCTest and can automate arbitrary bundle IDs and AppleScript. It requires Appium 3, full Xcode, Accessibility/UIAutomation setup, and serialized UI access; its display-oriented recording does not satisfy window-only privacy, so the ScreenCaptureKit helper remains separate. Retain the complete pinned `appium/skills` repository because its entrypoints depend on shared root assets. [Appium Mac2](https://github.com/appium/appium-mac2-driver), [Appium official drivers](https://appium.io/docs/en/latest/ecosystem/drivers/), [Appium skills](https://github.com/appium/skills) |
| Maestro | Do not install initially | It supports iOS Simulator, multi-app journeys, permissions, and MP4 recording, but not native macOS apps. It duplicates the current XcodeBuildMCP/XCUIAutomation and Playwright test DSLs. Reconsider only if a no-compile multi-app Simulator flow is materially easier. [Supported platforms](https://docs.maestro.dev/getting-started/build-and-install-your-app), [iOS](https://docs.maestro.dev/getting-started/build-and-install-your-app/ios), [recording](https://docs.maestro.dev/api-reference/commands/startrecording) |
| New custom MCP server | Exclude initially | Every needed action is local and scriptable; a new server adds schemas, lifecycle, security review, and context cost without a missing external capability. |
| Apps SDK `.app.json` / custom ChatGPT UI | Exclude | There is no external service connection, authentication flow, or structured ChatGPT UI that improves the local engineering workflow. OpenAI recommends an app when connecting to a service or exposing MCP tools. [Build an app](https://learn.chatgpt.com/docs/build-app) |
| Community plugin indexes | Discovery only | `awesome-codex-plugins` requires its own scanner for listed plugins; skills.sh explicitly says it cannot guarantee every listed skill's quality or security. Follow candidates to the owning source and inspect/pin them before use. [Awesome Codex Plugins](https://github.com/hashgraph-online/awesome-codex-plugins), [skills.sh documentation](https://skills.sh/docs) |

## Codex capability refresh (2026-07-16)

This refresh reconciles the live Codex catalog and current project skills with
the version 1 plan. It supersedes the earlier suggestion to install five macOS
development skills and does not replace the Appium follow-up report.

| Capability | Reuse decision | Scope, overlap, and effect on version 1 |
| --- | --- | --- |
| OpenAI `screenshot` skill | **Approved: add as a pinned project skill after plan approval** | The official Apache-2.0 skill is self-contained under `skills/.curated/screenshot`: `gh skill preview` includes its permission preflight, exact app/title/window-ID inventory, bounds metadata, and window-only screenshot helpers. Reuse those helpers for Mac proof stills and recorder window discovery instead of rebuilding them. It does not record video, so the approved thin `screencapturekit-rs` recorder remains necessary. Pin `openai/skills@49f948faa9258a0c61caceaf225e179651397431` with explicit Codex project scope. [OpenAI screenshot skill](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/screenshot) |
| Computer Use `1.0.1000387` and Record & Replay `1.0.1000387` | **Reuse from the current Codex environment** | Computer Use exposes semantic Accessibility-tree actions with coordinate fallback; Record & Replay captures a demonstrated event stream and turns it into a reviewed skill. Use them to observe and bootstrap Shortcuts import/configuration, then harden the result into source-controlled assertions. Neither is a committed UI-test framework or privacy-safe review-video recorder, so neither replaces Appium or ScreenCaptureKit. Do not copy these bundled plugins into the project plugin. [OpenAI Record & Replay](https://learn.chatgpt.com/docs/extend/record-and-replay) |
| Browser and Chrome `26.707.91948` | **Use Browser for interactive localhost diagnosis; exclude Chrome from automated proof** | Browser provides DOM snapshots, screenshots, console/network inspection, and Playwright-backed interaction in the isolated in-app browser. It does not expose the repository's committed Playwright test/video contract. Chrome may carry signed-in and private browsing state, so it is unsuitable for deterministic recording. The existing project `frontend-testing-debugging` and `playwright-cli` skills remain the reproducible path. |
| Microsoft `playwright-cli` at `eee5a185c98e6b04d88f580d45a854e9692ab50b` | **Keep as the web recording implementation** | It already supports semantic snapshots and locators, traces, video start/stop, chapter markers, action callouts, and scripted overlays. This directly covers the review-only web driver; do not add another browser-recording skill or MCP. Committed Playwright Test remains authoritative. [Playwright CLI](https://github.com/microsoft/playwright-cli/tree/eee5a185c98e6b04d88f580d45a854e9692ab50b), [video workflow](https://github.com/microsoft/playwright-cli/blob/eee5a185c98e6b04d88f580d45a854e9692ab50b/skills/playwright-cli/references/video-recording.md) |
| Build iOS Apps `0.1.2` and pinned XcodeBuildMCP | **Keep without duplication** | The project already vendors the nine relevant skills and pins XcodeBuildMCP. `ios-app-intents` applies to a future native App Intent/App Shortcut, not the current Cherri-authored `.shortcut`; Simulator tools remain appropriate after full Xcode exists. No version 1 dependency change. [Build iOS Apps](https://github.com/openai/plugins/tree/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/build-ios-apps) |
| Build macOS Apps `0.1.4` | **Do not add its five previously proposed skills in version 1** | Its first-party README explicitly excludes desktop UI automation. The approved implementation now uses Appium for cross-app control and Rust for ScreenCaptureKit recording, so build/run, SwiftUI window, AppKit bridge, test-triage, and telemetry skills would be unused dependencies. Reconsider only if the project adds Swift/Xcode macOS source. [Build macOS Apps](https://github.com/openai/plugins/tree/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/build-macos-apps) |
| GitHub plugin `0.1.8-2841cf9749ae` | **Optional operator aid, not a bundle dependency** | Its `gh-fix-ci` workflow combines GitHub PR context with `gh` Actions logs and can diagnose a failing Appium-submodule update PR when the plugin is enabled. Dependabot, repository Actions, and `gh` remain the update authority, so adding or copying the plugin would not improve the automation contract. [GitHub plugin source](https://github.com/openai/plugins/tree/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/github) |
| OpenAI Plugin Eval `0.1.2` | **Approved: pinned project-marketplace pilot** | Reference `plugins/plugin-eval` from the repository marketplace as a pinned `git-subdir` at `openai/plugins@11c74d6ba24d3a6d48f54a194cd00ef3beea18f9`; do not copy its CLI. Use its static analysis and isolated benchmark runs only as supplemental evidence. Plugin-creator validation, skill forward-tests, repository acceptance checks, verifier, and validator remain authoritative. Retain the dependency only if the pilot is stable. [Plugin Eval](https://github.com/openai/plugins/tree/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/plugin-eval) |
| Build Web Apps and Replay.io | **Exclude** | Build Web Apps duplicates the already pinned frontend-testing and React guidance while adding irrelevant shadcn, Stripe, and Supabase workflows. Replay.io records in a special browser and uploads recordings using credentials/hooks, conflicting with local-only `.build/review/` artifacts and the no-production-credential boundary. Neither changes version 1. [Build Web Apps](https://github.com/openai/plugins/tree/11c74d6ba24d3a6d48f54a194cd00ef3beea18f9/plugins/build-web-apps), [Replay.io plugin](https://github.com/replayio/plugins/tree/c6cd28ff3d47f4e8e8b23040c69925ec2a820695/plugins/replayio) |

**Conclusion.** The search found no Codex plugin that replaces Appium for
macOS/iOS cross-app UI automation and no existing skill that produces strict
single-window Mac video. Add only the official screenshot skill to the proposed
project dependency set; optionally expose Plugin Eval for development-time
assessment. Reuse the already available Computer Use, Record & Replay, Browser,
Playwright, Build iOS, and GitHub capabilities at their narrow boundaries, and
remove the five Build macOS skill additions from the version 1 recommendation.

## Build iOS Apps, Build macOS Apps, and Cloudflare boundaries

**Verified.** The official Build iOS Apps plugin contains nine skills and an
XcodeBuildMCP definition. This repository already vendors those nine skills and
pins XcodeBuildMCP rather than using upstream `latest`. Do not add a second copy
to the new plugin. [Build iOS Apps source](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps)

**Verified.** The official Build macOS Apps plugin contains eleven skills. Its
own README explicitly excludes desktop UI automation. The skills most relevant
to this plugin work are `build-run-debug`, `test-triage`, `window-management`,
`appkit-interop`, and `telemetry`; packaging, notarization, and signing guidance
should remain out of scope unless a native helper becomes a distributed app.
[Build macOS Apps source](https://github.com/openai/plugins/tree/main/plugins/build-macos-apps)

**Decision.** Do not add the five macOS development skills in version 1. The
approved Appium pilot and exact-window Rust recorder cover the actual workflow;
the development skills would become relevant only if the repository adds a
Swift/Xcode macOS application target.

**Verified.** Cloudflare's official skills repository currently provides a
comprehensive `cloudflare` skill plus focused `workers-best-practices` and
`wrangler` skills, among others. The repository already has the comprehensive
skill at the upstream current commit. [Cloudflare skills](https://github.com/cloudflare/skills)

**Decision.** Retain the comprehensive skill for D1, Workers, and product
routing. No Cloudflare skill update or additional focused skill is warranted in
version 1: the installed pin is current, its references already cover Workers,
D1, and Wrangler, and extra `workers-best-practices`/`wrangler` entries would
create overlapping triggers. Reconsider a focused addition only after a concrete
forward-test gap. Project pins and `package-lock.json` must override any upstream
instruction to install `latest`; a skill may advise, but must not silently
upgrade this project's locked Wrangler or Workers types.

## Project-scope install and update enforcement

### Written policy

Add one concise, mechanical rule to `AGENTS.md`:

> Install third-party agent skills only with `gh skill` at explicit Codex
> project scope, after preview and license/source review, pinned to an immutable
> commit or approved tag. Never use user/system scope, `npx skills add`, or a
> personal marketplace for this repository. Keep plugin source and marketplace
> metadata in this repository; the desktop app's documented plugin cache is not
> authoritative source.

Use this canonical shape:

```sh
gh skill preview OWNER/REPO PATH/TO/SKILL.md
gh skill install OWNER/REPO PATH/TO/SKILL.md \
  --agent codex --scope project --pin COMMIT_SHA
```

**Verified.** `gh skill install` defaults to project scope but defaults to the
GitHub Copilot agent when noninteractive. It supports explicit `--agent codex`,
`--scope project`, and `--pin`; installed metadata enables update discovery.
Pinned skills are skipped by `gh skill update` unless explicitly unpinned.
The command is currently documented as preview. [GitHub CLI skill
install](https://cli.github.com/manual/gh_skill_install), [GitHub CLI
source](https://github.com/cli/cli#agent-skills)

**Inference.** Require all three flags even where defaults happen to match. The
redundancy makes intent machine-checkable and protects against preview-command
default changes.

### Hook policy

Add a plugin `PreToolUse` Bash hook that activates only when the current Git
root contains this project's stable markers. It should deny:

- `gh skill install` missing `--agent codex`, `--scope project`, or `--pin`;
- any `gh skill install --scope user`;
- `npx skills add`, direct writes to user/system skill directories, or similar
  bypasses;
- plugin-creator commands targeting the personal marketplace or paths outside
  this repository; and
- `codex plugin marketplace add` for this project, because the repo marketplace
  is discovered from source control and no personal marketplace registration is
  needed.

It should allow read-only `gh skill preview`, `search`, `list`, and `update
--dry-run`. Updating a pin should be a reviewed reinstall followed by a complete
diff and verification pass, not `gh skill update --unpin`.

Keep the existing project pre-tool hook for destructive/distribution policy.
The new hook should not duplicate those regexes because matching hooks run
concurrently and cannot order themselves.

Add unit tests for every allowed and denied form, compound-command cases, quoted
arguments, non-project directories, and malformed hook input. Extend the
repository hook verification command to run both suites.

### Audit script

`verify-project-dependencies.py` should fail when:

- a project skill with external source metadata is unpinned;
- a known dependency's source, path, or commit differs from the checked-in
  inventory;
- the plugin marketplace resolves outside the repository;
- duplicate skill names create ambiguous project triggers; or
- the automation plugin is missing its validated manifest, skills, or hook.

It must not scan or mutate personal skill directories. The project is
responsible for its declared dependency set, not for policing a user's entire
machine.

## Plugin scaffolding and validation

After grilling approves the design, use the built-in plugin creator with the
repository paths explicitly supplied:

```sh
python3 /absolute/path/to/plugin-creator/scripts/create_basic_plugin.py \
  honeymoon-period-automation \
  --path "$REPO_ROOT/plugins" \
  --marketplace-path "$REPO_ROOT/.agents/plugins/marketplace.json" \
  --with-skills --with-hooks --with-scripts --with-marketplace
```

Do not use the creator's default personal paths. Omit `.mcp.json` and
`.app.json` in the first version. Use the default `hooks/hooks.json` discovery
path and omit a manifest `hooks` field if the installed validator rejects it.

Validate each skill with the built-in skill creator's `quick_validate.py`, then
validate the plugin with plugin creator's `validate_plugin.py`. Inspect the
marketplace path resolution and refresh/install it from the desktop app in a new
task. The app loads a cached copy, so a source edit is not proven active until
the cachebuster/reinstall flow has completed and the new version is visible.

## End-to-end workflows to automate

### Author and build

1. Check prerequisites and canonical source.
2. Add a failing verifier assertion for the requested Shortcut behavior.
3. Edit Cherri source.
4. Run the focused Shortcut verifier.
5. Run shell/Python/hook checks and confirm generated output remains disposable.
6. Confirm the signed candidate exists and the Reminders baseline remains
   intentional.

### Install and configure on Mac

1. Verify the artifact before opening it.
2. Inventory exact installed names and configuration.
3. Import or replace only after explicit user authorization.
4. Answer import questions with synthetic local values.
5. Enable/read back required surfaces and assign a test keyboard binding.
6. Stop for TCC/system/Shortcuts consent.
7. Report stale copies; remove only with explicit scope.

### Simulate capture without UI

1. Reset the disposable D1 database.
2. Start the API on loopback.
3. Create a synthetic input file containing one local/example URL.
4. Run the unnumbered installed candidate with `shortcuts run --input-path`.
5. Query the API and assert exact source provenance and capture count.
6. Repeat to verify idempotent/existing behavior.
7. Stop the API and write a sanitized manifest.

### Record Mac UI proof

1. Use a dedicated desktop/Space with only the synthetic page and intended app
   visible.
2. Resolve the exact target window and validate its owner, title, bounds, and
   screen before recording.
3. Start a ScreenCaptureKit single-window recording; use a monitored rectangle
   fallback only if the user accepts that residual risk.
4. Invoke the configured Shortcut from Safari.
5. Verify both visible feedback and API persistence.
6. Stop recording immediately, scan the artifact manifest, and keep all output
   under `.build/review/apple/`.

### Record web review

1. Run focused authoritative Playwright assertions for viewing/detail,
   participant A and B voting, filtering/querying, sorting, and rank explanation.
2. Start a separate review recording with action/test annotations or Playwright
   CLI chapters.
3. Demonstrate those workflows against the deterministic seed.
4. Close the browser context so video finalization completes.
5. Write video, optional trace, and sanitized manifest to
   `.build/review/web/`.

## Recording privacy and artifact contract

Every review run should create a manifest with:

- scenario and lane (`mac-runtime`, `mac-ui`, `simulator`, or `web`);
- Git commit/worktree status without full diffs;
- tool versions and exact sanitized command;
- fixture identifier and local ports, but no bearer token;
- start/end timestamps, result, and asserted API/UI outcomes;
- intended window bundle ID/title or Simulator UDID; and
- artifact relative paths and SHA-256 values.

Recording rules:

- use only deterministic local/example fixtures;
- never capture the full Mac display;
- fail before recording if the target window cannot be uniquely identified;
- stop if window ownership or bounds unexpectedly change;
- exclude microphone and system audio unless separately approved;
- keep personal notifications, contacts, Dock content, menu-bar details, and
  unrelated apps outside the recorded window;
- never commit `.build/review/` artifacts;
- never attach unsanitized recordings to issues or messages; and
- require a human visual privacy check before any recording leaves the Mac.

Retention rules:

- keep the latest successful run for each lane and the latest failed run;
- keep any additional run only when it carries an explicit local `preserve`
  marker; and
- cleanup must remain confined to `.build/review/` and must never follow a
  symlink outside that directory.

Screen Recording, Accessibility, Local Network, Shortcuts privacy, Apple ID,
device trust, and similar dialogs remain human-only ceremonies under the lab
identity convention. An automation may surface and describe the dialog but may
not choose for the owner.

## Verification and forward-testing strategy

### Mechanical validation

1. Validate all four skills with `quick_validate.py`.
2. Validate the plugin manifest and marketplace with `validate_plugin.py`.
3. Unit-test each helper script with fixtures and failure cases.
4. Unit-test the install hook's allow/deny matrix.
5. Run `zsh -n`, Python compilation, hook tests, `git diff --check`, the focused
   Shortcut verifier, and the repository aggregate check.
6. Run the project dependency audit from a checkout with no user skill state
   assumed.

### Behavioral validation

1. Run the deterministic Mac Shortcut lane twice against a reset database.
2. Run the Mac UI proof once with a synthetic page and inspect the video.
3. After full Xcode is available, run one Simulator proof and capture
   XcodeBuildMCP/XCUIAutomation evidence.
4. Run the focused authoritative web tests and generate the combined web review
   video.
5. Verify all artifacts remain under `.build/review/` and no private data or
   secret appears in text logs or manifests.

### Skill forward-tests

Use fresh subagents with minimal task-local context, as required by the skill
creator guidance:

- “Use `$author-shortcut` to add one harmless synthetic verifier-backed
  behavior to the candidate.”
- “Use `$configure-shortcut-macos` to inventory and configure an already-built
  synthetic candidate, stopping at consent.”
- “Use `$prove-apple-ui-flow` to run the non-UI synthetic Mac capture and
  produce a manifest.”
- “Use `$record-web-mvp-review` to produce review evidence for voting and
  sorting.”

Do not tell the forward-test agent the expected failure or intended fix. Clean
disposable artifacts between runs, then use fresh independent verifier and
validator agents for final acceptance.

## Components deliberately excluded from version 1

- a ChatGPT Apps SDK app or custom UI;
- a new Shortcut/Appium/Playwright MCP server;
- physical-device automation by default;
- Maestro installation;
- full-display or microphone recording;
- production URLs, credentials, calendars, or user data;
- automatic consent handling;
- plugin-driven Git commits, publication, deployment, TestFlight, notarization,
  or distribution;
- copies of current project skills or XcodeBuildMCP inside the plugin;
- a broad Stop hook that runs the aggregate suite on every turn; and
- a SessionStart hook that repeats `AGENTS.md` or the project plan.

These exclusions keep the first plugin testable, local, and aligned with the
approved MVP rather than creating a second product.

## Recommended implementation sequence

1. Finish grilling and record the remaining decisions below.
2. Add the precise project-only install policy to `AGENTS.md` and extend the
   existing hook tests.
3. Scaffold the repository plugin and marketplace with plugin creator.
4. Create and validate the four skill shells with skill creator and
   writing-great-skills guidance.
5. Implement the deterministic Shortcut runtime lane first.
6. Implement the Playwright review lane and generate the first review video.
7. Use Record & Replay to capture Mac import/configuration, then harden it into
   the setup skill.
8. Implement the exact-window `screencapturekit-rs` recorder and reject any
   approach that writes full-display frames.
9. Add the two project agent profiles and serialize UI ownership.
10. Install only approved additional project skills at pinned commits, then run
    the Appium pilot after the full-Xcode human checkpoint.
11. Run forward-tests, full repository verification, fresh verifier, and fresh
    validator.
12. Create the final `/tmp` handoff for a new Codex app goal only after the plan
    is approved.

## Grilling status

The earlier design branches and update-cadence decisions are resolved, including
the approved names `honeymoon-period-automation`, `shortcut-specialist`, and
`review-recorder`. The MCP and Agent Skills follow-up reopened four bounded
decisions that must be grilled one at a time before consolidated-plan approval:

1. whether to add Shortcuts Playground as a pinned advisory compatibility
   pilot, with its hook disabled and Cherri/project verification authoritative;
2. whether to pilot Appium MCP with the proposed least-privilege configuration;
3. whether version 1 should retain the recommendation to build no custom MCP;
   and
4. whether to adopt the Agent Skills portability and validation corrections.

The user resolved the former fifth decision by explicitly approving a pinned,
project-only `last30days` installation. It remains outside the plugin bundle and
may supplement `/research` for current trends under the repository's
primary-source, artifact-location, credential, cost, and publication controls.

Automation-plugin implementation and remaining dependency installations remain
paused. After these decisions and consolidated-plan approval, create the durable
plan and final `/tmp` handoff for the new `/goal` task.

## Sources reviewed

Primary sources were accessed on 2026-07-16:

- [OpenAI Skills & Plugins](https://learn.chatgpt.com/docs/skills-and-plugins)
- [OpenAI Build plugins](https://learn.chatgpt.com/docs/build-plugins)
- [OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI Hooks](https://learn.chatgpt.com/docs/hooks)
- [OpenAI custom subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [OpenAI Record & Replay](https://learn.chatgpt.com/docs/extend/record-and-replay)
- [OpenAI plugin source](https://github.com/openai/plugins)
- [Cloudflare official skills](https://github.com/cloudflare/skills)
- [GitHub CLI `gh skill install`](https://cli.github.com/manual/gh_skill_install)
- [GitHub CLI source](https://github.com/cli/cli)
- [Microsoft Playwright documentation](https://playwright.dev/docs/intro)
- [Microsoft Playwright CLI skill source](https://github.com/microsoft/playwright-cli)
- [Apple XCTest and XCUIAutomation](https://developer.apple.com/documentation/xctest)
- [Apple ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit)
- [XcodeBuildMCP 2.6.2 documentation](https://www.xcodebuildmcp.com/docs)
- [Appium Mac2 source](https://github.com/appium/appium-mac2-driver)
- [Maestro platform documentation](https://docs.maestro.dev/getting-started/build-and-install-your-app)

Discovery indexes were used only to find candidates, not as authority for tool
behavior: [Awesome Codex Plugins](https://github.com/hashgraph-online/awesome-codex-plugins)
and [skills.sh](https://skills.sh/).
