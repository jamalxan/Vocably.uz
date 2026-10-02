import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { addSpeakingRecording, ExamAttemptError } from '@/lib/exam/attemptServer';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { serverError } from '@/lib/apiError';
import { AUDIO_UPLOAD_MAX_BYTES, AUDIO_UPLOAD_MIN_BYTES, clampDuration, detectAudioType } from '@/lib/mediaSafety';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §19 Faza 4 item 23 — bitta Speaking javobi (Part 1/3'ning
// bitta savoli yoki Part 2'ning cue card javobi) yozib bo'lingach shu yerga
// yuklanadi: GridFS'ga saqlanadi + darhol transkripsiya qilinadi (final
// baholash keyinroq, "Yakunlash" bosilgach, faqat matn bilan ishlaydi — audio
// bilan qayta gaplashmaydi). Transkripsiya AI chaqiruvi (Whisper) bo'lgani
// uchun xuddi grade-writing/grade-speaking kabi rate-limit'ga tortiladi.
export async function POST(req, props) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    const form = await req.formData();
    const part = Number(form.get('part'));
    const questionIndex = Number(form.get('questionIndex'));
    const durationSec = clampDuration(form.get('durationSec'));
    const audio = form.get('audio');

    if (![1, 2, 3].includes(part) || !Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex > 50 || !audio || typeof audio === 'string') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }
    if (audio.size > AUDIO_UPLOAD_MAX_BYTES) {
      return NextResponse.json({ error: `Yozuv juda katta (maks ${AUDIO_UPLOAD_MAX_BYTES / 1024 / 1024} MB)` }, { status: 413 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    if (buffer.length < AUDIO_UPLOAD_MIN_BYTES) {
      return NextResponse.json({ error: "Yozuv juda qisqa — qaytadan urinib ko'ring" }, { status: 400 });
    }
    // Tur mijoz e'lon qilganidan EMAS, baytlardan aniqlanadi (HTML/skript "audio" sifatida yuklanib, keyin ilova originida
    // ochilib qolmasin — saqlangan XSS himoyasi). Saqlanadigan nom ham o'zimiz yasaymiz.
    const detected = detectAudioType(buffer);
    if (!detected) {
      return NextResponse.json({ error: 'Fayl audio emas yoki format qo‘llab-quvvatlanmaydi' }, { status: 415 });
    }

    let saved;
    try {
      saved = await addSpeakingRecording(params.id, userId, {
        part,
        questionIndex,
        buffer,
        filename: `speaking-${Date.now()}.${detected.split('/')[1] === 'mpeg' ? 'mp3' : detected.split('/')[1]}`,
        mimeType: detected,
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
