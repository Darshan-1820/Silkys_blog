import { getAllPosts } from '../lib/posts.js';
import { baseUrl, SITE } from '../lib/seo.js';

export const prerender = false;

const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(ctx) {
  const posts = await getAllPosts(ctx.locals.runtime.env.DB);
  const base = baseUrl(ctx);
  const items = posts
    .map((p) => {
      let pub = '';
      try { pub = new Date(p.date).toUTCString(); } catch {}
      return `  <item>\n    <title>${esc(p.title)}</title>\n    <link>${base}/blog/${p.slug}</link>\n    <guid isPermaLink="true">${base}/blog/${p.slug}</guid>\n    ${pub ? `<pubDate>${pub}</pubDate>\n    ` : ''}<description>${esc(p.excerpt)}</description>\n  </item>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>${esc(SITE.name)}</title>\n  <link>${base}/</link>\n  <description>${esc(SITE.description)}</description>\n  <language>en-us</language>\n${items}\n</channel></rss>`;
  return new Response(body, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=3600' },
  });
}
