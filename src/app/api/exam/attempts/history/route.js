import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getAttemptHistory } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §11.1 item 8 / §19 Faza 3 item 17 — "Tarix: oldingi
// mocklar bilan taqqoslash grafigi". §4 jadvalida alohida sanalmagan (u
// bitta attempt haqida so'raladigan endpointlar ro'yxati) — bu esa
// foydalanuvchining BARCHA baholangan urinishlari bo'yicha, shuning uchun
// `/attempts/history` (bitta attemptId'ga bog'lanmagan, static segment,
// `/attempts/[id]` bilan to'qnashmaydi — Next.js avval aniq yo'lni tekshiradi).
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const history = await getAttemptHistory(userId);

    return NextResponse.json({ history });
  } catch (err) {
    return serverError(err, 'exam/attempts:history');
  }
}
