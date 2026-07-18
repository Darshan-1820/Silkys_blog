// One-off: crop Gemini paintings to a centered square, resize, save as WebP
// into public/about/. Usage: node tools/process-about-art.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DL = 'C:/Users/addar/Downloads';
const OUT = fileURLToPath(new URL('../public/about/', import.meta.url));

const art = [
  { file: 'Gemini_Generated_Image_tjt250tjt250tjt2.png', name: 'music' },
  { file: 'Gemini_Generated_Image_pkubcepkubcepkub.png', name: 'movies' },
  { file: 'Gemini_Generated_Image_kx0ko8kx0ko8kx0k.png', name: 'flowers' },
];

await mkdir(OUT, { recursive: true });

for (const { file, name } of art) {
  const src = sharp(`${DL}/${file}`);
  const { width, height } = await src.metadata(); // 2816x1536
  const side = height;
  const left = Math.round((width - side) / 2);
  const out = `${OUT}${name}.webp`;
  await src
    .extract({ left, top: 0, width: side, height: side })
    .resize(640, 640)
    .webp({ quality: 82 })
    .toFile(out);
  console.log(name, '→', out);
}
