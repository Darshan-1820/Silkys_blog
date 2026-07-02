import { toggleLike } from '../../lib/interactions.js';

export const prerender = false;

// Like / unlike a target (public). The browser remembers what it liked (localStorage).
export async function POST(ctx) {
  const b = await ctx.request.json().catch(() => ({}));
  const target = (b.target || '').toString().slice(0, 120);
  if (!target) return Response.json({ error: 'no target' }, { status: 400 });
  const count = await toggleLike(ctx.locals.runtime.env.DB, target, b.dir < 0 ? -1 : 1);
  return Response.json({ count });
}
