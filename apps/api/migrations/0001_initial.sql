PRAGMA foreign_keys = ON;

CREATE TABLE actors (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  token_digest TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE honeymoon_periods (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'planned', 'completed', 'declined')),
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'unknown',
  normalized_url TEXT NOT NULL UNIQUE,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  metadata_updated_by_actor_id TEXT REFERENCES actors(id),
  rank_boost REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE captures (
  id TEXT PRIMARY KEY,
  honeymoon_period_id TEXT NOT NULL REFERENCES honeymoon_periods(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES actors(id),
  source_url TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  enrichment_status TEXT NOT NULL DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'complete', 'failed')),
  captured_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(actor_id, client_request_id)
);
CREATE TABLE preferences (
  honeymoon_period_id TEXT NOT NULL REFERENCES honeymoon_periods(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES actors(id),
  vote TEXT CHECK (vote IN ('interested', 'maybe', 'decline') OR vote IS NULL),
  score REAL CHECK (score BETWEEN 0 AND 5 OR score IS NULL),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (honeymoon_period_id, actor_id)
);
CREATE TABLE preference_change_requests (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id),
  client_request_id TEXT NOT NULL,
  honeymoon_period_id TEXT NOT NULL REFERENCES honeymoon_periods(id),
  payload_fingerprint TEXT NOT NULL,
  UNIQUE (actor_id, client_request_id)
);
CREATE TABLE preference_events (
  sequence INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  request_id TEXT NOT NULL UNIQUE REFERENCES preference_change_requests(id),
  honeymoon_period_id TEXT NOT NULL REFERENCES honeymoon_periods(id),
  actor_id TEXT NOT NULL REFERENCES actors(id),
  event_type TEXT NOT NULL CHECK (event_type = 'PreferenceChanged'),
  before_vote TEXT CHECK (before_vote IN ('interested', 'maybe', 'decline') OR before_vote IS NULL),
  after_vote TEXT CHECK (after_vote IN ('interested', 'maybe', 'decline') OR after_vote IS NULL),
  before_score REAL CHECK (before_score BETWEEN 0 AND 5 OR before_score IS NULL),
  after_score REAL CHECK (after_score BETWEEN 0 AND 5 OR after_score IS NULL),
  reason TEXT,
  accepted_at TEXT NOT NULL
);
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  honeymoon_period_id TEXT NOT NULL REFERENCES honeymoon_periods(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES actors(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE rate_limits (
  actor_id TEXT PRIMARY KEY REFERENCES actors(id) ON DELETE CASCADE,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL
);
CREATE INDEX captures_honeymoon_period_idx ON captures(honeymoon_period_id, captured_at);
CREATE INDEX notes_honeymoon_period_idx ON notes(honeymoon_period_id, created_at);
CREATE INDEX preference_events_period_sequence_idx
  ON preference_events(honeymoon_period_id, sequence);
CREATE INDEX honeymoon_periods_status_idx ON honeymoon_periods(status, updated_at);
