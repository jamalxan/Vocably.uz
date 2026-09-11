import { connectToDatabase } from '@/lib/db';
import { ExamTest } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, syncAttemptExpiry, remainingSec, sanitizedTestFor, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4 — "GET /attempts/:id — Sanitizatsiya qilingan kontent +
// saqlangan javoblar + serverNow, endsAt". §4.1: javob kalitlari BU YERDAN
// HECH QACHON chiqmaydi — `sanitizedTestFor` (sanitize.ts) doim ishlatiladi,
// hatto urinish submit qilingan bo'lsa ham (izohli/to'liq ko'rinish alohida
// `/result` endpointi ishi, Faza 3).
export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    let attempt = await getOwnedAttempt(params.id, userId);
    attempt = await syncAttemptExpiry(attempt);

    const test = await ExamTest.findById(attempt.testId).lean();
    if (!test) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const now = new Date();
    return NextResponse.json({
      serverNow: now,
      endsAt: attempt.endsAt,
      remainingSec: remainingSec(attempt.endsAt, now),
      attempt: {
        id: String(attempt._id),
        testId: String(attempt.testId),
        mode: attempt.mode,
        sections: attempt.sections,
        currentSection: attempt.currentSection,
        status: attempt.status,
        answers: attempt.answers || {},
        flagged: attempt.flagged || [],
        lastQuestion: attempt.lastQuestion || 0,
        audio: attempt.audio,
        essays: attempt.essays,
        speaking: {
          recordings: (attempt.speaking?.recordings || []).map((r) => ({
            part: r.part,
            questionIndex: r.questionIndex,
            audioFileId: r.audioFileId,
            transcript: r.transcript,
            durationSec: r.durationSec,
            recordedAt: r.recordedAt,
          })),
        },
        highlights: (attempt.highlights || []).map((h) => ({
          id: String(h._id),
          passageOrder: h.passageOrder,
          paragraphIndex: h.paragraphIndex,
          startOffset: h.startOffset,
          endOffset: h.endOffset,
          note: h.note || '',
        })),
        result: attempt.result || null,
      },
      test: { ...sanitizedTestFor(test), _id: String(test._id) },
    });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:get');
  }
}
