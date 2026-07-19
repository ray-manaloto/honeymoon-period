import {
  DomainError,
  idempotencyKey,
  normalizeUrl,
  ownedPreference,
  rank,
  replayRank,
} from "@honeymoon-period/domain";
import type {
  Capture,
  CaptureInput,
  CaptureResult,
  HistoricalRanking,
  HistoryEvent,
  HistoryPage,
  HoneymoonPeriod,
  HoneymoonPeriodDetail,
  HoneymoonPeriodPage,
  HoneymoonPeriodUpdate,
  Note,
  NoteInput,
  Preference,
  PreferenceChangeInput,
  PreferenceChangeResult,
} from "@honeymoon-period/generated";
import { assertContract, ContractError } from "./contract";

interface Env {
  DB: D1Database;
  TEST_MODE?: string;
}
interface Actor {
  id: string;
  display_name: string;
}
type Row = Record<string, unknown>;
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
};
const MAX_BODY_BYTES = 16 * 1024;
const REQUESTS_PER_MINUTE = 120;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function response(
  value: unknown,
  status = 200,
  schema?: Parameters<typeof assertContract>[0],
): Response {
  if (schema) assertContract(schema, value);
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}

function failure(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): Response {
  const value = { error: { code, message, ...(fields ? { fields } : {}) } };
  assertContract("ErrorEnvelope", value);
  return response(value, status);
}

async function readBody(
  request: Request,
  schema: Parameters<typeof assertContract>[0],
): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !==
    "application/json"
  ) {
    throw new ContractError({ body: "content-type must be application/json" });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new ContractError({ body: `must not exceed ${MAX_BODY_BYTES} bytes` });
  }
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES)
    throw new ContractError({ body: `must not exceed ${MAX_BODY_BYTES} bytes` });
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ContractError({ body: "must be valid JSON" });
  }
  assertContract(schema, value);
  return value;
}

async function tokenDigest(token: string): Promise<string> {
  const bytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
  );
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function actorFor(request: Request, db: D1Database): Promise<Actor | null> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  /* istanbul ignore next -- Fetch normalizes a whitespace-only bearer value to the already-tested non-bearer case. */
  if (!token) return null;
  const digest = await tokenDigest(token);
  return db
    .prepare("SELECT id, display_name FROM actors WHERE token_digest = ? AND status = 'active'")
    .bind(digest)
    .first<Actor>();
}

async function withinRateLimit(db: D1Database, actor: Actor): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / 60_000);
  const row = await db
    .prepare(`INSERT INTO rate_limits (actor_id, window_start, request_count) VALUES (?, ?, 1)
    ON CONFLICT (actor_id) DO UPDATE SET request_count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.request_count + 1 ELSE 1 END,
    window_start = excluded.window_start RETURNING request_count`)
    .bind(actor.id, windowStart)
    .first<{ request_count: number }>();
  /* istanbul ignore next -- D1 RETURNING either supplies the row or rejects the statement. */
  if (!row) throw new Error("rate limit update returned no row");
  return row.request_count <= REQUESTS_PER_MINUTE;
}

function captureFrom(row: Row): Capture {
  return {
    id: String(row.id),
    honeymoon_period_id: String(row.honeymoon_period_id),
    actor_id: String(row.actor_id),
    source_url: String(row.source_url),
    client_request_id: String(row.client_request_id),
    enrichment_status: row.enrichment_status as Capture["enrichment_status"],
    captured_at: String(row.captured_at),
  };
}

async function preferencesFor(db: D1Database, id: string): Promise<Preference[]> {
  const rows = await db
    .prepare(`SELECT p.honeymoon_period_id, p.actor_id, a.display_name, p.vote, p.score, p.updated_at
    FROM preferences p JOIN actors a ON a.id = p.actor_id WHERE p.honeymoon_period_id = ? ORDER BY p.actor_id`)
    .bind(id)
    .all<Row>();
  return rows.results.map((row) => ({
    honeymoon_period_id: String(row.honeymoon_period_id),
    actor_id: String(row.actor_id),
    display_name: String(row.display_name),
    vote: row.vote as Preference["vote"],
    score: row.score === null ? null : Number(row.score),
    updated_at: String(row.updated_at),
  }));
}

