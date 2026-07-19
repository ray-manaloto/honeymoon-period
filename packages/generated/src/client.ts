// @generated from openapi/v1.json; DO NOT EDIT.
import type { components } from "./types";

export type HoneymoonPeriod = components["schemas"]["HoneymoonPeriod"];
export type HoneymoonPeriodDetail = components["schemas"]["HoneymoonPeriodDetail"];
export type HoneymoonPeriodPage = components["schemas"]["HoneymoonPeriodPage"];
export type CaptureInput = components["schemas"]["CaptureInput"];
export type CaptureResult = components["schemas"]["CaptureResult"];
export type Capture = components["schemas"]["Capture"];
export type HoneymoonPeriodUpdate = components["schemas"]["HoneymoonPeriodUpdate"];
export type Preference = components["schemas"]["Preference"];
export type PreferenceChangeInput = components["schemas"]["PreferenceChangeInput"];
export type PreferenceChangeResult = components["schemas"]["PreferenceChangeResult"];
export type HistoryEvent = components["schemas"]["HistoryEvent"];
export type HistoryPage = components["schemas"]["HistoryPage"];
export type NoteInput = components["schemas"]["NoteInput"];
export type Note = components["schemas"]["Note"];
export type ErrorEnvelope = components["schemas"]["ErrorEnvelope"];

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly envelope: ErrorEnvelope) {
    super(envelope.error.message);
  }
}

export interface ApiClientOptions { baseUrl: string; token: () => string; fetch?: typeof globalThis.fetch }

export function createApiClient(options: ApiClientOptions) {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${options.token()}`, ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    });
    const value = await response.json() as T | ErrorEnvelope;
    if (!response.ok) throw new ApiError(response.status, value as ErrorEnvelope);
    return value as T;
  };
  return {
    createCapture: (input: CaptureInput) => request<CaptureResult>("/captures", { method: "POST", body: JSON.stringify(input) }),
    list: (query = "") => request<HoneymoonPeriodPage>(`/honeymoon-periods${query ? `?${query}` : ""}`),
    detail: (id: string) => request<HoneymoonPeriodDetail>(`/honeymoon-periods/${encodeURIComponent(id)}`),
    update: (id: string, input: HoneymoonPeriodUpdate) => request<HoneymoonPeriodDetail>(`/honeymoon-periods/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) }),
    preferenceChange: (id: string, input: PreferenceChangeInput) => request<PreferenceChangeResult>(`/honeymoon-periods/${encodeURIComponent(id)}/preference-changes`, { method: "POST", body: JSON.stringify(input) }),
    history: (id: string) => request<HistoryPage>(`/honeymoon-periods/${encodeURIComponent(id)}/history`),
    note: (id: string, input: NoteInput) => request<Note>(`/honeymoon-periods/${encodeURIComponent(id)}/notes`, { method: "POST", body: JSON.stringify(input) }),
    updateNote: (id: string, noteId: string, input: NoteInput) => request<Note>(`/honeymoon-periods/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`, { method: "PATCH", body: JSON.stringify(input) }),
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
