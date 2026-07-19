import { env, exports } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/worker";

const base = "http://example.test";
const headersA = {
  authorization: "Bearer prototype-participant-a",
  "content-type": "application/json",
};
const headersB = {
  authorization: "Bearer prototype-participant-b",
  "content-type": "application/json",
};

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const worker = exports as unknown as {
    default: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
  };
  return worker.default.fetch(`${base}${path}`, init);
}

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM rate_limits"),
    env.DB.prepare("DELETE FROM notes"),
    env.DB.prepare("DELETE FROM preference_events"),
    env.DB.prepare("DELETE FROM preference_change_requests"),
    env.DB.prepare("DELETE FROM preferences"),
    env.DB.prepare("DELETE FROM captures"),
    env.DB.prepare("DELETE FROM honeymoon_periods"),
    env.DB.prepare("DELETE FROM actors"),
  ]);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO actors (id, display_name, token_digest) VALUES (?, ?, ?)").bind(
      "actor-a",
      "Participant A",
      "26d76b2b0027aca73507f6904bbd1e1736016612a3cba49ef7b36edbfa75e448",
    ),
    env.DB.prepare("INSERT INTO actors (id, display_name, token_digest) VALUES (?, ?, ?)").bind(
      "actor-b",
      "Participant B",
      "0783c205225b2e9b8be6bbded0dcbd3a83ff60aa0e52a680386765d6a4a474b1",
    ),
  ]);
});

describe("local database bootstrap", () => {
  it("resets to the same deterministic synthetic seed", async () => {
    const reset = async () => {
      for (const statement of env.TEST_SEED_SQL.split(";").map((value) => value.trim())) {
        if (statement && !statement.startsWith("PRAGMA")) await env.DB.prepare(statement).run();
      }
    };
    const snapshot = async () => ({
      actors: (await env.DB.prepare("SELECT id, display_name FROM actors ORDER BY id").all())
        .results,
      items: (
        await env.DB.prepare(
          "SELECT id, title, metadata_json, created_at, updated_at FROM honeymoon_periods ORDER BY id",
        ).all()
      ).results,
    });
    await reset();
    const first = await snapshot();
    await reset();
    expect(await snapshot()).toEqual(first);
    expect(first.actors).toHaveLength(2);
    expect(first.items).toHaveLength(2);
  });
});

