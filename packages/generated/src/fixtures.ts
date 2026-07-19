// @generated from openapi/v1.json; DO NOT EDIT.
import type { CaptureInput, ErrorEnvelope, HistoricalRanking, HoneymoonPeriodUpdate, NoteInput, PreferenceChangeInput } from "./client";
export const contractFixtures = {
  CaptureInput: { source_url: "https://example.com/fixture", client_request_id: "fixture-request" } satisfies CaptureInput,
  HoneymoonPeriodUpdate: { title: "Fixture update", metadata: { cuisine: "Fixture cuisine" } } satisfies HoneymoonPeriodUpdate,
  PreferenceChangeInput: { vote: "interested", score: 4, client_request_id: "preference-fixture", reason: "Fixture reason" } satisfies PreferenceChangeInput,
  HistoricalRanking: { honeymoon_period_id: "00000000-0000-4000-8000-000000000101", through_sequence: 1, rank: { policy_version: 1, planning_eligible: true, score: 4, votes: 2, boost: 1, total: 7 } } satisfies HistoricalRanking,
  NoteInput: { body: "Fixture note" } satisfies NoteInput,
  ErrorEnvelope: { error: { code: "fixture_error", message: "Fixture error" } } satisfies ErrorEnvelope,
} as const;
