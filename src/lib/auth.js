import jwt from 'jsonwebtoken';
// Side-effect: Request.json() natijasini NoSQL operator inyeksiyasidan tozalaydi (src/lib/safeRequest.js).
// auth.js deyarli har bir himoyalangan API yo'li tomonidan import qilinadi.
import './safeRequest';
import { connectToDatabase } from './db';
import { User } from './models';

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

// Token bekor qilish: `User.tokensValidAfter` (parol tiklash / "hamma qurilmadan chiqish") dan oldin berilgan tokenlar rad etiladi.
// Har so'rovga DB yuki qo'shilmasligi uchun natija jarayon xotirasida 30 s keshlanadi (bekor qilish ko'pi bilan 30 s kechikadi).
const REVOCATION_CACHE_MS = 30_000;
const REVOCATION_CACHE_MAX = 5000;
const validAfterCache = new Map(); // userId -> { at, sec }

async function tokensValidAfterSec(userId) {
  const hit = validAfterCache.get(userId);
  if (hit && Date.now() - hit.at < REVOCATION_CACHE_MS) return hit.sec;
  try {
    await connectToDatabase();
    const u = await User.findById(userId).select('tokensValidAfter').lean();
    const sec = u?.tokensValidAfter ? Math.floor(new Date(u.tokensValidAfter).getTime() / 1000) : 0;
    if (validAfterCache.size >= REVOCATION_CACHE_MAX) validAfterCache.clear();
    validAfterCache.set(userId, { at: Date.now(), sec });
    return sec;
  } catch (err) {
    // DB uzilishida sessiyani o'ldirmaymiz (klient 401'da chiqib ketadi) — keyingi DB so'rovi baribir xato beradi.
    console.error('[auth] tokensValidAfter o\'qilmadi', err?.message);
    return 0;
  }
}

/** Foydalanuvchining barcha oldingi tokenlarini bekor qiladi (parol tiklash, "hamma qurilmadan chiqish"). */
export async function revokeUserSessions(userId, now = new Date()) {
  await connectToDatabase();
  await User.updateOne({ _id: userId }, { $set: { tokensValidAfter: now } });
  validAfterCache.delete(String(userId));
}

/** So'rov headerlaridagi "Authorization: Bearer <token>" DAN, topilmasa
 * httpOnly cookie'dan foydalanuvchi ID sini oladi. Ikkalasi ham yo'q yoki
 * noto'g'ri/bekor qilingan bo'lsa null qaytaradi. */
export async function getUserIdFromRequest(req) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET sozlanmagan.");
  }

  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader ? authHeader.split(' ')[1] : null;
  const cookieToken = req.cookies?.get?.(AUTH_COOKIE_NAME)?.value;
  const token = headerToken || cookieToken;
  if (!token) return null;

  try {
    // `algorithms` aniq cheklanadi (alg-confusion/"none" hujumlariga qarshi); sign() ham HS256 (standart).
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    // socket-ticket (src/app/api/chat/socket-ticket/route.js) — 60s, faqat
    // realtime-server handshake uchun. Shu yerda rad etiladi, shunda uni
    // Authorization header sifatida oddiy API'larga yuborish ishlamaydi.
    if (decoded.scope === 'realtime') return null;
    if (!decoded.userId) return null;
    // `iat` soniyalarda — qat'iy "<" (parol tiklangan soniyada berilgan yangi token o'tadi).
    if (typeof decoded.iat === 'number' && decoded.iat < (await tokensValidAfterSec(String(decoded.userId)))) return null;
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
