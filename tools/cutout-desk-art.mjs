// Cut painted objects off their cream paper background → transparent WebP
// for the /about desk scene. Flood-fills from the image border so cream
// areas INSIDE an object (labels, pages) stay opaque; the paint's own soft
// shadows survive with soft alpha, so objects still ground on the desk.
// Usage: node tools/cutout-desk-art.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DL = 'C:/Users/addar/Downloads';
const OUT = fileURLToPath(new URL('../public/desk/', import.meta.url));

const art = [
  { file: 'Gemini_Generated_Image_9plq9p9plq9p9plq.png', name: 'smokes' },
  { file: 'Gemini_Generated_Image_d4l1vbd4l1vbd4l1.png', name: 'coffee' },
  { file: 'Gemini_Generated_Image_tjt250tjt250tjt2.png', name: 'cassette' },
  { file: 'Gemini_Generated_Image_pkubcepkubcepkub.png', name: 'tickets' },
  { file: 'Gemini_Generated_Image_kx0ko8kx0ko8kx0k.png', name: 'flowers' },
  { file: 'Gemini_Generated_Image_yllbipyllbipyllb.png', name: 'books' },
];

const T_HI = 70;  // flood fill spreads while colour distance to paper < this
const T_LO = 20;  // below this → fully transparent; between → soft alpha

await mkdir(OUT, { recursive: true });

for (const { file, name } of art) {
  const { data, info } = await sharp(`${DL}/${file}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // paper colour = average of the four 24px corner patches
  let r = 0, g = 0, b = 0, n = 0;
  for (const [cx, cy] of [[0, 0], [W - 24, 0], [0, H - 24], [W - 24, H - 24]]) {
    for (let y = cy; y < cy + 24; y++) for (let x = cx; x < cx + 24; x++) {
      const i = (y * W + x) * 3; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  r /= n; g /= n; b /= n;

  const dist = (i) => Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b);

  // BFS flood fill from every border pixel
  const inBg = new Uint8Array(W * H);
  const queue = [];
  for (let x = 0; x < W; x++) { queue.push(x, (H - 1) * W + x); }
  for (let y = 0; y < H; y++) { queue.push(y * W, y * W + W - 1); }
  for (const p of queue) inBg[p] = 1;
  while (queue.length) {
    const p = queue.pop();
    const px = p % W, py = (p / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx;
      if (inBg[q] || dist(q * 3) >= T_HI) continue;
      inBg[q] = 1; queue.push(q);
    }
  }

  // RGBA with soft alpha in the background-connected region
  const rgba = Buffer.alloc(W * H * 4);
  const alpha = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) {
    const i = p * 3, o = p * 4;
    rgba[o] = data[i]; rgba[o + 1] = data[i + 1]; rgba[o + 2] = data[i + 2];
    let a = 255;
    if (inBg[p]) {
      const d = dist(i);
      a = Math.round(255 * Math.min(1, Math.max(0, (d - T_LO) / (T_HI - T_LO))));
      if (a < 26) a = 0;
    }
    alpha[p] = a;
  }

  // connected components on the alpha mask: drop speckle/vignette — anything
  // small or touching the image border. Keep only real object regions.
  const comp = new Int32Array(W * H).fill(-1);
  const keep = [];
  let nComp = 0;
  for (let s = 0; s < W * H; s++) {
    if (alpha[s] === 0 || comp[s] !== -1) continue;
    const id = nComp++;
    let area = 0, touches = false;
    const st = [s]; comp[s] = id;
    while (st.length) {
      const p = st.pop(); area++;
      const px = p % W, py = (p / W) | 0;
      if (px === 0 || py === 0 || px === W - 1 || py === H - 1) touches = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (alpha[q] === 0 || comp[q] !== -1) continue;
        comp[q] = id; st.push(q);
      }
    }
    keep[id] = !touches && area >= 3000;
  }

  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let p = 0; p < W * H; p++) {
    const a = (alpha[p] && keep[comp[p]]) ? alpha[p] : 0;
    rgba[p * 4 + 3] = a;
    if (a > 0) {
      const px = p % W, py = (p / W) | 0;
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
    }
  }

  const out = `${OUT}${name}.webp`;
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(out);
  console.log(name, `→ ${out} (bbox ${maxX - minX + 1}x${maxY - minY + 1})`);
}
