import {
  type ApiClientOptions,
  createApiClient,
  createReactAdminTransport,
  type HistoryPage,
  type HoneymoonPeriod,
  type HoneymoonPeriodDetail,
  type Note,
  type NoteInput,
  type PreferenceChangeInput,
  type PreferenceChangeResult,
} from "@honeymoon-period/generated";
import type { DataProvider, Identifier } from "react-admin";

export const ACTOR_STORAGE_KEY = "honeymoon-period.fixture-actor-token";
export const ACTOR_CHANGED_EVENT = "honeymoon-period:actor-changed";
export const ACTORS = [
  { id: "actor-a", name: "Participant A", token: "prototype-participant-a" },
  { id: "actor-b", name: "Participant B", token: "prototype-participant-b" },
] as const;

export type HoneymoonPeriodView = HoneymoonPeriodDetail & { history: HistoryPage };
export type HoneymoonRecord = HoneymoonPeriod & { detail?: HoneymoonPeriodView };

export interface HoneymoonDataProvider extends DataProvider {
  createPreferenceChange: (
    id: Identifier,
    input: PreferenceChangeInput,
  ) => Promise<{ data: PreferenceChangeResult }>;
  addNote: (id: Identifier, input: NoteInput) => Promise<{ data: Note }>;
  updateNote: (id: Identifier, noteId: Identifier, input: NoteInput) => Promise<{ data: Note }>;
}

function currentToken(): string {
  return localStorage.getItem(ACTOR_STORAGE_KEY) ?? ACTORS[0].token;
}

function unsupported(operation: string): Promise<never> {
  return Promise.reject(new Error(`${operation} is not supported by the honeymoon-period API`));
}

export function createHoneymoonDataProvider(
  options: Pick<ApiClientOptions, "baseUrl" | "fetch"> = { baseUrl: "/v1" },
): HoneymoonDataProvider {
  const client = createApiClient({ ...options, token: currentToken });
  const provider = {
    ...createReactAdminTransport(client),
    async getManyReference() {
      return { data: [], total: 0 };
    },
    updateMany: () => unsupported("updateMany"),
    delete: () => unsupported("delete"),
    deleteMany: () => unsupported("deleteMany"),
  };
  return provider as unknown as HoneymoonDataProvider;
}
