// @ts-check
import { defineConfig } from 'astro/config';

// Static build (great for SEO + free Cloudflare Pages hosting).
// Storyblok content is fetched at build time, then re-deployed via a publish webhook.
export default defineConfig({
  // site: 'https://your-domain.com', // set once the domain is bought (used for SEO/sitemap)
});
