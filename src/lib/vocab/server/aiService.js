// AI Vocabulary Engine servis qatlami (TZ §27, §28): rate limit + kunlik kvota + tarif tekshiruvi +
// prompt versiyasi + AI chiqishini tekshirish + zaxira (fallback). AI natijasi hech qachon avtomatik
// production kontentga tushmaydi — foydalanuvchiga AI_GENERATED deb ko'rsatiladi.
import mongoose from 'mongoose';
import { VocabEvent } from '@/lib/models';
import { generateJsonWithMeta } from '@/lib/aiJson';
import { checkAndIncrementAiRateLimit, logAiError, rateLimitMessage } from '@/lib/ai/client';
import { TIER_VOCAB_LIMITS } from '@/lib/vocab/config';
import {
  AI_DAILY_QUOTA,
  AI_PROMPT_VERSIONS,
  EXERCISES_SCHEMA,
  STORY_SCHEMA,
  buildCoachMessage,
  buildExercisesPrompt,
  buildStoryPrompt,
  validateExercises,
  validateStory,
} from '@/lib/vocab/ai';
import { localDateWithCutoff } from '@/lib/srs';
import { effectiveStreak } from '@/lib/vocab/streak';
import { flattenUserWords } from './words';
import { getQuestViews } from './questService';
import { tierOf, ServiceError } from './sessionService';
import { trackVocabEvents } from './ledger';

const MAX_STORY_WORDS = 8;
const MAX_EXERCISE_WORDS = 6;
const DAY = 24 * 3600 * 1000;

// ---------------------------------------------------------------------------
// Coach — LLM'siz, real o'quv ma'lumotiga asoslangan (barcha tariflar uchun)
// ---------------------------------------------------------------------------
export async function coachForUser(user, now = new Date(), locale = 'uz') {
  const tz = user.timezone || 'Asia/Tashkent';
  const words = flattenUserWords(user, { now });
  const dueWords = words.filter((w) => w.nextReview && new Date(w.nextReview).getTime() <= now.getTime() && (w.reps || 0) > 0);
  const overdue = dueWords.filter((w) => now.getTime() - new Date(w.nextReview).getTime() >= DAY);

  // So'nggi 48 soatdagi xatolar (eng yangisi birinchi) — so'z statistikasidagi lastWrongAt bo'yicha.
  const recent = [];
  for (const cat of user.categories || []) {
    for (const w of cat.words || []) {
      const t = w.stats?.lastWrongAt ? new Date(w.stats.lastWrongAt).getTime() : 0;
      if (t && now.getTime() - t <= 2 * DAY) recent.push({ word: w.word, t });
    }
  }
  recent.sort((a, b) => b.t - a.t);

  const streak = effectiveStreak(
    { streak: user.reviewStreak || 0, lastDate: user.lastReviewDate || null, freezes: user.streakFreezes || 0, longest: user.longestReviewStreak || 0 },
    now,
    tz
  );
  const quests = await getQuestViews({ userId: user._id, timeZone: tz, now });
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(now)) % 24;

  return buildCoachMessage({
    name: user.name || '',
    dueCount: dueWords.length,
    overdueCount: overdue.length,
    weakCount: words.filter((w) => (w.weakness || 0) >= 40 || w.isLeech).length,
    recentMistakes: recent.slice(0, 3).map((r) => r.word),
    streak: streak.streak,
    streakAtRisk: streak.atRisk,
    dailyDone: quests.daily.filter((q) => q.done).length,
    dailyTotal: quests.daily.length,
    newAvailable: words.filter((w) => (w.srsState || 'new') === 'new' && !(w.reps || 0)).length,
    hourLocal: hour,
  }, locale);
}

// ---------------------------------------------------------------------------
// Umumiy AI kirish tekshiruvi
// ---------------------------------------------------------------------------
async function aiGate(user) {
  const tier = tierOf(user);
  if (!TIER_VOCAB_LIMITS[tier].aiExercises) {
    throw new ServiceError(403, "AI mashqlar va hikoyalar Premium rejada ochiladi. /narxlar sahifasidan tarifni yangilang.", 'tier');
  }
  const quota = AI_DAILY_QUOTA[tier];
  if (quota != null) {
    const today = localDateWithCutoff(new Date(), user.timezone || 'Asia/Tashkent');
    const since = new Date(Date.now() - 36 * 3600 * 1000);
    const evs = await VocabEvent.find({ userId: new mongoose.Types.ObjectId(String(user._id)), name: 'ai_exercise_generated', createdAt: { $gte: since } }, { createdAt: 1 }).lean();
    const used = evs.filter((e) => localDateWithCutoff(new Date(e.createdAt), user.timezone || 'Asia/Tashkent') === today).length;
    if (used >= quota) throw new ServiceError(429, `Bugungi AI limiti (${quota} ta) tugadi. Ertaga qayta urinib ko'ring.`, 'ai_quota');
  }
  const rl = await checkAndIncrementAiRateLimit(String(user._id));
  if (!rl.allowed) throw new ServiceError(429, rateLimitMessage(rl.retryAfterMinutes), 'rate_limited');
}

