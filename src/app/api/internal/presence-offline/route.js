import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { safeEqual } from '@/lib/safeEqual';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { NextResponse } from 'next/server';

// realtime-server bir foydalanuvchining OXIRGI socket'i uzilib, qayta ulanish oynasi ham o'tgach
// shu yerga chaqiradi (realtime-server/server.js `notifyPresenceOffline`): `at` — socket uzilgan
// lahza, ya'ni foydalanuvchi ilovada haqiqatan oxirgi marta bo'lgan vaqt.
//
// Nega kerak: `lastActiveAt`ni faqat /api/chat/* so'rovlari yozadi (src/lib/chatAuth.js), "onlayn"
// holati esa butun ilova bo'ylab ochiq turadigan socket'dan olinadi va u hech qanday so'rov
// yubormaydi. Natijada odam ilovada bir soat o'tirib chiqib ketsa, "Do'stlar"da darhol "oxirgi
// marta ko'rilgan 1 soat oldin" chiqardi — bir daqiqa oldin "Onlayn" bo'lib turgan bo'lsa ham.
//
// Vaqt faqat OLDINGA suriladi ($max) va kelajakka o'tkazilmaydi — kechikkan yoki takroriy chaqiruv
// yangiroq faollikni ortga qaytarmaydi. presence-online bilan bir xil ichki sir bilan himoyalangan.
export async function POST(req) {
  try {
    const secret = req.headers.get('x-internal-secret');
    if (!process.env.REALTIME_SHARED_SECRET || !safeEqual(secret, process.env.REALTIME_SHARED_SECRET)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { userId, at } = await req.json().catch(() => ({}));
    if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: 'userId kerak' }, { status: 400 });
    }
    const atMs = typeof at === 'string' ? Date.parse(at) : NaN;
    if (!Number.isFinite(atMs)) return NextResponse.json({ error: 'at kerak' }, { status: 400 });

    await connectToDatabase();
    await User.updateOne({ _id: userId }, { $max: { lastActiveAt: new Date(Math.min(atMs, Date.now())) } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'internal/presence-offline POST');
  }
}
