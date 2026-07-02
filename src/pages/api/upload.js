import { guard } from '../../lib/auth.js';

export const prerender = false;

// Receives one image, stores it in R2, returns its public URL (/media/...).
export async function POST(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;

  const env = ctx.locals.runtime.env;
  const form = await ctx.request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'no file' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'images only' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ url: `/media/${key}` });
}
