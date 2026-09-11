import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { addSpeakingRecording, ExamAttemptError } from '@/lib/exam/attemptServer';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §19 Faza 4 item 23 — bitta Speaking javobi (Part 1/3'ning
// bitta savoli yoki Part 2'ning cue card javobi) yozib bo'lingach shu yerga
// yuklanadi: GridFS'ga saqlanadi + darhol transkripsiya qilinadi (final
// baholash keyinroq, "Yakunlash" bosilgach, faqat matn bilan ishlaydi — audio
// bilan qayta gaplashmaydi). Transkripsiya AI chaqiruvi (Whisper) bo'lgani
// uchun xuddi grade-writing/grade-speaking kabi rate-limit'ga tortiladi.
export async function POST(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    const form = await req.formData();
    const part = Number(form.get('part'));
    const questionIndex = Number(form.get('questionIndex'));
    const durationSec = Number(form.get('durationSec')) || 0;
    const audio = form.get('audio');

    if (![1, 2, 3].includes(part) || !Number.isInteger(questionIndex) || questionIndex < 0 || !audio || typeof audio === 'string') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    if (buffer.length < 2000) {
      return NextResponse.json({ error: "Yozuv juda qisqa — qaytadan urinib ko'ring" }, { status: 400 });
    }

    let saved;
    try {
      saved = await addSpeakingRecording(params.id, userId, {
        part,
        questionIndex,
        buffer,
        filename: audio.name || `speaking-${Date.now()}.webm`,
        mimeType: audio.type || 'audio/webm',
        durationSec,
      });
    } catch (err) {
      if (err instanceof ExamAttemptError) throw err;
      return aiErrorResponse(err, { endpoint: 'exam/attempts:speaking-recording', userId });
    }

    return NextResponse.json(saved);
  } catch (err) {
    if (err instanceof ExamAttemptError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/attempts:speaking-recording');
  }
}
