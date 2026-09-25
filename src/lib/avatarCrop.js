// Profil rasmini dumaloq kesish (AvatarCropper.jsx) matematikasi — Telegram
// muharririga o'xshash: rasm kvadrat "oyna"ni doim TO'LIQ qoplaydi (bo'sh joy
// qolmaydi), foydalanuvchi uni suradi, kattalashtiradi va 90° buradi.
//
// Koordinatalar: `offset` — rasm markazining oyna markazidan siljishi (ekran
// pikselida), `zoom` — 1 (minimal, "cover") dan MAX_ZOOM gacha.
// Sof funksiyalar (DOM'siz) — avatarCrop.test.js bevosita tekshiradi.

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

export function rotatedSize(width, height, rotation) {
  const quarter = ((rotation % 360) + 360) % 360;
  return quarter === 90 || quarter === 270 ? { w: height, h: width } : { w: width, h: height };
}

// Oynani to'liq qoplash uchun kerakli minimal masshtab.
export function coverScale(width, height, rotation, viewport) {
  const { w, h } = rotatedSize(width, height, rotation);
  return viewport / Math.min(w, h);
}

export function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number.isFinite(zoom) ? zoom : MIN_ZOOM));
}

// Rasm chetlari oyna ichiga kirib qolmasligi uchun siljishni cheklaydi.
export function clampOffset(offset, { width, height, rotation, zoom, viewport }) {
  const { w, h } = rotatedSize(width, height, rotation);
  const scale = coverScale(width, height, rotation, viewport) * zoom;
  const maxX = Math.max(0, (w * scale - viewport) / 2);
  const maxY = Math.max(0, (h * scale - viewport) / 2);
  // `+ 0` — `-0`ni oddiy 0 ga aylantiradi (maxX=0 bo'lganda Math.max(-0, ...) -0 beradi).
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)) + 0,
    y: Math.min(maxY, Math.max(-maxY, offset.y)) + 0,
  };
}

// Kursor/pinch markazi atrofida zoom qilganda o'sha nuqta joyida qolishi uchun
// (Telegram/iOS xatti-harakati) — yangi siljishni hisoblaydi. `anchor` — oyna
// markaziga nisbatan nuqta.
export function zoomAround(offset, anchor, prevZoom, nextZoom) {
  const k = nextZoom / prevZoom;
  return { x: anchor.x - (anchor.x - offset.x) * k, y: anchor.y - (anchor.y - offset.y) * k };
}

// Kesilgan kvadratni `size`x`size` canvas'ga chizib JPEG Blob qaytaradi.
// Brauzer rasmni <img> orqali yuklaganda EXIF orientatsiyasini allaqachon
// qo'llaydi (image-orientation: from-image — zamonaviy brauzerlarda standart).
export function renderCrop(image, { rotation, zoom, offset, viewport }, size, quality = 0.9) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  // JPEG'da shaffoflik yo'q — PNG'ning shaffof joylari qora bo'lib qolmasin.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const k = size / viewport;
  const scale = coverScale(width, height, rotation, viewport) * zoom * k;
  ctx.translate(size / 2 + offset.x * k, size / 2 + offset.y * k);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -width / 2, -height / 2);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob'))), 'image/jpeg', quality);
  });
}

// Juda katta rasmni (masalan 48MP telefon kamerasi) bir necha bosqichda
// kichraytirish sifatliroq natija beradi — lekin 640px chiqish uchun bitta
// "high" sifatli drawImage yetarli, shuning uchun alohida bosqich qilinmaydi.
