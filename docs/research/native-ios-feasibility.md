# Native iOS feasibility

- Status: primary-source findings retained; native SwiftUI destination accepted and implementation deferred until the web/API contract stabilizes
- Last verified: 2026-07-20
- Decision evidence: [approved Calendar V1 boundary](../product/requirements.md#approved-20-plan-and-calendar-boundaries)

## Sources reviewed

- [Build native iOS apps](https://learn.chatgpt.com/use-cases/native-ios-apps)
- [Debug in iOS Simulator](https://learn.chatgpt.com/use-cases/ios-simulator-bug-debugging)
- [Build App Intents](https://learn.chatgpt.com/use-cases/ios-app-intents)
- [Apple App Shortcuts](https://developer.apple.com/documentation/appintents/app-shortcuts)
- [Apple intent infrastructure](https://developer.apple.com/documentation/appintents/intent-infrastructure)
- [Apple simulated and physical devices](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices)

## Retained findings

- When native development begins, start with an iPhone-only SwiftUI app, a generated Swift 6 client, CLI-first `xcodebuild`, and narrow simulator validation. Do not add Tuist, iPad scope, profiling, or distribution infrastructure before a demonstrated need.
- A Share Extension remains the primary arbitrary-link capture surface. App Intents complement it for composed Shortcuts, scoring a known idea, and opening ranked ideas; they do not replace provider Share Sheet ingestion.
- A focused App Intents V1 can expose save, score, and show-top actions around a privacy-safe honeymoon-period entity. Defer metadata editing, booking, location search, batch operations, widgets, Live Activities, and broad indexing.
- The simulator workflow should reproduce one failure at a time: establish the starting UI, drive by accessibility identifiers, capture screenshot/hierarchy/log/LLDB evidence, make the smallest fix, and repeat the same path.
- Serialize simulator ownership. Parallel workers may review or run isolated unit tests, but should not drive the same simulator or Derived Data concurrently.

## Current prerequisite gap

Earlier inspection found only Command Line Tools selected; full Xcode and an iOS Simulator runtime were unavailable. Reverify before native work. Installing Xcode is a separate environment action, not part of the product bake-off.

## Simulator boundary

Simulator-first work can cover SwiftUI flows, deterministic URL fixtures, metadata forms, ranking logic, many Share Extension paths from Safari, local calendar fakes, accessibility, and logs. It cannot be final proof for real provider-app share sheets, production CloudKit sharing, GPS context, notifications/background behavior, real-device performance, or TestFlight onboarding.

## Apple service decision boundary

Calendar V1 is now approved as a user-confirmed EventKit system-editor export only,
with no calendar reads and no managed synchronization. That product boundary does not
authorize native implementation. Do not infer CloudKit, App Groups, direct EventKit
store access, or Google OAuth from feasibility alone; those remain later decisions.
Backend and client boundaries are recorded in
[ADR-0002](../adr/0002-api-first-web-mvp.md).
