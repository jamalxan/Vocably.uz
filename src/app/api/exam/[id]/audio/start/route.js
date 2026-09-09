import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, ExamError } from '@/lib/exam/server';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// exam.py'ning /audio/start'i — play-once: yagona boshlanish vaqtini yozadi va
// qayta chaqirilsa (sahifa yangilanishi) O'SHA vaqt + o'tgan soniyalarni (offset)
// qaytaradi — client shu offsetdan davom ettiradi, boshidan qayta ijro etmaydi.
// "practice" rejimida bu cheklov YO'Q — har chaqiriqda yangi boshlanish (qayta
// tinglash erkin, TZ §11.3).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { section } = await req.json();
    if (section !== 'listening') return NextResponse.json({ error: "Noto'g'ri bo'lim" }, { status: 400 });

    await connectToDatabase();
    const doc = await getOwnedSession(params.id, userId);

    const entry = doc.audio?.[section];
    if (doc.mode !== 'practice' && entry?.startedAt) {
      const elapsed = Math.max(0, Math.round((Date.now() - new Date(entry.startedAt).getTime()) / 1000));
      return NextResponse.json({ startedAt: entry.startedAt, offset: elapsed, replaysBlocked: true });
    }

    const start = new Date();
    doc.audio = { ...doc.audio, [section]: { startedAt: start, plays: (entry?.plays || 0) + 1 } };
    doc.markModified('audio');
    await doc.save();

    return NextResponse.json({ startedAt: start, offset: 0, replaysBlocked: false });
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/audio/start');
  }
}
