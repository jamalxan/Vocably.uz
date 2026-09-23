import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, syncAttemptExpiry, submitAttempt, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4 — "POST /attempts/:id/submit — Yakunlash + avtomatik
// baholash". `submitAttempt` idempotent (atomik shartli yangilash) — ikki marta
// bosilsa yoki tarmoq qayta yuborsa, ikkinchisi hech narsani qayta hisoblamaydi.
//
// N-02 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §3) — `endsAt`dan keyin kelgan
// "submit" endi `'user_submit'` sifatida QABUL QILINMAYDI: avval
// `syncAttemptExpiry` chaqiriladi (answers/route.js'dagi bilan bir xil naqsh) —
// muddati haqiqatan tugagan bo'lsa, u attempt'ni `'time_expired'` sababi bilan
// (javoblar allaqachon saqlangan holicha, `timeSpentSec` `endsAt`da to'xtatilib)
// avtomatik yakunlaydi va bu yerdagi `submitAttempt` chaqiruvi shunchaki
// eskirgan/keraksiz bo'lib qoladi — natija shu avtomatik yakunlashdan qaytadi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    let attempt = await getOwnedAttempt(params.id, userId);
    attempt = await syncAttemptExpiry(attempt);

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ result: attempt.result ?? null });
    }

    const result = await submitAttempt(params.id, userId, 'user_submit');
    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:submit');
  }
}
