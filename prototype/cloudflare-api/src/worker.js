const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const TRACKING_KEYS = new Set(["fbclid", "gclid", "igshid", "mc_cid", "mc_eid", "si"]);
const VOTES = new Set(["interested", "maybe", "decline"]);
const MAX_BODY_BYTES = 16 * 1024;
const REQUESTS_PER_MINUTE = 120;

function json(value, status = 200) {
  return new Response(JSON.stringify(value, null, 2), { status, headers: JSON_HEADERS });
}

function fail(status, code, message) {
  return json({ error: { code, message } }, status);
}

function normalizeUrl(value) {
  if (typeof value !== "string" || value.length < 1 || value.length > 4096) {
    throw new Error("source_url must be between 1 and 4096 characters");
  }
  const url = new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("source_url must use http or https");
  }
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || TRACKING_KEYS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

async function tokenDigest(token) {
  const bytes = new TextEncoder().encode(token);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

function digestFromHex(value) {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/i.test(value)) return null;
  return Uint8Array.from(value.match(/../g), (pair) => Number.parseInt(pair, 16));
}

async function actorFor(request, db) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  if (!token) return null;
  const suppliedDigest = await tokenDigest(token);
  const actors = await db
    .prepare("SELECT id, display_name, token_digest FROM actors WHERE status = 'active'")
    .all();
  for (const actor of actors.results) {
    const storedDigest = digestFromHex(actor.token_digest);
    if (storedDigest && crypto.subtle.timingSafeEqual(suppliedDigest, storedDigest)) {
      return { id: actor.id, display_name: actor.display_name };
    }
  }
  return null;
}

async function withinRateLimit(db, actor) {
  const windowStart = Math.floor(Date.now() / 60_000);
  const row = await db
    .prepare(`INSERT INTO rate_limits (actor_id, window_start, request_count)
    VALUES (?, ?, 1)
    ON CONFLICT (actor_id) DO UPDATE SET
      request_count = CASE
        WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.request_count + 1
        ELSE 1
      END,
      window_start = excluded.window_start
    RETURNING request_count`)
    .bind(actor.id, windowStart)
    .first();
  return row.request_count <= REQUESTS_PER_MINUTE;
}

async function body(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("content-type must be application/json");
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new Error(`JSON body must not exceed ${MAX_BODY_BYTES} bytes`);
  }
  const encoded = await request.arrayBuffer();
  if (encoded.byteLength > MAX_BODY_BYTES) {
    throw new Error(`JSON body must not exceed ${MAX_BODY_BYTES} bytes`);
  }
  const value = JSON.parse(new TextDecoder().decode(encoded));
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("JSON body must be an object");
  }
  return value;
}

