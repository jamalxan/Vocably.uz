import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, finalize, ExamError } from '@/lib/exam/server';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// exam.py'ning /submit'i — idempotent qo'lda submit. Ikki marta bosilsa (masalan
// sekin tarmoq + ikkinchi bosish) ikkinchisi hech narsani qayta hisoblamaydi,
// saqlangan natijani qaytaradi (finalize()'dagi atomik shartli yangilash).
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    await getOwnedSession(params.id, userId); // 404 bo'lsa shu yerda tashlanadi

    const result = await finalize(params.id, userId, 'manual');
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/submit');
  }
}