function historyEventFrom(row: Row): HistoryEvent {
  return {
    sequence: Number(row.sequence),
    id: String(row.id),
    type: "PreferenceChanged",
    honeymoon_period_id: String(row.honeymoon_period_id),
    actor_id: String(row.actor_id),
    display_name: String(row.display_name),
    accepted_at: String(row.accepted_at),
    payload: {
      reason: row.reason === null ? null : String(row.reason),
      changes: {
        vote: {
          before: row.before_vote as HistoryEvent["payload"]["changes"]["vote"]["before"],
          after: row.after_vote as HistoryEvent["payload"]["changes"]["vote"]["after"],
        },
        score: {
          before: row.before_score === null ? null : Number(row.before_score),
          after: row.after_score === null ? null : Number(row.after_score),
        },
      },
    },
  };
}

async function historyFor(db: D1Database, id: string): Promise<HistoryPage> {
  const rows = await db
    .prepare(`SELECT e.*, a.display_name FROM preference_events e
    JOIN actors a ON a.id = e.actor_id
    WHERE e.honeymoon_period_id = ? ORDER BY e.sequence`)
    .bind(id)
    .all<Row>();
  return { items: rows.results.map(historyEventFrom) };
}

async function historyEventById(db: D1Database, eventId: string): Promise<HistoryEvent | null> {
  const row = await db
    .prepare(`SELECT e.*, a.display_name FROM preference_events e
    JOIN actors a ON a.id = e.actor_id WHERE e.id = ?`)
    .bind(eventId)
    .first<Row>();
  return row ? historyEventFrom(row) : null;
}

async function historicalRankingFor(
  db: D1Database,
  id: string,
  throughSequence: number,
): Promise<HistoricalRanking | null> {
  const events = await db
    .prepare(`SELECT sequence, actor_id, after_vote, after_score, policy_version, rank_boost
    FROM preference_events
    WHERE honeymoon_period_id = ? AND sequence <= ? ORDER BY sequence`)
    .bind(id, throughSequence)
    .all<Row>();
  if (events.results.length === 0) return null;
  const historical = replayRank(
    events.results.map((event) => ({
      sequence: Number(event.sequence),
      actorId: String(event.actor_id),
      policyVersion: Number(event.policy_version),
      rankBoost: Number(event.rank_boost),
      after: {
        vote: event.after_vote as Preference["vote"],
        score: event.after_score === null ? null : Number(event.after_score),
      },
    })),
    throughSequence,
  );
  return {
    honeymoon_period_id: id,
    through_sequence: throughSequence,
    rank: apiRank(historical),
  };
}

function apiRank(components: ReturnType<typeof rank>): HoneymoonPeriod["rank"] {
  return {
    policy_version: components.policyVersion,
    planning_eligible: components.planningEligible,
    score: components.score,
    votes: components.votes,
    boost: components.boost,
    total: components.total,
  };
}

