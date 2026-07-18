// Garden background for /about: crop the painting's white paper border off,
// resize, save as WebP. Usage: node tools/process-garden-bg.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const SRC = 'C:/Users/addar/Downloads/Gemini_Generated_Image_67ulrj67ulrj67ul.png';
const OUT = fileURLToPath(new URL('../public/desk/garden.webp', import.meta.url));

const { width: W, height: H } = await sharp(SRC).metadata();
// inset past the irregular painted edge so the crop is full-bleed paint
const crop = {
  left: Math.round(W * 0.045),
  top: Math.round(H * 0.05),
  width: Math.round(W * 0.91),
  height: Math.round(H * 0.89),
};

await sharp(SRC).extract(crop).resize(2048).webp({ quality: 78 }).toFile(OUT);
const { size } = await sharp(OUT).metadata().then(() => import('node:fs/promises')).then(fs => fs.stat(OUT));
console.log('garden →', OUT, Math.round(size / 1024) + 'KB');
