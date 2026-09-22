import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, syncAttemptExpiry, patchAttemptAnswers, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4/§4.3 — "PATCH /attempts/:id/answers — Batch saqlash:
// {answers, flagged, lastQuestion}". `answers` QISMAN bo'lishi mumkin (masalan
// bitta savolning debounce'langan javobi) — mavjud javoblarning ustiga
// birlashtiriladi, butunlay ALMASHTIRILMAYDI (`patchAttemptAnswers` MongoDB
// nuqta-notatsiyasi bilan, PERF-01 tuzatishi — attemptServer.ts izohiga q.).
// `flagged` va `lastQuestion` esa to'liq snapshot sifatida keladi (§4.3
// jadvali) — bor bo'yicha almashtiriladi.
//
// `essays` — TZ §4/§8 Writing uchun alohida endpoint YO'Q (§4 jadvalida
// bittagina PATCH /answers bor); insho matni ham xuddi shu "batch saqlash"
// yo'lidan, `{task1?: {text, wordCount}, task2?: {text, wordCount}}` sifatida
// keladi (examStore.ts#syncNow "task1"/"task2" dirty kalitlari orqali).
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

    const { answers, flagged, lastQuestion, essays } = await req.json().catch(() => ({}));
    await patchAttemptAnswers(params.id, userId, { answers, flagged, lastQuestion, essays });

    return NextResponse.json({ saved: true, savedAt: new Date() });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:answers');
  }
}
