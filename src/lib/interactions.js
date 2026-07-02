// Comments + likes, keyed by a "target" string.

export async function addComment(db, { target, author, body }) {
  const now = new Date().toISOString();
  const res = await db
    .prepare('INSERT INTO comments (target,author,body,created_at) VALUES (?1,?2,?3,?4)')
    .bind(target, author, body, now)
    .run();
  return { id: res.meta.last_row_id, author, body, created_at: now };
}

export async function getComments(db, target) {
  const { results } = await db
    .prepare('SELECT id, author, body, created_at FROM comments WHERE target = ?1 AND hidden = 0 ORDER BY created_at ASC')
    .bind(target)
    .all();
  return results || [];
}

export async function deleteComment(db, id) {
  await db.prepare('DELETE FROM comments WHERE id = ?1').bind(id).run();
}

// Admin moderation list (newest first).
export async function listComments(db) {
  const { results } = await db
    .prepare('SELECT id, target, author, body, created_at FROM comments ORDER BY created_at DESC LIMIT 500')
    .all();
  return results || [];
}

// Toggle a like up (+1) or down (-1); returns the new count (never below 0).
export async function toggleLike(db, target, dir) {
  const d = dir < 0 ? -1 : 1;
  await db
    .prepare('INSERT INTO likes (target, count) VALUES (?1, MAX(0, ?2)) ON CONFLICT(target) DO UPDATE SET count = MAX(0, count + ?2)')
    .bind(target, d)
    .run();
  const row = await db.prepare('SELECT count FROM likes WHERE target = ?1').bind(target).first();
  return row ? row.count : 0;
}

// Batch counts for a list of targets -> { target: { likes, comments } }
export async function getCounts(db, targets) {
  const out = {};
  const uniq = [...new Set(targets)].filter(Boolean);
  for (const t of uniq) out[t] = { likes: 0, comments: 0 };
  if (!uniq.length) return out;
  const ph = uniq.map((_, i) => `?${i + 1}`).join(',');
  const likeRows = (await db.prepare(`SELECT target, count FROM likes WHERE target IN (${ph})`).bind(...uniq).all()).results || [];
  const cmtRows = (await db.prepare(`SELECT target, COUNT(*) AS n FROM comments WHERE hidden = 0 AND target IN (${ph}) GROUP BY target`).bind(...uniq).all()).results || [];
  for (const r of likeRows) out[r.target].likes = r.count;
  for (const r of cmtRows) out[r.target].comments = r.n;
  return out;
}
