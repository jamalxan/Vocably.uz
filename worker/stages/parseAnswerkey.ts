// AI-01 worker, S7 "parse_answerkey" — Answer Key sahifalaridan har savol
// raqami uchun to'g'ri javob(lar)ni chiqaradi. Savol matni bilan RAQAM
// bo'yicha bog'lash (mismatch = blocker) `assemble.ts`da bo'ladi — bu yerda
// faqat XOM JAVOB KALITINI o'qish.
//
// "9.30 ↔ 9:30", "colour/color" kabi variant-ekvivalentlarni bu yerda
// ALGORITMIK generatsiya QILMAYMIZ — bu noto'g'ri ekvivalentlar to'qib
// chiqarish xavfini keltiradi (masalan har doim ham "colour"="color" deb
// bo'lmaydi, kontekstga bog'liq). Buning o'rniga: (1) agar kitobning o'zi
// javob kalitida bir nechta variantni ro'yxatlagan bo'lsa (masalan
// "9. 9.30 / 9:30"), promptga ko'ra AI ularning BARCHASINI `accepted`
// massiviga qo'shadi; (2) qolgan robustlik (katta/kichik harf, tinish
// belgisi, qavsli ixtiyoriy qism) BALKI ALLAQACHON `src/lib/exam/scoring.ts`
// `normalize()`/`expandOptional()`da bor — baholash paytida qo'llanadi,
// bu yerda TAKRORLANMAYDI.
import { runAiStage } from '../lib/aiStageRunner';
import { requireStageOutput } from '../lib/dependencies';
import type { StageContext } from '../types';
import type { SplitSectionsOutput } from './splitSections';

const PROMPT_VERSION = 'v1';

const ANSWER_KEY_SCHEMA = {
  type: 'object',
  properties: {
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          listening: {
            type: 'array',
            items: { type: 'object', properties: { number: { type: 'integer' }, accepted: { type: 'array', items: { type: 'string' } } }, required: ['number', 'accepted'] },
          },
          reading: {
            type: 'array',
            items: { type: 'object', properties: { number: { type: 'integer' }, accepted: { type: 'array', items: { type: 'string' } } }, required: ['number', 'accepted'] },
          },
        },
        required: ['index'],
      },
    },
  },
  required: ['tests'],
};

function buildPrompt(answerKeyText: string): string {
  return `Quyida IELTS kitobining "Answer Key" (javob kaliti) sahifalari matni berilgan — bir nechta testning javoblari bo'lishi mumkin.

MATN:
"""
${answerKeyText.slice(0, 30000)}
"""

Har test uchun: index (Test 1, Test 2...), listening va reading bo'limlari alohida — har savol raqami + shu savolga qabul qilinadigan javob(lar). Agar kitobning o'zi bitta savol uchun bir nechta variant ko'rsatgan bo'lsa (masalan "9.30 / 9:30" yoki "colour (color)"), BARCHASINI "accepted" massiviga qo'sh — o'zingdan yangi variant TO'QIMA, faqat matnda YOZILGANINI ol.`;
}

export interface AnswerKeyOutput {
  tests: { index: number; listening: { number: number; accepted: string[] }[]; reading: { number: number; accepted: string[] }[] }[];
}

export async function runParseAnswerkey(ctx: StageContext): Promise<AnswerKeyOutput> {
  const splitOutput = (await requireStageOutput(ctx.job.bookId, 'split_sections')) as SplitSectionsOutput;
  if (!splitOutput.answerKeyText.trim()) return { tests: [] };

  const { data } = await runAiStage<{ tests?: AnswerKeyOutput['tests'] }>({
    taskKey: 'answerkey.parse',
    bookId: ctx.job.bookId,
    jobId: ctx.job._id,
    systemPrompt: "Sen IELTS javob kaliti sahifalarini strukturali JSON'ga o'giradigan yordamchisan. Faqat so'ralgan JSON'ni qaytar, javoblarni o'zgartirma.",
    userContent: buildPrompt(splitOutput.answerKeyText),
    jsonSchema: { name: 'answer_key', schema: ANSWER_KEY_SCHEMA },
    promptVersion: PROMPT_VERSION,
    inputForHash: splitOutput.answerKeyText,
  });

  return {
    tests: (data.tests || []).map((t) => ({
      index: t.index,
      listening: (t.listening || []).map((q) => ({ number: q.number, accepted: (q.accepted || []).filter(Boolean) })),
      reading: (t.reading || []).map((q) => ({ number: q.number, accepted: (q.accepted || []).filter(Boolean) })),
    })),
  };
}
