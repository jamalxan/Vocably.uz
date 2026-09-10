import { connectToDatabase } from '@/lib/db';
import { User, ReadingAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson } from '@/lib/aiJson';
import { aiErrorResponse, checkAndIncrementAiRateLimit, rateLimitMessage } from '@/lib/ai/client';
import { getRecentlyLearnedWords } from '@/lib/reviewChain';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §7 (Reading moduli). Admin-tasdiqlangan kontent banki (FAZA 5, hali
// yo'q) o'rniga — har so'rovda AI orqali generatsiya, natija ReadingAttempt'da
// saqlanadi (generate/submit orasidagi holat + foydalanuvchi tarixi). `correctAnswer`/
// `explanation` bu javobda YO'Q — faqat /submit'da qaytadi (11.2: javob kaliti
// clientga oldindan yuborilmaydi).
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    passage: { type: 'string' },
    questions: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
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
  required: ['passage', 'questions'],
};

function buildPrompt(cefr, topic, targetWords) {
  return `CEFR darajasi: ${cefr}
Mavzu: ${topic || 'erkin (o\'zing tanla, qiziqarli va tabiiy)'}
${targetWords.length ? `Matnda albatta ishlatilishi kerak bo'lgan so'zlar: ${targetWords.join(', ')}` : ''}

100-180 so'zlik inglizcha reading passage yoz (${cefr} darajasiga mos so'z boyligi va grammatika bilan). Keyin 5 ta savol tuz:
- 3 ta MCQ (4 variant, faqat bittasi to'g'ri)
- 2 ta True/False/Not Given (options har doim aynan ["True","False","Not Given"])
Har savol uchun explanation — matnning aynan qaysi qismidan kelib chiqqanini o'zbek tilida qisqa tushuntir.
JAVOBNI FAQAT JSON qaytar: {"passage": "...", "questions": [{"type":"mcq"|"tfng","prompt":"...","options":[...],"correctAnswer":"...","explanation":"..."}]}`;
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
      return aiErrorResponse(aiErr, { endpoint: 'reading/generate', userId });
    }

    const questions = (data.questions || []).slice(0, 5).map((q) => ({
      type: q.type === 'tfng' ? 'tfng' : 'mcq',
      prompt: q.prompt || '',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
    }));

    const attempt = await ReadingAttempt.create({
      userId: user._id,
      cefr,
      topic,
      targetWords,
      passage: data.passage || '',
      questions,
    });

    return NextResponse.json({
      id: attempt._id,
      passage: attempt.passage,
      targetWords,
      questions: questions.map((q) => ({ type: q.type, prompt: q.prompt, options: q.options })),
    });
  } catch (err) {
    return serverError(err, 'reading/generate');
  }
}
