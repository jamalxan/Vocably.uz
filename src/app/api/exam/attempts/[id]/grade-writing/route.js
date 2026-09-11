import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { gradeWritingAttempt, ExamAttemptError } from '@/lib/exam/attemptServer';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §4/§8.5 — "POST /attempts/:id/grade-writing — AI baholash
// (navbatga qo'yiladi, natija polling bilan)". Bu loyihada haqiqiy navbat
// (queue) infratuzilmasi yo'q — mavjud /api/writing/submit ham xuddi shunday
// SINXRON ishlaydi (attemptServer.ts#gradeWritingAttempt izohiga q.), shuning
// uchun bu route ham javobni to'g'ridan-to'g'ri (polling shart bo'lmagan
// holda) qaytaradi. Kelajakda haqiqiy navbat qo'shilsa, o'zgaradigan yagona
// joy shu route + gradeWritingAttempt() — klient kontrakti (submit qilingach
// shu endpointni chaqirish, natija qaytishi) o'zgarmaydi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let result;
    try {
      result = await gradeWritingAttempt(params.id, userId);
    } catch (err) {
      if (err instanceof ExamAttemptError) throw err;
      return aiErrorResponse(err, { endpoint: 'exam/attempts:grade-writing', userId });
    }

    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:grade-writing');
  }
}