function pickWords(user, wordIds, max, now) {
  const all = flattenUserWords(user, { now });
  let chosen;
  if (Array.isArray(wordIds) && wordIds.length) {
    const ids = new Set(wordIds.map(String));
    chosen = all.filter((w) => ids.has(w.wordId));
  } else {
    // zaif so'zlar birinchi, keyin yaqinda o'rganilayotganlar
    chosen = all.slice().sort((a, b) => (b.weakness || 0) - (a.weakness || 0));
  }
  return chosen.slice(0, max);
}

// ---------------------------------------------------------------------------
// AI mini hikoya
// ---------------------------------------------------------------------------
export async function generateStoryForUser(user, { wordIds } = {}, now = new Date()) {
  await aiGate(user);
  const chosen = pickWords(user, wordIds, MAX_STORY_WORDS, now);
  if (chosen.length < 3) throw new ServiceError(422, "Hikoya uchun kamida 3 ta so'z kerak.", 'not_enough_words');
  const words = chosen.map((w) => w.word);
  const cefr = chosen.find((w) => w.cefr)?.cefr || 'B1';

  let story = null;
  let provider = null;
  let validation = null;
  try {
    const { data, provider: p } = await generateJsonWithMeta(buildStoryPrompt(words, cefr), STORY_SCHEMA);
    provider = p;
    validation = validateStory(data, words);
    if (validation.ok) story = data;
  } catch (err) {
    logAiError(err, { endpoint: 'vocabulary/story', userId: String(user._id) });
  }

  await trackVocabEvents(new mongoose.Types.ObjectId(String(user._id)), [{ name: 'ai_exercise_generated', payload: { kind: 'story', words: words.length, ok: !!story, version: AI_PROMPT_VERSIONS.story } }]);

  if (story) {
    return {
      status: 'AI_GENERATED',
      promptVersion: AI_PROMPT_VERSIONS.story,
      provider,
      fallback: false,
      words: chosen.map((w) => ({ wordId: w.wordId, word: w.word })),
      usedWords: validation.usedWords,
      missingWords: validation.missingWords,
      ...story,
    };
  }

  // Zaxira: AI ishlamasa, foydalanuvchining o'z misol gaplarini birlashtirib beramiz (haqiqiy, tekshirilgan kontent).
  const sentences = chosen.map((w) => w.examples?.[0]?.en).filter(Boolean);
  if (!sentences.length) throw new ServiceError(502, "AI hozir javob bermadi. Keyinroq qayta urinib ko'ring.", 'ai_unavailable');
  return {
    status: 'AI_GENERATED',
    promptVersion: AI_PROMPT_VERSIONS.story,
    provider: null,
    fallback: true,
    words: chosen.map((w) => ({ wordId: w.wordId, word: w.word })),
    usedWords: words,
    missingWords: [],
    title: "So'zlaringiz kontekstda",
    story: sentences.join(' '),
    summaryUz: "AI hozir band — o'rniga so'zlaringizning o'z misol gaplari ko'rsatildi.",
    question: '',
  };
}

// ---------------------------------------------------------------------------
// AI mashqlar
// ---------------------------------------------------------------------------
export async function generateExercisesForUser(user, { wordIds } = {}, now = new Date()) {
  await aiGate(user);
  const chosen = pickWords(user, wordIds, MAX_EXERCISE_WORDS, now);
  if (!chosen.length) throw new ServiceError(422, "Mashq uchun so'z topilmadi.", 'not_enough_words');

  let result = null;
  let provider = null;
  try {
    const { data, provider: p } = await generateJsonWithMeta(buildExercisesPrompt(chosen.map((w) => ({ word: w.word, translations: w.translations })), 2), EXERCISES_SCHEMA);
    provider = p;
    result = validateExercises(data, chosen.map((w) => w.word));
  } catch (err) {
    logAiError(err, { endpoint: 'vocabulary/exercises', userId: String(user._id) });
  }

  await trackVocabEvents(new mongoose.Types.ObjectId(String(user._id)), [{ name: 'ai_exercise_generated', payload: { kind: 'exercises', words: chosen.length, ok: !!result?.valid.length, version: AI_PROMPT_VERSIONS.exercises } }]);

  if (!result || !result.valid.length) throw new ServiceError(502, "AI mashqlarni tuza olmadi. Keyinroq qayta urinib ko'ring.", 'ai_unavailable');
  return {
    status: 'AI_GENERATED',
    promptVersion: AI_PROMPT_VERSIONS.exercises,
    provider,
    exercises: result.valid,
    rejected: result.rejected,
  };
}
