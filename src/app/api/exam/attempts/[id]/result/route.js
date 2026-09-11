import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getAttemptReviewDetail, ExamAttemptError } from '@/lib/exam/attemptServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4/§11.2 — "GET /attempts/:id/result — To'g'ri javoblar +
// izohlar — faqat status === 'graded' bo'lsa". Bu YAGONA joy javob kaliti/
// izoh/transkript ochiq chiqadigan (GET /attempts/:id — §4.1 — hech qachon
// bularni bermaydi).
export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const detail = await getAttemptReviewDetail(params.id, userId);

    return NextResponse.json({ detail });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:result');
  }
}
