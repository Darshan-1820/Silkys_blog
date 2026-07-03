// Client-side image shrink: resize huge photos + re-encode to WebP BEFORE upload.
// A multi-MB phone photo becomes ~100-300KB, so pages load fast and R2 stays lean.
// Leaves GIFs/SVGs untouched (animation / vector).
export async function compressImage(file, { maxDim = 1800, quality = 0.82 } = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close && bitmap.close();
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
    if (!blob) return file;
    // only swap in the compressed version if it's actually smaller (or we downscaled)
    if (blob.size >= file.size && scale === 1) return file;
    const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}
