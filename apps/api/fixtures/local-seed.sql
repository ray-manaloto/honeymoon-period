PRAGMA foreign_keys = ON;
DELETE FROM rate_limits;
DELETE FROM notes;
DELETE FROM preference_events;
DELETE FROM preference_change_requests;
DELETE FROM preferences;
DELETE FROM captures;
DELETE FROM honeymoon_periods;
DELETE FROM actors;
INSERT INTO actors (id, display_name, token_digest, created_at) VALUES
  ('actor-a', 'Participant A', '3c22d41a0f3a0de6ce4b4a41351bdcf7dedba531b80f0aa994c6a224c2a2d0c9', '2026-01-01T00:00:00.000Z'),
  ('actor-b', 'Participant B', '56b7725c3accbd63b596380e3e46d0ec345b1b5d3cdfb2e8294db1e4c6a22cd1', '2026-01-01T00:00:00.000Z');
INSERT INTO honeymoon_periods (id, title, kind, normalized_url, metadata_json, rank_boost, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-000000000101', 'Fixture Bistro', 'restaurant', 'https://example.com/fixture-bistro', '{"cuisine":"Fixture cuisine","address":"123 Example Street"}', 1, '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000102', 'Fixture Concert', 'event', 'https://example.com/fixture-concert', '{"special":"One night only","special_date":"2026-12-15"}', 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
