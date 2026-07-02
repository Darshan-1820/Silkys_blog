-- Reader interaction: comments + like counts, keyed by a "target" string
-- (e.g. post:5, vent:8:<id>, book:3:<id>, photo:14:<id>, quote:9).
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  target     TEXT    NOT NULL,
  author     TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  hidden     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target, created_at);

CREATE TABLE IF NOT EXISTS likes (
  target TEXT    PRIMARY KEY,
  count  INTEGER NOT NULL DEFAULT 0
);
