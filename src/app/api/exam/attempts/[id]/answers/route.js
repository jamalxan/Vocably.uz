import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, syncAttemptExpiry, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4/§4.3 — "PATCH /attempts/:id/answers — Batch saqlash:
// {answers, flagged, lastQuestion}". `answers` QISMAN bo'lishi mumkin (masalan
// bitta savolning debounce'langan javobi) — mavjud javoblarning ustiga
// birlashtiriladi (Object.assign), butunlay ALMASHTIRILMAYDI. `flagged` va
// `lastQuestion` esa to'liq snapshot sifatida keladi (§4.3 jadvali) — bor
// bo'yicha almashtiriladi.
export async function PATCH(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    let attempt = await getOwnedAttempt(params.id, userId);
    attempt = await syncAttemptExpiry(attempt);

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'Urinish allaqachon yakunlangan' }, { status: 409 });
    }

    const { answers, flagged, lastQuestion } = await req.json().catch(() => ({}));

    if (answers && typeof answers === 'object') {
      attempt.answers = { ...(attempt.answers || {}), ...answers };
      attempt.markModified('answers');
    }
    if (Array.isArray(flagged)) attempt.flagged = flagged;
    if (typeof lastQuestion === 'number') attempt.lastQuestion = lastQuestion;

    await attempt.save();

    return NextResponse.json({ saved: true, savedAt: new Date() });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:answers');
  }
}
