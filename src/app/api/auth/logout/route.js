import { clearAuthCookie, getUserIdFromRequest, revokeUserSessions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md BUG-030 (§G1) — httpOnly cookie client JS'dan o'chirilishi
// mumkin emas (shu sababning o'zi uni localStorage'dan xavfsizroq qiladi),
// shuning uchun uni tozalash uchun server endpointi kerak. AppContext.jsx'ning
// logout()i localStorage tozalashdan tashqari shu endpointni ham chaqiradi.
//
// `{ "allDevices": true }` — shu akkauntning BARCHA qurilmalardagi sessiyalarini bekor qiladi
// (`User.tokensValidAfter`, src/lib/auth.js): token o'g'irlangan/yo'qolgan telefon uchun.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.allDevices === true) {
      const userId = await getUserIdFromRequest(req);
      if (userId) await revokeUserSessions(userId);
    }
  } catch {
    // Chiqish har doim muvaffaqiyatli bo'lishi kerak (cookie baribir tozalanadi).
  }
  return clearAuthCookie(NextResponse.json({ ok: true }));
}