describe("capture contract", () => {
  it("creates, replays, and exact-link deduplicates without losing source provenance", async () => {
    const first = await api("/v1/captures", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        source_url: "https://EXAMPLE.com/place?utm_source=message",
        client_request_id: "capture-a",
      }),
    });
    expect(first.status).toBe(201);
    const created = await first.json<{
      status: string;
      honeymoon_period: { id: string };
      capture: { source_url: string };
    }>();
    expect(created.status).toBe("created");
    expect(created.capture.source_url).toContain("utm_source=message");

    const replay = await api("/v1/captures", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        source_url: "https://example.com/changed",
        client_request_id: "capture-a",
      }),
    });
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({
      status: "replayed",
      honeymoon_period: { id: created.honeymoon_period.id },
    });

    const dedupe = await api("/v1/captures", {
      method: "POST",
      headers: headersB,
      body: JSON.stringify({
        source_url: "https://example.com/place",
        client_request_id: "capture-b",
      }),
    });
    expect(dedupe.status).toBe(201);
    expect(await dedupe.json()).toMatchObject({
      status: "existing",
      honeymoon_period: { id: created.honeymoon_period.id },
    });
    expect(
      (
        await env.DB.prepare("SELECT COUNT(*) AS count FROM honeymoon_periods").first<{
          count: number;
        }>()
      )?.count,
    ).toBe(1);
  });

  it("returns stable contract errors for invalid and unauthorized requests", async () => {
    const invalid = await api("/v1/captures", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ source_url: "file:///private/data", client_request_id: "bad" }),
    });
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ error: { code: "invalid_request" } });
    const unauthorized = await api("/v1/honeymoon-periods");
    expect(unauthorized.status).toBe(401);
    expect(await unauthorized.json()).toEqual({
      error: { code: "unauthorized", message: "valid bearer token required" },
    });
  });

  it("returns complete capture error envelopes for unauthorized and rate-limited requests", async () => {
    const unauthorized = await api("/v1/captures", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source_url: "https://example.com/unauthorized",
        client_request_id: "capture-unauthorized",
      }),
    });
    expect(unauthorized.status).toBe(401);
    expect(await unauthorized.json()).toEqual({
      error: { code: "unauthorized", message: "valid bearer token required" },
    });

    await env.DB.prepare(
      "INSERT INTO rate_limits (actor_id, window_start, request_count) VALUES (?, ?, ?)",
    )
      .bind("actor-a", Math.floor(Date.now() / 60_000), 120)
      .run();
    const rateLimited = await api("/v1/captures", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        source_url: "https://example.com/rate-limited",
        client_request_id: "capture-rate-limited",
      }),
    });
    expect(rateLimited.status).toBe(429);
    expect(await rateLimited.json()).toEqual({
      error: {
        code: "rate_limited",
        message: "participant request limit exceeded; retry next minute",
      },
    });
  });

  it.each([
    [{ authorization: "Basic fixture", "content-type": "application/json" }, "{}"],
    [{ authorization: "Bearer ", "content-type": "application/json" }, "{}"],
    [{ authorization: "Bearer invalid", "content-type": "application/json" }, "{}"],
  ])("rejects malformed credentials", async (headers, body) => {
    expect((await api("/v1/captures", { method: "POST", headers, body })).status).toBe(401);
  });

  it("validates media type, body size, JSON syntax, and required fields", async () => {
    expect(
      (
        await api("/v1/captures", {
          method: "POST",
          headers: { ...headersA, "content-type": "text/plain" },
          body: "{}",
        })
      ).status,
    ).toBe(400);
    expect(
      (await api("/v1/captures", { method: "POST", headers: headersA, body: "{" })).status,
    ).toBe(400);
    expect(
      (await api("/v1/captures", { method: "POST", headers: headersA, body: "{}" })).status,
    ).toBe(400);
    expect(
      (
        await api("/v1/captures", {
          method: "POST",
          headers: { ...headersA, "content-length": "20000" },
          body: "{}",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await api("/v1/captures", {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({
            source_url: `https://example.com/${"x".repeat(17000)}`,
            client_request_id: "large",
          }),
        })
      ).status,
    ).toBe(400);
    const streamed = new Request(`${base}/v1/captures`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        source_url: `https://example.com/${"x".repeat(17000)}`,
        client_request_id: "large-stream",
      }),
    });
    expect(
      (await worker.fetch(streamed as unknown as Request, { DB: env.DB, TEST_MODE: "true" }))
        .status,
    ).toBe(400);
  });

  it("resolves concurrent idempotent requests to one capture", async () => {
    const init = {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        source_url: "https://example.com/concurrent",
        client_request_id: "same-request",
      }),
    };
    const responses = await Promise.all([api("/v1/captures", init), api("/v1/captures", init)]);
    expect(responses.map((result) => result.status).sort()).toEqual([200, 201]);
    expect(
      (await env.DB.prepare("SELECT COUNT(*) AS count FROM captures").first<{ count: number }>())
        ?.count,
    ).toBe(1);
  });

  it("does not expose an orphan when concurrent idempotent requests use different URLs", async () => {
    const responses = await Promise.all(
      ["first", "second"].map((name) =>
        api("/v1/captures", {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({
            source_url: `https://${name}.example.com/concurrent`,
            client_request_id: "same-request-different-urls",
          }),
        }),
      ),
    );
    expect(responses.map((result) => result.status).sort()).toEqual([200, 201]);
    const bodies = await Promise.all(
      responses.map((response) =>
        response.json<{ honeymoon_period: { id: string }; status: string }>(),
      ),
    );
    expect(new Set(bodies.map((body) => body.honeymoon_period.id))).toHaveProperty("size", 1);

    const page = await (await api("/v1/honeymoon-periods", { headers: headersA })).json<{
      items: Array<{ id: string }>;
    }>();
    expect(page.items.map((item) => item.id)).toEqual([bodies[0]?.honeymoon_period.id]);
  });
});

