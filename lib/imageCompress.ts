'use client';

// Client-side image compression. Phones save 3–6 MB JPEG/HEIC photos.
// We resize only if the image is genuinely huge (max edge > 3200 px,
// roughly anything bigger than a 12 MP shot's long side) and re-encode
// JPEG at 0.92 — visually near-lossless. Smaller photos pass through
// untouched so we never down-rez originals.

const MAX_EDGE_DEFAULT = 3200;
const QUALITY_DEFAULT = 0.92;

export interface CompressedImage {
  /** data: URL ready to drop into the JSON payload */
  base64: string;
  /** approximate post-compression byte size (used for the progress bar) */
  bytes: number;
  /** mime type after compression */
  mime: string;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Resize/compress an image. Falls back to the original encoding if the
 * browser can't decode the file (some HEIC variants on non-Safari).
 */
export async function compressImage(
  file: File,
  maxEdge = MAX_EDGE_DEFAULT,
  quality = QUALITY_DEFAULT
): Promise<CompressedImage> {
  try {
    const img = await loadImage(file);
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (!w || !h) throw new Error('Empty image');
    if (Math.max(w, h) > maxEdge) {
      const scale = maxEdge / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = dataUrl.split(',')[1] ?? '';
    return {
      base64: dataUrl,
      bytes: Math.floor((base64.length * 3) / 4),
      mime: 'image/jpeg',
    };
  } catch {
    // Fallback: pass the original through unchanged.
    const dataUrl = await readDataUrl(file);
    const base64 = dataUrl.split(',')[1] ?? '';
    return {
      base64: dataUrl,
      bytes: Math.floor((base64.length * 3) / 4),
      mime: file.type || 'application/octet-stream',
    };
  }
}
