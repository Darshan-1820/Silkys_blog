import { baseUrl } from '../lib/seo.js';

export const prerender = false;

export async function GET(ctx) {
  const base = baseUrl(ctx);
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  });
}
