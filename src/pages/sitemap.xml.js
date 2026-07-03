import { getAllPosts } from '../lib/posts.js';
import { baseUrl } from '../lib/seo.js';

export const prerender = false;

export async function GET(ctx) {
  const posts = await getAllPosts(ctx.locals.runtime.env.DB);
  const base = baseUrl(ctx);
  const urls = [
    { loc: `${base}/`, changefreq: 'daily', priority: '1.0' },
    ...posts.map((p) => ({
      loc: `${base}/blog/${p.slug}`,
      lastmod: String(p.updatedAt || p.date || '').slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
      .join('\n') +
    `\n</urlset>`;
  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=3600' },
  });
}
