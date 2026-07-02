import { guard } from '../../../lib/auth.js';
import { updatePost, deletePost } from '../../../lib/admin-db.js';

export const prerender = false;

export async function PUT(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;

  const id = Number(ctx.params.id);
  const data = await ctx.request.json();
  if (!data.title || !data.title.trim()) {
    return Response.json({ error: 'a title is needed' }, { status: 400 });
  }
  const res = await updatePost(ctx.locals.runtime.env.DB, id, data);
  if (!res) return Response.json({ error: 'not found' }, { status: 404 });
  return Response.json(res);
}

export async function DELETE(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;

  await deletePost(ctx.locals.runtime.env.DB, Number(ctx.params.id));
  return Response.json({ ok: true });
}