describe("query, preference, notes, and metadata contract", () => {
  async function capturedId(): Promise<string> {
    const response = await api("/v1/captures", {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        source_url: "https://example.com/bistro",
        client_request_id: "fixture",
      }),
    });
    return (await response.json<{ honeymoon_period: { id: string } }>()).honeymoon_period.id;
  }

  it("preserves participant-owned preferences and exposes deterministic rank components", async () => {
    const id = await capturedId();
    await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ vote: "interested", score: 5, client_request_id: "rank-a" }),
    });
    await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersB,
      body: JSON.stringify({ vote: "maybe", score: 3, client_request_id: "rank-b" }),
    });
    const detail = await (await api(`/v1/honeymoon-periods/${id}`, { headers: headersA })).json<{
      item: { rank: unknown };
      preferences: Array<{ actor_id: string; vote: string }>;
    }>();
    expect(detail.preferences).toEqual([
      expect.objectContaining({ actor_id: "actor-a", vote: "interested" }),
      expect.objectContaining({ actor_id: "actor-b", vote: "maybe" }),
    ]);
    expect(detail.item.rank).toEqual({ score: 4, votes: 3, boost: 0, total: 7 });
    await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersB,
      body: JSON.stringify({ vote: null, score: null, client_request_id: "rank-b-clear" }),
    });
    expect(
      (
        await (
          await api(`/v1/honeymoon-periods/${id}`, { headers: headersA })
        ).json<{ item: { rank: { score: number } } }>()
      ).item.rank.score,
    ).toBe(5);
  });

  it("records immutable field-level preference history and replays identical requests", async () => {
    const id = await capturedId();
    const changed = await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        vote: "interested",
        score: 4,
        client_request_id: "history-replay",
      }),
    });
    expect(changed.status).toBe(201);
    const replay = await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        vote: "interested",
        score: 4,
        client_request_id: "history-replay",
      }),
    });
    expect(replay.status).toBe(200);

    const history = await (
      await api(`/v1/honeymoon-periods/${id}/history`, { headers: headersB })
    ).json<{ items: Array<Record<string, unknown>> }>();
    expect(history.items).toEqual([
      expect.objectContaining({
        sequence: expect.any(Number),
        type: "PreferenceChanged",
        honeymoon_period_id: id,
        actor_id: "actor-a",
        display_name: "Participant A",
        payload: {
          reason: null,
          changes: {
            vote: { before: null, after: "interested" },
            score: { before: null, after: 4 },
          },
        },
      }),
    ]);
    const detail = await (await api(`/v1/honeymoon-periods/${id}`, { headers: headersA })).json<{
      preferences: Array<{ actor_id: string; vote: string }>;
    }>();
    expect(detail.preferences).toEqual([
      expect.objectContaining({ actor_id: "actor-a", vote: "interested" }),
    ]);
  });

  it("replays exact preference changes and rejects conflicting key reuse without changing state", async () => {
    const id = await capturedId();
    const request = {
      vote: "maybe",
      score: 3,
      reason: "Good rainy-day option",
      client_request_id: "preference-a-1",
    };
    const first = await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify(request),
    });
    expect(first.status).toBe(201);
    const original = await first.json();
    const replay = await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify(request),
    });
    expect(replay.status).toBe(200);
    expect(await replay.json()).toEqual(original);

    const conflict = await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ ...request, score: 5 }),
    });
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({ error: { code: "idempotency_conflict" } });
    expect(
      (
        await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM preference_events WHERE honeymoon_period_id = ?",
        )
          .bind(id)
          .first<{ count: number }>()
      )?.count,
    ).toBe(1);
    expect(
      await env.DB.prepare(
        "SELECT vote, score FROM preferences WHERE honeymoon_period_id = ? AND actor_id = ?",
      )
        .bind(id, "actor-a")
        .first(),
    ).toMatchObject({ vote: "maybe", score: 3 });
  });

  it("records and replays idempotent no-op results and rejects blank reasons", async () => {
    const id = await capturedId();
    const send = (clientRequestId: string, reason?: string) =>
      api(`/v1/honeymoon-periods/${id}/preference-changes`, {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({
          vote: "maybe",
          score: 2,
          client_request_id: clientRequestId,
          ...(reason === undefined ? {} : { reason }),
        }),
      });
    expect((await send("initial-change")).status).toBe(201);
    const unchanged = await send("same-current-values");
    expect(unchanged.status).toBe(201);
    expect(await unchanged.clone().json()).toEqual({ status: "unchanged", event: null });
    const replay = await send("same-current-values");
    expect(replay.status).toBe(200);
    expect(await replay.json()).toEqual(await unchanged.json());
    expect((await send("blank-reason", "   ")).status).toBe(400);
    expect(
      (
        await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM preference_events WHERE honeymoon_period_id = ?",
        )
          .bind(id)
          .first<{ count: number }>()
      )?.count,
    ).toBe(1);
  });

  it("serializes concurrent participant changes without orphaning history or projections", async () => {
    const id = await capturedId();
    const responses = await Promise.all([
      api(`/v1/honeymoon-periods/${id}/preference-changes`, {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({
          vote: "interested",
          score: 5,
          client_request_id: "parallel-a",
        }),
      }),
      api(`/v1/honeymoon-periods/${id}/preference-changes`, {
        method: "POST",
        headers: headersB,
        body: JSON.stringify({ vote: "decline", score: 1, client_request_id: "parallel-b" }),
      }),
    ]);
    expect(responses.map(({ status }) => status)).toEqual([201, 201]);
    const history = await (
      await api(`/v1/honeymoon-periods/${id}/history`, { headers: headersA })
    ).json<{ items: Array<{ sequence: number; actor_id: string }> }>();
    expect(history.items).toHaveLength(2);
    expect(history.items[1]?.sequence).toBe((history.items[0]?.sequence ?? 0) + 1);
    expect(new Set(history.items.map(({ actor_id }) => actor_id))).toEqual(
      new Set(["actor-a", "actor-b"]),
    );
    expect(
      (
        await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM preferences WHERE honeymoon_period_id = ?",
        )
          .bind(id)
          .first<{ count: number }>()
      )?.count,
    ).toBe(2);
  });

  it("resolves concurrent idempotency races without an orphan event or projection", async () => {
    const id = await capturedId();
    const sameRequest = (vote: "interested" | "decline", score: number) =>
      api(`/v1/honeymoon-periods/${id}/preference-changes`, {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({
          vote,
          score,
          client_request_id: "concurrent-key",
        }),
      });
    const responses = await Promise.all([sameRequest("interested", 5), sameRequest("decline", 1)]);
    expect(responses.map(({ status }) => status).sort()).toEqual([201, 409]);
    const history = await (
      await api(`/v1/honeymoon-periods/${id}/history`, { headers: headersB })
    ).json<{
      items: Array<{
        payload: { changes: { vote: { after: string }; score: { after: number } } };
      }>;
    }>();
    expect(history.items).toHaveLength(1);
    const projection = await env.DB.prepare(
      "SELECT vote, score FROM preferences WHERE honeymoon_period_id = ? AND actor_id = ?",
    )
      .bind(id, "actor-a")
      .first<{ vote: string; score: number }>();
    expect(projection).toEqual({
      vote: history.items[0]?.payload.changes.vote.after,
      score: history.items[0]?.payload.changes.score.after,
    });
    expect(
      (
        await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM preference_change_requests WHERE actor_id = ? AND client_request_id = ?",
        )
          .bind("actor-a", "concurrent-key")
          .first<{ count: number }>()
      )?.count,
    ).toBe(1);
  });

  it("retains immutable history when deletion of its parent is attempted", async () => {
    const id = await capturedId();
    const changed = await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        vote: "interested",
        score: 4,
        client_request_id: "retained-history",
      }),
    });
    expect(changed.status).toBe(201);
    await expect(
      env.DB.prepare("DELETE FROM honeymoon_periods WHERE id = ?").bind(id).run(),
    ).rejects.toThrow();
    const history = await (
      await api(`/v1/honeymoon-periods/${id}/history`, { headers: headersB })
    ).json<{ items: unknown[] }>();
    expect(history.items).toHaveLength(1);
  });

  it("can rank from one configured participant without changing the two-participant default", async () => {
    const id = await capturedId();
    await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ vote: "interested", score: 5, client_request_id: "single-a" }),
    });
    await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
      method: "POST",
      headers: headersB,
      body: JSON.stringify({ vote: "decline", score: 1, client_request_id: "single-b" }),
    });
    const defaultDetail = await (
      await api(`/v1/honeymoon-periods/${id}`, { headers: headersA })
    ).json<{ item: { rank: { total: number } } }>();
    expect(defaultDetail.item.rank.total).toBe(3);
    const singleActorResponse = await worker.fetch(
      new Request(`${base}/v1/honeymoon-periods/${id}`, { headers: headersA }),
      { DB: env.DB, TEST_MODE: "true", SINGLE_PARTICIPANT_RANKING_ACTOR_ID: "actor-a" },
    );
    expect(
      (await singleActorResponse.json<{ item: { rank: { total: number } } }>()).item.rank.total,
    ).toBe(7);
  });

  it("updates shared metadata, records note provenance, filters, sorts, and paginates", async () => {
    const id = await capturedId();
    const updated = await api(`/v1/honeymoon-periods/${id}`, {
      method: "PATCH",
      headers: headersA,
      body: JSON.stringify({
        title: "Synthetic Bistro",
        kind: "restaurant",
        metadata: { cuisine: "Fixture food", decline_reason: "Too far this week" },
        rank_boost: 2,
      }),
    });
    expect(updated.status).toBe(200);
    expect(await updated.clone().json()).toMatchObject({
      item: {
        metadata: { decline_reason: "Too far this week" },
        metadata_updated_by_actor_id: "actor-a",
      },
    });
    const note = await api(`/v1/honeymoon-periods/${id}/notes`, {
      method: "POST",
      headers: headersB,
      body: JSON.stringify({ body: "Synthetic note" }),
    });
    const createdNote = await note.json<{ id: string }>();
    expect(createdNote).toMatchObject({
      actor_id: "actor-b",
      display_name: "Participant B",
      body: "Synthetic note",
    });
    const forbiddenEdit = await api(`/v1/honeymoon-periods/${id}/notes/${createdNote.id}`, {
      method: "PATCH",
      headers: headersA,
      body: JSON.stringify({ body: "Edited shared note" }),
    });
    expect(forbiddenEdit.status).toBe(404);
    const edited = await api(`/v1/honeymoon-periods/${id}/notes/${createdNote.id}`, {
      method: "PATCH",
      headers: headersB,
      body: JSON.stringify({ body: "Edited shared note" }),
    });
    expect(await edited.json()).toMatchObject({ actor_id: "actor-b", body: "Edited shared note" });
    const page = await (
      await api(
        "/v1/honeymoon-periods?kind=restaurant&q=synthetic&sort=title&order=asc&page=1&per_page=1",
        { headers: headersA },
      )
    ).json<{ total: number; items: Array<{ title: string; rank: { boost: number } }> }>();
    expect(page).toMatchObject({
      total: 1,
      items: [{ title: "Synthetic Bistro", rank: { boost: 2 } }],
    });
  });

  it("enforces foreign keys, uniqueness, missing records, and invalid pagination", async () => {
    await expect(
      env.DB.prepare(
        "INSERT INTO captures (id, honeymoon_period_id, actor_id, source_url, client_request_id) VALUES ('bad', 'missing', 'actor-a', 'https://example.com', 'bad')",
      ).run(),
    ).rejects.toThrow();
    const missing = await api("/v1/honeymoon-periods/00000000-0000-4000-8000-000000000999", {
      headers: headersA,
    });
    expect(missing.status).toBe(404);
    const invalid = await api("/v1/honeymoon-periods?page=0", { headers: headersA });
    expect(invalid.status).toBe(400);
    expect((await api("/v1/honeymoon-periods?status=unknown", { headers: headersA })).status).toBe(
      400,
    );
    expect((await api("/v1/honeymoon-periods?sort=unknown", { headers: headersA })).status).toBe(
      400,
    );
    expect((await api("/v1/honeymoon-periods?order=sideways", { headers: headersA })).status).toBe(
      400,
    );
    expect((await api("/v1/honeymoon-periods?per_page=101", { headers: headersA })).status).toBe(
      400,
    );
    expect((await api("/v1/honeymoon-periods?per_page=nope", { headers: headersA })).status).toBe(
      400,
    );
    expect((await api("/v1/honeymoon-periods?page=nope", { headers: headersA })).status).toBe(400);
    expect(
      (await api(`/v1/honeymoon-periods?kind=${"k".repeat(51)}`, { headers: headersA })).status,
    ).toBe(400);
    expect(
      (await api(`/v1/honeymoon-periods?q=${"q".repeat(101)}`, { headers: headersA })).status,
    ).toBe(400);
    expect((await api("/v1/honeymoon-periods/not-a-uuid", { headers: headersA })).status).toBe(400);
  });

  it("returns empty pages and supports every stable sort direction with tie breaking", async () => {
    expect(await (await api("/v1/honeymoon-periods", { headers: headersA })).json()).toMatchObject({
      items: [],
      total: 0,
    });
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO honeymoon_periods (id, title, kind, normalized_url, updated_at) VALUES (?, ?, ?, ?, ?)",
      ).bind(
        "00000000-0000-4000-8000-000000000201",
        "Zulu",
        "event",
        "https://example.com/zulu",
        "2026-01-02T00:00:00.000Z",
      ),
      env.DB.prepare(
        "INSERT INTO honeymoon_periods (id, title, kind, normalized_url, updated_at) VALUES (?, ?, ?, ?, ?)",
      ).bind(
        "00000000-0000-4000-8000-000000000202",
        "Alpha",
        "restaurant",
        "https://example.com/alpha",
        "2026-01-01T00:00:00.000Z",
      ),
    ]);
    const titleDesc = await (
      await api("/v1/honeymoon-periods?sort=title&order=desc", { headers: headersA })
    ).json<{ items: Array<{ title: string }> }>();
    expect(titleDesc.items.map(({ title }) => title)).toEqual(["Zulu", "Alpha"]);
    const newestAsc = await (
      await api("/v1/honeymoon-periods?sort=newest&order=asc", { headers: headersA })
    ).json<{ items: Array<{ title: string }> }>();
    expect(newestAsc.items.map(({ title }) => title)).toEqual(["Alpha", "Zulu"]);
    const ranked = await (
      await api("/v1/honeymoon-periods?sort=rank&order=asc", { headers: headersA })
    ).json<{ items: Array<{ id: string }> }>();
    expect(ranked.items.map(({ id }) => id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
      "00000000-0000-4000-8000-000000000202",
    ]);
    await env.DB.prepare("UPDATE honeymoon_periods SET updated_at = ? WHERE id = ?")
      .bind("2026-01-02T00:00:00.000Z", "00000000-0000-4000-8000-000000000202")
      .run();
    const identicalTimestamps = await (
      await api("/v1/honeymoon-periods?sort=rank&order=desc", { headers: headersA })
    ).json<{ items: Array<{ id: string }> }>();
    expect(identicalTimestamps.items.map(({ id }) => id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
      "00000000-0000-4000-8000-000000000202",
    ]);
  });

  it("returns not found for every missing mutation and rejects invalid mutation bodies", async () => {
    const missing = "00000000-0000-4000-8000-000000000999";
    expect(
      (
        await api(`/v1/honeymoon-periods/${missing}`, {
          method: "PATCH",
          headers: headersA,
          body: JSON.stringify({ title: "Missing" }),
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await api(`/v1/honeymoon-periods/${missing}/preference-changes`, {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({ vote: null, score: null, client_request_id: "missing" }),
        })
      ).status,
    ).toBe(404);
    expect(
      (await api(`/v1/honeymoon-periods/${missing}/history`, { headers: headersA })).status,
    ).toBe(404);
    expect(
      (
        await api(`/v1/honeymoon-periods/${missing}/notes`, {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({ body: "Missing" }),
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await api(`/v1/honeymoon-periods/${missing}/notes/00000000-0000-4000-8000-000000000998`, {
          method: "PATCH",
          headers: headersA,
          body: JSON.stringify({ body: "Missing" }),
        })
      ).status,
    ).toBe(404);
    expect(
      (await api("/v1/honeymoon-periods", { method: "POST", headers: headersA, body: "{}" }))
        .status,
    ).toBe(404);
    expect(
      (
        await api(`/v1/honeymoon-periods/${missing}/notes`, {
          method: "PUT",
          headers: headersA,
          body: "{}",
        })
      ).status,
    ).toBe(404);
    expect((await api("/v1/unknown", { headers: headersA })).status).toBe(404);
  });

  it("supports partial shared updates and rejects oversized metadata", async () => {
    const id = await capturedId();
    for (const value of [
      { title: "Trimmed title " },
      { kind: "event " },
      { status: "planned" },
      { rank_boost: -2 },
      { metadata: { timing: "Evening" } },
    ]) {
      expect(
        (
          await api(`/v1/honeymoon-periods/${id}`, {
            method: "PATCH",
            headers: headersA,
            body: JSON.stringify(value),
          })
        ).status,
      ).toBe(200);
    }
    const oversized = await api(`/v1/honeymoon-periods/${id}`, {
      method: "PATCH",
      headers: headersA,
      body: JSON.stringify({ metadata: { special: "x".repeat(9000) } }),
    });
    expect(oversized.status).toBe(400);
    for (const value of [{ title: "   " }, { kind: "\t" }]) {
      expect(
        (
          await api(`/v1/honeymoon-periods/${id}`, {
            method: "PATCH",
            headers: headersA,
            body: JSON.stringify(value),
          })
        ).status,
      ).toBe(400);
    }
    expect(
      (
        await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({ vote: "yes", score: 9, client_request_id: "invalid" }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await api(`/v1/honeymoon-periods/${id}/notes`, {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({ body: "" }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await api(`/v1/honeymoon-periods/${id}/notes`, {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({ body: "   " }),
        })
      ).status,
    ).toBe(400);
  });

  it("preserves concurrently patched fields when each request omits the other field", async () => {
    const id = await capturedId();
    const responses = await Promise.all([
      api(`/v1/honeymoon-periods/${id}`, {
        method: "PATCH",
        headers: headersA,
        body: JSON.stringify({ title: "Concurrent Bistro" }),
      }),
      api(`/v1/honeymoon-periods/${id}`, {
        method: "PATCH",
        headers: headersB,
        body: JSON.stringify({ rank_boost: 7 }),
      }),
    ]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);

    const value = await (await api(`/v1/honeymoon-periods/${id}`, { headers: headersA })).json<{
      item: { title: string; rank: { boost: number } };
    }>();
    expect(value.item).toMatchObject({
      title: "Concurrent Bistro",
      rank: { boost: 7 },
    });
  });
});

describe("Worker adapter states", () => {
  it("serves health and CORS preflight without authentication", async () => {
    expect(await (await api("/health")).json()).toEqual({ status: "ok" });
    const options = await api("/v1/captures", { method: "OPTIONS" });
    expect(options.status).toBe(204);
    expect(options.headers.get("access-control-allow-methods")).toBe(
      "GET, POST, PATCH, OPTIONS",
    );
  });

  it("rejects disabled actors and enforces the bounded request rate", async () => {
    await env.DB.prepare("UPDATE actors SET status = 'disabled' WHERE id = 'actor-a'").run();
    expect((await api("/v1/honeymoon-periods", { headers: headersA })).status).toBe(401);
    await env.DB.prepare("UPDATE actors SET status = 'active' WHERE id = 'actor-a'").run();
    let last: Response | undefined;
    for (let index = 0; index < 121; index += 1)
      last = await api("/v1/honeymoon-periods", { headers: headersA });
    expect(last?.status).toBe(429);
  });

  it("exercises the observable error matrix for preference mutation and history", async () => {
    const id = "00000000-0000-4000-8000-000000000301";
    await env.DB.prepare(
      "INSERT INTO honeymoon_periods (id, title, normalized_url) VALUES (?, ?, ?)",
    )
      .bind(id, "Error fixture", "https://example.com/error-fixture")
      .run();
    expect(
      (
        await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ vote: null, score: null, client_request_id: "unauthorized" }),
        })
      ).status,
    ).toBe(401);
    expect((await api(`/v1/honeymoon-periods/${id}/history`)).status).toBe(401);
    expect(
      (await api("/v1/honeymoon-periods/not-a-uuid/history", { headers: headersA })).status,
    ).toBe(400);

    const windowStart = Math.floor(Date.now() / 60_000);
    const primeLimit = () =>
      env.DB.prepare(
        `INSERT INTO rate_limits (actor_id, window_start, request_count) VALUES (?, ?, 120)
        ON CONFLICT (actor_id) DO UPDATE SET window_start = excluded.window_start, request_count = 120`,
      )
        .bind("actor-a", windowStart)
        .run();
    await primeLimit();
    expect(
      (
        await api(`/v1/honeymoon-periods/${id}/preference-changes`, {
          method: "POST",
          headers: headersA,
          body: JSON.stringify({ vote: null, score: null, client_request_id: "limited" }),
        })
      ).status,
    ).toBe(429);
    await primeLimit();
    expect((await api(`/v1/honeymoon-periods/${id}/history`, { headers: headersA })).status).toBe(
      429,
    );

    const broken = {
      prepare: () => {
        throw new Error("private adapter detail");
      },
    } as unknown as D1Database;
    for (const request of [
      new Request(`${base}/v1/honeymoon-periods/${id}/preference-changes`, {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({ vote: null, score: null, client_request_id: "broken" }),
      }),
      new Request(`${base}/v1/honeymoon-periods/${id}/history`, { headers: headersA }),
    ]) {
      const result = await worker.fetch(request, { DB: broken, TEST_MODE: "true" });
      expect(result.status).toBe(500);
    }
  });

  it("converts unexpected adapter failures into privacy-safe errors", async () => {
    const request = new Request(`${base}/v1/honeymoon-periods`, { headers: headersA });
    for (const thrown of [new Error("private database detail"), "private non-error detail"]) {
      const broken = {
        prepare: () => {
          throw thrown;
        },
      } as unknown as D1Database;
      const result = await worker.fetch(request.clone() as unknown as Request, {
        DB: broken,
        TEST_MODE: "true",
      });
      expect(result.status).toBe(500);
      expect(await result.json()).toEqual({
        error: { code: "internal_error", message: "request could not be completed" },
      });
    }
  });
});
