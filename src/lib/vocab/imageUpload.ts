// Lug'at yozuvlari uchun rasm yuklash (Rasm↔So'z o'yinlari, TZ §9.11–9.12): faqat xavfsiz raster formatlar.
// Fayl turi kengaytma/Content-Type bo'yicha emas, BAYTLARning boshiga ("magic bytes") qarab aniqlanadi —
// aks holda "rasm.png" nomli HTML/SVG yuklanib, ilovadan XSS uchun ishlatilishi mumkin. SVG ataylab qo'llab-quvvatlanmaydi.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // Vercel so'rov chegarasi (~4.5 MB) dan past

export type ImageType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';

export function detectImageType(buf: Uint8Array): ImageType | null {
  const b = (i: number) => buf[i];
  if (buf.length >= 8 && b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 && b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a) return 'image/png';
  if (buf.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'image/jpeg';
  // WEBP: "RIFF" ???? "WEBP"
  if (buf.length >= 12 && b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50) return 'image/webp';
  // GIF87a / GIF89a
  if (buf.length >= 6 && b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x38 && (b(4) === 0x37 || b(4) === 0x39) && b(5) === 0x61) return 'image/gif';
  return null;
}

const EXT: Record<ImageType, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };

/** Saqlash nomi: foydalanuvchi bergan nomdan faqat xavfsiz asos, kengaytma esa aniqlangan turdan. */
export function safeImageFilename(original: string, type: ImageType): string {
  const base = String(original || 'image')
    .replace(/\.[^.]*$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `vocab-${base || 'image'}.${EXT[type]}`;
}
