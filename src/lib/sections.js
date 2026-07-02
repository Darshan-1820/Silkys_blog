// Data layer for Silky's composable homepage sections.

function parse(row) {
  let data = {};
  try { data = JSON.parse(row.data || '{}'); } catch { data = {}; }
  return {
    id: row.id, type: row.type, heading: row.heading || '', subhead: row.subhead || '',
    design: row.design || '', status: row.status, sort_order: row.sort_order, data,
  };
}

export async function getSections(db) {
  const { results } = await db
    .prepare("SELECT * FROM sections WHERE status = 'published' ORDER BY sort_order ASC, id ASC")
    .all();
  return (results || []).map(parse);
}

export async function getSectionsForAdmin(db) {
  const { results } = await db.prepare('SELECT * FROM sections ORDER BY sort_order ASC, id ASC').all();
  return (results || []).map(parse);
}

export async function getSectionById(db, id) {
  const row = await db.prepare('SELECT * FROM sections WHERE id = ?1').bind(id).first();
  return row ? parse(row) : null;
}

export async function createSection(db, d) {
  const max = await db.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM sections').first();
  const order = (max?.m || 0) + 10;
  const res = await db
    .prepare('INSERT INTO sections (type,heading,subhead,design,data,sort_order,status,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)')
    .bind(d.type, d.heading || '', d.subhead || '', d.design || '', JSON.stringify(d.data || {}), order, d.status || 'published', new Date().toISOString())
    .run();
  return { id: res.meta.last_row_id };
}

export async function updateSection(db, id, d) {
  await db
    .prepare('UPDATE sections SET heading=?1,subhead=?2,design=?3,data=?4,status=?5,updated_at=?6 WHERE id=?7')
    .bind(d.heading || '', d.subhead || '', d.design || '', JSON.stringify(d.data || {}), d.status || 'published', new Date().toISOString(), id)
    .run();
}

export async function deleteSection(db, id) {
  await db.prepare('DELETE FROM sections WHERE id = ?1').bind(id).run();
}

// Move a section up/down by swapping sort_order with its neighbour.
export async function moveSection(db, id, dir) {
  const cur = await db.prepare('SELECT id, sort_order FROM sections WHERE id = ?1').bind(id).first();
  if (!cur) return;
  const neighbor = dir === 'up'
    ? await db.prepare('SELECT id, sort_order FROM sections WHERE sort_order < ?1 ORDER BY sort_order DESC LIMIT 1').bind(cur.sort_order).first()
    : await db.prepare('SELECT id, sort_order FROM sections WHERE sort_order > ?1 ORDER BY sort_order ASC LIMIT 1').bind(cur.sort_order).first();
  if (!neighbor) return;
  await db.batch([
    db.prepare('UPDATE sections SET sort_order=?1 WHERE id=?2').bind(neighbor.sort_order, cur.id),
    db.prepare('UPDATE sections SET sort_order=?1 WHERE id=?2').bind(cur.sort_order, neighbor.id),
  ]);
}
