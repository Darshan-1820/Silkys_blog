-- Silky's blog — posts table (Cloudflare D1 / SQLite).
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,
  title        TEXT    NOT NULL,
  section      TEXT    NOT NULL DEFAULT 'blog',   -- blog | diary | short_story | incident | reflection
  excerpt      TEXT    DEFAULT '',
  cover_url    TEXT,                              -- URL of the cover photo in R2
  body_html    TEXT    DEFAULT '',                -- rendered HTML from the TipTap editor
  song         TEXT    DEFAULT '',
  doodle       TEXT    DEFAULT 'star',
  featured     INTEGER NOT NULL DEFAULT 0,        -- 0/1
  status       TEXT    NOT NULL DEFAULT 'draft',  -- draft | published
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts(status, published_at DESC);