async function createCapture(request, db, actor) {
  const input = await body(request);
  const sourceUrl = input.source_url;
  const clientRequestId = input.client_request_id;
  if (
    typeof clientRequestId !== "string" ||
    clientRequestId.length < 1 ||
    clientRequestId.length > 100
  ) {
    throw new Error("client_request_id must be between 1 and 100 characters");
  }

  const replay = await db
    .prepare(
      "SELECT id, honeymoon_period_id FROM captures WHERE actor_id = ? AND client_request_id = ?",
    )
    .bind(actor.id, clientRequestId)
    .first();
  if (replay) return json({ status: "replayed", capture: replay }, 200);

  const normalizedUrl = normalizeUrl(sourceUrl);
  let item = await db
    .prepare("SELECT id, title, normalized_url FROM honeymoon_periods WHERE normalized_url = ?")
    .bind(normalizedUrl)
    .first();
  let itemStatus = "existing";
  if (!item) {
    const id = crypto.randomUUID();
    const title = new URL(sourceUrl).hostname.replace(/^www\./, "");
    const inserted = await db
      .prepare(
        "INSERT OR IGNORE INTO honeymoon_periods (id, title, normalized_url) VALUES (?, ?, ?)",
      )
      .bind(id, title, normalizedUrl)
      .run();
    item = await db
      .prepare("SELECT id, title, normalized_url FROM honeymoon_periods WHERE normalized_url = ?")
      .bind(normalizedUrl)
      .first();
    itemStatus = inserted.meta.changes === 1 ? "created" : "existing";
  }

  const capture = {
    id: crypto.randomUUID(),
    honeymoon_period_id: item.id,
    actor_id: actor.id,
    source_url: sourceUrl,
    client_request_id: clientRequestId,
    enrichment_status: "pending",
  };
  const insertedCapture = await db
    .prepare(`INSERT OR IGNORE INTO captures
      (id, honeymoon_period_id, actor_id, source_url, client_request_id, enrichment_status)
      VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(
      capture.id,
      capture.honeymoon_period_id,
      capture.actor_id,
      capture.source_url,
      capture.client_request_id,
      capture.enrichment_status,
    )
    .run();
  if (insertedCapture.meta.changes !== 1) {
    const concurrentReplay = await db
      .prepare(
        "SELECT id, honeymoon_period_id FROM captures WHERE actor_id = ? AND client_request_id = ?",
      )
      .bind(actor.id, clientRequestId)
      .first();
    return json({ status: "replayed", capture: concurrentReplay }, 200);
  }
  return json({ status: itemStatus, honeymoon_period: item, capture }, 201);
}

async function listItems(request, db) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "active";
  const sort = url.searchParams.get("sort") || "rank";
  if (!new Set(["rank", "newest"]).has(sort)) throw new Error("sort must be rank or newest");
  const order = sort === "rank" ? "rank_total DESC, hp.updated_at DESC" : "hp.created_at DESC";
  const result = await db
    .prepare(`
    SELECT hp.id, hp.status, hp.title, hp.kind, hp.normalized_url,
      hp.metadata_json, hp.rank_boost, hp.created_at, hp.updated_at,
      COALESCE(AVG(p.score), 0) AS score_component,
      COALESCE(SUM(CASE p.vote
        WHEN 'interested' THEN 2 WHEN 'maybe' THEN 1 WHEN 'decline' THEN -2 ELSE 0 END), 0)
        AS vote_component,
      hp.rank_boost + COALESCE(AVG(p.score), 0) + COALESCE(SUM(CASE p.vote
        WHEN 'interested' THEN 2 WHEN 'maybe' THEN 1 WHEN 'decline' THEN -2 ELSE 0 END), 0)
        AS rank_total
    FROM honeymoon_periods hp
    LEFT JOIN preferences p ON p.honeymoon_period_id = hp.id
    WHERE hp.status = ?
    GROUP BY hp.id
    ORDER BY ${order}
  `)
    .bind(status)
    .all();
  return json({
    items: result.results.map((item) => ({
      ...item,
      metadata: JSON.parse(item.metadata_json),
      metadata_json: undefined,
      rank: {
        score: item.score_component,
        votes: item.vote_component,
        boost: item.rank_boost,
        total: item.rank_total,
      },
    })),
  });
}

async function getItem(id, db) {
  const item = await db.prepare("SELECT * FROM honeymoon_periods WHERE id = ?").bind(id).first();
  if (!item) return fail(404, "not_found", "honeymoon-period not found");
  const [preferences, notes, captures] = await db.batch([
    db
      .prepare(`SELECT p.actor_id, a.display_name, p.vote, p.score, p.updated_at
      FROM preferences p JOIN actors a ON a.id = p.actor_id
      WHERE p.honeymoon_period_id = ? ORDER BY p.actor_id`)
      .bind(id),
    db
      .prepare(`SELECT n.id, n.actor_id, a.display_name, n.body, n.created_at
      FROM notes n JOIN actors a ON a.id = n.actor_id
      WHERE n.honeymoon_period_id = ? ORDER BY n.created_at`)
      .bind(id),
    db
      .prepare(`SELECT id, actor_id, source_url, client_request_id, enrichment_status, captured_at
      FROM captures WHERE honeymoon_period_id = ? ORDER BY captured_at`)
      .bind(id),
  ]);
  return json({
    item: { ...item, metadata: JSON.parse(item.metadata_json), metadata_json: undefined },
    preferences: preferences.results,
    notes: notes.results,
    captures: captures.results,
  });
}

async function updatePreference(request, id, db, actor) {
  if (!(await db.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first())) {
    return fail(404, "not_found", "honeymoon-period not found");
  }
  const input = await body(request);
  const vote = input.vote ?? null;
  const score = input.score ?? null;
  if (vote !== null && !VOTES.has(vote))
    throw new Error("vote must be interested, maybe, decline, or null");
  if (score !== null && (typeof score !== "number" || score < 0 || score > 5)) {
    throw new Error("score must be a number from 0 through 5 or null");
  }
  await db
    .prepare(`INSERT INTO preferences (honeymoon_period_id, actor_id, vote, score)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (honeymoon_period_id, actor_id) DO UPDATE SET
      vote = excluded.vote, score = excluded.score,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`)
    .bind(id, actor.id, vote, score)
    .run();
  return json({ status: "updated", actor_id: actor.id, vote, score });
}

async function addNote(request, id, db, actor) {
  if (!(await db.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first())) {
    return fail(404, "not_found", "honeymoon-period not found");
  }
  const input = await body(request);
  const text = input.body;
  if (typeof text !== "string" || text.trim().length < 1 || text.length > 4000) {
    throw new Error("body must be between 1 and 4000 characters");
  }
  const note = { id: crypto.randomUUID(), actor_id: actor.id, body: text.trim() };
  await db
    .prepare("INSERT INTO notes (id, honeymoon_period_id, actor_id, body) VALUES (?, ?, ?, ?)")
    .bind(note.id, id, actor.id, note.body)
    .run();
  return json({ status: "created", note }, 201);
}

async function updateItem(request, id, db) {
  if (!(await db.prepare("SELECT 1 FROM honeymoon_periods WHERE id = ?").bind(id).first())) {
    return fail(404, "not_found", "honeymoon-period not found");
  }
  const input = await body(request);
  const allowed = new Set(["title", "kind", "status", "metadata", "rank_boost"]);
  if (Object.keys(input).some((key) => !allowed.has(key)))
    throw new Error("body contains an unsupported field");
  const current = await db.prepare("SELECT * FROM honeymoon_periods WHERE id = ?").bind(id).first();
  const next = {
    title: input.title ?? current.title,
    kind: input.kind ?? current.kind,
    status: input.status ?? current.status,
    metadata_json:
      input.metadata === undefined ? current.metadata_json : JSON.stringify(input.metadata),
    rank_boost: input.rank_boost ?? current.rank_boost,
  };
  if (typeof next.title !== "string" || next.title.trim().length < 1 || next.title.length > 200) {
    throw new Error("title must be between 1 and 200 characters");
  }
  if (typeof next.kind !== "string" || next.kind.trim().length < 1 || next.kind.length > 50) {
    throw new Error("kind must be between 1 and 50 characters");
  }
  if (!new Set(["active", "planned", "completed", "declined"]).has(next.status)) {
    throw new Error("unsupported status");
  }
  if (typeof next.rank_boost !== "number" || next.rank_boost < -100 || next.rank_boost > 100) {
    throw new Error("rank_boost must be between -100 and 100");
  }
  if (
    input.metadata !== undefined &&
    (input.metadata === null ||
      Array.isArray(input.metadata) ||
      typeof input.metadata !== "object" ||
      new TextEncoder().encode(next.metadata_json).byteLength > 8192)
  ) {
    throw new Error("metadata must be a JSON object no larger than 8192 bytes");
  }
  await db
    .prepare(`UPDATE honeymoon_periods SET title = ?, kind = ?, status = ?,
    metadata_json = ?, rank_boost = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?`)
    .bind(next.title.trim(), next.kind.trim(), next.status, next.metadata_json, next.rank_boost, id)
    .run();
  return json({ status: "updated", id });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ status: "ok" });

    const actor = await actorFor(request, env.DB);
    if (!actor) return fail(401, "unauthorized", "valid bearer token required");
    if (!(await withinRateLimit(env.DB, actor))) {
      return fail(429, "rate_limited", "participant request limit exceeded; retry next minute");
    }

    try {
      if (request.method === "POST" && url.pathname === "/v1/captures") {
        return await createCapture(request, env.DB, actor);
      }
      if (request.method === "GET" && url.pathname === "/v1/honeymoon-periods") {
        return await listItems(request, env.DB);
      }
      const match = url.pathname.match(
        /^\/v1\/honeymoon-periods\/([^/]+)(?:\/(preference|notes))?$/,
      );
      if (match) {
        const [, id, child] = match;
        if (request.method === "GET" && !child) return await getItem(id, env.DB);
        if (request.method === "PATCH" && !child) return await updateItem(request, id, env.DB);
        if (request.method === "PUT" && child === "preference") {
          return await updatePreference(request, id, env.DB, actor);
        }
        if (request.method === "POST" && child === "notes")
          return await addNote(request, id, env.DB, actor);
      }
      return fail(404, "not_found", "route not found");
    } catch (error) {
      return fail(
        400,
        "invalid_request",
        error instanceof Error ? error.message : "invalid request",
      );
    }
  },
};
