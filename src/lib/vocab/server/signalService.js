// Reading / Listening / Writing / Speaking / Mock -> lug'at signallari (TZ §22-§26).
// Boshqa ko'nikma modullari so'zning ishlatilishi natijasini shu yerga yuboradi; ular mastery
// ko'nikma hisoblagichlariga (va xato bo'lsa SRS ga) qo'shiladi. XP berilmaydi (manipulyatsiya xavfi).
import { User } from '@/lib/models';
import { normalizeForCompare } from '@/lib/textCompare';
import { trackVocabEvents } from './ledger';
import { applyWordUpdates, computeWordUpdate } from './words';

const SOURCE_SKILL = {
  reading: 'context',
  listening: 'listening',
  writing: 'writing',
  speaking: 'speaking',
  mock: 'context',
};

export const SIGNAL_SOURCES = Object.keys(SOURCE_SKILL);
const MAX_ITEMS = 40;

/**
 * @param items [{ wordId?, word?, correct: boolean, added?: boolean }]
 * @returns {{ applied:number, unmatched:number, mastered:number }}
 */
export async function applySkillSignals({ userId, source, items, now = new Date() }) {
  const skill = SOURCE_SKILL[source];
  if (!skill) throw new Error("Noma'lum manba");
  const list = (Array.isArray(items) ? items : []).slice(0, MAX_ITEMS);
  if (!list.length) return { applied: 0, unmatched: 0, mastered: 0 };

  const user = await User.findById(userId).select('categories').lean();
  const byId = new Map();
  const byText = new Map();
  for (const cat of user?.categories || []) {
    for (const w of cat.words || []) {
      const hit = { w, cat };
      byId.set(String(w._id), hit);
      const key = normalizeForCompare(w.word);
      if (key && !byText.has(key)) byText.set(key, hit);
    }
  }

  const grouped = new Map(); // wordId -> { hit, results }
  let unmatched = 0;
  const events = [];
  for (const it of list) {
    const hit = (it?.wordId && byId.get(String(it.wordId))) || (it?.word && byText.get(normalizeForCompare(String(it.word)))) || null;
    if (!hit) {
      unmatched += 1;
      continue;
    }
    const id = String(hit.w._id);
    const entry = grouped.get(id) || { hit, results: [] };
    entry.results.push({ skill, isCorrect: !!it.correct, responseMs: null });
    grouped.set(id, entry);
    if (source === 'writing') events.push({ name: 'writing_word_used', payload: { word: hit.w.word, correct: !!it.correct } });
    if (source === 'speaking') events.push({ name: 'speaking_word_used', payload: { word: hit.w.word, correct: !!it.correct } });
    if (it.added && source === 'reading') events.push({ name: 'word_added_from_reading', payload: { word: hit.w.word } });
    if (it.added && source === 'listening') events.push({ name: 'word_added_from_listening', payload: { word: hit.w.word } });
  }

  const updates = [];
  let mastered = 0;
  for (const [wordId, { hit, results }] of grouped) {
    const out = computeWordUpdate(hit.w.stats || {}, results, now);
    updates.push({ categoryId: String(hit.cat._id), wordId, set: out.set });
    if (out.newlyMastered) {
      mastered += 1;
      events.push({ name: 'vocabulary_mastered', payload: { word: hit.w.word } });
    }
  }
  await applyWordUpdates(userId, updates);
  if (events.length) await trackVocabEvents(userId, events);
  return { applied: updates.length, unmatched, mastered };
}

/**
 * Yozuv/nutq matnida foydalanuvchi o'z lug'atidagi qaysi so'zlarni ishlatganini topib, ijobiy signal beradi
 * (TZ §24–§25). Hech qachon xato tashlamaydi — asosiy oqimni (baholash) buzmasligi kerak.
 */
export async function recordTextUsage({ userId, source, text, now = new Date() }) {
  try {
    if (!['writing', 'speaking'].includes(source) || typeof text !== 'string' || text.length < 20) return { applied: 0 };
    const { vocabEngineFlag } = await import('@/lib/vocab/access');
    if (!vocabEngineFlag(String(userId), 'student', process.env).enabled) return { applied: 0 };
    const { findWordInSentence } = await import('@/lib/vocab/games');
    const user = await User.findById(userId).select('categories.words.word categories.words._id').lean();
    const items = [];
    for (const cat of user?.categories || []) {
      for (const w of cat.words || []) {
        if (w?.word && findWordInSentence(text, w.word)) items.push({ wordId: String(w._id), correct: true });
        if (items.length >= MAX_ITEMS) break;
      }
      if (items.length >= MAX_ITEMS) break;
    }
    if (!items.length) return { applied: 0 };
    return await applySkillSignals({ userId, source, items, now });
  } catch (err) {
    console.error('[vocab] recordTextUsage failed', err?.message || err);
    return { applied: 0 };
  }
}

/**
 * Reading/Listening mashqi yakunlanganda: to'g'ri javob berilgan savol matnida (savol, variantlar, to'g'ri javob)
 * foydalanuvchining o'z lug'at so'zi uchraganda — shu so'zga "kontekstda tushundi" signali yoziladi (TZ §22–§23).
 * Faqat IJOBIY signal: noto'g'ri javob so'zni jazolamaydi (savol boshqa narsani sinagan bo'lishi mumkin).
 * Hech qachon xato tashlamaydi — asosiy oqimni (baholash) buzmasligi kerak.
 * @param {{userId:any, source:'reading'|'listening', questions:Array<{prompt?:string, options?:string[], correctAnswer?:string, isCorrect:boolean}>}} args
 */
export async function recordAttemptUsage({ userId, source, questions, now = new Date() }) {
  try {
    if (!['reading', 'listening'].includes(source) || !Array.isArray(questions)) return { applied: 0 };
    const texts = questions
      .filter((q) => q?.isCorrect)
      .map((q) => [q.prompt, ...(Array.isArray(q.options) ? q.options : []), q.correctAnswer].filter((x) => typeof x === 'string').join(' \n '))
      .filter(Boolean);
    if (!texts.length) return { applied: 0 };
    const { vocabEngineFlag } = await import('@/lib/vocab/access');
    if (!vocabEngineFlag(String(userId), 'student', process.env).enabled) return { applied: 0 };
    const { findWordInSentence } = await import('@/lib/vocab/games');
    const user = await User.findById(userId).select('categories.words.word categories.words._id').lean();
    const items = [];
    outer: for (const cat of user?.categories || []) {
      for (const w of cat.words || []) {
        if (w?.word && texts.some((t) => findWordInSentence(t, w.word))) items.push({ wordId: String(w._id), correct: true });
        if (items.length >= MAX_ITEMS) break outer;
      }
    }
    if (!items.length) return { applied: 0 };
    return await applySkillSignals({ userId, source, items, now });
  } catch (err) {
    console.error('[vocab] recordAttemptUsage failed', err?.message || err);
    return { applied: 0 };
  }
}
