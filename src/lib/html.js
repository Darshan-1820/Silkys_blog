// Add lazy-loading + async decoding to any <img> in stored HTML that lacks it.
export function lazyImages(html) {
  return (html || '').replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"');
}
