PRAGMA foreign_keys = ON;
DELETE FROM rate_limits;
DELETE FROM notes;
DELETE FROM preferences;
DELETE FROM captures;
DELETE FROM honeymoon_periods;
DELETE FROM actors;
INSERT INTO actors (id, display_name, token_digest, created_at) VALUES
  ('actor-a', 'Participant A', '26d76b2b0027aca73507f6904bbd1e1736016612a3cba49ef7b36edbfa75e448', '2026-01-01T00:00:00.000Z'),
  ('actor-b', 'Participant B', '0783c205225b2e9b8be6bbded0dcbd3a83ff60aa0e52a680386765d6a4a474b1', '2026-01-01T00:00:00.000Z');
INSERT INTO honeymoon_periods (id, title, kind, normalized_url, metadata_json, rank_boost, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-000000000101', 'Fixture Bistro', 'restaurant', 'https://example.com/fixture-bistro', '{"cuisine":"Fixture cuisine","address":"123 Example Street"}', 1, '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000102', 'Fixture Concert', 'event', 'https://example.com/fixture-concert', '{"special":"One night only","special_date":"2026-12-15"}', 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
