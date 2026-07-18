# macOS Shortcuts sharing, Safari input, and local-network behavior

- **Status:** Researched
- **Last verified:** 2026-07-15
- **Question:** Why does a Safari share show an individual workflow under
  **Shortcuts**, how should the workflow be exposed as a Quick Action or keyboard
  shortcut, what input reaches it, and what does a missing network-permission
  prompt prove?

## Findings

### The nested macOS share-sheet entry is expected

**Verified.** Apple's macOS procedure is explicitly **Share → Shortcuts → select
a shortcut → Done**. “Show in Share Sheet” therefore exposes the Shortcuts app's
sharing extension, which then presents eligible workflows; it does not register
each workflow as a separate top-level macOS sharing service. Apple also requires
the Shortcuts sharing extension itself to be enabled in **System Settings →
Privacy & Security → Extensions → Sharing**. [Run a shortcut while working on
your Mac](https://support.apple.com/guide/shortcuts-mac/launch-a-shortcut-from-another-app-apd163eb9f95/mac),
[Adjust basic privacy settings in Shortcuts on
Mac](https://support.apple.com/guide/shortcuts-mac/apd961a4fc65/mac)

**Inference.** A separately named top-level sharing item would be a different
product surface: a native app Share extension. Apple's extension documentation
says macOS exposes Share extensions in the system sharing-services UI and
identifies their extension point as `com.apple.share-services`; that is not a
setting an individual Shortcuts workflow can acquire. [Apple App Extension
Programming Guide: Share](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html)

### Quick Actions, Services, and keyboard shortcuts are distinct surfaces

**Verified.** “Use as Quick Action” can expose a workflow in Finder's **Quick
Actions** menu. The workflow must also be enabled under **System Settings →
Privacy & Security → Extensions → Finder**. A **Services Menu** selection exposes
it through an app's Services menu, while **Add Keyboard Shortcut** assigns a key
combination that can run it from any macOS app. These are separate options in
Apple's workflow details, not ways to promote it to the top level of Safari's
Share menu. [Run a shortcut while working on your
Mac](https://support.apple.com/guide/shortcuts-mac/launch-a-shortcut-from-another-app-apd163eb9f95/mac)

**Verified.** The pinned Cherri compiler represents these settings separately:
`quickactions` maps to the workflow type `QuickActions`, `services` maps to the
Quick Action subtype `Services`, `sharesheet` maps to `ActionExtension`, and
`onscreen` maps to `ReceivesOnScreenContent`. Its compile fixture demonstrates
`#define from onscreen, quickactions` with `#define quickactions finder,
services`. [Cherri workflow-type mappings](https://github.com/electrikmilk/cherri/blob/68f3f3feaf00768f7943f650b2230605355936ed/shortcut.go#L282-L297),
[Cherri definition fixture](https://github.com/electrikmilk/cherri/blob/68f3f3feaf00768f7943f650b2230605355936ed/tests/definitions.cherri#L1-L11)

### Safari input depends on how the workflow is launched

**Verified.** When launched from another app's share sheet, the host passes its
content into the workflow's first action. Eligibility is controlled by accepted
input types: Apple gives the concrete example that a URL-only workflow appears
in Safari, and separately documents `Safari webpages` as a selectable type.
[Understanding input types in Shortcuts on
Mac](https://support.apple.com/guide/shortcuts-mac/apd7644168e1/mac), [Use the
Run JavaScript on Web Page action in Shortcuts on
Mac](https://support.apple.com/guide/shortcuts-mac/apdb71a01d93/mac)

**Verified.** Launch modes such as Siri or a keyboard shortcut need **Receive
What's On Screen** to pass the current item from a supported app such as Safari
into the first action. Without that setting, Apple does not promise that a
keyboard-triggered run receives Safari's page. [Receive onscreen items from
other apps](https://support.apple.com/guide/shortcuts-mac/apde1a4ac892/mac)

**Verified.** At the start of this investigation, the canonical API candidate
declared URL, text, rich text, and Safari webpage inputs, enabled only the
share-sheet launch surface, and fell back to the clipboard when there was no
input. Its first action extracts URLs from `ShortcutInput`; it stops before the
API request if no URL is found or if either imported configuration value is
empty. [Canonical candidate source](../../shortcut/Save%20Date%20Idea%20API.cherri)

**Inference.** For a keyboard shortcut that preserves the active Safari page,
the source-controlled configuration should add Cherri's `onscreen` workflow type
instead of relying on the clipboard fallback. Adding only a keyboard binding can
otherwise save a stale clipboard URL or stop with “No link found.” This follows
from Apple's input contract and the candidate's current no-input behavior.
[Receive onscreen items from other
apps](https://support.apple.com/guide/shortcuts-mac/apde1a4ac892/mac), [canonical
candidate source](../../shortcut/Save%20Date%20Idea%20API.cherri)

### Local diagnosis separated launch failure from response handling

**Observed locally.** The original Safari attempt activated the generic
Shortcuts sharing service but never launched a background run of the named API
workflow, and the local Worker received no request. The missing permission
dialog was therefore downstream of a simpler failure: the individual workflow
had not been selected from the nested picker.

**Observed locally after enabling Services and onscreen input.** The keyboard
Quick Action received Safari's current page and the Worker persisted the exact
source URL. The first revised workflow could still report failure *after* that
successful POST: its generated “all dictionary keys contains `error`”
conditional raised a Shortcuts runtime error. Removing that unnecessary guard
and branching directly on the response's documented `status` value made both a
new capture and a repeated capture finish successfully. The structural verifier
now rejects reintroducing the crashing all-keys guard. [Canonical candidate
source](../../shortcut/Save%20Date%20Idea%20API.cherri), [candidate structural
verifier](../../scripts/verify-save-date-idea-shortcut.py)

### No permission dialog is not evidence that the POST ran

**Verified.** Apple says Shortcuts requests access to necessary data when a
workflow runs, but describes the privacy dialog conditionally: **if** one
appears, the choices are Allow Once, Always Allow, or Don't Allow. “Always Allow”
suppresses the same request on later runs, and prior grants can be reviewed or
reset in the workflow's **Details → Privacy** tab. Apple does not document a
privacy dialog as a guaranteed side effect of every `Get Contents of URL`
request. [Adjust basic privacy settings in Shortcuts on
Mac](https://support.apple.com/guide/shortcuts-mac/apd961a4fc65/mac)

**Verified.** Apple documents that `Get Contents of URL` performs the API request
only when that action is run; it supports POST and a JSON request body. In this
candidate, URL extraction and three validation exits precede the request action.
Therefore, a Worker with no inbound request should first be diagnosed by proving
which installed copy ran, which input reached `ShortcutInput`, and which endpoint
and token values that installed copy retained—not by waiting for a permission
dialog. [Request your first API in Shortcuts on
Mac](https://support.apple.com/guide/shortcuts-mac/apd58d46713f/mac), [canonical
candidate source](../../shortcut/Save%20Date%20Idea%20API.cherri)

**Verified.** macOS separately offers per-app Local Network controls under
**System Settings → Privacy & Security → Local Network**. On iPhone and iPad,
Apple says an app asks the first time it tries to interact with devices on the
local network, and the decision can later be changed under **Privacy & Security
→ Local Network**. These OS controls are separate from a workflow's Shortcuts
privacy grants. [Control access to your local network on
Mac](https://support.apple.com/guide/mac-help/mchla4f49138/mac), [If an app would
like to connect to devices on your local
network](https://support.apple.com/102229)

## Practical conclusion

Keep **Show in Share Sheet** for the direct iPhone/iPad action and accept the
documented nested **Shortcuts** step on macOS. For fast Mac capture, expose the
workflow through **Services**, add a keyboard binding, and enable **Receive
What's On Screen** so Safari supplies the active page. Diagnose the missed POST
at the installed-workflow launch, input, configuration, request, and response
steps; the absence of an Allow dialog is not itself a failure signal.
