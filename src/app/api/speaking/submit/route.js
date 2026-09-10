import { connectToDatabase } from '@/lib/db';
import { SpeakingAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { transcribeAudio } from '@/lib/transcribe';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    band: { type: 'number' },
    fluencyCoherence: { type: 'number' },
    fluencyCoherenceNote: { type: 'string' },
    lexicalResource: { type: 'number' },
    lexicalResourceNote: { type: 'string' },
    grammaticalRange: { type: 'number' },
    grammaticalRangeNote: { type: 'string' },
    pronunciationNote: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { original: { type: 'string' }, suggestion: { type: 'string' } },
        required: ['original', 'suggestion'],
      },
    },
    nextStepsUz: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'band', 'fluencyCoherence', 'fluencyCoherenceNote', 'lexicalResource', 'lexicalResourceNote',
    'grammaticalRange', 'grammaticalRangeNote', 'pronunciationNote', 'strengths', 'corrections', 'nextStepsUz',
  ],
};

// Diqqat: `pronunciation` band'i FONEMA DARAJASIDA emas — Azure Speech Pronunciation
// Assessment (TZ 9.1'dagi asosiy reja) bu yerda YO'Q, GROQ_API_KEY orqali faqat
// Whisper transkripsiya + shu matnga qarab LLM taxminiy bahosi bor (TZ 20.1'dagi
// o'zi ko'rsatgan "bepul tarif" zaxirasi). UI'da bu aniq ko'rsatilishi kerak.
function buildPrompt(part, prompt, transcript) {
  return `Siz IELTS Speaking baholovchisiz. Part ${part} savoli: "${prompt}"

Foydalanuvchining OG'ZAKI javobi (Whisper orqali yozma matnga o'girilgan, tinish
belgilari/pauza ma'lumoti yo'qolgan bo'lishi mumkin):
"""
${transcript}
"""

IELTS mezonlari bo'yicha taxminiy baholang (0-9, 0.5 qadamda): Fluency & Coherence,
Lexical Resource, Grammatical Range & Accuracy — har biriga o'zbekcha qisqa izoh.
pronunciationNote — FAQAT matn asosida (talaffuzni EMAS, so'z tanlovi/ravonlikni aks
ettiruvchi belgilar asosida) umumiy kuzatuv, "aniq fonema tahlili yo'q" ekanini aslida
yozmang, shunchaki matndan ko'ringan narsalarni yozing.
Umumiy band (3 mezon o'rtachasi, 0.5ga yaxlitlangan — pronunciation hisobga kiritilmaydi,
chunki aniq o'lchanmagan).
strengths — 2-3 ta kuchli tomon.
corrections — 3-5 ta grammatik/leksik tuzatish (original parcha -> tuzatilgan).
nextStepsUz — 2-3 ta aniq maslahat, o'zbek tilida.
JAVOBNI FAQAT JSON qaytar (sxemaga qat'iy mos).`;
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const form = await req.formData();
    const part = Number(form.get('part')) || 1;
    const prompt = String(form.get('prompt') || '');
    const audio = form.get('audio');
    if (!prompt || !audio || typeof audio === 'string') {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    if (buffer.length < 2000) {
      return NextResponse.json({ error: 'Yozuv juda qisqa — qaytadan urinib ko\'ring' }, { status: 400 });
    }

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let transcript;
    try {
      transcript = await transcribeAudio(buffer, audio.name, audio.type);
    } catch (err) {
      return aiErrorResponse(err, { endpoint: 'speaking/submit:transcribe', userId });
    }
    if (!transcript.trim()) {
      return NextResponse.json({ error: "Ovoz tanilmadi — aniqroq gapirib qaytadan urinib ko'ring" }, { status: 422 });
    }

    let data;
    try {
      data = await generateJson(buildPrompt(part, prompt, transcript), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'speaking/submit:grade', userId });
    }

    await connectToDatabase();
    const attempt = await SpeakingAttempt.create({
      userId,
      part,
      prompt,
      transcript,
      feedback: {
        band: data.band,
        criteria: {
          fluencyCoherence: { band: data.fluencyCoherence, note: data.fluencyCoherenceNote },
          lexicalResource: { band: data.lexicalResource, note: data.lexicalResourceNote },
          grammaticalRange: { band: data.grammaticalRange, note: data.grammaticalRangeNote },
          pronunciation: { band: null, note: data.pronunciationNote },
        },
        strengths: data.strengths || [],
        corrections: data.corrections || [],
        nextStepsUz: data.nextStepsUz || [],
      },
    });

    return NextResponse.json({ id: attempt._id, transcript, feedback: attempt.feedback });
  } catch (err) {
    return serverError(err, 'speaking/submit');
  }
}
