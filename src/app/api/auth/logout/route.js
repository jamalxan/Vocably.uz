import { clearAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md BUG-030 (§G1) — httpOnly cookie client JS'dan o'chirilishi
// mumkin emas (shu sababning o'zi uni localStorage'dan xavfsizroq qiladi),
// shuning uchun uni tozalash uchun server endpointi kerak. AppContext.jsx'ning
// logout()i localStorage tozalashdan tashqari shu endpointni ham chaqiradi.
export async function POST() {
  return clearAuthCookie(NextResponse.json({ ok: true }));
}
