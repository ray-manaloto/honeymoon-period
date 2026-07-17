# ADR-0002: Build an API-first web MVP before native clients

- Status: Accepted
- Date: 2026-07-15

## Context

The existing-product research found no free, portable product that satisfies capture, two actor-owned preferences, structured metadata, explainable ranking, and future native clients without material lock-in. The local Workers + D1 and Shortcut slices already prove the core transport and record behavior, while a physical-iPhone bake-off cannot proceed with the available devices. Backend and UI research compared Cloudflare, Supabase, low-code products, and shared UI frameworks.

## Decision

Productize a web-first MVP behind a provider-neutral, versioned `/v1` OpenAPI contract. Use Cloudflare Workers + D1 for the initial fixed-two-participant service and React-admin 5 on Vite 8 for the source-controlled responsive web UI. Generate transport clients, models, validators, mocks, and routine adapters from the contract; allow Codex and Sites to generate and maintain ordinary React and future SwiftUI presentation source; reserve handwritten code for product behavior and any minimal adapter a maintained generator cannot emit.

Committed Playwright tests are the end-to-end authority. ChatGPT Browser with approved CDP access is the interactive localhost inspection and profiling layer, and Sites is an optional noncanonical design/prototype surface. Future iOS work uses platform-native SwiftUI and a generated Swift client rather than sharing the web UI runtime. Move from D1 to Supabase/Postgres before production identities exist if invitations, account recovery, more than one household, or realtime collaboration enter the near-term scope.

## Consequences

- ADR-0001 is superseded as the active phase, but its research, fixtures, and baseline remain valid evidence.
- The first complete product surface is web; the existing Shortcut remains the iOS capture client until native work is separately prioritized.
- React-admin conventions stay behind an adapter and never shape the public API.
- Strict TypeScript, Biome, unit/component/contract/Worker tests, production builds, and Playwright E2E checks are enabled from the first vertical slice.
- This decision does not authorize provider deployment, production credentials/data, paid services, TestFlight, App Store distribution, or public publication.

## Revisit when

Revisit the backend before adding production identity lifecycle or multiple households; revisit the web framework only if measured partner testing shows React-admin cannot provide an acceptable responsive experience; begin native SwiftUI work after the API and primary web workflows are stable.
