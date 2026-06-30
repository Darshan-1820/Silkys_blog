// @ts-check
import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'STORYBLOK');

// Static build (great for SEO + free Cloudflare Pages hosting).
// Storyblok content is fetched at build time, then re-deployed via a publish webhook.
export default defineConfig({
  // site: 'https://your-domain.com', // set once the domain is bought (used for SEO/sitemap)
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      apiOptions: { region: 'eu' }, // space is on the EU region
      components: {
        // Storyblok component name -> Astro component path (filled in as we build the model)
      },
    }),
  ],
});
