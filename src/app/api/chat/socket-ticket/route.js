import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// AUTH_MIGRATION_MAP.md — realtime-server/ (alohida deploy qilinadigan xizmat,
// docs/ chat plani) socket.io ulanishini `socket.handshake.auth.token` orqali
// HAQIQIY JWT bilan tekshiradi (realtime-server/index.js:35-44) — bu Next.js
// ilovasining httpOnly cookie'siga ega EMAS (boshqa xizmat, cross-origin), shuning
// uchun ulanish uchun client baribir bironta HAQIQIY token qiymatiga ega bo'lishi
// SHART. To'liq 30-kunlik sessiya tokenini (localStorage'da bo'lgani kabi) buning
// uchun saqlash o'rniga — bu yerda faqat SHU MAQSAD uchun, 60 soniyalik umr bilan
// yangi "chipta" (ticket) yaratiladi. Client uni HECH QACHON localStorage'ga
// yozmaydi (faqat xotirada, socket ulanish payti uchun) — XSS uni o'g'irlasa ham,
// atigi bir necha soniya amal qiladi va faqat socket ulanishi uchun ishlatilishi
// mumkin (boshqa hech qanday API endpoint bu qisqa tokenni maxsus tekshirmaydi —
// u realtime-server uchun signature+userId'dan boshqa hech narsa emas).
export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    if (!(await checkRateLimit(user._id, 'socket-ticket', 30))) {
      return NextResponse.json({ error: "Juda ko'p so'rov" }, { status: 429 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server sozlanmagan" }, { status: 500 });
    }

    const ticket = jwt.sign({ userId: String(user._id), scope: 'realtime' }, process.env.JWT_SECRET, { expiresIn: '60s' });
    return NextResponse.json({ ticket });
  } catch (err) {
    return serverError(err, 'chat/socket-ticket');
  }
}
