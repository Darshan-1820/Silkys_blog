// One-off: port the existing self-contained index.html into an Astro page.
// Keeps CSS + JS verbatim by marking them is:inline (no Astro processing/scoping).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

let html = readFileSync('index.html', 'utf8');

// Preserve hand-tuned global CSS and global-scope JS exactly as-is.
html = html.replace('<style>', '<style is:inline>');
html = html.replace('<script>', '<script is:inline>');

// Astro pages render a full document fine. Empty frontmatter fence keeps intent explicit.
const out = `---\n// Homepage — ported 1:1 from the original prototype. Will be componentized next.\n---\n${html}`;

mkdirSync('src/pages', { recursive: true });
writeFileSync('src/pages/index.astro', out, 'utf8');
console.log('Wrote src/pages/index.astro (' + out.length + ' bytes)');
