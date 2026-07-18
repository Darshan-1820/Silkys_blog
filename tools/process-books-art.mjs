// Books painting is wider than a center-square crop allows: cut the subject
// out (with a paper margin) and composite it onto a paper patch from the same
// image, using a feathered alpha mask so no seam shows.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const SRC = 'C:/Users/addar/Downloads/Gemini_Generated_Image_yllbipyllbipyllb.png';
const OUT = fileURLToPath(new URL('../public/about/books.webp', import.meta.url));

const srcMeta = await sharp(SRC).metadata(); // 2816x1536

// 1. find the subject bounding box via trim offsets
const { info } = await sharp(SRC).trim({ threshold: 32 }).toBuffer({ resolveWithObject: true });
const bbox = { left: -info.trimOffsetLeft, top: -info.trimOffsetTop, width: info.width, height: info.height };
console.log('subject bbox:', bbox);

// 2. re-extract with a paper margin around the subject
const M = 90;
const ex = {
  left: Math.max(0, bbox.left - M),
  top: Math.max(0, bbox.top - M),
};
ex.width = Math.min(srcMeta.width - ex.left, bbox.width + 2 * M);
ex.height = Math.min(srcMeta.height - ex.top, bbox.height + 2 * M);

const fgBuf = await sharp(SRC).extract(ex).resize(600, 600, { fit: 'inside' }).toBuffer();
const fgMeta = await sharp(fgBuf).metadata();

// 3. feathered mask: white rounded rect inset from the edge, blurred
const inset = 26;
const maskSvg = `<svg width="${fgMeta.width}" height="${fgMeta.height}">
  <rect x="${inset}" y="${inset}" width="${fgMeta.width - 2 * inset}" height="${fgMeta.height - 2 * inset}" rx="30" fill="white"/>
</svg>`;
const mask = await sharp(Buffer.from(maskSvg)).blur(10).greyscale().toBuffer();
const fgFeathered = await sharp(fgBuf).removeAlpha().joinChannel(mask).png().toBuffer();

// 4. paper base sampled from the clean top-right corner, subject centered on it
const base = await sharp(SRC)
  .extract({ left: srcMeta.width - 560, top: 30, width: 520, height: 520 })
  .resize(640, 640)
  .toBuffer();

await sharp(base)
  .composite([{
    input: fgFeathered,
    left: Math.round((640 - fgMeta.width) / 2),
    top: Math.round((640 - fgMeta.height) / 2),
  }])
  .webp({ quality: 82 })
  .toFile(OUT);

console.log('books →', OUT);
