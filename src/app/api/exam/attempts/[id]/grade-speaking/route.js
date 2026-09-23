import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { gradeSpeakingAttempt, ExamAttemptError } from '@/lib/exam/attemptServer';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §19 Faza 4 item 23 — grade-writing/route.js bilan bir xil
// naqsh (q. o'sha yerdagi izoh: sinxron AI chaqiruv, navbat infratuzilmasi
// yo'q). Client Speaking bo'limining oxirgi javobini yuborib "Yakunlash"
// bosgach (submit'dan keyin) DARHOL shu endpointni chaqiradi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    // BILL-01/02: 'grading' — FREE tarif uchun oylik AI baholash chegarasi ham
    // tekshiriladi (src/lib/ai/client.js), rl.message berilsa shuni ko'rsatamiz.
    const rl = await checkAndIncrementAiRateLimit(userId, { feature: 'grading' });
    if (!rl.allowed) {
      return NextResponse.json({ error: rl.message || rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let result;
    try {
      result = await gradeSpeakingAttempt(params.id, userId);
    } catch (err) {
      if (err instanceof ExamAttemptError) throw err;
      return aiErrorResponse(err, { endpoint: 'exam/attempts:grade-speaking', userId });
    }

    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:grade-speaking');
  }
}
