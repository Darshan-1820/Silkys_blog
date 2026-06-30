import { useStoryblokApi, renderRichText } from '@storyblok/astro';

// Section value -> label shown on stickers/cards
const CATEGORY_LABEL = {
  blog: 'blog',
  diary: 'digital diary',
  short_story: 'short story',
  incident: 'incident',
  reflection: 'reflection',
};

// Count words in a Storyblok richtext doc (for auto read-time)
function countWords(node) {
  if (!node) return 0;
  if (typeof node.text === 'string') return node.text.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(node.content)) return node.content.reduce((n, c) => n + countWords(c), 0);
  return 0;
}

function toPost(story) {
  const c = story.content || {};
  const words = countWords(c.body);
  return {
    slug: story.slug,
    fullSlug: story.full_slug,
    title: c.title || story.name,
    excerpt: c.excerpt || '',
    category: c.category || 'blog',
    categoryLabel: CATEGORY_LABEL[c.category] || c.category || 'blog',
    doodle: c.doodle || 'star',
    song: c.song || '',
    featured: !!c.featured,
    cover: c.cover && c.cover.filename ? c.cover : null,
    date: c.date || story.first_published_at || story.created_at,
    bodyHtml: c.body ? renderRichText(c.body) : '',
    readTime: Math.max(1, Math.round(words / 200)),
    editable: c, // carries Storyblok's _editable marker for click-to-edit in the Visual Editor
  };
}

// During build we read drafts (preview token). At deploy we switch to published.
const VERSION = 'draft';

export async function getAllPosts() {
  const sb = useStoryblokApi();
  const { data } = await sb.get('cdn/stories', {
    version: VERSION,
    content_type: 'post',
    per_page: 100,
    sort_by: 'content.date:desc',
  });
  return (data.stories || []).map(toPost);
}
