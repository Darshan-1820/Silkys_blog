import { getComments, addComment } from '../../lib/interactions.js';

export const prerender = false;

// List comments for a target (public).
export async function GET(ctx) {
  const target = ctx.url.searchParams.get('target');
  if (!target) return Response.json({ error: 'no target' }, { status: 400 });
  const comments = await getComments(ctx.locals.runtime.env.DB, target);
  return Response.json({ comments });
}

// Post a comment (public). Shows instantly; Silky can delete from moderation.
export async function POST(ctx) {
  const b = await ctx.request.json().catch(() => ({}));
  // honeypot: real people leave this empty; bots fill it. Pretend success, drop it.
  if (b.hp) return Response.json({ ok: true, dropped: true });

  const target = (b.target || '').toString().slice(0, 120);
  const author = (b.author || '').toString().trim().slice(0, 60);
  const body = (b.body || '').toString().trim().slice(0, 2000);
  if (!target || !author || !body) return Response.json({ error: 'name and comment are needed' }, { status: 400 });

  const comment = await addComment(ctx.locals.runtime.env.DB, { target, author, body });
  return Response.json({ comment });
}
