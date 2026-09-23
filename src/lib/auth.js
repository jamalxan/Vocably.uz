import jwt from 'jsonwebtoken';

// TZ-vocably-v2.md BUG-030 / AUTH_MIGRATION_MAP.md (2026-09-17) — MIGRATSIYA
// TUGALLANDI: hech qanday client kodi endi tokenni `localStorage`da
// saqlamaydi yoki `Authorization` header sifatida qo'lda biriktirmaydi —
// barcha ~90 fetch chaqiruvi (AppContext, AdminContext, exam-engine,
// chat-friends, admin panel) httpOnly `vocably_session` cookie'ga tayanadi
// (brauzer buni same-origin so'rovga o'zi qo'shadi). `Authorization` header
// tekshiruvi shu funksiyada ATAYLAB saqlab qolingan — faqat orqaga
// moslik/kelajakdagi boshqa client (masalan mobil ilova) uchun zaxira yo'l,
// hech qanday joriy kod uni endi yubormaydi.
const AUTH_COOKIE_NAME = 'vocably_session';

/** So'rov headerlaridagi "Authorization: Bearer <token>" DAN, topilmasa
 * httpOnly cookie'dan foydalanuvchi ID sini oladi. Ikkalasi ham yo'q yoki
 * noto'g'ri bo'lsa null qaytaradi. */
export function getUserIdFromRequest(req) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET sozlanmagan.");
  }

  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader ? authHeader.split(' ')[1] : null;
  const cookieToken = req.cookies?.get?.(AUTH_COOKIE_NAME)?.value;
  const token = headerToken || cookieToken;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // socket-ticket (src/app/api/chat/socket-ticket/route.js) — 60s, faqat
    // realtime-server handshake uchun. Shu yerda rad etiladi, shunda uni
    // Authorization header sifatida oddiy API'larga yuborish ishlamaydi.
    if (decoded.scope === 'realtime') return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

/** Login/verify-code javobiga httpOnly+Secure+SameSite=Lax cookie qo'shadi.
 * `SameSite=Lax` cross-site POST/PUT/DELETE so'rovlarida cookie'ni
 * yubormaydi — bu CSRF'ning eng xavfli holatini (state-changing so'rovlar)
 * alohida CSRF-token sxemasisiz ham to'sadi (zamonaviy brauzerlar). */
export function setAuthCookie(res, token) {
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 kun — jwt.sign expiresIn bilan bir xil
  });
  return res;
}

export function clearAuthCookie(res) {
  res.cookies.set(AUTH_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
