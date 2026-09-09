import { connectToDatabase } from '@/lib/db';
import { WritingAttempt } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateJson, friendlyAiError } from '@/lib/aiJson';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// VOCABLY-TZ.md §10.2 — AI Grader. Diqqat: bu yerdagi ball AI'ning xom bahosi —
// TZ o'zi ta'kidlaganidek (§10.2 oxiri) haqiqiy IELTS namunalari bilan kalibrlash
// (test to'plami + har prompt o'zgarishida tekshirish) FAZA doirasidan tashqari —
// shuning uchun UI'da "taxminiy band" sifatida ko'rsatiladi, rasmiy natija emas.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    band: { type: 'number' },
    taskAchievement: { type: 'number' },
    taskAchievementNote: { type: 'string' },
    coherenceCohesion: { type: 'number' },
    coherenceCohesionNote: { type: 'string' },
    lexicalResource: { type: 'number' },
    lexicalResourceNote: { type: 'string' },
    grammaticalRange: { type: 'number' },
    grammaticalRangeNote: { type: 'string' },
    inlineCorrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { original: { type: 'string' }, suggestion: { type: 'string' }, reason: { type: 'string' } },
        required: ['original', 'suggestion', 'reason'],
      },
    },
    vocabularyUpgrades: {
      type: 'array',
      items: {
        type: 'object',
        properties: { original: { type: 'string' }, better: { type: 'array', items: { type: 'string' } } },
        required: ['original', 'better'],
      },
    },
    nextStepsUz: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'band', 'taskAchievement', 'taskAchievementNote', 'coherenceCohesion', 'coherenceCohesionNote',
    'lexicalResource', 'lexicalResourceNote', 'grammaticalRange', 'grammaticalRangeNote',
    'inlineCorrections', 'vocabularyUpgrades', 'nextStepsUz',
  ],
};

function buildPrompt(task, prompt, text) {
  return `Siz IELTS Writing baholovchisiz. Task ${task} topshirig'i: "${prompt}"

Foydalanuvchi javobi:
"""
${text}
"""

IELTS mezonlari bo'yicha baholang (0-9, 0.5 qadamda): Task Achievement, Coherence & Cohesion,
Lexical Resource, Grammatical Range & Accuracy. Har biriga o'zbek tilida qisqa izoh (note) yozing.
Umumiy band (4 mezon o'rtachasi, 0.5ga yaxlitlangan).
inlineCorrections — matndagi grammatik/leksik xatolar (asl parcha, tuzatilgan variant, o'zbekcha sabab), 3-6 ta.
vocabularyUpgrades — "yaxshi" so'zlarni kuchliroq muqobillar bilan almashtirish taklifi, 3-5 ta.
nextStepsUz — 7.0 ga chiqish uchun 2-3 ta aniq maslahat, o'zbek tilida.
JAVOBNI FAQAT JSON qaytar (sxemaga qat'iy mos).`;
}

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    const { task, prompt, text } = await req.json();
    if (![1, 2].includes(task) || !prompt || !text || text.trim().length < 20) {
      return NextResponse.json({ error: "Matn juda qisqa yoki noto'g'ri format" }, { status: 400 });
    }

    let data;
    try {
      data = await generateJson(buildPrompt(task, prompt, text), RESPONSE_SCHEMA);
    } catch (aiErr) {
      return NextResponse.json({ error: friendlyAiError(aiErr) }, { status: 502 });
    }

    await connectToDatabase();
    const attempt = await WritingAttempt.create({
      userId,
      task,
      prompt,
      text,
      wordCount: text.trim().split(/\s+/).length,
      feedback: {
        band: data.band,
        criteria: {
          taskAchievement: { band: data.taskAchievement, note: data.taskAchievementNote },
          coherenceCohesion: { band: data.coherenceCohesion, note: data.coherenceCohesionNote },
          lexicalResource: { band: data.lexicalResource, note: data.lexicalResourceNote },
          grammaticalRange: { band: data.grammaticalRange, note: data.grammaticalRangeNote },
        },
        inlineCorrections: data.inlineCorrections || [],
        vocabularyUpgrades: data.vocabularyUpgrades || [],
        nextStepsUz: data.nextStepsUz || [],
      },
    });

    return NextResponse.json({ id: attempt._id, feedback: attempt.feedback, wordCount: attempt.wordCount });
  } catch (err) {
    return serverError(err, 'writing/submit');
  }
}
