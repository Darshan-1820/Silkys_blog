// Admin-side DB operations for posts (create / read / update / delete).

export function slugify(str) {
  return (
    (str || '')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  );
}

// Ensure the slug is unique (append -2, -3, ... if taken by a different post).
async function uniqueSlug(db, base, excludeId = null) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const row = await db.prepare('SELECT id FROM posts WHERE slug = ?1').bind(slug).first();
    if (!row || row.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function getPostById(db, id) {
  return db.prepare('SELECT * FROM posts WHERE id = ?1').bind(id).first();
}

// Only one post is "featured" at a time — clear the flag on the others.
async function clearOtherFeatured(db, keepId = null) {
  await db.prepare('UPDATE posts SET featured = 0 WHERE featured = 1 AND id IS NOT ?1').bind(keepId).run();
}

export async function createPost(db, d) {
  const slug = await uniqueSlug(db, slugify(d.slug || d.title));
  const now = new Date().toISOString();
  const publishedAt = d.status === 'published' ? now : null;
  const res = await db
    .prepare(
      `INSERT INTO posts (slug,title,section,excerpt,cover_url,body_html,song,song_url,doodle,featured,status,published_at,created_at,updated_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?13)`
    )
    .bind(
      slug, d.title || 'untitled', d.section || 'blog', d.excerpt || '',
      d.cover_url || null, d.body_html || '', d.song || '', d.song_url || null, d.doodle || 'star',
      d.featured ? 1 : 0, d.status === 'published' ? 'published' : 'draft', publishedAt, now
    )
    .run();
  const id = res.meta.last_row_id;
  if (d.featured) await clearOtherFeatured(db, id);
  return { id, slug };
}

export async function updatePost(db, id, d) {
  const existing = await getPostById(db, id);
  if (!existing) return null;
  const slug = await uniqueSlug(db, slugify(d.slug || d.title), id);
  const now = new Date().toISOString();
  // keep the original publish date; stamp it the first time it goes live
  const publishedAt = d.status === 'published' ? existing.published_at || now : existing.published_at;
  await db
    .prepare(
      `UPDATE posts SET slug=?1,title=?2,section=?3,excerpt=?4,cover_url=?5,body_html=?6,
        song=?7,song_url=?8,doodle=?9,featured=?10,status=?11,published_at=?12,updated_at=?13 WHERE id=?14`
    )
    .bind(
      slug, d.title || 'untitled', d.section || 'blog', d.excerpt || '',
      d.cover_url || null, d.body_html || '', d.song || '', d.song_url || null, d.doodle || 'star',
      d.featured ? 1 : 0, d.status === 'published' ? 'published' : 'draft', publishedAt, now, id
    )
    .run();
  if (d.featured) await clearOtherFeatured(db, id);
  return { id, slug };
}

export async function deletePost(db, id) {
  await db.prepare('DELETE FROM posts WHERE id = ?1').bind(id).run();
}
