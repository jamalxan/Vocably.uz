// AI Vocabulary Engine yordamchilari (TZ §27, §28): prompt'lar versiyalangan, AI chiqishi
// qat'iy tekshiriladi, shaxsiy ma'lumot yuborilmaydi (faqat so'z matni — TZ §36 "minimum necessary").
// "AI foydalanuvchining o'rniga essay yozib bermasin" (TZ §24) — bu modul faqat o'quv materiali
// (qisqa hikoya, mashq) yaratadi; hamma natija AI_GENERATED holatida, production kontentga avtomatik tushmaydi.
import { findWordInSentence } from './games';

export const AI_PROMPT_VERSIONS = {
  story: 'vocab_story_v1',
  exercises: 'vocab_exercises_v1',
};

/** Kunlik AI kvotalari (tarifga qarab; null = tarifdagi umumiy soatlik chegaraga tayanadi). */
export const AI_DAILY_QUOTA = { free: 0, standard: 0, premium: 30 } as const;

export type AiStatus = 'AI_GENERATED';

// ---------------------------------------------------------------------------
// AI Personal Coach — haqiqiy o'quv ma'lumotiga asoslangan (LLM'siz, deterministik)
// ---------------------------------------------------------------------------
export interface CoachContext {
  name?: string;
  dueCount: number;
  overdueCount: number;
  weakCount: number;
  /** So'nggi 48 soatda xato qilingan so'zlar (eng yangisi birinchi). */
  recentMistakes: string[];
  streak: number;
  streakAtRisk: boolean;
  dailyDone: number;
  dailyTotal: number;
  newAvailable: number;
  hourLocal?: number;
}

export interface CoachMessage {
  message: string;
  /** Tavsiya etilgan keyingi harakat (UI tugma uchun). */
  action: { label: string; href: string };
  tone: 'greeting' | 'nudge' | 'celebrate';
}

function joinWords(words: string[]): string {
  const w = words.slice(0, 2).map((x) => `"${x}"`);
  return w.length === 2 ? `${w[0]} va ${w[1]}` : w[0] || '';
}

export function buildCoachMessage(c: CoachContext): CoachMessage {
  const hello = c.hourLocal != null ? (c.hourLocal < 12 ? 'Xayrli tong' : c.hourLocal < 18 ? 'Xayrli kun' : 'Xayrli kech') : 'Salom';
  const parts: string[] = [];

  if (c.dueCount > 0) {
    parts.push(`Bugun ${c.dueCount} ta so'zingiz takrorlash uchun tayyor${c.overdueCount > 0 ? ` (${c.overdueCount} tasining muddati o'tgan)` : ''}.`);
  }
  if (c.recentMistakes.length > 0) {
    parts.push(`Yaqinda ${joinWords(c.recentMistakes)} so'zlarida xato qilgansiz — avval shu so'zlardan boshlaymiz.`);
  }

  let action: CoachMessage['action'];
  let tone: CoachMessage['tone'] = 'greeting';

  if (c.recentMistakes.length > 0 || c.weakCount >= 5) {
    action = { label: "Zaif so'zlar bilan mashq", href: '/app/oyinlar/multiple_choice?mode=weak' };
  } else if (c.dueCount > 0) {
    action = { label: 'Takrorlashni boshlash', href: '/app/lugat/takrorlash' };
  } else if (c.newAvailable > 0) {
    action = { label: "Yangi so'zlarni o'rganish", href: '/app/lugat/kartochka' };
    parts.push("Takrorlash navbati bo'sh — yangi so'zlar bilan tanishish uchun yaxshi payt.");
  } else {
    action = { label: "O'yin o'ynash", href: '/app/oyinlar' };
  }

  if (c.dailyTotal > 0 && c.dailyDone >= c.dailyTotal) {
    parts.unshift('Ajoyib! Bugungi barcha kunlik vazifalarni bajardingiz.');
    tone = 'celebrate';
  } else if (c.streakAtRisk && c.streak > 0) {
    parts.push(`${c.streak} kunlik seriyangizni davom ettirish uchun bugun qisqa mashq qilish yetarli.`);
    tone = 'nudge';
  } else if (c.streak >= 7) {
    parts.push(`${c.streak} kun ketma-ket — zo'r ketyapsiz!`);
  }

  if (parts.length === 0) parts.push("Bugun hammasi joyida. Xohlasangiz bitta o'yin bilan so'zlarni mustahkamlang.");
  return { message: `${hello}${c.name ? `, ${c.name}` : ''}! ${parts.join(' ')}`, action, tone };
}

// ---------------------------------------------------------------------------
// AI mini story
// ---------------------------------------------------------------------------
export const STORY_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    story: { type: 'string' },
    summaryUz: { type: 'string' },
    question: { type: 'string' },
  },
  required: ['title', 'story', 'summaryUz', 'question'],
};

export function buildStoryPrompt(words: string[], cefr = 'B1'): string {
  const list = words.map((w) => `"${w}"`).join(', ');
  return `Ingliz tili o'rganuvchisi (${cefr} daraja) uchun qisqa, tabiiy hikoya yoz (90-140 so'z).
Hikoyada quyidagi so'zlarning HAMMASI ishlatilsin (kerak bo'lsa grammatik shaklda): ${list}.
Talablar:
- Sodda, aniq, hayotiy vaziyat; ${cefr} darajaga mos grammatika.
- So'zlarni ** ** belgilari ichida ajrat (masalan **maintain**).
- title: qisqa sarlavha.
- summaryUz: hikoyaning 1-2 gapli o'zbekcha mazmuni.
- question: hikoya bo'yicha 1 ta inglizcha tushunish savoli.
Faqat JSON sxemaga mos javob ber.`;
}

