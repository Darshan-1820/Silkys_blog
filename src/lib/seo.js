// Site-wide SEO config + helpers. Absolute URLs resolve from `Astro.site`
// (set in astro.config once the domain is bought) or fall back to the request origin,
// so canonical/OG/sitemap all work locally now and in production later.

import { site } from '../config/site.config.js';

export const SITE = {
  name: site.brand.name,
  title: `${site.brand.name} — ${site.brand.tagline}`,
  description: site.brand.description,
  locale: site.seo.locale,
  author: site.brand.author,
  themeColor: site.seo.themeColor,
  defaultImage: site.seo.ogImage,
};

export function baseUrl(Astro) {
  if (Astro.site) return Astro.site.href.replace(/\/$/, '');
  return Astro.url.origin;
}

export function abs(Astro, path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return baseUrl(Astro) + (path.startsWith('/') ? path : '/' + path);
}

export function websiteLd(Astro) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: baseUrl(Astro) + '/',
    description: SITE.description,
  };
}

export function articleLd(Astro, post) {
  const url = abs(Astro, `/blog/${post.slug}`);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || SITE.description,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: { '@type': 'Person', name: SITE.author },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
  if (post.categoryLabel) ld.articleSection = post.categoryLabel;
  if (post.cover) ld.image = [abs(Astro, post.cover)];
  return ld;
}

export function breadcrumbLd(Astro, crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(Astro, c.path),
    })),
  };
}
