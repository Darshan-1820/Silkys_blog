import { guard } from '../../lib/auth.js';
import { createSection } from '../../lib/sections.js';
import { blankSection, SECTION_TYPES } from '../../lib/section-types.js';

export const prerender = false;

// Create a new section of the given type (starts as a draft so the homepage
// doesn't change until Silky is ready).
export async function POST(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;

  const body = await ctx.request.json();
  const type = body.type;
  if (!SECTION_TYPES[type]) return Response.json({ error: 'unknown type' }, { status: 400 });

  // one section per kind: if it already exists, hand back that one instead of duplicating
  const dup = await ctx.locals.runtime.env.DB.prepare('SELECT id FROM sections WHERE type = ?1 LIMIT 1').bind(type).first();
  if (dup) return Response.json({ id: dup.id, existing: true });

  const blank = blankSection(type);
  const res = await createSection(ctx.locals.runtime.env.DB, { type, ...blank, status: 'draft' });
  return Response.json(res);
}
