import crypto from 'node:crypto';

/**
 * Sirlarni (token, imzo, OTP kodi) VAQT BO'YICHA YON KANALSIZ solishtiradi. `===`/`!==` birinchi farq qilgan belgida to'xtaydi —
 * javob vaqtidan sirni belgi-belgi taxmin qilish mumkin. Ikkala qiymat avval SHA-256 bilan bir xil uzunlikka keltiriladi
 * (`timingSafeEqual` turli uzunlikda xato beradi va uzunlikni oshkor qiladi), uzunlik tengligi alohida tekshiriladi.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ''), 'utf8');
  const y = Buffer.from(String(b ?? ''), 'utf8');
  const hx = crypto.createHash('sha256').update(x).digest();
  const hy = crypto.createHash('sha256').update(y).digest();
  return crypto.timingSafeEqual(hx, hy) && x.length === y.length;
}

/** `Authorization: Bearer <secret>` sarlavhasi `secret` ga tengmi (secret sozlanmagan bo'lsa HAR DOIM false — fail closed). */
export function bearerMatches(headerValue, secret) {
  if (!secret) return false;
  return safeEqual(headerValue || '', `Bearer ${secret}`);
}
