// TZ-vocably-v2.md §8.5/§19 Faza 2 item 13 — AI Writing grader. Reuses the
// existing Groq→OpenRouter→Gemini chain (src/lib/aiJson.js) that already
// backs /api/words/enrich and the old (pre-exam-engine) /api/writing/submit —
// per user direction, no separate model/budget for this.
//
// §4/§8.5 describe this as "queue + 2s polling" to avoid Vercel serverless
// timeouts. No queue infrastructure exists in this project (no Redis/BullMQ/
// Vercel Queue), and the OLD writing endpoint (src/app/api/writing/submit)
// already grades SYNCHRONOUSLY within one request — so this does the same,
// deliberately, rather than half-building a fake queue. Two essays are graded
// in parallel (Promise.all in attemptServer.ts) to keep total wall time down.
// If this ever needs to become truly async (a real queue arrives), the surface
// to change is exactly gradeEssay() below plus the one call site — nothing
// about the client contract (POST grade-writing → result) needs to change.
import { generateJsonWithMeta } from '@/lib/aiJson';
import type { WritingScore, WritingTask } from './types';

// Prompt/sxema (RESPONSE_SCHEMA yoki buildPrompt) mazmunli o'zgarganda
// qo'lda oshiriladi — eski saqlangan `WritingScore.graderVersion` qaysi
// mezon matni bilan baholanganini bildiradi (audit uchun, TA/TR bahosi
// prompt formulasiga sezilarli bog'liq).
const GRADER_VERSION = '1.0';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    taskAchievement: { type: 'number' },
    coherenceCohesion: { type: 'number' },
    lexicalResource: { type: 'number' },
    grammaticalRange: { type: 'number' },
    band: { type: 'number' },
    feedbackUz: { type: 'string' },
    criteriaFeedbackUz: {
      type: 'object',
      properties: {
        taskAchievement: { type: 'string' },
        coherenceCohesion: { type: 'string' },
        lexicalResource: { type: 'string' },
        grammaticalRange: { type: 'string' },
      },
      required: ['taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange'],
    },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { original: { type: 'string' }, suggested: { type: 'string' }, reason: { type: 'string' } },
        required: ['original', 'suggested', 'reason'],
      },
    },
    improvedVersion: { type: 'string' },
  },
  required: [
    'taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange',
    'band', 'feedbackUz', 'criteriaFeedbackUz', 'corrections',
  ],
};

function countWordsInline(text: string): number {
  return text.trim().split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w)).length;
}

/** TZ §8.5 — mezon bandini eng yaqin 0.5 ga yaxlitlaydi va 0-9 oralig'ida
 * qisqartiradi (AI ba'zan 6.75 yoki 9.5 kabi qiymat qaytarishi mumkin). */
function clampToHalfBand(n: unknown): number {
  const num = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  const rounded = Math.round(num * 2) / 2;
  return Math.min(9, Math.max(0, rounded));
}

function buildPrompt(task: WritingTask, text: string, wordCount: number): string {
  const underMinWords = wordCount < task.minWords;
  return `Rol: siz tajribali IELTS Writing examiner'siz, Cambridge rasmiy rubrikasidan foydalanasiz.

Task ${task.order} topshirig'i:
"""
${task.promptHtml.replace(/<[^>]+>/g, ' ').trim()}
"""
Talab qilingan minimal so'z soni: ${task.minWords}.

Foydalanuvchi javobi (${wordCount} so'z):
"""
${text}
"""
${underMinWords ? `\nMUHIM: foydalanuvchi minimal ${task.minWords} so'zdan KAM yozgan (${wordCount} so'z) — bu Task Achievement/Task Response bahosiga JARIMA sifatida ta'sir qilishi kerak (rasmiy IELTS qoidasi).` : ''}

To'rt mezon bo'yicha 0-9 oralig'ida, 0.5 qadamda baholang: Task Achievement (Task 1) / Task Response (Task 2), Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy. "band" — shu to'rt mezon o'rtachasi, eng yaqin 0.5 ga yaxlitlangan.

