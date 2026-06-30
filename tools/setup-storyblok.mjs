// Creates Silky's blog content model in Storyblok via the Management API.
// Re-runnable: skips the "post" type if it already exists.
//
// Needs a Personal Access Token (Management API) — different from the read-only
// content token. Get it at: https://app.storyblok.com/#/me/account?tab=token
//
// Run:  STORYBLOK_MGMT_TOKEN=xxxxx node tools/setup-storyblok.mjs
//
// This same script is the reusable template for every future client space.

const MAPI = 'https://mapi.storyblok.com/v1';
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '293544690926590';
const TOKEN = process.env.STORYBLOK_MGMT_TOKEN;

if (!TOKEN) {
  console.error('Missing STORYBLOK_MGMT_TOKEN. Get a Personal Access Token at https://app.storyblok.com/#/me/account?tab=token');
  process.exit(1);
}

const headers = { Authorization: TOKEN, 'Content-Type': 'application/json' };

async function api(path, init = {}) {
  const res = await fetch(`${MAPI}/spaces/${SPACE_ID}${path}`, { ...init, headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

// ── The "Blog Post" content type Silky fills in ──
// category drives the sections; richtext "body" is the Google-Docs-like writing area
// (supports image upload + paste). Options are easy to edit later with Silky.
const postComponent = {
  name: 'post',
  display_name: 'Blog Post',
  is_root: true,
  is_nestable: false,
  schema: {
    title:    { type: 'text',     pos: 0, required: true, display_name: 'Title' },
    category: { type: 'option',   pos: 1, display_name: 'Section', default_value: 'blog', options: [
      { name: 'Blog',         value: 'blog' },
      { name: 'Digital Diary',value: 'diary' },
      { name: 'Short Story',  value: 'short_story' },
      { name: 'Incident',     value: 'incident' },
      { name: 'Reflection',   value: 'reflection' },
    ]},
    excerpt:  { type: 'textarea', pos: 2, display_name: 'Excerpt (card teaser line)' },
    cover:    { type: 'asset',    pos: 3, filetypes: ['images'], display_name: 'Cover image (optional)' },
    body:     { type: 'richtext', pos: 4, required: true, display_name: 'Story', tooltip: 'Write or paste here. Drag images straight in.' },
    song:     { type: 'text',     pos: 5, display_name: 'Scored to a song (optional)' },
    doodle:   { type: 'option',   pos: 6, display_name: 'Doodle thumbnail', default_value: 'star', options: [
      { name: 'Star', value: 'star' }, { name: 'Moon', value: 'moon' },
      { name: 'Eye', value: 'eye' },   { name: 'Heart', value: 'heart' },
      { name: 'Sun', value: 'sun' },
    ]},
    featured: { type: 'boolean',  pos: 7, display_name: 'Feature on homepage' },
    date:     { type: 'datetime', pos: 8, display_name: 'Publish date' },
  },
};

const { components } = await api('/components');
const existing = components.find((c) => c.name === 'post');

if (existing) {
  console.log('• "post" content type already exists (id ' + existing.id + ') — skipping.');
} else {
  const created = await api('/components', { method: 'POST', body: JSON.stringify({ component: postComponent }) });
  console.log('✓ Created "Blog Post" content type (id ' + created.component.id + ').');
}

// ── A sample post so we can build + verify the design against real content ──
const stories = await api('/stories?starts_with=blog/&per_page=1');
if (stories.stories && stories.stories.length) {
  console.log('• Sample post already present — skipping.');
} else {
  const sample = {
    story: {
      name: 'The Neighbour Who Knocked at 3am',
      slug: 'the-neighbour-who-knocked',
      parent_id: 0,
      content: {
        component: 'post',
        title: 'The Neighbour Who Knocked at 3am',
        category: 'incident',
        excerpt: "four years in that flat. I'd never seen a door on that wall before.",
        song: '',
        doodle: 'eye',
        featured: true,
        date: '2026-06-30 00:00',
        body: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Four years in that flat. I had memorised every sound it made at night — the fridge, the pipes, the upstairs couple who fought in whispers. And I had never, not once, seen a door on that wall before.' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'It was 3am when the knocking started.' }] },
          ],
        },
      },
    },
    publish: 1,
  };
  const made = await api('/stories', { method: 'POST', body: JSON.stringify(sample) });
  console.log('✓ Created + published sample post: blog/' + made.story.slug);
}

console.log('\nDone. Silky now has a "Blog Post" editor in Storyblok.');