function itemFromRow(row: Row, preferences: readonly Preference[]): HoneymoonPeriod {
  const components = rank(
    preferences.map(({ vote, score }) => ({ vote, score })),
    Number(row.rank_boost),
  );
  return {
    id: String(row.id),
    status: row.status as HoneymoonPeriod["status"],
    title: String(row.title),
    kind: String(row.kind),
    normalized_url: String(row.normalized_url),
    metadata: JSON.parse(String(row.metadata_json)) as Record<string, unknown>,
    metadata_updated_by_actor_id:
      row.metadata_updated_by_actor_id === null ? null : String(row.metadata_updated_by_actor_id),
    rank_boost: Number(row.rank_boost),
    rank: apiRank(components),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

async function itemFrom(db: D1Database, row: Row): Promise<HoneymoonPeriod> {
  return itemFromRow(row, await preferencesFor(db, String(row.id)));
}

async function detail(db: D1Database, id: string): Promise<HoneymoonPeriodDetail | null> {
  const row = await db
    .prepare("SELECT * FROM honeymoon_periods WHERE id = ?")
    .bind(id)
    .first<Row>();
  if (!row) return null;
  const [preferences, notesResult, capturesResult] = await Promise.all([
    preferencesFor(db, id),
    db
      .prepare(`SELECT n.id, n.honeymoon_period_id, n.actor_id, a.display_name, n.body, n.created_at
      FROM notes n JOIN actors a ON a.id = n.actor_id WHERE n.honeymoon_period_id = ? ORDER BY n.created_at, n.id`)
      .bind(id)
      .all<Row>(),
    db
      .prepare("SELECT * FROM captures WHERE honeymoon_period_id = ? ORDER BY captured_at, id")
      .bind(id)
      .all<Row>(),
  ]);
  const notes: Note[] = notesResult.results.map((note) => ({
    id: String(note.id),
    honeymoon_period_id: String(note.honeymoon_period_id),
    actor_id: String(note.actor_id),
    display_name: String(note.display_name),
    body: String(note.body),
    created_at: String(note.created_at),
  }));
  return {
    item: itemFromRow(row, preferences),
    preferences,
    notes,
    captures: capturesResult.results.map(captureFrom),
  };
}

async function createCapture(request: Request, env: Env, actor: Actor): Promise<Response> {
  const input = (await readBody(request, "CaptureInput")) as CaptureInput;
  idempotencyKey(actor.id, input.client_request_id);
  const replay = await env.DB.prepare(
    "SELECT * FROM captures WHERE actor_id = ? AND client_request_id = ?",
  )
    .bind(actor.id, input.client_request_id)
    .first<Row>();
  if (replay) {
    const replayDetail = await detail(env.DB, String(replay.honeymoon_period_id));
    /* istanbul ignore next -- foreign keys make this a defensive corruption guard. */
    if (!replayDetail) throw new Error("capture references a missing honeymoon-period");
    const result: CaptureResult = {
      status: "replayed",
      capture: captureFrom(replay),
      honeymoon_period: replayDetail.item,
    };
    return response(result, 200, "CaptureResult");
  }
  const normalized = normalizeUrl(input.source_url);
  const itemId = crypto.randomUUID();
  const captureId = crypto.randomUUID();
  const title = new URL(input.source_url).hostname.replace(/^www\./, "");
  const insertResults = await env.DB.batch([
    env.DB.prepare(
      "INSERT OR IGNORE INTO honeymoon_periods (id, title, normalized_url) VALUES (?, ?, ?)",
    ).bind(itemId, title, normalized),
    env.DB.prepare(`INSERT OR IGNORE INTO captures (id, honeymoon_period_id, actor_id, source_url, client_request_id)
      SELECT ?, id, ?, ?, ? FROM honeymoon_periods WHERE normalized_url = ?`).bind(
      captureId,
      actor.id,
      input.source_url,
      input.client_request_id,
      normalized,
    ),
    env.DB.prepare(`DELETE FROM honeymoon_periods WHERE id = ?
      AND NOT EXISTS (SELECT 1 FROM captures WHERE honeymoon_period_id = ?)`).bind(itemId, itemId),
  ]);
  const itemInsert = insertResults[0];
  const captureInsert = insertResults[1];
  /* istanbul ignore next -- D1 batch returns one result for each submitted statement. */
  if (!itemInsert || !captureInsert) throw new Error("capture batch returned incomplete results");
  if (captureInsert.meta.changes !== 1) {
    const concurrent = await env.DB.prepare(
      "SELECT * FROM captures WHERE actor_id = ? AND client_request_id = ?",
    )
      .bind(actor.id, input.client_request_id)
      .first<Row>();
    /* istanbul ignore next -- a zero-change unique insert must have a conflicting row. */
    if (!concurrent) throw new Error("failed to resolve concurrent capture replay");
    const replayDetail = await detail(env.DB, String(concurrent.honeymoon_period_id));
    /* istanbul ignore next -- foreign keys make this a defensive corruption guard. */
    if (!replayDetail) throw new Error("capture references a missing honeymoon-period");
    return response(
      { status: "replayed", capture: captureFrom(concurrent), honeymoon_period: replayDetail.item },
      200,
      "CaptureResult",
    );
  }
  const itemRow = await env.DB.prepare("SELECT * FROM honeymoon_periods WHERE normalized_url = ?")
    .bind(normalized)
    .first<Row>();
  /* istanbul ignore next -- the successful capture insert references an existing item. */
  if (!itemRow) throw new Error("failed to create honeymoon-period");
  const captureRow = await env.DB.prepare("SELECT * FROM captures WHERE id = ?")
    .bind(captureId)
    .first<Row>();
  /* istanbul ignore next -- the successful INSERT and same-connection SELECT are invariant. */
  if (!captureRow) throw new Error("failed to create capture");
  const result: CaptureResult = {
    status: itemInsert.meta.changes === 1 ? "created" : "existing",
    capture: captureFrom(captureRow),
    honeymoon_period: await itemFrom(env.DB, itemRow),
  };
  return response(result, 201, "CaptureResult");
}

async function list(request: Request, db: D1Database): Promise<Response> {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "active";
  const kind = url.searchParams.get("kind");
  const rawQuery = url.searchParams.get("q") ?? "";
  const query = rawQuery.trim().toLowerCase();
  const sort = url.searchParams.get("sort") ?? "rank";
  const order = url.searchParams.get("order") ?? "desc";
  const page = Number(url.searchParams.get("page") ?? 1);
  const perPage = Number(url.searchParams.get("per_page") ?? 25);
  if (
    !["active", "planned", "completed", "declined"].includes(status) ||
    (kind?.length ?? 0) > 50 ||
    rawQuery.length > 100 ||
    !["rank", "newest", "title"].includes(sort) ||
    !["asc", "desc"].includes(order) ||
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(perPage) ||
    perPage < 1 ||
    perPage > 100
  ) {
    throw new ContractError({ query: "invalid list filter, sort, or pagination" });
  }
  const rows = await db
    .prepare("SELECT * FROM honeymoon_periods WHERE status = ?")
    .bind(status)
    .all<Row>();
  const items = (await Promise.all(rows.results.map((row) => itemFrom(db, row))))
    .filter(
      (item) =>
        (!kind || item.kind === kind) && (!query || item.title.toLowerCase().includes(query)),
    )
    .sort((left, right) => {
      const direction = order === "asc" ? 1 : -1;
      const primary =
        sort === "rank"
          ? left.rank.total - right.rank.total
          : sort === "newest"
            ? left.updated_at.localeCompare(right.updated_at)
            : left.title.localeCompare(right.title);
      if (primary !== 0) return primary * direction;
      if (sort === "rank") {
        const newest = right.updated_at.localeCompare(left.updated_at);
        if (newest !== 0) return newest;
      }
      return left.id.localeCompare(right.id);
    });
  const start = (page - 1) * perPage;
  const result: HoneymoonPeriodPage = {
    items: items.slice(start, start + perPage),
    page,
    per_page: perPage,
    total: items.length,
  };
  return response(result, 200, "HoneymoonPeriodPage");
}

async function update(
  request: Request,
  db: D1Database,
  id: string,
  actor: Actor,
): Promise<Response> {
  const input = (await readBody(request, "HoneymoonPeriodUpdate")) as HoneymoonPeriodUpdate;
  const current = await db
    .prepare("SELECT * FROM honeymoon_periods WHERE id = ?")
    .bind(id)
    .first<Row>();
  if (!current) return failure(404, "not_found", "honeymoon-period not found");
  const assignments: string[] = [];
  const values: unknown[] = [];
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title)
      throw new ContractError({ body: "title and kind must contain non-whitespace characters" });
    assignments.push("title = ?");
    values.push(title);
  }
  if (input.kind !== undefined) {
    const kind = input.kind.trim();
    if (!kind)
      throw new ContractError({ body: "title and kind must contain non-whitespace characters" });
    assignments.push("kind = ?");
    values.push(kind);
  }
  if (input.status !== undefined) {
    assignments.push("status = ?");
    values.push(input.status);
  }
  if (input.metadata !== undefined) {
    const metadata = JSON.stringify(input.metadata);
    if (new TextEncoder().encode(metadata).byteLength > 8192)
      throw new ContractError({ "/metadata": "must not exceed 8192 bytes" });
    assignments.push("metadata_json = ?", "metadata_updated_by_actor_id = ?");
    values.push(metadata, actor.id);
  }
  if (input.rank_boost !== undefined) {
    assignments.push("rank_boost = ?");
    values.push(input.rank_boost);
  }
  assignments.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  await db
    .prepare(`UPDATE honeymoon_periods SET ${assignments.join(", ")} WHERE id = ?`)
    .bind(...values, id)
    .run();
  const value = await detail(db, id);
  /* istanbul ignore next -- the row is protected by the completed update. */
  if (!value) throw new Error("updated honeymoon-period disappeared");
  return response(value, 200, "HoneymoonPeriodDetail");
}