"feedbackUz" — o'zbek tilida 3-5 jumlalik umumiy tahlil.
"criteriaFeedbackUz" — har mezon bo'yicha alohida, o'zbek tilida 1-2 jumlalik izoh.
"corrections" — matndagi eng muhim 3-6 ta grammatik/leksik xato: asl parcha, tuzatilgan variant, o'zbekcha sabab.
"improvedVersion" — band 7.5 darajasidagi qayta yozilgan to'liq variant (ingliz tilida).

JAVOBNI FAQAT xom JSON obyekti sifatida qaytar — hech qanday izoh, markdown yoki \`\`\`json bloki bo'lmasin.`;
}

// N-03 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §3) — bundan kam so'zli javob
// AI'ga umuman yuborilmaydi (bo'sh/deyarli bo'sh insho baholashga arzimaydi,
// behuda token xarajati qiladi) — deterministik band 0 qaytariladi.
const EMPTY_ESSAY_MIN_WORDS = 20;

export async function gradeEssay(task: WritingTask, text: string): Promise<WritingScore> {
  const wordCount = countWordsInline(text);

  if (wordCount < EMPTY_ESSAY_MIN_WORDS) {
    return {
      taskAchievement: 0,
      coherenceCohesion: 0,
      lexicalResource: 0,
      grammaticalRange: 0,
      band: 0,
      feedbackUz: "Javob yozilmagan yoki juda qisqa — baholash uchun yetarli matn yo'q.",
      criteriaFeedbackUz: {
        taskAchievement: 'Javob yozilmagan.',
        coherenceCohesion: 'Javob yozilmagan.',
        lexicalResource: 'Javob yozilmagan.',
        grammaticalRange: 'Javob yozilmagan.',
      },
      corrections: [],
      graderModel: 'none',
      graderVersion: GRADER_VERSION,
      underMinWords: true,
    };
  }

  const { data, provider } = await generateJsonWithMeta(buildPrompt(task, text, wordCount), RESPONSE_SCHEMA);

  const criteria = {
    taskAchievement: clampToHalfBand(data.taskAchievement),
    coherenceCohesion: clampToHalfBand(data.coherenceCohesion),
    lexicalResource: clampToHalfBand(data.lexicalResource),
    grammaticalRange: clampToHalfBand(data.grammaticalRange),
  };
  const band = clampToHalfBand(
    (criteria.taskAchievement + criteria.coherenceCohesion + criteria.lexicalResource + criteria.grammaticalRange) / 4
  );

  return {
    ...criteria,
    band,
    feedbackUz: typeof data.feedbackUz === 'string' ? data.feedbackUz : '',
    criteriaFeedbackUz: {
      taskAchievement: data.criteriaFeedbackUz?.taskAchievement || '',
      coherenceCohesion: data.criteriaFeedbackUz?.coherenceCohesion || '',
      lexicalResource: data.criteriaFeedbackUz?.lexicalResource || '',
      grammaticalRange: data.criteriaFeedbackUz?.grammaticalRange || '',
    },
    corrections: Array.isArray(data.corrections)
      ? data.corrections.slice(0, 6).map((c: any) => ({
          original: String(c?.original || ''),
          suggested: String(c?.suggested || ''),
          reason: String(c?.reason || ''),
        }))
      : [],
    improvedVersion: typeof data.improvedVersion === 'string' ? data.improvedVersion : undefined,
    graderModel: provider,
    graderVersion: GRADER_VERSION,
    underMinWords: wordCount < task.minWords,
    // N-13 — only one rubric revision is tracked today, so it reuses the same
    // constant as graderVersion (see the comment on WritingScore.rubricVersion).
    rubricVersion: GRADER_VERSION,
    // N-13 — `generateJsonWithMeta` (src/lib/aiJson.js) returns only
    // `{ data, provider }`; none of the four provider chains it wraps
    // (Groq/Gemini/Cerebras/OpenRouter, via streamOpenAiCompatible /
    // getGeminiClient) surface a confidence/logprob-like signal, so this is
    // left undefined rather than fabricating a number.
  };
}

/** TZ §3.8 — "(task1 + task2*2) / 3, 0.5 ga yaxlitlanadi" — Task 2 ikki baravar og'irroq. */
export function combineWritingBand(task1: WritingScore, task2: WritingScore): number {
  return clampToHalfBand((task1.band + task2.band * 2) / 3);
}
