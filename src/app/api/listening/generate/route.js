import { connectToDatabase } from '@/lib/db';
import { User, ListeningAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { getRecentlyLearnedWords } from '@/lib/reviewChain';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §8 (Listening moduli). Real audio-fayl/aksent kutubxonasi yo'q (T4) —
// transkript brauzer TTS orqali o'qiladi (client, /app/tinglash/page.jsx). Shuning
// uchun bu yerda faqat TABIIY GAPIRISH UCHUN MOS matn generatsiya qilinadi (qisqa
// suhbat yoki monolog), Reading'dagi bilan bir xil savol formatida.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    transcript: { type: 'string' },
    questions: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['mcq', 'tfng'] },
          prompt: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctAnswer: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['type', 'prompt', 'options', 'correctAnswer', 'explanation'],
      },
    },
  },
  required: ['transcript', 'questions'],
};

function buildPrompt(cefr, topic, targetWords) {
  return `CEFR darajasi: ${cefr}
Mavzu: ${topic || "erkin (kundalik hayotdan tabiiy vaziyat)"}
${targetWords.length ? `Matnda albatta ishlatilishi kerak bo'lgan so'zlar: ${targetWords.join(', ')}` : ''}

Ovoz bilan o'qish uchun 60-100 so'zlik TABIIY GAPIRISH uslubidagi ingliz matni yoz (${cefr} darajasiga mos) —
qisqa monolog yoki bitta odam so'zlaydigan e'lon/xabar shaklida (dialog belgilari, tire, qo'shtirnoq ISHLATMA —
faqat oddiy uzluksiz nutq, chunki bu matn to'g'ridan-to'g'ri ovozli o'qiladi). Keyin 4 ta tushunish savoli tuz:
- 2 ta MCQ (4 variant)
- 2 ta True/False/Not Given (options har doim aynan ["True","False","Not Given"])
Har savol uchun explanation — matnning qaysi qismidan kelib chiqqanini o'zbek tilida qisqa tushuntir.
JAVOBNI FAQAT JSON qaytar: {"transcript": "...", "questions": [{"type":"mcq"|"tfng","prompt":"...","options":[...],"correctAnswer":"...","explanation":"..."}]}`;
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { cefr = 'B1', topic = '' } = await req.json().catch(() => ({}));

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const targetWords = await getRecentlyLearnedWords(user);

    const rl = await checkAndIncrementAiRateLimit(userId);
    if (!rl.allowed) {
      return NextResponse.json({ error: rateLimitMessage(rl.retryAfterMinutes) }, { status: 429 });
    }

    let data;
    try {
      data = await generateJson(buildPrompt(cefr, topic, targetWords), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return aiErrorResponse(aiErr, { endpoint: 'listening/generate', userId });
    }

    const questions = (data.questions || []).slice(0, 4).map((q) => ({
      type: q.type === 'tfng' ? 'tfng' : 'mcq',
      prompt: q.prompt || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
    }));

    const attempt = await ListeningAttempt.create({
      userId: user._id,
      cefr,
      topic,
      targetWords,
      transcript: data.transcript || '',
      questions,
    });

    return NextResponse.json({
      id: attempt._id,
      cefr,
      transcript: attempt.transcript,
      targetWords,
      questions: questions.map((q) => ({ type: q.type, prompt: q.prompt, options: q.options })),
    });
  } catch (err) {
    return serverError(err, 'listening/generate');
  }
}
