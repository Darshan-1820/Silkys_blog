import { guard } from '../../../lib/auth.js';
import { updateSection, deleteSection, moveSection, getSectionById } from '../../../lib/sections.js';

export const prerender = false;

export async function PUT(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;

  const id = Number(ctx.params.id);
  const existing = await getSectionById(ctx.locals.runtime.env.DB, id);
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  const d = await ctx.request.json();
  // statusOnly = a show/hide toggle: keep everything else exactly as it was.
  const merged = d.statusOnly
    ? { heading: existing.heading, subhead: existing.subhead, design: existing.design, data: existing.data, status: d.status }
    : { heading: d.heading, subhead: d.subhead, design: d.design, data: d.data, status: d.status };
  await updateSection(ctx.locals.runtime.env.DB, id, merged);
  return Response.json({ ok: true });
}

// Reorder up/down.
export async function POST(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;
  const { dir } = await ctx.request.json();
  await moveSection(ctx.locals.runtime.env.DB, Number(ctx.params.id), dir === 'up' ? 'up' : 'down');
  return Response.json({ ok: true });
}

export async function DELETE(ctx) {
  const denied = await guard(ctx, { api: true });
  if (denied) return denied;
  await deleteSection(ctx.locals.runtime.env.DB, Number(ctx.params.id));
  return Response.json({ ok: true });
}
