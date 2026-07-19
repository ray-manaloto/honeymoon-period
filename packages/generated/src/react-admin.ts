// @generated from openapi/v1.json; DO NOT EDIT.
import type { ApiClient, HoneymoonPeriodUpdate } from "./client";
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
    async getOne(_resource: string, params: { id: string | number }) { const id = String(params.id); const [detail, history] = await Promise.all([client.detail(id), client.history(id)]); return { data: { ...detail.item, detail: { ...detail, history } } }; },
    async getMany(_resource: string, params: { ids: Array<string | number> }) { return { data: await Promise.all(params.ids.map(async (id) => (await client.detail(String(id))).item)) }; },
    async create(_resource: string, params: { data: { source_url: string; client_request_id: string } }) { const result = await client.createCapture(params.data); return { data: result.honeymoon_period }; },
    async update(_resource: string, params: { id: string | number; data: HoneymoonPeriodUpdate }) { const id = String(params.id); const [detail, history] = await Promise.all([client.update(id, params.data), client.history(id)]); return { data: { ...detail.item, detail: { ...detail, history } } }; },
    async createPreferenceChange(id: string | number, input: Parameters<ApiClient["preferenceChange"]>[1]) { return { data: await client.preferenceChange(String(id), input) }; },
    async getHistoricalRanking(id: string | number, throughSequence: number) { return { data: await client.historicalRanking(String(id), throughSequence) }; },
    async addNote(id: string | number, input: Parameters<ApiClient["note"]>[1]) { return { data: await client.note(String(id), input) }; },
    async updateNote(id: string | number, noteId: string | number, input: Parameters<ApiClient["updateNote"]>[2]) { return { data: await client.updateNote(String(id), String(noteId), input) }; },
  };
}
