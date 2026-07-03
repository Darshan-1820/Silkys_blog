# Launching a new client (the platform → a theme)

This repo is a **base editorial platform**. Everything client-specific lives in one
place, so a new client is a *config edit + deploy*, not a rewrite.

## 1. Reskin — edit `src/config/site.config.js`
One file controls the whole identity:

- **brand** — name, mark, tagline, description, author, footer line, credit, year
- **colors** — `day` + `night` palettes (`pink` = primary accent, `blue` = secondary)
- **fonts** — the five font tokens + the Google Fonts URL
- **nav** — the header menu items
- **features** — toggle `nightMode`, `fireflies`, `newsletter`

`global.css` holds **structure only**; `ThemeVars.astro` injects the colors + fonts
from the config as CSS variables, so changing the config re-themes the whole site
(public **and** admin) with no code changes.

Example — a warmer, serif reskin:
```js
brand: { name: 'ember', mark: '✦', tagline: 'a slow journal', author: 'Maya', ... },
colors: {
  day:   { paper:'#FBF7F0', ink:'#241a15', inkSoft:'#6b5d54', pink:'#C8492B', pinkDeep:'#9c3620',
           blue:'#2F6F5E', blueDeep:'#1f4d41', card:'#ffffff', tape:'rgba(200,120,60,.35)' },
  night: { paper:'#1b1613', ink:'#efe7dd', ... },
},
fonts: { marker:'"Fraunces", serif', body:'"Work Sans", sans-serif', googleUrl:'…', ... },
```

## 2. Swap the share image
Replace `public/og-default.png` (1200×630) with the client's branded card.

## 3. Provision their backend (per client — isolated, free tier)
```
npx wrangler d1 create <client>-blog          # then paste database_id into wrangler.toml
npx wrangler r2 bucket create <client>-media
npx wrangler d1 execute <client>-blog --file=./db/schema.sql        # tables
npx wrangler d1 execute <client>-blog --file=./db/seed-sections.sql # default homepage
```

## 4. Set secrets
```
node tools/hash-password.mjs "their-password"   # -> SILKY_PASSWORD_HASH
npx wrangler pages secret put SILKY_PASSWORD_HASH
npx wrangler pages secret put SESSION_SECRET     # a long random string
```

## 5. Deploy + domain
`wrangler pages deploy dist` (or connect the Git repo in the Cloudflare dashboard),
then set `site` in `astro.config.mjs` to their domain (for canonical/OG/sitemap).

---
**What stays the same across every client:** auth, admin, the block editor, sections,
SEO, comments/likes, image pipeline, deploy flow. **What changes:** the config + content.
