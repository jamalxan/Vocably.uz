// Photos are re-encoded in the browser before upload (Telegram "send as photo"): a 4000×3000
// 6 MB phone photo becomes ~400 KB at 2560 px / JPEG 0.85 — that is where most of the "slow
// sending" went. "Send as file" skips this and keeps the original bytes. GIFs are never touched
// (animation), PNG keeps PNG (transparency) unless it is huge.

export const IMAGE_COMPRESS = { maxEdge: 2560, quality: 0.85, skipBelowBytes: 300 * 1024, pngToJpegAboveBytes: 2 * 1024 * 1024 };

/** Pure decision: what to do with a picked image. */
export function planImage({ mimeType, size, width, height }, cfg = IMAGE_COMPRESS) {
  if (!mimeType?.startsWith('image/')) return { action: 'keep' };
  if (mimeType === 'image/gif' || mimeType === 'image/svg+xml') return { action: 'keep' };
  const longest = Math.max(width || 0, height || 0);
  const tooBig = longest > cfg.maxEdge;
  const heavy = size > cfg.skipBelowBytes;
  if (!tooBig && !heavy) return { action: 'keep' };
  const scale = tooBig ? cfg.maxEdge / longest : 1;
  const keepPng = mimeType === 'image/png' && size <= cfg.pngToJpegAboveBytes;
  return {
    action: 'encode',
    width: Math.max(1, Math.round((width || 0) * scale)),
    height: Math.max(1, Math.round((height || 0) * scale)),
    outType: keepPng ? 'image/png' : 'image/jpeg',
    quality: keepPng ? undefined : cfg.quality,
  };
}

function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

/**
 * Browser: returns `{ file, width, height }` — the re-encoded image when it pays off, otherwise the
 * original with its dimensions. Never throws: on any decoding problem the original is returned as is.
 */
export async function prepareImage(file, cfg = IMAGE_COMPRESS) {
  try {
    const bmp = await loadBitmap(file);
    const width = bmp.width || bmp.naturalWidth;
    const height = bmp.height || bmp.naturalHeight;
    const plan = planImage({ mimeType: file.type, size: file.size, width, height }, cfg);
    if (plan.action !== 'encode') {
      bmp.close?.();
      return { file, width, height };
    }
    const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(plan.width, plan.height) : Object.assign(document.createElement('canvas'), { width: plan.width, height: plan.height });
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0, plan.width, plan.height);
    bmp.close?.();
    const blob = canvas.convertToBlob
      ? await canvas.convertToBlob({ type: plan.outType, quality: plan.quality })
      : await new Promise((resolve) => canvas.toBlob(resolve, plan.outType, plan.quality));
    if (!blob || blob.size >= file.size) return { file, width, height };
    const name = file.name.replace(/\.[a-z0-9]+$/i, '') + (plan.outType === 'image/png' ? '.png' : '.jpg');
    return { file: new File([blob], name, { type: plan.outType }), width: plan.width, height: plan.height };
  } catch {
    return { file, width: null, height: null };
  }
}

/** Dimensions of a video file (for the bubble placeholder), null when unknown. Never throws. */
export function probeVideo(file) {
  return new Promise((resolve) => {
    try {
      const v = document.createElement('video');
      const url = URL.createObjectURL(file);
      const done = (r) => {
        URL.revokeObjectURL(url);
        resolve(r);
      };
      v.preload = 'metadata';
      v.onloadedmetadata = () => done({ width: v.videoWidth || null, height: v.videoHeight || null, durationSec: Number.isFinite(v.duration) ? v.duration : null });
      v.onerror = () => done({ width: null, height: null, durationSec: null });
      v.src = url;
    } catch {
      resolve({ width: null, height: null, durationSec: null });
    }
  });
}
