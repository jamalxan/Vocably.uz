import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedAttempt, submitAttempt, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4 — "POST /attempts/:id/submit — Yakunlash + avtomatik
// baholash". `submitAttempt` idempotent (atomik shartli yangilash) — ikki marta
// bosilsa yoki tarmoq qayta yuborsa, ikkinchisi hech narsani qayta hisoblamaydi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    await getOwnedAttempt(params.id, userId); // faqat egalikni tekshirish uchun — 404 bo'lsa shu yerda otiladi
    const result = await submitAttempt(params.id, userId, 'user_submit');

    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:submit');
  }
}
