import type { ApiError } from "@honeymoon-period/generated";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ACTOR_STORAGE_KEY, ACTORS, createHoneymoonDataProvider } from "../src/data-provider";

const item = {
  id: "period-1",
  title: "Fixture Bistro",
  kind: "restaurant",
  status: "active" as const,
  normalized_url: "https://example.com/bistro",
  metadata: {},
  rank_boost: 1,
  rank: {
    policy_version: 1 as const,
    planning_eligible: true,
    score: 4,
    votes: 3,
    boost: 1,
    total: 8,
  },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

afterEach(() => localStorage.clear());

describe("honeymoon-period data provider", () => {
  it("translates React-admin list state and authenticates as the selected fixture actor", async () => {
    localStorage.setItem(ACTOR_STORAGE_KEY, ACTORS[1].token);
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      async () =>
        new Response(JSON.stringify({ items: [item], page: 2, per_page: 10, total: 1 }), {
          status: 200,
        }),
    );
    const provider = createHoneymoonDataProvider({ baseUrl: "/v1", fetch });

    const result = await provider.getList("honeymoon-periods", {
      pagination: { page: 2, perPage: 10 },
      sort: { field: "title", order: "ASC" },
      filter: { status: "planned", q: "bistro", kind: "restaurant" },
    });

    expect(result).toEqual({ data: [item], total: 1 });
    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(String(url)).toContain(
      "page=2&per_page=10&sort=title&order=asc&status=planned&q=bistro&kind=restaurant",
    );
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer local-participant-b");

    await provider.getList("honeymoon-periods", {
      sort: { field: "updated_at", order: "DESC" },
      filter: {},
    });
    await provider.getList("honeymoon-periods", {
      pagination: { page: 1, perPage: 25 },
      sort: { field: "unsupported", order: "DESC" },
      filter: { q: "   ", kind: 2 },
    });
    expect(String(fetch.mock.calls[1]?.[0])).toContain("sort=newest");
    expect(String(fetch.mock.calls[2]?.[0])).toContain("sort=rank");
  });

  it("maps capture, detail update, preference, and note mutations through provider methods", async () => {
    const detail = { item, captures: [], preferences: [], notes: [], history: { items: [] } };
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "created",
            capture: { id: "capture-1" },
            honeymoon_period: item,
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(detail), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "changed",
            event: null,
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            honeymoon_period_id: item.id,
            through_sequence: 1,
            rank: item.rank,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "note-1",
            actor_id: "actor-a",
            honeymoon_period_id: item.id,
            display_name: "Participant A",
            body: "Try the patio",
            created_at: item.created_at,
          }),
          { status: 201 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "note-1",
            actor_id: "actor-a",
            honeymoon_period_id: item.id,
            display_name: "Participant A",
            body: "Edited patio note",
            created_at: item.created_at,
          }),
          { status: 200 },
        ),
      );
    const provider = createHoneymoonDataProvider({ baseUrl: "/v1", fetch });

    expect(
      (
        await provider.create("honeymoon-periods", {
          data: { source_url: "https://example.com/bistro", client_request_id: "request-1" },
        })
      ).data.id,
    ).toBe(item.id);
    expect(
      (
        await provider.update("honeymoon-periods", {
          id: item.id,
          data: { title: "Bistro", metadata: {} },
          previousData: item,
        })
      ).data.title,
    ).toBe(item.title);
    expect(
      (
        await provider.createPreferenceChange(item.id, {
          vote: "interested",
          score: 5,
          client_request_id: "preference-1",
        })
      ).data.status,
    ).toBe("changed");
    expect((await provider.getHistoricalRanking(item.id, 1)).data.through_sequence).toBe(1);
    expect((await provider.addNote(item.id, { body: "Try the patio" })).data.body).toBe(
      "Try the patio",
    );
    expect(
      (await provider.updateNote(item.id, "note-1", { body: "Edited patio note" })).data.body,
    ).toBe("Edited patio note");
    expect(String(fetch.mock.calls[4]?.[0])).toContain("/ranking?through_sequence=1");
    expect(fetch.mock.calls.map(([, init]) => init?.method)).toEqual([
      "POST",
      "PATCH",
      undefined,
      "POST",
      undefined,
      "POST",
      "PATCH",
    ]);
  });

  it("maps detail reads and explicitly rejects unsupported collection mutations", async () => {
    const apiDetail = { item, captures: [], preferences: [], notes: [] };
    const history = { items: [] };
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      async (input) =>
        new Response(JSON.stringify(String(input).endsWith("/history") ? history : apiDetail), {
          status: 200,
        }),
    );
    const provider = createHoneymoonDataProvider({ baseUrl: "/v1", fetch });

    expect((await provider.getOne("honeymoon-periods", { id: item.id })).data.detail).toEqual({
      ...apiDetail,
      history,
    });
    expect(
      (
        await provider.getMany("honeymoon-periods", {
          ids: [item.id, "period-2"],
        })
      ).data,
    ).toHaveLength(2);
    expect(
      await provider.getManyReference("honeymoon-periods", {
        target: "unused",
        id: item.id,
        pagination: { page: 1, perPage: 25 },
        sort: { field: "rank", order: "DESC" },
        filter: {},
      }),
    ).toEqual({ data: [], total: 0 });
    await expect(
      provider.updateMany("honeymoon-periods", { ids: [item.id], data: {} }),
    ).rejects.toThrow("updateMany is not supported");
    await expect(provider.delete("honeymoon-periods", { id: item.id })).rejects.toThrow(
      "delete is not supported",
    );
    await expect(provider.deleteMany("honeymoon-periods", { ids: [item.id] })).rejects.toThrow(
      "deleteMany is not supported",
    );
  });

  it("preserves the stable API error for authorization and retry UI", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            error: { code: "unauthorized", message: "valid bearer token required" },
          }),
          { status: 401 },
        ),
    );
    const provider = createHoneymoonDataProvider({ baseUrl: "/v1", fetch });
    await expect(provider.getOne("honeymoon-periods", { id: item.id })).rejects.toMatchObject({
      status: 401,
      message: "valid bearer token required",
    } satisfies Partial<ApiError>);
  });
});
