import { getCounts } from '../../lib/interactions.js';

export const prerender = false;

// Batch like + comment counts for all targets on a page (public).
export async function POST(ctx) {
  const b = await ctx.request.json().catch(() => ({}));
  const targets = Array.isArray(b.targets) ? b.targets.slice(0, 200) : [];
  const counts = await getCounts(ctx.locals.runtime.env.DB, targets);
  return Response.json({ counts });
}
