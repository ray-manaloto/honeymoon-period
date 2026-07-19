// @generated from openapi/v1.json; DO NOT EDIT.
import type { CaptureInput, ErrorEnvelope, HoneymoonPeriodUpdate, NoteInput, PreferenceChangeInput } from "./client";
export const contractFixtures = {
  CaptureInput: { source_url: "https://example.com/fixture", client_request_id: "fixture-request" } satisfies CaptureInput,
  HoneymoonPeriodUpdate: { title: "Fixture update", metadata: { cuisine: "Fixture cuisine" } } satisfies HoneymoonPeriodUpdate,
  PreferenceChangeInput: { vote: "interested", score: 4, client_request_id: "preference-fixture", reason: "Fixture reason" } satisfies PreferenceChangeInput,
  NoteInput: { body: "Fixture note" } satisfies NoteInput,
  ErrorEnvelope: { error: { code: "fixture_error", message: "Fixture error" } } satisfies ErrorEnvelope,
} as const;
