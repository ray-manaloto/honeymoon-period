import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import addFormats from "ajv-formats";
import openapiTS, { astToString } from "openapi-typescript";

const root = resolve(import.meta.dirname, "..");
const contractPath = resolve(root, "openapi/v1.json");
const uiPath = resolve(root, "openapi/ui-metadata.json");
const outputDirectory = resolve(root, "packages/generated/src");
const header = "// @generated from openapi/v1.json; DO NOT EDIT.\n";
const contract = JSON.parse(await readFile(contractPath, "utf8"));
const ui = JSON.parse(await readFile(uiPath, "utf8"));

const schemaAst = await openapiTS(contract, { alphabetize: true });
const types = `${header}${astToString(schemaAst)}`;
const schemas = `${header}export const componentSchemas = ${JSON.stringify(contract.components.schemas, null, 2)} as const;\n`;
const ajv = new Ajv2020({ allErrors: true, strict: false, code: { esm: true, source: true } });
addFormats(ajv);
for (const [name, schema] of Object.entries(contract.components.schemas)) {
  ajv.addSchema(schema, `#/components/schemas/${name}`);
}
const compiledValidators = Object.fromEntries(
  Object.keys(contract.components.schemas).map((name) => [name, `#/components/schemas/${name}`]),
);
const validatorNames = Object.keys(compiledValidators);
const validators = `${header}// @ts-nocheck -- Ajv standalone output is generated JavaScript.\n${standaloneCode(ajv, compiledValidators)}\nexport const contractValidators = { ${validatorNames.join(", ")} };\n`;
const metadata = `${header}export const uiMetadata = ${JSON.stringify(ui, null, 2)} as const;\n`;
const fixtures = `${header}import type { CaptureInput, ErrorEnvelope, HoneymoonPeriodUpdate, NoteInput, PreferenceChangeInput } from "./client";
export const contractFixtures = {
  CaptureInput: { source_url: "https://example.com/fixture", client_request_id: "fixture-request" } satisfies CaptureInput,
  HoneymoonPeriodUpdate: { title: "Fixture update", metadata: { cuisine: "Fixture cuisine" } } satisfies HoneymoonPeriodUpdate,
  PreferenceChangeInput: { vote: "interested", score: 4, client_request_id: "preference-fixture", reason: "Fixture reason" } satisfies PreferenceChangeInput,
  NoteInput: { body: "Fixture note" } satisfies NoteInput,
  ErrorEnvelope: { error: { code: "fixture_error", message: "Fixture error" } } satisfies ErrorEnvelope,
} as const;
`;
const reactAdmin = `${header}import type { ApiClient, HoneymoonPeriodUpdate } from "./client";
import { uiMetadata } from "./ui-metadata";

export const reactAdminResource = uiMetadata.resource;
export interface ReactAdminListParams {
  pagination?: { page?: number; perPage?: number };
  sort?: { field?: string; order?: string };
  filter: Record<string, unknown>;
}
export function buildReactAdminListQuery(params: ReactAdminListParams): string {
  const sort = params.sort?.field === "title" ? "title" : params.sort?.field === "updated_at" || params.sort?.field === "newest" ? "newest" : "rank";
  const query = new URLSearchParams({
    page: String(params.pagination?.page ?? 1), per_page: String(params.pagination?.perPage ?? 25),
    sort, order: (params.sort?.order ?? "DESC").toLowerCase(), status: String(params.filter.status ?? "active"),
  });
  for (const field of ["q", "kind"] as const) {
    const value = params.filter[field];
    if (typeof value === "string" && value.trim()) query.set(field, value.trim());
  }
  return query.toString();
}
export function createReactAdminTransport(client: ApiClient) {
  return {
    async getList(_resource: string, params: ReactAdminListParams) { const page = await client.list(buildReactAdminListQuery(params)); return { data: page.items, total: page.total }; },
    async getOne(_resource: string, params: { id: string | number }) { const detail = await client.detail(String(params.id)); return { data: { ...detail.item, detail } }; },
    async getMany(_resource: string, params: { ids: Array<string | number> }) { return { data: await Promise.all(params.ids.map(async (id) => (await client.detail(String(id))).item)) }; },
    async create(_resource: string, params: { data: { source_url: string; client_request_id: string } }) { const result = await client.createCapture(params.data); return { data: result.honeymoon_period }; },
    async update(_resource: string, params: { id: string | number; data: HoneymoonPeriodUpdate }) { const detail = await client.update(String(params.id), params.data); return { data: { ...detail.item, detail } }; },
    async createPreferenceChange(id: string | number, input: Parameters<ApiClient["preferenceChange"]>[1]) { return { data: await client.preferenceChange(String(id), input) }; },
    async getHistory(id: string | number) { return { data: await client.history(String(id)) }; },
    async addNote(id: string | number, input: Parameters<ApiClient["note"]>[1]) { return { data: await client.note(String(id), input) }; },
    async updateNote(id: string | number, noteId: string | number, input: Parameters<ApiClient["updateNote"]>[2]) { return { data: await client.updateNote(String(id), String(noteId), input) }; },
  };
}
`;
const client = `${header}import type { components } from "./types";

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
    const response = await (options.fetch ?? globalThis.fetch)(\`\${options.baseUrl}\${path}\`, {
      ...init,
      headers: { authorization: \`Bearer \${options.token()}\`, ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    });
    const value = await response.json() as T | ErrorEnvelope;
    if (!response.ok) throw new ApiError(response.status, value as ErrorEnvelope);
    return value as T;
  };
  return {
    createCapture: (input: CaptureInput) => request<CaptureResult>("/captures", { method: "POST", body: JSON.stringify(input) }),
    list: (query = "") => request<HoneymoonPeriodPage>(\`/honeymoon-periods\${query ? \`?\${query}\` : ""}\`),
    detail: (id: string) => request<HoneymoonPeriodDetail>(\`/honeymoon-periods/\${encodeURIComponent(id)}\`),
    update: (id: string, input: HoneymoonPeriodUpdate) => request<HoneymoonPeriodDetail>(\`/honeymoon-periods/\${encodeURIComponent(id)}\`, { method: "PATCH", body: JSON.stringify(input) }),
    preferenceChange: (id: string, input: PreferenceChangeInput) => request<PreferenceChangeResult>(\`/honeymoon-periods/\${encodeURIComponent(id)}/preference-changes\`, { method: "POST", body: JSON.stringify(input) }),
    history: (id: string) => request<HistoryPage>(\`/honeymoon-periods/\${encodeURIComponent(id)}/history\`),
    note: (id: string, input: NoteInput) => request<Note>(\`/honeymoon-periods/\${encodeURIComponent(id)}/notes\`, { method: "POST", body: JSON.stringify(input) }),
    updateNote: (id: string, noteId: string, input: NoteInput) => request<Note>(\`/honeymoon-periods/\${encodeURIComponent(id)}/notes/\${encodeURIComponent(noteId)}\`, { method: "PATCH", body: JSON.stringify(input) }),
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
`;
const mocks = `${header}import type { HoneymoonPeriod } from "./client";
export const mockHoneymoonPeriod: HoneymoonPeriod = {
  id: "00000000-0000-4000-8000-000000000101", status: "active", title: "Fixture Bistro", kind: "restaurant",
  normalized_url: "https://example.com/fixture-bistro", metadata: { cuisine: "Fixture cuisine" }, metadata_updated_by_actor_id: null, rank_boost: 1,
  rank: { score: 4, votes: 3, boost: 1, total: 8 }, created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z"
};
`;
const index = `${header}export * from "./client";\nexport * from "./fixtures";\nexport * from "./mocks";\nexport * from "./react-admin";\nexport * from "./schemas";\nexport * from "./ui-metadata";\n`;

const outputs = {
  "types.ts": types,
  "schemas.ts": schemas,
  "validators.ts": validators,
  "ui-metadata.ts": metadata,
  "fixtures.ts": fixtures,
  "react-admin.ts": reactAdmin,
  "client.ts": client,
  "mocks.ts": mocks,
  "index.ts": index,
};
let stale = false;
for (const [name, content] of Object.entries(outputs)) {
  const path = resolve(outputDirectory, name);
  if (process.argv.includes("--check")) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== content) {
      console.error(`Generated file is stale: ${name}`);
      stale = true;
    }
  } else {
    await writeFile(path, content);
  }
}
if (stale) process.exitCode = 1;
