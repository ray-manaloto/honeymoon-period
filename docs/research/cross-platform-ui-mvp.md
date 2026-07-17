# Cross-platform UI frameworks for a replaceable MVP

- Status: research complete; React-admin + Vite source-controlled web MVP selected
- Last verified: 2026-07-15
- Accessed: 2026-07-15
- Evidence boundary: official documentation, official repositories, and first-party release/pricing material only
- Question: which shared UI framework can deliver the current product workflow quickly, preserve hot reload for web development, work well with generated OpenAPI clients and coding agents, and remain disposable when platform-native UIs replace it?

## Answer

Build the first interactive UI as a **responsive browser application**, not as the permanent iOS or Android application. Keep all domain behavior behind the versioned OpenAPI contract. The current Shortcut remains the capture surface; the browser UI supplies review, voting/scoring, sorting, ranking explanation, notes, and metadata.

There is no single free evaluated option that simultaneously provides generated screens, OpenAPI import, conventional exported source, Git-based agent workflows, repository lint/static-analysis gates, hot reload, and platform-native output. The practical choice is therefore between:

1. **ToolJet Free as a disposable two-page validation UI.** It can generate up to two pages, imports OpenAPI operations, provides responsive desktop/mobile layouts, and can be cloud-hosted or self-hosted. Its free plan is limited to two apps, 50 end users, and 100 AI credits; version control and Git sync are paid, and export is ToolJet application JSON rather than standalone frontend source. [ToolJet pricing](https://www.tooljet.ai/pricing), [OpenAPI data source](https://docs.tooljet.ai/docs/data-sources/openapi/), [application export](https://docs.tooljet.ai/docs/development-lifecycle/import-export/importing-exporting-applications/)
2. **React-admin 5 on Vite 8 as a source-controlled responsive SPA.** It has the strongest open-source CRUD surface, conventional TypeScript source, hot module replacement, and official coding-agent guidance. No proven official generator was located for either its OpenAPI `dataProvider` or its product-specific presentation source, so the selected path explicitly authorizes project-owned scaffolding generators and Codex/Sites-generated presentation source. [React-admin documentation](https://marmelab.com/react-admin/documentation.html), [data providers](https://marmelab.com/react-admin/DataProviders.html), [coding-agent guide](https://marmelab.com/react-admin/CodingAgents.html)

The owner accepted **React-admin + Vite** for the source-controlled MVP and explicitly authorized Codex/Sites-generated presentation source. Deterministic generators own transport clients, models, validators, mocks, and routine provider/resource scaffolding; generated output is never hand-edited. Product-specific presentation remains ordinary reviewed source. Neither React-admin nor its query encoding may reshape the public `/v1` contract. ToolJet remains rejected for the canonical MVP because its free runtime weakens source-control, lint, static-analysis, and portability guarantees. See [ADR-0002](../adr/0002-api-first-web-mvp.md).

On the source-controlled React-admin or Refine branch, use **Vite 8**, whose stable release uses Rolldown as a unified Rust-based bundler and Oxc for the default React transform. Vite retains hot module replacement and, when a coding agent is detected, can forward browser console output to the terminal. ToolJet uses its own runtime rather than Vite. [Vite 8 announcement](https://vite.dev/blog/announcing-vite8)

Use three complementary web-verification layers rather than treating any one tool as sufficient. Committed Playwright tests are the reproducible end-to-end and CI contract. ChatGPT's built-in Browser supplies shared localhost preview, screenshots, and element-level annotations. With Developer mode explicitly enabled and CDP access approved per site, Browser can also inspect the DOM, applied styles, console/runtime errors, local storage, network traffic, and performance traces. The OpenAI demonstration reinforces a measure-first loop: profile the failing interaction, fix the evidenced bottleneck, and retain comparable before/after measurements. Browser/CDP is an interactive diagnostic surface, not a replacement for Playwright tests, and full CDP access can expose sensitive browser internals. [Browser and Developer mode](https://learn.chatgpt.com/docs/browser?surface=app#app-developer-mode), [CDP debugging demonstration](https://www.youtube.com/watch?v=bhgYFRZLyKI)

This is deliberately a disposable presentation layer. Later clients should be platform-native:

- SwiftUI on iOS with a generated Swift 6 client;
- Jetpack Compose on Android with a generated Kotlin client;
- an ordinary browser UI with the generated TypeScript client; and
- a TUI/CLI with a generated Rust client.

OpenAPI Generator currently lists stable or supported client generators for TypeScript Fetch/Axios, Swift 6, Kotlin, Dart/Dio, C#, and Rust. Generated output should be reproducible and never hand-edited. [OpenAPI Generator client list](https://openapi-generator.tech/docs/generators/)

If a packaged iOS/Android application becomes necessary **before** the native rewrite, choose one of two explicit bridges:

1. **Expo + React Native Web** when native mobile behavior and AI-agent tooling matter more than prebuilt CRUD screens.
2. **Ionic React + Capacitor** when reusing the web UI nearly unchanged matters more than native rendering.

Do not begin with Flutter, Compose Multiplatform, Tauri, NativeScript, .NET MAUI, Tamagui, or Skip for this MVP. They remain credible later choices, but they do not remove enough screen composition and API integration work to satisfy the strict generation rule.

## Important constraint: OpenAPI does not generate the product

An OpenAPI document can generate transport models, serialization, clients, server interfaces, mocks, and contract tests. It does **not** encode whether a preference is private, how a ranking is explained, which actions are primary, or how a couple reviews two independent votes. Those are presentation and business decisions.

No evaluated cross-platform framework can generate a polished consumer workflow from OpenAPI alone. React-admin and Refine can generate or infer generic CRUD pages, but the following still require declarative product configuration or business-specific views:

- independent actor-owned vote/score controls;
- an explanation of ranking factors;
- capture provenance and duplicate handling;
- special/deadline presentation;
- plan/completion actions; and
- privacy-aware visibility.

Under the strict “no handwritten code except business logic” rule:

- **generated:** OpenAPI types and clients, server interfaces, validation, API mocks, fixtures, and routine resource scaffolding;
- **framework-owned, generated, or visually configured:** routing, forms, tables/lists, pagination, sorting controls, navigation, loading/error states, accessibility primitives, styling tokens, and complete screen composition;
- **handwritten:** only actual product rules such as ranking/voting semantics, authorization decisions, and orchestration.

Because handwritten declarative screen composition is prohibited, a low-code application builder or a complete presentation-source generator—not an ordinary UI framework alone—is required. Visual application definitions are generated/configured artifacts, not conventional source that the repository's TypeScript/Swift/Kotlin linters can fully analyze.

## MVP UI surface

The framework only needs to cover these screens because Shortcut capture continues to call the public API directly:

1. Candidate list with sort/filter and visible ranking reasons.
2. Candidate detail with source link/provenance and metadata.
3. Independent vote/score form for the current actor.
4. Notes and structured metadata editing.
5. Planned/completed state changes.
6. Loading, empty, stale, authorization, and enrichment-failure states.

This is a CRUD-heavy responsive application with a few domain-specific controls. It is not yet a native Share Extension, offline-first mobile product, map-heavy application, or desktop application.

## Decision matrix

Ratings are project-fit inferences from the cited capabilities, not vendor benchmarks.

| Candidate | Actual UI/runtime | Browser and reload path | Ready-made MVP surface | OpenAPI/generated-client fit | First-party agent support found | Replacement cost | MVP verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **React-admin + Vite 8** | React DOM browser SPA | Stable web; Vite HMR; Rust Rolldown/Oxc toolchain | **Excellent:** list, table, simple list, filters, sorting, forms, inputs, show/edit/create, auth/access hooks | Generated TypeScript client plus project-owned provider/resource scaffolding | **Excellent:** official skill plus Context7 instructions | Low after generators exist; medium until then | **Selected:** generated plumbing plus agent-generated presentation source |
| **Refine + Vite 8** | Headless React web framework with chosen UI library | Stable web; Vite HMR/Rust toolchain | **Excellent:** CRUD generation, routing, auth/access, TanStack Query; Ant Design/MUI/Mantine/Chakra integrations | REST provider is configurable; nonstandard responses require mapping | No first-party agent skill/MCP located in reviewed official docs | Low-medium | Runner-up when a consumer-styled UI matters more than minimum code |
| **Expo + React Native Web** | Native platform views on iOS/Android; DOM primitives on web | Universal Fast Refresh for Android/iOS/web | Good primitives, routing, lists, forms through libraries; no built-in CRUD application | Generated TypeScript client works directly | **Best:** official Codex skills/plugin, MCP, `llms.txt`, agent-ready templates | Medium: React component logic may help; UI is rewritten in SwiftUI/Compose | Best packaged-mobile bridge |
| **Ionic React + Capacitor** | Web Components in browser; embedded WebView in packaged mobile apps | Web dev server/HMR through React/Vite; same web app packages to iOS/Android | Good: 100+ mobile components, lists, inputs, navigation, modals; no CRUD resource layer | Generated TypeScript client works directly | No first-party skill/MCP located in reviewed official docs | Low for web, medium for native replacement | Best “wrap the web app” bridge |
| **Flutter** | Flutter engine renders its own widgets; CanvasKit/skwasm on web | Stable web plus stateful hot reload | Strong Material/Cupertino widgets, forms, navigation; no resource CRUD generator in core | Generated Dart or Dart/Dio client | **Excellent:** official skills and experimental Dart/Flutter MCP for Codex | High: Dart/widget UI is replaced | Strong general framework, wrong disposable MVP |
| **Compose Multiplatform** | Compose rendering on Android/iOS/desktop; Kotlin/Wasm renderer on web | Mobile/desktop stable; web Beta; stable bundled Compose Hot Reload | Material components/navigation; no CRUD application layer | Generated Kotlin client | No framework-specific agent skill/MCP located in reviewed first-party material | High for web/native-platform rewrite | Reject while web remains Beta |
| **Tamagui + Expo** | React Native/native views on mobile and DOM on web, with compiler and optional UI kit | Expo Fast Refresh; Vite possible for web-only configurations | Good design-system primitives; less CRUD automation than React-admin/Refine | Generated TypeScript client | Benefits from Expo skills; no separate official Tamagui skill found | Medium | Add only if Expo is chosen and shared design primitives are worth another layer |
| **NativeScript** | Direct native iOS/Android views from TypeScript | Mobile live development; no equally mature single browser UI target established by core docs | Basic controls, list, form inputs, navigation; no CRUD resource layer | Generated TypeScript client | `llms.txt` exists; no official task-skill/MCP located | High for web-first MVP | Reject for required web-first workflow |
| **.NET MAUI / Blazor Hybrid** | Native controls with MAUI; HTML/CSS in embedded WebView with Blazor Hybrid | XAML/C# hot reload; Blazor web is a separate deployment model | Good controls and community toolkit; no CRUD application layer equivalent | Generated C# client | Repository has agent assets, but no public framework skill/MCP comparable to Expo/Flutter/react-admin was located | High: C#/XAML/Razor UI rewrite | Reject absent an existing .NET codebase |
| **Tauri 2** | Any web frontend inside OS WebViews; Rust application shell | Uses the selected web frontend dev server/HMR | No UI kit or CRUD layer; must add React-admin/Refine/Ionic | Generated TypeScript/Rust client works | No first-party task skill/MCP located in reviewed official docs | Medium; frontend can survive, native shell does not help this MVP | Reject: desktop-first strength is irrelevant |
| **Skip** | SwiftUI on iOS and generated/compiled Jetpack Compose on Android | Native mobile build loop; no web target | SwiftUI/Compose primitives; no web CRUD surface | Generated Swift client can be shared; Android generation adds another compiler layer | No first-party Codex skill/MCP located | Low between its two mobile targets, **not applicable to web** | Interesting native-mobile experiment later, not MVP |

## Low-code and generated-app builders

These tools were added because they come closer than shared UI frameworks to “no handwritten code except business logic.” They are application runtimes, however, not interchangeable source-code generators.

| Candidate | OpenAPI/REST onboarding | Generated UI and mobile behavior | Free/self-host boundary | Source control, export, and agent fit | Verdict |
| --- | --- | --- | --- | --- | --- |
| **ToolJet** | Imports OpenAPI JSON/YAML and generates REST operations, including documented auth schemes | AI can generate a working app; free tier allows up to two generated pages; separate responsive desktop/mobile layouts; browser runtime, not native controls | Cloud and self-host free: 2 builders, 50 users, 2 apps, 100 monthly AI credits; AGPL-3.0 community code | Version control is Pro and Git sync is Team; app export is ToolJet JSON; MCP is enterprise self-hosted. Repository lint/static analysis cannot validate the whole visual app | **Best strict no-code MVP candidate**, if two pages suffice and disposable lock-in is accepted |
| **Budibase** | Imports OpenAPI 2/3 JSON/YAML into multiple REST queries; imported auth, base URL, and bodies still require validation | Responsive multi-screen browser apps with components and data-derived screens; PWA packaging is documented as enterprise-only | Current managed cloud starts paid; open-source self-host is free with unlimited apps/users/actions | Workspace export is a Budibase JSON artifact, not standalone application source; no equivalent free Git source workflow was located; custom transformations use JavaScript | Strong self-hosted runner-up; weaker AI generation and source-control fit than ToolJet |
| **Appsmith** | Flexible REST query editor and cURL import, but no official OpenAPI-spec import was located | Drag/drop responsive internal-tool UI; browser runtime, not native output; interactions and transformations commonly use queries and JavaScript | Free cloud supports up to 5 users, 5 workspaces, and 3 Git repositories; free self-hosting; Apache-2.0 core | Git support is unusually good on free, but it versions Appsmith application definitions; export is an Appsmith JSON blueprint, not standalone React source | Best free Git story, but manual REST wiring violates the transport-generation rule |
| **FlutterFlow** | Swagger/OpenAPI import exists, but current first-party pages conflict: the detailed plan comparison lists Basic while the public pricing page lists Growth; conservatively assume Growth until confirmed. Free permits only two manually defined API endpoints | Visual builder generates Flutter apps for mobile, web, and desktop; preview plus web test mode/hot reload; native-capable Flutter output | Proprietary managed service; free permits 2 projects and web publishing, but no self-hosting | Code download and experimental MCP start at Basic ($39/month); GitHub starts at Growth ($80/month for first seat); OpenAPI is disputed Basic-versus-Growth and should be budgeted as Growth. Free output is not exportable source | Best native-capable generator evaluated, but its critical portability and OpenAPI features are paid and therefore out of scope |

Primary evidence: [ToolJet platform](https://docs.tooljet.ai/docs/getting-started/platform-overview/), [ToolJet pricing](https://www.tooljet.ai/pricing), [ToolJet repository/license](https://github.com/ToolJet/ToolJet), [Budibase OpenAPI import](https://docs.budibase.com/docs/rest-query-import), [Budibase mobile design](https://docs.budibase.com/docs/designing-for-mobile), [Budibase pricing](https://budibase.com/pricing/), [Budibase export](https://docs.budibase.com/docs/export-and-import-apps), [Appsmith introduction](https://docs.appsmith.com/), [Appsmith REST API](https://docs.appsmith.com/connect-data/reference/rest-api), [Appsmith pricing](https://www.appsmith.com/pricing), [Appsmith repository/license](https://github.com/appsmithorg/appsmith), [FlutterFlow pricing](https://flutterflow.io/pricing), [FlutterFlow plan comparison](https://docs.flutterflow.io/accounts-billing/plan-comparison/), [FlutterFlow OpenAPI import](https://docs.flutterflow.io/resources/backend-logic/create-test-api/), [FlutterFlow run modes](https://docs.flutterflow.io/testing/run-your-app/), [FlutterFlow source export boundary](https://docs.flutterflow.io/flutterflow-ui/toolbar/).

## Shortlist in detail

### 1. React-admin + Vite 8 — selected source-controlled MVP

React-admin 5.15 documents a browser SPA framework with more than 170 open-source hooks/components. Its resource primitives include list, simple list, data table, create, edit, show, filtering, sorting, pagination, fields, inputs, forms, authentication, access control, notifications, themes, and internationalization. [React-admin documentation](https://marmelab.com/react-admin/documentation.html), [feature overview](https://marmelab.com/react-admin/Features.html)

The data-provider boundary is both its advantage and the main integration constraint. React-admin does not call a generated OpenAPI client automatically; it calls a `dataProvider` interface. The official Simple REST provider maps resource operations to conventional `GET`, `POST`, `PUT`, and `DELETE` requests and expects a `Content-Range` header for list totals. [React-admin data providers](https://marmelab.com/react-admin/DataProviders.html)

The public API must not conform itself to React-admin's Simple REST query encoding merely to avoid UI work; that would leak a disposable frontend convention into every future generated client. No official, maintained OpenAPI-to-React-admin adapter or presentation-source generator was located in the reviewed primary sources. The selected path therefore uses project-owned deterministic generation for the `dataProvider` and routine resource scaffolding from the stable contract and UI metadata, while Codex/Sites-generated product presentation is maintained as reviewed source. Contract tests must prove filtering, sorting, pagination, errors, authentication, mutation invalidation, and generated-screen behavior.

React-admin has unusually strong first-party agent guidance: its documentation provides an official skill and Context7 MCP instructions specifically for Codex and other coding agents. [React-admin coding-agent guide](https://marmelab.com/react-admin/CodingAgents.html)

**Why it was selected:** almost every MVP screen is an existing resource component, Vite meets the hot-reload/native-tooling preference, and explicit approval now permits agent-generated presentation source while handwritten product logic stays concentrated in preference and ranking behavior.

**Limit:** the default aesthetic is administration/B2B-oriented. Responsive behavior is viable, but a partner-facing consumer polish pass will either customize Material UI or trigger the move to a native client.

### 2. Refine + Vite 8 — customizable web runner-up

Refine 5 is a headless React framework for CRUD-heavy applications. Its core supplies authentication, access control, routing, networking, state management, internationalization, TanStack Query integration, and CRUD generation. Official integrations cover Ant Design, Material UI, Mantine, and Chakra UI. [Refine overview](https://refine.dev/docs/), [official integrations](https://refine.dev/core/integrations/)

Refine's current REST package exposes endpoint, header, query, body, response, count, and error mapping hooks. This is flexible, but a nonstandard API still needs mapping code. [Refine REST provider](https://refine.dev/core/docs/data/packages/rest-data-provider/)

**Choose Refine instead** if the React-admin prototype proves too visually administrative and the team accepts more declarative UI/configuration code in exchange for a more consumer-oriented presentation. Keep the same generated client and OpenAPI contract.

**Why it is second:** it provides more UI freedom but less “assemble these resource components and stop” leverage. No first-party agent skill or MCP comparable to React-admin's was located in the official material reviewed.

### 3. Expo + React Native Web — packaged-mobile bridge

React Native maps its core components to native platform views on Android and iOS. Expo adds first-class Android, iOS, and web support; React Native Web maps common primitives to React DOM. Expo Router provides a shared navigation structure, native mobile navigation, deep links, static web rendering, and Fast Refresh across Android, iOS, and web. [React Native native components](https://reactnative.dev/docs/intro-react-native-components), [Expo web](https://docs.expo.dev/workflow/web/), [Expo Router](https://docs.expo.dev/router/introduction/)

Expo does not provide a React-admin-equivalent CRUD screen system. React Native core supplies primitives such as `View`, `Text`, `TextInput`, `FlatList`, `Button`, and `Switch`; the screens and data states still need composition. [React Native components](https://reactnative.dev/docs/components-and-apis)

Its agent story is the strongest evaluated. Expo publishes Codex-compatible skills, an MCP server that can inspect projects and interact with simulators/React Native DevTools, Markdown/`llms.txt` documentation, and agent context files in newly generated projects. OpenAI also publishes a Codex workflow specifically for Expo. [Expo skills](https://docs.expo.dev/skills/), [Expo MCP](https://docs.expo.dev/mcp/), [Expo agent overview](https://docs.expo.dev/agents/), [OpenAI Expo workflow](https://developers.openai.com/codex/use-cases/react-native-expo-apps)

Expo UI now exposes SwiftUI and Jetpack Compose components to React, but its own guide says the first milestone prioritizes SwiftUI and that broader universal support follows later; it is a primitives layer, not a CRUD application generator. [Expo UI](https://docs.expo.dev/versions/latest/sdk/ui/), [Expo UI guide and roadmap boundary](https://docs.expo.dev/guides/expo-ui-swift-ui/)

**Switch to Expo** only when one of these becomes true before the native-client work begins:

- a packaged app is required for partner distribution;
- mobile deep linking, notifications, or device APIs become essential;
- the responsive web UI is materially inadequate on phones; or
- the official Expo agent/simulator loop saves more work than React-admin's prebuilt CRUD surface.

### 4. Ionic React + Capacitor — package the web app

Ionic is an MIT-licensed Web Component UI toolkit for iOS-, Android-, and web-styled interfaces. Its official material describes 100+ components and adaptive iOS/Material presentation. Capacitor packages the web application in a native container and exposes native APIs through plugins; the UI remains HTML/CSS/JavaScript in a WebView. [Ionic introduction](https://ionicframework.com/docs), [Ionic React](https://ionicframework.com/react), [Capacitor architecture](https://capacitorjs.com/docs), [Ionic repository/license](https://github.com/ionic-team/ionic-framework)

This is the lowest-effort path if “mobile app” means an installable shell around the responsive web application. It does **not** satisfy a strict platform-native UI requirement. It is an intentional temporary bridge whose value is maximum web-code reuse.

**Switch to Ionic/Capacitor** only if store packaging or a native plugin is required before the SwiftUI/Compose clients, and only after verifying the specific iOS workflow in Simulator.

## Other evaluated frameworks

### Flutter

Flutter targets iOS, Android, web, and desktop from Dart and has stateful hot reload, Material/Cupertino widgets, accessibility support, and stable web deployment. On web it renders through CanvasKit or skwasm rather than ordinary DOM controls. [Flutter architecture](https://docs.flutter.dev/resources/architectural-overview), [web renderers](https://docs.flutter.dev/platform-integration/web/renderers), [hot reload](https://docs.flutter.dev/tools/hot-reload), [accessibility](https://docs.flutter.dev/ui/accessibility)

Flutter now has official agent skills and an experimental Dart/Flutter MCP server supporting Codex; the MCP can analyze errors, inspect a running app, search packages, manage dependencies, run tests, format, and invoke static analysis. [Flutter agent skills](https://docs.flutter.dev/ai/agent-skills), [Dart and Flutter MCP](https://docs.flutter.dev/ai/mcp-server)

It is a strong long-lived shared-UI framework, but a poor disposable browser-UI choice here: it provides widgets, not generated resource screens; it adds Dart; the web output uses a custom renderer; and the later SwiftUI/Compose strategy discards nearly all UI work.

### Compose Multiplatform

Compose Multiplatform is Apache-2.0 and stable for mobile and desktop, while its web target remains Beta and uses Kotlin/Wasm. Compose Hot Reload became stable and bundled in 1.10. [Compose repository/platform status](https://github.com/JetBrains/compose-multiplatform), [2026 platform status](https://blog.jetbrains.com/kotlin/2026/05/kotlinconf26-keynote-highlights/), [stable hot reload](https://blog.jetbrains.com/kotlin/2026/01/compose-multiplatform-1-10-0/)

It is attractive if Android/desktop and shared Kotlin UI become primary. It is not the safe web-first MVP because the browser target is not stable, and Compose supplies primitives/navigation rather than CRUD resources.

### Tamagui

Tamagui 2 is an MIT-licensed React/React Native styling system with an optional UI kit and optimizing compiler, designed for parity between React Native and web. [Tamagui repository](https://github.com/tamagui/tamagui)

It can improve an Expo universal application's design consistency and web responsiveness. It does not replace Expo, generate OpenAPI integration, or supply React-admin's resource model. Adding it now would increase framework surface before a packaged-mobile requirement exists.

### NativeScript

NativeScript provides direct typed access to native iOS and Android APIs from TypeScript and ships native-backed layout, navigation, list, text-input, picker, switch, and accessibility primitives. Its official docs expose `llms.txt`, but the documented runtimes are iOS/Android/visionOS and its web story is not the same mature shared-renderer path offered by Expo, Ionic, or Flutter. [NativeScript introduction](https://docs.nativescript.org/), [UI components](https://docs.nativescript.org/ui/), [accessibility](https://docs.nativescript.org/guide/accessibility)

It is a credible mobile framework, but it offers neither a ready-made browser CRUD application nor a low-cost path from this browser UI to future native UIs.

### .NET MAUI and Blazor Hybrid

.NET MAUI 10 is an MIT-licensed native UI framework for Android, iOS, macOS through Mac Catalyst, and Windows. MAUI does not target ordinary browsers. Blazor Hybrid renders Razor components as HTML/CSS inside an embedded WebView, while browser Blazor is a separate hosting model. XAML and .NET Hot Reload are supported, with documented edit limitations. [MAUI supported platforms](https://learn.microsoft.com/en-us/dotnet/maui/supported-platforms), [Blazor Hybrid hosting](https://learn.microsoft.com/en-us/aspnet/core/blazor/hybrid/), [XAML Hot Reload](https://learn.microsoft.com/en-us/dotnet/maui/xaml/hot-reload), [MAUI repository/license](https://github.com/dotnet/maui)

It is viable for a C# team wanting mobile/desktop and shared Razor components, but introduces an unrelated toolchain and does not accelerate this browser CRUD MVP.

### Tauri 2

Tauri 2 is stable, MIT/Apache-2.0, Rust-based application infrastructure for desktop and mobile. It embeds a chosen web frontend in the operating system WebView and supports iOS/Android targets, but provides no UI component or CRUD layer. [Tauri stable release](https://tauri.app/blog/tauri-20/), [Tauri repository and license](https://github.com/tauri-apps/tauri), [mobile prerequisites](https://v2.tauri.app/start/prerequisites/)

Tauri satisfies the Rust-native-build preference at the shell/runtime layer, but adds no value to a hosted browser application and is less directly aligned with mobile UI than Capacitor. Reconsider it only if a desktop application or substantial local Rust capability becomes a requirement.

### Skip

Skip 1.8 is MPL-2.0 and generates or compiles a shared Swift/SwiftUI codebase into native SwiftUI on iOS and Jetpack Compose on Android, without a WebView or custom renderer. It has no web target. [Skip repository, architecture, releases, and license](https://github.com/skiptools/skip)

Skip is the most interesting later experiment if the project decides that “platform-native” means using SwiftUI and Compose while sharing the Swift source. It cannot deliver the required hot-reloading web MVP and adds a source-generation/toolchain dependency between the product UI and Android. Evaluate it only in a bounded prototype after native mobile is approved.

## Build and quality baseline

For the recommended web MVP, enable the guardrails before feature code:

- Vite 8 with React and strict TypeScript;
- generated TypeScript API client from the checked-in OpenAPI contract;
- a generated React-admin provider, if that path is explicitly selected;
- ESLint type-aware rules or an explicitly evaluated Rust-native replacement, plus formatting;
- accessibility linting and automated keyboard/semantic checks;
- unit tests for business-specific presentation logic;
- contract tests against the generated mock/server;
- browser end-to-end tests for capture review, independent preferences, sorting, ranking explanation, notes, and completion; and
- CI that fails on generated-code drift, OpenAPI validation, type errors, lint, tests, and production build.

Vite 8 already moves the bundler and default React transform to Rust-based Rolldown/Oxc. Do not select a UI framework merely because one internal build component is written in Rust; end-to-end iteration, stable APIs, generated-code drift detection, and agent-visible failures matter more.

## Replacement boundary

Keep these assets independent of the MVP UI:

- canonical OpenAPI document and operation IDs;
- generated-client configuration and lockfile;
- provider-neutral actor, household, candidate, capture, preference, note, special, and plan identifiers;
- error codes and idempotency behavior;
- pagination/sorting/filter semantics;
- ranking explanation payloads—not just a final rank number;
- synthetic fixtures and contract tests; and
- accessibility and end-to-end acceptance scenarios expressed in product language.

Do not let React-admin resource names, filter encodings, Material UI component names, ToolJet query shapes, Supabase table APIs, or Cloudflare bindings become the public contract. UI adapters must consume the product API; the product API must not be redesigned around a disposable UI runtime.

## Switch triggers

### Stay with React-admin while

- there are only two actors or a small private beta;
- the Shortcut remains the primary capture path;
- responsive browser review/voting is acceptable;
- custom UI code remains limited to product-specific controls; and
- responsive-browser accessibility and performance meet acceptance tests.

### Switch the MVP shell to Expo when

- packaged mobile distribution is approved and required;
- push notifications, native deep links, background behavior, or device APIs become essential;
- React-admin's phone UX fails partner testing; or
- a shared temporary mobile/web implementation is cheaper than immediately building SwiftUI and Compose separately.

### Wrap with Ionic/Capacitor when

- a packaged app is urgently required;
- the web UI itself is acceptable;
- native rendering is explicitly deferred; and
- the required native plugin works in Simulator and does not require paid Appflow services.

### Begin native SwiftUI/Compose clients when

- Share Extension/App Intent behavior, polished platform navigation, offline use, widgets, or deep OS integration becomes central;
- partner testing shows persistent web/hybrid friction;
- product semantics and the OpenAPI contract are stable enough that two native presentation layers will not churn together; or
- maintaining a cross-platform abstraction costs more than generating two clients and composing native screens.

## Final recommendation

1. Preserve the current Shortcut and canonical OpenAPI contract; do not reshape `/v1` for a UI tool.
2. Retain **ToolJet Free** only as rejected-alternative evidence; do not create a second canonical UI runtime.
3. Implement React-admin + Vite 8 as a responsive SPA with generated transport/resource scaffolding, agent-generated presentation source, repository lint/static analysis, and the test contract in the approved implementation plan.
4. Do not select FlutterFlow under the standing no-paid-services boundary: free lacks code export and OpenAPI import, while GitHub integration costs still more.
5. Treat either browser UI as a validation instrument. Generate Swift and Kotlin clients from the same OpenAPI contract when platform-native applications are justified.

The decision is now recorded in [ADR-0002](../adr/0002-api-first-web-mvp.md): build the source-controlled React-admin MVP and preserve the stable OpenAPI boundary for later SwiftUI, Compose, web, and TUI clients.
