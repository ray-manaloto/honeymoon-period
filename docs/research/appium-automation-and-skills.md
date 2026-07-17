# Appium automation and agent skills

- **Status:** Research complete; adoption decision remains for grilling
- **Last verified:** 2026-07-16
- **Question:** Can maintained Appium drivers, tools, MCP integration, and
  `appium/skills` replace custom macOS and iOS UI automation for this project?

## Recommendation

**Inference.** Adopt Appium as the preferred cross-application Apple UI
automation layer, but introduce it as a pinned project-local pilot before making
it a completion dependency.

- Use **Mac2** to replace bespoke AppleScript/Accessibility UI-driving code for
  the macOS Shortcuts and Safari workflow.
- Use **XCUITest** for iOS Simulator and explicitly authorized physical-device
  Share Sheet flows when Appium provides the required multi-app control.
- Pilot **Appium MCP** as the agent-facing interaction layer instead of writing
  a new MCP server or a bespoke WebDriver client.
- Retain **XcodeBuildMCP** for Xcode build, launch, log, debugger, and Simulator
  ownership. Route Appium to cross-app UI behavior so the two integrations do
  not compete for the same responsibility.
- Do not use Appium's macOS recording as review evidence: Mac2 records a display,
  not one privacy-isolated window. Reuse the Apache-2.0
  `screencapturekit-rs` library behind a thin project adapter if exact-window
  recording survives a focused forward-test.
- Do not install the current `appium/skills` entries with `gh skill` yet. Their
  required shared contexts and scripts are outside each skill directory and are
  omitted by the current installer preview, producing incomplete skills.

This changes the earlier plugin proposal: remove the custom
`configure-shortcut-macos.scpt` implementation and make the Apple UI skill an
Appium orchestrator. Keep Computer Use and Record & Replay for exploration,
consent handoff, and visual diagnosis rather than committed regression control.

## Adopt, pilot, keep, and exclude

| Capability | Decision | Reason |
| --- | --- | --- |
| Appium Mac2 Driver | **Pilot, then adopt if the Shortcut proof passes** | Mature W3C/XCTest driver for arbitrary macOS bundle IDs, semantic elements, keyboard/mouse input, app lifecycle, and AppleScript extensions. |
| Appium XCUITest Driver | **Pilot for multi-app iOS flows** | Maintained iOS Simulator and device automation with WebDriverAgent; it can cover system Share Sheet interaction that an app-scoped Swift UI test may not own conveniently. |
| Appium MCP | **Pilot as the agent-facing layer** | Already exposes sessions, locators, gestures, assertions, screenshots, recordings, permissions, and test-generation guidance. Do not build a competing MCP server. |
| WebdriverIO | **Use only if committed Appium tests need a runner beyond MCP** | Appium's JavaScript quickstart uses the maintained WebdriverIO client. Avoid a direct protocol client. |
| Appium Inspector | **Optional developer aid** | Maintained visual page-source, locator, and command inspector; useful for authoring but not a reproducible test authority. |
| `appium/skills` `setup` | **Do not install until packaging is self-contained** | `gh skill` omits the top-level context assets and helper scripts the skill requires. |
| `appium-troubleshooting` | **Same packaging hold** | Useful for XCUITest failures, but it does not implement Mac2 troubleshooting and currently loses its shared references on install. |
| `xcuitest-real-device-config` | **Same packaging hold** | Strong device/signing procedure, but physical-device work remains explicit and its shared assets are not installed. |
| XcodeBuildMCP 2.6.2 | **Keep** | Existing pinned build/debug/log/Simulator integration. Appium should not duplicate these lanes. |
| Computer Use and Record & Replay | **Keep as fallback/discovery** | Useful for first observation and human-guided consent; weaker than source-controlled Appium locators and assertions. |
| Custom Mac UI driver or new MCP server | **Exclude** | Appium already owns these interfaces. |
| Appium Mac2 screen video | **Exclude as review evidence** | Captures a display and may expose unrelated content. |
| `screencapturekit-rs` | **Preferred recording library pilot** | Maintained Apache-2.0 bindings support exact window filters and direct-to-file recording. |
| SwiftCapture | **Exclude for now** | Its CLI advertises app recording, but GitHub did not detect a repository license during this review. |

## Verified Appium capabilities

### Mac2

