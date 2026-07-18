// One-off: crop Gemini paintings to a centered square, resize, save as WebP
// into public/about/. Usage: node tools/process-about-art.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DL = 'C:/Users/addar/Downloads';
const OUT = fileURLToPath(new URL('../public/about/', import.meta.url));

const art = [
  { file: 'Gemini_Generated_Image_q283xlq283xlq283.png', name: 'drinks' },
  { file: 'Gemini_Generated_Image_s6phf2s6phf2s6ph.png', name: 'camera' },
  { file: 'Gemini_Generated_Image_9plq9p9plq9p9plq.png', name: 'smokes' },
  { file: 'Gemini_Generated_Image_d4l1vbd4l1vbd4l1.png', name: 'coffee' },
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