interface PreferenceWrite {
  vote: PreferenceChangeInput["vote"];
  score: PreferenceChangeInput["score"];
  reason: string | null;
}

async function fingerprintPreferenceChange(
  id: string,
  input: PreferenceChangeInput,
  reason: string | null,
): Promise<string> {
  const canonical = JSON.stringify([id, input.vote, input.score, reason]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function applyPreferenceChange(
  db: D1Database,
  id: string,
  actor: Actor,
  input: PreferenceWrite,
  requestIdentity: { clientRequestId: string; fingerprint: string },
): Promise<PreferenceChangeResult> {
  const eventId = crypto.randomUUID();
  const requestId = crypto.randomUUID();
  const acceptedAt = new Date().toISOString();
  const statements: D1PreparedStatement[] = [
    db
      .prepare(`INSERT INTO preference_change_requests
      (id, actor_id, client_request_id, honeymoon_period_id, payload_fingerprint)
      VALUES (?, ?, ?, ?, ?)`)
      .bind(requestId, actor.id, requestIdentity.clientRequestId, id, requestIdentity.fingerprint),
    db
      .prepare(`INSERT INTO preference_events
      (id, request_id, honeymoon_period_id, actor_id, event_type, before_vote, after_vote, before_score, after_score, reason, policy_version, rank_boost, accepted_at)
      SELECT ?, ?, ?, ?, 'PreferenceChanged', p.vote, ?, p.score, ?, ?, 1,
      (SELECT rank_boost FROM honeymoon_periods WHERE id = ?), ?
      FROM (SELECT 1) seed
      LEFT JOIN preferences p ON p.honeymoon_period_id = ? AND p.actor_id = ?
      WHERE p.honeymoon_period_id IS NULL OR p.vote IS NOT ? OR p.score IS NOT ?`)
      .bind(
        eventId,
        requestId,
        id,
        actor.id,
        input.vote,
        input.score,
        input.reason,
        id,
        acceptedAt,
        id,
        actor.id,
        input.vote,
        input.score,
      ),
    db
      .prepare(`INSERT INTO preferences (honeymoon_period_id, actor_id, vote, score, updated_at)
      SELECT ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM preference_events WHERE id = ?)
      ON CONFLICT (honeymoon_period_id, actor_id) DO UPDATE SET vote = excluded.vote,
      score = excluded.score, updated_at = excluded.updated_at`)
      .bind(id, actor.id, input.vote, input.score, acceptedAt, eventId),
    db
      .prepare(`UPDATE honeymoon_periods SET updated_at = ? WHERE id = ?
      AND EXISTS (SELECT 1 FROM preference_events WHERE id = ?)`)
      .bind(acceptedAt, id, eventId),
  ];
  await db.batch(statements);
  const event = await historyEventById(db, eventId);
  return { status: event ? "changed" : "unchanged", event };
}

async function storedPreferenceChange(
  db: D1Database,
  actorId: string,
  clientRequestId: string,
): Promise<{ fingerprint: string; result: PreferenceChangeResult } | null> {
  const row = await db
    .prepare(`SELECT id, payload_fingerprint FROM preference_change_requests
    WHERE actor_id = ? AND client_request_id = ?`)
    .bind(actorId, clientRequestId)
    .first<{ id: string; payload_fingerprint: string }>();
  if (!row) return null;
  const eventRow = await db
    .prepare("SELECT id FROM preference_events WHERE request_id = ?")
    .bind(row.id)
    .first<{ id: string }>();
  const event = eventRow ? await historyEventById(db, eventRow.id) : null;
  return {
    fingerprint: row.payload_fingerprint,
    result: { status: event ? "changed" : "unchanged", event },
  };
}

async function createPreferenceChange(
  request: Request,
  db: D1Database,
  id: string,
  actor: Actor,
): Promise<Response> {
  if (!(await db.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first()))
    return failure(404, "not_found", "honeymoon-period not found");
  const input = (await readBody(request, "PreferenceChangeInput")) as PreferenceChangeInput;
  idempotencyKey(actor.id, input.client_request_id);
  const owned = ownedPreference(actor.id, id, input);
  const reason = input.reason?.trim() ?? null;
  if (input.reason !== undefined && !reason)
    throw new ContractError({ "/reason": "must contain non-whitespace characters" });
  const fingerprint = await fingerprintPreferenceChange(id, input, reason);
  const existing = await storedPreferenceChange(db, actor.id, input.client_request_id);
  if (existing) {
    return existing.fingerprint === fingerprint
      ? response(existing.result, 200, "PreferenceChangeResult")
      : failure(409, "idempotency_conflict", "client request ID was already used");
  }
  let result: PreferenceChangeResult;
  try {
    result = await applyPreferenceChange(
      db,
      id,
      actor,
      { ...owned, reason },
      { clientRequestId: input.client_request_id, fingerprint },
    );
  } catch (error) {
    const raced = await storedPreferenceChange(db, actor.id, input.client_request_id);
    if (!raced) throw error;
    return raced.fingerprint === fingerprint
      ? response(raced.result, 200, "PreferenceChangeResult")
      : failure(409, "idempotency_conflict", "client request ID was already used");
  }
  return response(result, 201, "PreferenceChangeResult");
}

async function createNote(
  request: Request,
  db: D1Database,
  id: string,
  actor: Actor,
): Promise<Response> {
  if (!(await db.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first()))
    return failure(404, "not_found", "honeymoon-period not found");
  const input = (await readBody(request, "NoteInput")) as NoteInput;
  const body = input.body.trim();
  if (!body) throw new ContractError({ "/body": "must contain non-whitespace characters" });
  const noteId = crypto.randomUUID();
  await db.batch([
    db
      .prepare("INSERT INTO notes (id, honeymoon_period_id, actor_id, body) VALUES (?, ?, ?, ?)")
      .bind(noteId, id, actor.id, body),
    db
      .prepare(
        "UPDATE honeymoon_periods SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
      )
      .bind(id),
  ]);
  const value = await db
    .prepare(`SELECT n.id, n.honeymoon_period_id, n.actor_id, a.display_name, n.body, n.created_at
    FROM notes n JOIN actors a ON a.id = n.actor_id WHERE n.id = ?`)
    .bind(noteId)
    .first<Row>();
  /* istanbul ignore next -- the completed insert must be readable by the same connection. */
  if (!value) throw new Error("failed to create note");
  const note: Note = {
    id: String(value.id),
    honeymoon_period_id: String(value.honeymoon_period_id),
    actor_id: String(value.actor_id),
    display_name: String(value.display_name),
    body: String(value.body),
    created_at: String(value.created_at),
  };
  return response(note, 201, "Note");
}

async function updateNote(
  request: Request,
  db: D1Database,
  id: string,
  noteId: string,
  actor: Actor,
): Promise<Response> {
  const input = (await readBody(request, "NoteInput")) as NoteInput;
  const body = input.body.trim();
  if (!body) throw new ContractError({ "/body": "must contain non-whitespace characters" });
  const result = await db
    .prepare("UPDATE notes SET body = ? WHERE id = ? AND honeymoon_period_id = ? AND actor_id = ?")
    .bind(body, noteId, id, actor.id)
    .run();
  if (result.meta.changes !== 1) return failure(404, "not_found", "note not found");
  const value = await db
    .prepare(`SELECT n.id, n.honeymoon_period_id, n.actor_id, a.display_name, n.body, n.created_at
    FROM notes n JOIN actors a ON a.id = n.actor_id WHERE n.id = ?`)
    .bind(noteId)
    .first<Row>();
  /* istanbul ignore next -- the completed update must be readable by the same connection. */
  if (!value) throw new Error("updated note disappeared");
  const note: Note = {
    id: String(value.id),
    honeymoon_period_id: String(value.honeymoon_period_id),
    actor_id: String(value.actor_id),
    display_name: String(value.display_name),
    body: String(value.body),
    created_at: String(value.created_at),
  };
  return response(note, 200, "Note");
}

function pathIdentifier(value: string, field: string): string {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new ContractError({ [field]: "must be a valid UUID" });
  }
  if (!UUID_PATTERN.test(decoded)) throw new ContractError({ [field]: "must be a valid UUID" });
  return decoded;
}

async function route(request: Request, env: Env, actor: Actor): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/v1/captures")
    return createCapture(request, env, actor);
  if (request.method === "GET" && url.pathname === "/v1/honeymoon-periods")
    return list(request, env.DB);
  const preferenceChangeMatch = url.pathname.match(
    /^\/v1\/honeymoon-periods\/([^/]+)\/preference-changes$/,
  );
  if (request.method === "POST" && preferenceChangeMatch)
    return createPreferenceChange(
      request,
      env.DB,
      pathIdentifier(preferenceChangeMatch[1] ?? "", "id"),
      actor,
    );
  const historyMatch = url.pathname.match(/^\/v1\/honeymoon-periods\/([^/]+)\/history$/);
  if (request.method === "GET" && historyMatch) {
    const id = pathIdentifier(historyMatch[1] ?? "", "id");
    if (!(await env.DB.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first()))
      return failure(404, "not_found", "honeymoon-period not found");
    return response(await historyFor(env.DB, id), 200, "HistoryPage");
  }
  const rankingMatch = url.pathname.match(/^\/v1\/honeymoon-periods\/([^/]+)\/ranking$/);
  if (request.method === "GET" && rankingMatch) {
    const id = pathIdentifier(rankingMatch[1] ?? "", "id");
    if (!(await env.DB.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first()))
      return failure(404, "not_found", "honeymoon-period not found");
    const rawThroughSequence = url.searchParams.get("through_sequence");
    const throughSequence = Number(rawThroughSequence);
    if (
      rawThroughSequence === null ||
      !Number.isSafeInteger(throughSequence) ||
      throughSequence < 1
    ) {
      throw new ContractError({ through_sequence: "must be a positive safe integer" });
    }
    const snapshot = await historicalRankingFor(env.DB, id, throughSequence);
    return snapshot
      ? response(snapshot, 200, "HistoricalRanking")
      : failure(404, "not_found", "ranking snapshot not found");
  }
  const noteMatch = url.pathname.match(/^\/v1\/honeymoon-periods\/([^/]+)\/notes\/([^/]+)$/);
  if (request.method === "PATCH" && noteMatch)
    return updateNote(
      request,
      env.DB,
      pathIdentifier(noteMatch[1] ?? "", "id"),
      pathIdentifier(noteMatch[2] ?? "", "noteId"),
      actor,
    );
  const match = url.pathname.match(/^\/v1\/honeymoon-periods\/([^/]+)(?:\/(notes))?$/);
  if (!match) return failure(404, "not_found", "route not found");
  const id = pathIdentifier(match[1] ?? "", "id");
  const child = match[2];
  if (request.method === "GET" && !child) {
    const value = await detail(env.DB, id);
    return value
      ? response(value, 200, "HoneymoonPeriodDetail")
      : failure(404, "not_found", "honeymoon-period not found");
  }
  if (request.method === "PATCH" && !child) return update(request, env.DB, id, actor);
  if (request.method === "POST" && child === "notes") return createNote(request, env.DB, id, actor);
  return failure(404, "not_found", "route not found");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "authorization, content-type",
          "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
        },
      });
    if (url.pathname === "/health") return response({ status: "ok" });
    try {
      const actor = await actorFor(request, env.DB);
      if (!actor) return failure(401, "unauthorized", "valid bearer token required");
      if (!(await withinRateLimit(env.DB, actor)))
        return failure(
          429,
          "rate_limited",
          "participant request limit exceeded; retry next minute",
        );
      const result = await route(request, env, actor);
      const headers = new Headers(result.headers);
      headers.set("access-control-allow-origin", "*");
      return new Response(result.body, { status: result.status, headers });
    } catch (error) {
      if (error instanceof ContractError)
        return failure(400, "invalid_request", error.message, error.fields);
      if (error instanceof DomainError) return failure(400, "invalid_request", error.message);
      console.error("request failed", error instanceof Error ? error.message : "unknown error");
      return failure(500, "internal_error", "request could not be completed");
    }
  },
};