**Verified.** Appium Mac2 is an Appium 3 driver backed by Apple's XCTest. It can
launch or foreground an arbitrary installed macOS application by bundle ID,
query its accessibility tree through W3C WebDriver, interact with elements,
activate and terminate other apps, open deep links, and run bounded AppleScript
extensions. Its doctor command validates most environment requirements.
[Appium Mac2](https://github.com/appium/appium-mac2-driver)

**Verified.** Mac2 also exposes two recording paths, but both select a display:
FFmpeg recording takes a screen device index, while native XCTest recording
takes a display ID. Neither API documents a single-window content filter.
[Mac2 recording commands](https://github.com/appium/appium-mac2-driver#macos-startrecordingscreen)

**Inference.** Mac2 can replace custom UI-driving code for importing and
configuring the Shortcut, opening a synthetic Safari page, invoking the Services
or keyboard workflow, and checking visible feedback. It cannot satisfy the
already-approved window-only recording rule.

### XCUITest

**Verified.** Appium's XCUITest driver automates iOS and tvOS through
WebDriverAgent on Simulator and real devices. Appium publishes separate setup,
troubleshooting, and real-device provisioning guidance for it.
[XCUITest driver](https://github.com/appium/appium-xcuitest-driver),
[Appium real-device guide](https://appium.github.io/appium-xcuitest-driver/latest/preparation/real-device-config/)

**Inference.** XCUITest is most valuable here for a system-level journey across
Safari, the Share Sheet, Shortcuts, and visible completion state. Product-owned
native screens should still prefer committed XCTest/XCUIAutomation tests in the
future Xcode project; web behavior remains Playwright-owned.

### Appium MCP and existing clients

**Verified.** `appium/appium-mcp` is an Apache-2.0 MCP server in the Appium
organization. Version `1.87.6` exposes device/session management, element
finding, gestures, keyboard input, lifecycle control, permissions, screenshots,
screen recording, and guided test generation. It embeds local Android and iOS
drivers and can connect to an existing Appium server with `platform=general`,
which is the route for Mac2. [Appium MCP](https://github.com/appium/appium-mcp)

**Verified.** Appium MCP's recording tool explicitly accepts only Android and
iOS sessions. A remote Mac2 session can use the generic WebDriver interaction
tools, but not that MCP recording tool. Its test-generation guidance emits an
Appium/WebdriverIO-style test after exercising the live session; the older
README summary still mentions Java/TestNG, so generated code must be reviewed
against the current tool response rather than trusted blindly.
[Appium MCP screen-recording source](https://github.com/appium/appium-mcp/blob/main/src/tools/interactions/screen-recording.ts),
[test-generation source](https://github.com/appium/appium-mcp/blob/main/src/tools/test-generation/generate-tests.ts)

**Verified.** Appium's JavaScript quickstart recommends an Appium-compatible
client and demonstrates WebdriverIO. Appium Inspector is a separately maintained
GUI for screenshots, page source, element interaction, and locator development.
[Appium JavaScript quickstart](https://appium.io/docs/en/latest/quickstart/test-js/),
[Appium Inspector](https://github.com/appium/appium-inspector)

**Inference.** First pilot Appium MCP because it already supplies the agent tool
schemas. If stable committed Mac2 tests are required, use WebdriverIO rather than
writing a direct WebDriver adapter. Inspector is optional and must not become a
required manual gate.

## Environment and version facts

The following were observed locally or from current package metadata on
2026-07-16:

- Appium `3.5.2`;
- Mac2 Driver `4.0.4`;
- XCUITest Driver `11.17.7`;
- Appium MCP `1.87.6`;
- `appium/skills` commit
  `91884b938fe89a40d1301b2a0300ec82fbe9e23a`;
- repository shell Node `26.5.0` and npm `12.0.1`;
- Codex bundled Node `24.14.0`; and
- Command Line Tools selected at `/Library/Developer/CommandLineTools`, with no
  full Xcode application found.

**Verified.** Appium MCP declares Node `>=22 <26`; the repository's current Node
26 is outside that supported range, while the Codex bundled Node 24 is inside.
Mac2 and XCUITest require full Xcode, so neither can run on this Mac until Xcode
is installed and selected. [Appium MCP package](https://www.npmjs.com/package/appium-mcp),
[Mac2 requirements](https://github.com/appium/appium-mac2-driver#requirements)

**Inference.** Do not hard-code the Codex runtime's absolute Node path into the
plugin. If Appium MCP is accepted, pin a portable project Node 24 toolchain
before adding the MCP dependency. Full Xcode installation/selection is a precise
human checkpoint and should precede the Appium proof ticket.

## `appium/skills` packaging result

The official repository currently exposes four skills:

- `skills/setup/SKILL.md`;
- `skills/appium-troubleshooting/SKILL.md`;
- `skills/xcuitest-real-device-config/SKILL.md`; and
- `skills/prepare-development-environment/SKILL.md`.

The first three are relevant. The development-environment skill is for
contributing to `appium/skills` itself and is not a project dependency.
[Appium agent skills](https://github.com/appium/skills)

**Verified locally.** This command:

```sh
GH_PAGER=cat gh skill preview appium/skills \
  skills/setup/SKILL.md@91884b938fe89a40d1301b2a0300ec82fbe9e23a
```

showed only:

```text
setup/
└── SKILL.md
```

The skill requires files such as
`contexts/tools/appium/setup/routing.md`, driver profiles, references, and
`tools/appium/setup/scripts/check-*.mjs`. Those top-level assets were absent
from the preview. The other relevant skills use the same shared-asset layout.

**Inference.** Installing these skills now with `gh skill --scope project` would
give agents authoritative-looking but incomplete workflows. Do not copy the
missing files into each skill; that would duplicate upstream work and create an
unmaintainable fork.

Safe options, in order:

1. retain the complete upstream repository at an exact commit as a project
   dependency and expose thin project-local adapters that load its entrypoints
   and root-level assets in place;
2. use Appium MCP's opt-in `appium_skills`/documentation tool during the pilot
   if its packaged content passes a forward-test; or
3. wait for `appium/skills` to publish self-contained install artifacts or for
   `gh skill` to support its shared repository layout.

Install the upstream skills with `gh skill` only after a preview proves every
required asset is present.

Do not publish an upstream issue or modify external state without separate
authorization.

## Installation documentation audit (2026-07-16)

**Verified.** Appium does not currently document a command for installing these
workflows into Codex, Claude, or another agent host. Its README instead calls
the architecture **repository-first**: each `SKILL.md` is an entrypoint, while
shared knowledge and deterministic helpers remain in top-level `contexts/` and
`tools/` so multiple skills can reuse them. `AGENTS.md` tells an agent to load
the repository guide, then the selected skill and its routed repository assets.
A search of the pinned repository and its history found no `gh skill`,
`npx skills`, `.agents/skills`, or `.claude/skills` installation procedure.
[`README.md` at the reviewed commit](https://github.com/appium/skills/blob/91884b938fe89a40d1301b2a0300ec82fbe9e23a/README.md),
[`AGENTS.md` at the reviewed commit](https://github.com/appium/skills/blob/91884b938fe89a40d1301b2a0300ec82fbe9e23a/AGENTS.md)

**Verified.** The repository's `setup` skill installs and validates the Appium
runtime and selected drivers; it is not a skill-installer procedure. It requires
`contexts/tools/appium/setup/routing.md`, calls helpers below
`tools/appium/setup/scripts/`, and hands off to sibling skills. The
`prepare-development-environment` skill likewise assumes the complete
repository root and explicitly says standalone packaging is a separate
architecture change. Local Appium mode is supported, but commands must run from
the consuming project root with an existing `npx --no-install appium` binary.
[`setup/SKILL.md`](https://github.com/appium/skills/blob/91884b938fe89a40d1301b2a0300ec82fbe9e23a/skills/setup/SKILL.md),
[`setup routing`](https://github.com/appium/skills/blob/91884b938fe89a40d1301b2a0300ec82fbe9e23a/contexts/tools/appium/setup/routing.md),
[`local-npx profile`](https://github.com/appium/skills/blob/91884b938fe89a40d1301b2a0300ec82fbe9e23a/contexts/tools/appium/setup/profiles/local-npx.md),
[`prepare-development-environment/SKILL.md`](https://github.com/appium/skills/blob/91884b938fe89a40d1301b2a0300ec82fbe9e23a/skills/prepare-development-environment/SKILL.md)

**Verified.** GitHub CLI can install at Codex project scope, but it discovers
and copies individual skill directories into `.agents/skills`. The Agent Skills
specification defines resources inside the skill directory and resolves file
references from the skill root. Appium instead keeps required resources outside
each skill directory. At commit
`91884b938fe89a40d1301b2a0300ec82fbe9e23a`, `gh skill preview` showed only
`SKILL.md` for all four discovered Appium skills. Consequently, `--all`,
`--from-local`, or `--dir` can change selection or destination but cannot retain
the missing repository-root relationships.
[GitHub CLI `gh skill install`](https://cli.github.com/manual/gh_skill_install),
[Agent Skills directory and reference rules](https://agentskills.io/specification)

**Inference and recommendation.** The faithful project-scoped integration is a
complete, read-only checkout pinned to the reviewed commit, preferably a Git
submodule below `vendor/appium-skills/`, plus thin project-owned skills under
`.agents/skills/`. Each adapter should verify the upstream URL and commit, load
the upstream `AGENTS.md`, selected `SKILL.md`, and routed assets by explicit
repository-root paths, and invoke read-only helpers from this product's root so
its local Node/Appium dependencies remain authoritative. Keep the upstream
checkout outside `.agents/skills/` to avoid accidental discovery of incomplete
raw entrypoints. This preserves all upstream skills, contexts, tools, examples,
profiles, references, and safety guidance without copying or forking them.

This is an explicit exception to the project's ordinary `gh skill --agent
codex --scope project --pin ...` rule because Appium publishes one
repository-composed workflow graph rather than self-contained installable skill
directories. The dependency audit should require the exact repository URL,
commit, submodule path, clean checkout, and adapter path checks. A plain ignored
clone is acceptable for a disposable experiment but not as the reproducible
project dependency.

## Exact project-local dependency posture

If the pilot is approved:

1. Pin a supported Node 24 runtime for the Appium lane.
2. Add exact project dev dependencies; do not use global npm installation.
3. Set `APPIUM_HOME` to an ignored repository-owned path such as
   `.build/appium-home` and install the exact Mac2 driver there.
4. Pin Appium MCP exactly and expose it from the repository plugin only after
   its tool allowlist is narrowed to the approved session, interaction,
   screenshot, and evidence operations.
5. Keep AI-vision finding, telemetry argument capture, remote uploads, app
   deletion, and permission mutation disabled by default.
6. Serialize Appium, XcodeBuildMCP, Computer Use, ScreenCaptureKit recording,
   and shared development-server ownership.
7. Store screenshots, videos, logs, and manifests only below
   `.build/review/` with synthetic data.

The `appium/skills` setup workflow defaults to global Appium installation, but
supports an explicitly requested local `npx --no-install appium` lane. This
project must always choose the local lane if the skill becomes installable.

## Recording without handwritten bindings

**Verified.** `screencapturekit-rs` is an actively maintained Apache-2.0 Rust
binding for Apple's ScreenCaptureKit. It supports window-specific content
filters and direct-to-file recording on supported macOS versions. The current
Mac already has Rust/Cargo. [screencapturekit-rs](https://github.com/doom-fish/screencapturekit-rs)

**Inference.** A thin CLI adapter that selects exactly one window by bundle ID,
title, and window ID, disables audio, records to a caller-provided path, and
fails when the identity changes is justified project behavior. It reuses the
maintained binding instead of recreating ScreenCaptureKit FFI or a general
recorder.

`GlennWong/SwiftCapture` advertises application recording and JSON inventory,
but GitHub reported no license for the repository during this review. Do not
vendor or depend on it without a verified license.

## No-duplication gate for the plugin plan

Before any custom automation module is accepted, its ticket and verifier report
must show:

1. existing repository commands and tests inspected;
2. installed project skills/plugins inspected;
3. official vendor tools, drivers, MCP servers, and maintained clients checked;
4. vetted discovery candidates followed to their owning source;
5. the exact missing capability demonstrated by a focused forward-test; and
6. the proposed custom implementation reduced to the thinnest adapter around a
   maintained interface.

Hooks can enforce exact install scope, pins, forbidden personal paths, and
generated-file edits. They cannot prove that an agent performed a meaningful
capability search. Enforce that semantic gate through the workflow skills,
ticket template, code review, verifier acceptance criteria, and dependency
audit.

## Proposed proof before final adoption

After full Xcode is available, one bounded pilot should:

1. run Appium and Mac2 entirely from project-local pinned state;
2. inspect `com.apple.shortcuts` and Safari with stable semantic locators;
3. import/configure only a synthetic candidate after explicit authorization;
4. invoke the Shortcut from a synthetic local page;
5. assert exact API persistence and idempotent replay;
6. drive an iOS Simulator Share Sheet with XCUITest or Appium MCP;
7. record only the Mac target window through the maintained ScreenCaptureKit
   binding and record only the synthetic Simulator display; and
8. compare reliability and evidence quality with Computer Use and
   XcodeBuildMCP without maintaining two authoritative tests for one behavior.

Adopt Appium when the Mac and Simulator flows pass repeatedly with stable
locators and clean teardown. Otherwise retain it as an exploratory tool and
keep the deterministic CLI/API tests authoritative.

## Remaining decision

Should the next goal include the full-Xcode human checkpoint and an Appium
pilot, replacing the planned custom Mac UI driver?

**Recommendation:** yes. The evidence is strong enough to test the maintained
Appium path first, but not strong enough to install incomplete skills or declare
Appium a completion dependency before the proof passes.

## Sources reviewed

Primary sources accessed 2026-07-16:

- [Appium documentation](https://appium.io/docs/en/latest/)
- [Appium Mac2 Driver](https://github.com/appium/appium-mac2-driver)
- [Appium XCUITest Driver](https://github.com/appium/appium-xcuitest-driver)
- [Appium MCP](https://github.com/appium/appium-mcp)
- [Appium Inspector](https://github.com/appium/appium-inspector)
- [Appium agent skills](https://github.com/appium/skills)
- [GitHub CLI skill installation](https://cli.github.com/manual/gh_skill_install)
- [XcodeBuildMCP tools](https://www.xcodebuildmcp.com/docs/tools)
- [ScreenCaptureKit](https://developer.apple.com/documentation/screencapturekit)
- [screencapturekit-rs](https://github.com/doom-fish/screencapturekit-rs)
