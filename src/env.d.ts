/// <reference types="astro/client" />

// Cloudflare bindings available on every SSR request as Astro.locals.runtime.env
type ENV = {
  DB: import('@cloudflare/workers-types').D1Database;
  MEDIA: import('@cloudflare/workers-types').R2Bucket;
  // secrets (set in Cloudflare dashboard for prod, .dev.vars for local):
  SILKY_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<ENV>;

declare namespace App {
  interface Locals extends Runtime {}
}
