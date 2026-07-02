// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// SSR on Cloudflare: the public blog renders on the edge reading from D1,
// and /admin (Silky's editor) is fully dynamic. Publishing is instant — no rebuild.
export default defineConfig({
  // site: 'https://your-domain.com', // set once the domain is bought (used for SEO/sitemap)
  output: 'server',
  // Hide the dev-only toolbar (the pill at the bottom of the screen). Never shows on the live site anyway.
  devToolbar: { enabled: false },
  adapter: cloudflare({
    // Lets `astro dev` talk to a LOCAL D1 + R2 (from wrangler.toml) so we can
    // build and test the whole CMS offline before deploying.
    platformProxy: { enabled: true },
  }),
});
