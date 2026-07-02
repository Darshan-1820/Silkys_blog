-- Silky's composable homepage: each row is a section she controls.
CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT    NOT NULL,                    -- featured | story_wall | books | music | gallery | text
  heading     TEXT    DEFAULT '',
  subhead     TEXT    DEFAULT '',
  design      TEXT    DEFAULT '',                  -- variant within a type (e.g. gallery: polaroid | strip)
  data        TEXT    NOT NULL DEFAULT '{}',       -- JSON payload (items, song, lyrics, playlist, …)
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'published',-- draft | published
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(status, sort_order);
