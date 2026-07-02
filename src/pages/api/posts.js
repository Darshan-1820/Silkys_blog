import { guard } from '../../lib/auth.js';
import { createPost } from '../../lib/admin-db.js';

export const prerender = false;

// Create a post (draft or published).
export async function POST(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;

  const data = await ctx.request.json();
  if (!data.title || !data.title.trim()) {
    return Response.json({ error: 'a title is needed' }, { status: 400 });
  }
  const res = await createPost(ctx.locals.runtime.env.DB, data);
  return Response.json(res);
}
