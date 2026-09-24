// C-14 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.2/§9.3 H) — oddiy, TO'LIQ BO'LMAGAN
// magic-byte tekshiruvi: fayl kengaytmasi/MIME turi "image" deb da'vo qilingan bo'lsa
// ham, haqiqiy fayl boshi (birinchi baytlari) mashhur rasm formatlaridan biriga mos
// kelishini tasdiqlaydi. Faqat eng ko'p uchraydigan formatlar (JPEG/PNG/GIF/WEBP/BMP)
// — barcha mumkin bo'lgan rasm formatini emas, faqat bu ilovada yuklashga ruxsat
// berilgan asosiylarini qamrab oladi (ataylab sodda, "exhaustive" emas).
// Pure funksiya — DB/tarmoq/fayl tizimiga bog'liq emas, shuning uchun bevosita
// unit test qilinadi (imageMagicBytes.test.js).
export function isValidImageMagicBytes(input) {
  if (!input) return false;
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 4) return false;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= PNG.length && PNG.every((b, i) => bytes[i] === b)) return true;

  // GIF: "GIF8" (GIF87a yoki GIF89a)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;

  // BMP: "BM"
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return true;

  // WEBP: "RIFF"....."WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}
