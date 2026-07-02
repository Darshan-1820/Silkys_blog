// Posts now live in Cloudflare D1 (our own database) — no third-party CMS.
// Every page passes in the D1 binding: `Astro.locals.runtime.env.DB`.

// Section value -> label shown on stickers/cards
const CATEGORY_LABEL = {
  blog: 'blog',
  diary: 'digital diary',
  short_story: 'short story',
  incident: 'incident',
  reflection: 'reflection',
};

// Rough word count from rendered HTML (for auto read-time)
function countWords(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// D1 row -> the shape every page/component already expects
function toPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    category: row.section || 'blog',
    categoryLabel: CATEGORY_LABEL[row.section] || row.section || 'blog',
    doodle: row.doodle || 'star',
    song: row.song || '',
    featured: !!row.featured,
    songUrl: row.song_url || '',
    cover: row.cover_url || null, // now a plain URL string (was a Storyblok object)
    date: row.published_at || row.created_at,
    bodyHtml: row.body_html || '',
    readTime: Math.max(1, Math.round(countWords(row.body_html) / 200)),
  };
}

// All published posts, newest first.
export async function getAllPosts(db) {
  const { results } = await db
    .prepare(
      "SELECT * FROM posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC"
    )
    .all();
  return (results || []).map(toPost);
}

// One published post by slug (null if missing / still a draft).
export async function getPostBySlug(db, slug) {
  const row = await db
    .prepare("SELECT * FROM posts WHERE slug = ?1 AND status = 'published'")
    .bind(slug)
    .first();
  return row ? toPost(row) : null;
}

// Admin: every post (drafts + published), newest activity first.
export async function getPostsForAdmin(db) {
  const { results } = await db
    .prepare('SELECT id, slug, title, section, status, featured, updated_at FROM posts ORDER BY updated_at DESC')
    .all();
  return results || [];
}
