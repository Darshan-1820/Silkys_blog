import { guard } from '../../../lib/auth.js';
import { deleteComment } from '../../../lib/interactions.js';

export const prerender = false;

// Delete a comment (Silky only).
export async function DELETE(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;
  await deleteComment(ctx.locals.runtime.env.DB, Number(ctx.params.id));
  return Response.json({ ok: true });
}