export interface StoryOutput {
  title: string;
  story: string;
  summaryUz: string;
  question: string;
}

export interface StoryValidation {
  ok: boolean;
  usedWords: string[];
  missingWords: string[];
  wordCount: number;
  reason?: string;
}

/** AI hikoyasini tekshiradi: matn bor, uzunlik mantiqiy, so'zlar qanchasi ishlatilgan. */
export function validateStory(out: Partial<StoryOutput> | null | undefined, words: string[]): StoryValidation {
  if (!out || typeof out.story !== 'string' || !out.story.trim() || typeof out.title !== 'string') {
    return { ok: false, usedWords: [], missingWords: words, wordCount: 0, reason: 'empty' };
  }
  const clean = out.story.replace(/\*\*/g, '');
  const wordCount = clean.trim().split(/\s+/).filter(Boolean).length;
  const used: string[] = [];
  const missing: string[] = [];
  for (const w of words) (findWordInSentence(clean, w) ? used : missing).push(w);
  if (wordCount < 40 || wordCount > 260) return { ok: false, usedWords: used, missingWords: missing, wordCount, reason: 'length' };
  // Kamida 70% so'z ishlatilgan bo'lsa qabul qilamiz (AI ba'zan shaklni keskin o'zgartiradi).
  const ok = words.length === 0 || used.length / words.length >= 0.7;
  return { ok, usedWords: used, missingWords: missing, wordCount, reason: ok ? undefined : 'missing_words' };
}

// ---------------------------------------------------------------------------
// AI exercise generation
// ---------------------------------------------------------------------------
export const EXERCISE_TYPES = ['multiple_choice', 'fill_gap', 'sentence_completion', 'synonym', 'antonym', 'context', 'translation'] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const EXERCISES_SCHEMA = {
  type: 'object',
  properties: {
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string' },
          type: { type: 'string', enum: [...EXERCISE_TYPES] },
          prompt: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answer: { type: 'string' },
          explanationUz: { type: 'string' },
        },
        required: ['word', 'type', 'prompt', 'answer', 'explanationUz'],
      },
    },
  },
  required: ['exercises'],
};

export function buildExercisesPrompt(words: Array<{ word: string; translations: string[] }>, perWord = 2): string {
  const list = words.map((w) => `- "${w.word}"${w.translations.length ? ` (o'zbekcha: ${w.translations.slice(0, 2).join(', ')})` : ''}`).join('\n');
  return `Quyidagi so'zlar uchun har biriga ${perWord} tadan IELTS darajasiga mos mashq tuz:
${list}

Mashq turlari: ${EXERCISE_TYPES.join(', ')}.
Qoidalar:
- multiple_choice / synonym / antonym: aynan 4 ta variant (options), answer — variantlardan biri.
- fill_gap / sentence_completion / context: prompt ichida "_____" bo'lsin; answer — yetishmayotgan so'z/ibora.
- translation: prompt — o'zbekcha gap, answer — inglizcha tarjima (qisqa).
- explanationUz: nima uchun aynan shu javob to'g'riligini o'zbekcha qisqa tushuntir.
- Mashqlar bir-birini takrorlamasin. Faqat JSON sxemaga mos javob ber.`;
}

export interface RawExercise {
  word?: unknown;
  type?: unknown;
  prompt?: unknown;
  options?: unknown;
  answer?: unknown;
  explanationUz?: unknown;
}

export interface Exercise {
  word: string;
  type: ExerciseType;
  prompt: string;
  options?: string[];
  answer: string;
  explanationUz: string;
  status: AiStatus;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** AI mashqlarini qat'iy tekshiradi; yaroqsizlarini tashlab yuboradi (tuzatishga urinmaydi). */
export function validateExercises(raw: unknown, allowedWords: string[]): { valid: Exercise[]; rejected: number } {
  const list = Array.isArray((raw as { exercises?: unknown })?.exercises) ? ((raw as { exercises: RawExercise[] }).exercises) : [];
  const allowed = new Set(allowedWords.map((w) => w.toLowerCase()));
  const valid: Exercise[] = [];
  let rejected = 0;
  for (const r of list) {
    if (!r || typeof r !== 'object') {
      rejected += 1;
      continue;
    }
    const word = str(r.word);
    const type = str(r.type) as ExerciseType;
    const prompt = str(r.prompt);
    const answer = str(r.answer);
    const explanationUz = str(r.explanationUz);
    if (!word || !prompt || !answer || !explanationUz || !(EXERCISE_TYPES as readonly string[]).includes(type) || !allowed.has(word.toLowerCase())) {
      rejected += 1;
      continue;
    }
    const isChoice = type === 'multiple_choice' || type === 'synonym' || type === 'antonym';
    const isGap = type === 'fill_gap' || type === 'sentence_completion' || type === 'context';
    let options: string[] | undefined;
    if (isChoice) {
      options = Array.isArray(r.options) ? (r.options as unknown[]).map(str).filter(Boolean) : [];
      const unique = Array.from(new Set(options.map((o) => o.toLowerCase())));
      if (options.length !== 4 || unique.length !== 4 || !options.some((o) => o.toLowerCase() === answer.toLowerCase())) {
        rejected += 1;
        continue;
      }
    }
    if (isGap && !prompt.includes('_____')) {
      rejected += 1;
      continue;
    }
    valid.push({ word, type, prompt, ...(options ? { options } : {}), answer, explanationUz, status: 'AI_GENERATED' });
  }
  return { valid, rejected };
}
