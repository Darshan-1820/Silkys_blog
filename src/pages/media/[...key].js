export const prerender = false;

// Serves uploaded images straight from R2. Public (images must show on the blog),
// long-cached, no third-party host.
export async function GET({ params, locals }) {
  try {
    const env = locals.runtime.env;
    const key = params.key;
    if (!key) return new Response('Not found', { status: 404 });

    const obj = await env.MEDIA.get(key);
    if (!obj) return new Response('Not found', { status: 404 });

    // NB: read contentType off httpMetadata (obj.writeHttpMetadata breaks under
    // miniflare's local proxy — DevalueError on the streaming call).
    const headers = new Headers();
    headers.set('content-type', obj.httpMetadata?.contentType || 'application/octet-stream');
    if (obj.httpEtag) headers.set('etag', obj.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    return new Response(obj.body, { headers });
  } catch {
    return new Response('media error', { status: 500 });
  }
}
