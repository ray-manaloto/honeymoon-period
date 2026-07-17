-- Obvious local smoke-test credentials. This file is never applied by migrations
-- and must never be used to bootstrap a deployed database.
INSERT INTO actors (id, display_name, token_digest) VALUES
  ('actor-a', 'Participant A', '26d76b2b0027aca73507f6904bbd1e1736016612a3cba49ef7b36edbfa75e448'),
  ('actor-b', 'Participant B', '0783c205225b2e9b8be6bbded0dcbd3a83ff60aa0e52a680386765d6a4a474b1');
