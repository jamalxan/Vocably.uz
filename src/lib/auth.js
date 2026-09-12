import jwt from 'jsonwebtoken';

// TZ-vocably-v2.md BUG-030 (Sprint 5 "Ishonchlilik" §G1) — token hozircha
// `localStorage`da ham saqlanadi (client — AppContext.jsx), bu XSS bo'lsa
// o'g'irlanishi mumkin. To'liq tuzatish (localStorage'ni butunlay olib
// tashlash) ilova bo'ylab ~100 ta fetch chaqiruvini (har biri qo'lda
// `Authorization: Bearer ${token}` biriktiradi) qayta yozishni talab qiladi —
// bu sandboxda hech qanday tarmoq/brauzer orqali sinab bo'lmaydigan, katta va
// xavfli o'zgarish bo'lardi (login butunlay buzilib qolishi mumkin, sinovsiz).
// Shu sabab bosqichma-bosqich yondashuv: server endi HAR IKKALASINI qabul
// qiladi (avvalgidek Authorization header — o'zgarishsiz — VA endi shu
// yerdagi httpOnly cookie), va login/verify-code endi ikkalasini ham
// o'rnatadi. Bu mavjud client kodini SINDIRMAYDI (hech narsa o'zgarmadi —
// header hali ham ishlaydi) va cookie orqali xavfsizroq yo'lni tayyorlaydi;
// client'ni to'liq faqat-cookie'ga o'tkazish (localStorage'ni olib tashlash)
// alohida, brauzerda sinovdan o'tkaziladigan keyingi qadam.
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
