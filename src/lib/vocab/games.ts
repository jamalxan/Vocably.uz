// O'yin katalogi va savol generatsiyasi (TZ §9-§11, §8).
// "Games alohida modul emas — vocabulary engine'ga ulanadigan learning interface":
// barcha o'yinlar bitta generatordan o'tadi, har bir savol mastery o'lchovi (skill)ga bog'langan.
// Bu yerdagi savollarning to'g'ri javobi SERVERda saqlanadi — klientga faqat `toClientQuestion`
// qaytargan (javobsiz) ko'rinish beriladi.
import { levenshtein } from '../levenshtein';
import { normalizeForCompare } from '../textCompare';
import { type Difficulty, type SkillKey, type Tier } from './config';
import { pick, sample, shuffle, type Rand } from './rng';

// ---------------------------------------------------------------------------
// Kirish: o'yin uchun so'z
// ---------------------------------------------------------------------------
export interface GameWord {
  wordId: string;
  categoryId: string;
  word: string;
  /** O'zbekcha tarjimalar (User.categories[].words[].syns). */
  translations: string[];
  definitionEn?: string;
  definitionUz?: string;
  examples?: Array<{ en: string; uz?: string }>;
  synonymsEn?: string[];
  antonyms?: string[];
  collocations?: string[];
  pos?: string;
  cefr?: string;
}

// ---------------------------------------------------------------------------
// Katalog
// ---------------------------------------------------------------------------
export type GameKey =
  | 'word_match'
  | 'memory'
  | 'multiple_choice'
  | 'listen_choose'
  | 'listen_type'
  | 'word_drop'
  | 'fill_gap'
  | 'sentence_builder'
  | 'definition_challenge'
  | 'synonym_antonym'
  | 'speed_challenge'
  | 'vocabulary_boss';

export type Priority = 'P0' | 'P1' | 'P2';

export interface GameDefinition {
  key: GameKey;
  title: string;
  description: string;
  priority: Priority;
  /** Shu o'yinni ochish uchun minimal tarif. */
  minTier: Tier;
  /** UI ikonka nomi (lucide-react). */
  icon: string;
  /** Asosiy mastery o'lchovi. */
  skill: SkillKey;
  /** O'yin uchun kerakli minimal so'z soni. */
  minWords: number;
  /** Savollar soni (raund soni — match/memory uchun) qiyinlik bo'yicha. */
  questionCount: Record<Difficulty, number>;
  /** Har savol uchun vaqt chegarasi (soniya; null = cheksiz). */
  timePerQuestionSec: Record<Difficulty, number | null>;
  /** "Jon" soni (null = cheksiz) — word_drop kabi o'yinlar uchun. */
  lives: number | null;
  /** Feedback darhol (har javobdan keyin) ko'rsatiladimi, yoki batch oxirida. */
  instantFeedback: boolean;
  /** Bu o'yin tinglashga (audio) tayanadi. */
  needsAudio: boolean;
}

const cnt = (e: number, m: number, h: number, x: number): Record<Difficulty, number> => ({ easy: e, medium: m, hard: h, expert: x });
const tm = (e: number | null, m: number | null, h: number | null, x: number | null): Record<Difficulty, number | null> => ({
  easy: e,
  medium: m,
  hard: h,
  expert: x,
});

export const GAME_CATALOG: GameDefinition[] = [
  {
    key: 'word_match',
    title: "So'z juftligi",
    description: "So'z ↔ tarjima juftliklarini toping",
    priority: 'P0',
    minTier: 'free',
    icon: 'Link2',
    skill: 'recall',
    minWords: 4,
    questionCount: cnt(2, 3, 3, 4),
    timePerQuestionSec: tm(null, null, 60, 45),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'multiple_choice',
    title: 'Ko\'p variantli test',
    description: "To'g'ri variantni tanlang — qiyinlik sizga moslashadi",
    priority: 'P0',
    minTier: 'free',
    icon: 'ListChecks',
    skill: 'recall',
    minWords: 4,
    questionCount: cnt(8, 10, 12, 15),
    timePerQuestionSec: tm(null, null, 20, 12),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'fill_gap',
    title: "Bo'sh joyni to'ldiring",
    description: "Avval variantlar bilan, keyin variantsiz",
    priority: 'P0',
    minTier: 'free',
    icon: 'PenSquare',
    skill: 'context',
    minWords: 4,
    questionCount: cnt(8, 10, 10, 12),
    timePerQuestionSec: tm(null, null, 40, 30),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'listen_choose',
    title: 'Eshiting va tanlang',
    description: "Audio → to'g'ri so'zni tanlang",
    priority: 'P0',
    minTier: 'free',
    icon: 'Ear',
    skill: 'listening',
    minWords: 4,
    questionCount: cnt(8, 10, 12, 15),
    timePerQuestionSec: tm(null, null, 20, 12),
    lives: null,
    instantFeedback: true,
    needsAudio: true,
  },
  {
    key: 'listen_type',
    title: 'Eshiting va yozing',
    description: "Audio → so'zning aniq imlosi",
    priority: 'P0',
    minTier: 'standard',
    icon: 'Headphones',
    skill: 'spelling',
    minWords: 3,
    questionCount: cnt(6, 8, 10, 12),
    timePerQuestionSec: tm(null, null, 45, 30),
    lives: null,
    instantFeedback: true,
    needsAudio: true,
  },
  {
    key: 'word_drop',
    title: "So'z yomg'iri",
    description: "Tushayotgan tarjimaga mos so'zni vaqtida yozing",
    priority: 'P1',
    minTier: 'standard',
    icon: 'CloudRain',
    skill: 'spelling',
    minWords: 3,
    questionCount: cnt(10, 12, 15, 18),
    timePerQuestionSec: tm(14, 11, 8, 6),
    lives: 3,
    instantFeedback: false,
    needsAudio: false,
  },
  {
    key: 'memory',
    title: 'Xotira kartalari',
    description: "Yopiq kartalarni oching, juftliklarni toping",
    priority: 'P1',
    minTier: 'free',
    icon: 'Grid',
    skill: 'recall',
    minWords: 4,
    questionCount: cnt(2, 3, 3, 4),
    timePerQuestionSec: tm(null, null, 90, 60),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'sentence_builder',
    title: 'Jumla quruvchi',
    description: "Aralashgan so'zlardan to'g'ri jumla tuzing",
    priority: 'P1',
    minTier: 'standard',
    icon: 'Rows',
    skill: 'context',
    minWords: 3,
    questionCount: cnt(5, 6, 8, 10),
    timePerQuestionSec: tm(null, null, 60, 45),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'speed_challenge',
    title: 'Tezlik sinovi',
    description: 'Vaqtga qarshi savollar',
    priority: 'P1',
    minTier: 'standard',
    icon: 'Zap',
    skill: 'recall',
    minWords: 4,
    questionCount: cnt(15, 20, 25, 30),
    timePerQuestionSec: tm(8, 6, 5, 4),
    lives: null,
    instantFeedback: false,
    needsAudio: false,
  },
  {
    key: 'definition_challenge',
    title: "Ta'rif → so'z",
    description: "Ingliz tilidagi ta'rifdan so'zni toping",
    priority: 'P1',
    minTier: 'standard',
    icon: 'BookOpen',
    skill: 'recall',
    minWords: 4,
    questionCount: cnt(6, 8, 10, 12),
    timePerQuestionSec: tm(null, null, 30, 20),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'synonym_antonym',
    title: 'Sinonim / Antonim',
    description: 'Academic/IELTS lug\'at uchun',
    priority: 'P1',
    minTier: 'standard',
    icon: 'Swords',
    skill: 'synonym',
    minWords: 4,
    questionCount: cnt(6, 8, 10, 12),
    timePerQuestionSec: tm(null, null, 25, 15),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    key: 'vocabulary_boss',
    title: 'Vocabulary Boss',
    description: "Haftalik keng qamrovli sinov: ma'no, tinglash, imlo, kontekst, sinonim",
    priority: 'P2',
    minTier: 'premium',
    icon: 'Crown',
    skill: 'recall',
    minWords: 8,
    questionCount: cnt(25, 50, 50, 50),
    timePerQuestionSec: tm(null, null, 30, 20),
    lives: null,
    instantFeedback: true,
    needsAudio: true,
  },
];

export function getGame(key: string): GameDefinition | undefined {
  return GAME_CATALOG.find((g) => g.key === key);
}

// Tarif tartibi
const TIER_RANK: Record<Tier, number> = { free: 0, standard: 1, premium: 2 };
export function tierAllows(userTier: Tier, minTier: Tier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

// ---------------------------------------------------------------------------
// Savol modeli
// ---------------------------------------------------------------------------
export type QuestionKind =
  | 'mc_meaning'
  | 'mc_word'
  | 'definition'
  | 'syn_ant'
  | 'fill_choice'
  | 'fill_typed'
  | 'listen_choose'
  | 'listen_type'
  | 'sentence_build'
  | 'match_pairs'
  | 'memory_pairs'
  | 'spell_drop';

export type InputType = 'choice' | 'typed' | 'arrange' | 'match';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface GameQuestion {
  qid: string;
  kind: QuestionKind;
  inputType: InputType;
  /** Shu savol natijasi yangilaydigan mastery o'lchovi. */
  skill: SkillKey;
  secondarySkill?: SkillKey;
  wordId: string;
  categoryId: string;
  /** Tahlil/xatolar ro'yxati uchun (klientga ham beriladi). */
  word: string;
  prompt: string;
  /** TTS orqali o'qiladigan matn (audio savollar). */
  audioText?: string;
  hint?: string;
  options?: QuestionOption[];
  /** arrange: aralashgan bo'laklar */
  tokens?: string[];
  /** match: chap/o'ng ustunlar (o'ng id'lar maxfiy). */
  lefts?: Array<{ id: string; text: string; wordId: string }>;
  rights?: Array<{ id: string; text: string }>;
  timeLimitSec?: number | null;
  explanation: string;
  /**
   * Faqat 'memory_pairs': kartalarni ochganda juftlik mosligini mijozda darhol ko'rsatish uchun.
   * (Bu foydalanuvchining o'z so'zlari — sir emas; yakuniy natija baribir SERVERda tekshiriladi.)
   */
  memoryMap?: Record<string, string>;
  // --- faqat server ---
  answer?: string; // choice: option id
  accepted?: string[]; // typed: normallashgan qabul qilinadigan javoblar
  answerTokens?: string[]; // arrange
  answerMap?: Record<string, string>; // match: leftId -> rightId
  correctDisplay: string; // javobdan keyin ko'rsatiladigan to'g'ri javob matni
  difficulty: Difficulty;
}

export const SERVER_ONLY_FIELDS = ['answer', 'accepted', 'answerTokens', 'answerMap', 'correctDisplay'] as const;

/** Klientga yuboriladigan (javobsiz) ko'rinish. */
export function toClientQuestion(q: GameQuestion): Omit<GameQuestion, (typeof SERVER_ONLY_FIELDS)[number]> {
  const { answer, accepted, answerTokens, answerMap, correctDisplay, ...rest } = q;
  void answer;
  void accepted;
  void answerTokens;
  void answerMap;
  void correctDisplay;
  return rest;
}

// ---------------------------------------------------------------------------
// Yordamchilar
// ---------------------------------------------------------------------------
function norm(s: string): string {
  return normalizeForCompare(String(s || ''));
}

function uniqueBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = key(it);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

function optionsFrom(correct: string, distractors: string[], rand: Rand): { options: QuestionOption[]; answerId: string } {
  const all = shuffle([{ text: correct, ok: true }, ...distractors.map((d) => ({ text: d, ok: false }))], rand);
  const options = all.map((o, i) => ({ id: `o${i + 1}`, text: o.text }));
  const answerId = options[all.findIndex((o) => o.ok)].id;
  return { options, answerId };
}

/** Yaqin (shakli o'xshash) distraktorlar oldinga — qiyin rejimlar uchun. */
function rankBySimilarity(target: string, candidates: string[]): string[] {
  const t = norm(target);
  return candidates
    .slice()
    .sort((a, b) => levenshtein(t, norm(a)) - levenshtein(t, norm(b)));
}

/** Distraktor tanlash: takrorlarsiz, to'g'ri javobga teng emas. */
function pickDistractors(correctAll: string[], pool: string[], n: number, rand: Rand, similar = false, target = ''): string[] {
  const banned = new Set(correctAll.map(norm));
  const unique = uniqueBy(pool, norm).filter((p) => !banned.has(norm(p)));
  if (unique.length <= n) return shuffle(unique, rand).slice(0, n);
  if (similar && target) {
    const ranked = rankBySimilarity(target, unique);
    // eng yaqin 2n tasidan tasodifiy n ta
    return sample(ranked.slice(0, Math.max(n + 2, n * 2)), n, rand);
  }
  return sample(unique, n, rand);
}

function optionCountFor(d: Difficulty): number {
  return d === 'easy' ? 3 : d === 'expert' ? 5 : 4;
}

function explain(w: GameWord): string {
  const tr = w.translations.filter(Boolean).join(', ');
  const ex = w.examples?.[0]?.en;
  return [`"${w.word}"${tr ? ` — ${tr}` : ''}`, ex ? `Misol: ${ex}` : ''].filter(Boolean).join('. ');
}

function escapeRegExp(str: string): string {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Gapdagi so'zning (ehtimoliy tuslangan) shaklini topadi. */
export function findWordInSentence(sentence: string, word: string): { surface: string; index: number } | null {
  const base = word.trim();
  if (!base || !sentence) return null;
  const variants = new Set<string>();
  const lower = base.toLowerCase();
  variants.add(`${escapeRegExp(base)}(?:s|es|ed|d|ing|ly|er|est|ment|ness)?`);
  if (lower.endsWith('y') && lower.length > 2) variants.add(`${escapeRegExp(base.slice(0, -1))}(?:ies|ied|ying|ily)`);
  if (lower.endsWith('e') && lower.length > 2) variants.add(`${escapeRegExp(base.slice(0, -1))}ing`);
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(lower)) variants.add(`${escapeRegExp(base)}${escapeRegExp(base.slice(-1))}(?:ed|ing|er)`);
  for (const v of variants) {
    const m = new RegExp(`(?<![A-Za-z])(${v})(?![A-Za-z])`, 'i').exec(sentence);
    if (m) return { surface: m[1], index: m.index };
  }
  return null;
}

export function blankSentence(sentence: string, found: { surface: string; index: number }): string {
  return sentence.slice(0, found.index) + '_____' + sentence.slice(found.index + found.surface.length);
}

/** Yozma javob uchun qabul qilinadigan shakllar (normallashgan). */
export function acceptedForWord(word: string, surface?: string): string[] {
  const list = [norm(word)];
  if (surface) list.push(norm(surface));
  return Array.from(new Set(list.filter(Boolean)));
}

function firstLetterHint(word: string): string {
  const w = word.trim();
  return `${w.charAt(0)}${'_ '.repeat(Math.max(0, w.length - 1)).trim()} (${w.length} harf)`;
}

function tokenizeSentence(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Savol generatorlari — mos kelmasa null qaytaradi.
// ---------------------------------------------------------------------------
interface Ctx {
  word: GameWord;
  pool: GameWord[];
  difficulty: Difficulty;
  rand: Rand;
  index: number;
  timeLimit: number | null;
}

function base(ctx: Ctx, kind: QuestionKind, inputType: InputType, skill: SkillKey): Pick<GameQuestion, 'qid' | 'kind' | 'inputType' | 'skill' | 'wordId' | 'categoryId' | 'word' | 'timeLimitSec' | 'explanation' | 'difficulty'> {
  return {
    qid: `q${ctx.index + 1}`,
    kind,
    inputType,
    skill,
    wordId: ctx.word.wordId,
    categoryId: ctx.word.categoryId,
    word: ctx.word.word,
    timeLimitSec: ctx.timeLimit,
    explanation: explain(ctx.word),
    difficulty: ctx.difficulty,
  };
}

function genMcMeaning(ctx: Ctx): GameQuestion | null {
  const { word, pool, rand, difficulty } = ctx;
  const own = word.translations.filter(Boolean);
  if (!own.length) return null;
  const correct = pick(own, rand)!;
  const poolTr = pool.filter((p) => p.wordId !== word.wordId).flatMap((p) => p.translations.filter(Boolean));
  const dis = pickDistractors(own, poolTr, optionCountFor(difficulty) - 1, rand, difficulty === 'hard' || difficulty === 'expert', correct);
  if (dis.length < 2) return null;
  const { options, answerId } = optionsFrom(correct, dis, rand);
  return {
    ...base(ctx, 'mc_meaning', 'choice', 'recall'),
    prompt: word.word,
    audioText: word.word,
    options,
    answer: answerId,
    correctDisplay: correct,
  };
}

function genMcWord(ctx: Ctx): GameQuestion | null {
  const { word, pool, rand, difficulty } = ctx;
  const tr = word.translations.filter(Boolean);
  if (!tr.length) return null;
  const others = pool.filter((p) => p.wordId !== word.wordId).map((p) => p.word);
  const dis = pickDistractors([word.word], others, optionCountFor(difficulty) - 1, rand, difficulty === 'hard' || difficulty === 'expert', word.word);
  if (dis.length < 2) return null;
  const { options, answerId } = optionsFrom(word.word, dis, rand);
  return {
    ...base(ctx, 'mc_word', 'choice', 'recall'),
    prompt: tr.slice(0, 2).join(', '),
    options,
    answer: answerId,
    correctDisplay: word.word,
  };
}

function genDefinition(ctx: Ctx): GameQuestion | null {
  const { word, pool, rand, difficulty } = ctx;
  const def = (word.definitionEn || '').trim();
  if (!def) return null;
  const others = pool.filter((p) => p.wordId !== word.wordId).map((p) => p.word);
  const dis = pickDistractors([word.word], others, optionCountFor(difficulty) - 1, rand, difficulty === 'hard' || difficulty === 'expert', word.word);
  if (dis.length < 2) return null;
  const { options, answerId } = optionsFrom(word.word, dis, rand);
  return {
    ...base(ctx, 'definition', 'choice', 'recall'),
    prompt: def,
    options,
    answer: answerId,
    correctDisplay: word.word,
  };
}

function genSynAnt(ctx: Ctx): GameQuestion | null {
  const { word, pool, rand, difficulty } = ctx;
  const syn = (word.synonymsEn || []).filter(Boolean);
  const ant = (word.antonyms || []).filter(Boolean);
  if (!syn.length && !ant.length) return null;
  const useAnt = ant.length > 0 && (syn.length === 0 || rand() < 0.4);
  const correct = pick(useAnt ? ant : syn, rand)!;
  const forbidden = [word.word, ...syn, ...ant];
  const poolWords = pool
    .filter((p) => p.wordId !== word.wordId)
    .flatMap((p) => [p.word, ...(p.synonymsEn || []), ...(p.antonyms || [])]);
  const dis = pickDistractors(forbidden, poolWords, optionCountFor(difficulty) - 1, rand, difficulty !== 'easy', correct);
  if (dis.length < 2) return null;
  const { options, answerId } = optionsFrom(correct, dis, rand);
  return {
    ...base(ctx, 'syn_ant', 'choice', 'synonym'),
    prompt: useAnt ? `"${word.word}" ning ANTONIMI qaysi?` : `"${word.word}" ning SINONIMI qaysi?`,
    options,
    answer: answerId,
    correctDisplay: correct,
  };
}

function genFill(ctx: Ctx, typed: boolean): GameQuestion | null {
  const { word, pool, rand, difficulty } = ctx;
  for (const ex of shuffle(word.examples || [], rand)) {
    const found = findWordInSentence(ex.en || '', word.word);
    if (!found) continue;
    const blanked = blankSentence(ex.en, found);
    if (typed) {
      return {
        ...base(ctx, 'fill_typed', 'typed', 'context'),
        secondarySkill: 'spelling',
        prompt: blanked,
        hint: difficulty === 'hard' ? firstLetterHint(found.surface) : ex.uz || undefined,
        accepted: acceptedForWord(word.word, found.surface),
        correctDisplay: found.surface,
      };
    }
    const others = pool.filter((p) => p.wordId !== word.wordId).map((p) => p.word);
    const dis = pickDistractors([word.word, found.surface], others, optionCountFor(difficulty) - 1, rand, true, word.word);
    if (dis.length < 2) continue;
    const { options, answerId } = optionsFrom(found.surface, dis, rand);
    return {
      ...base(ctx, 'fill_choice', 'choice', 'context'),
      prompt: blanked,
      hint: ex.uz || undefined,
      options,
      answer: answerId,
      correctDisplay: found.surface,
    };
  }
  return null;
}

function genListenChoose(ctx: Ctx): GameQuestion | null {
  const { word, pool, rand, difficulty } = ctx;
  const others = pool.filter((p) => p.wordId !== word.wordId).map((p) => p.word);
  const dis = pickDistractors([word.word], others, optionCountFor(difficulty) - 1, rand, difficulty !== 'easy', word.word);
  if (dis.length < 2) return null;
  const { options, answerId } = optionsFrom(word.word, dis, rand);
  return {
    ...base(ctx, 'listen_choose', 'choice', 'listening'),
    prompt: 'Eshiting va to\'g\'ri so\'zni tanlang',
    audioText: word.word,
    options,
    answer: answerId,
    correctDisplay: word.word,
  };
}

function genListenType(ctx: Ctx): GameQuestion | null {
  const { word, difficulty } = ctx;
  return {
    ...base(ctx, 'listen_type', 'typed', 'spelling'),
    secondarySkill: 'listening',
    prompt: 'Eshiting va so\'zni yozing',
    audioText: word.word,
    hint: difficulty === 'easy' ? firstLetterHint(word.word) : undefined,
    accepted: acceptedForWord(word.word),
    correctDisplay: word.word,
  };
}

function genSpellDrop(ctx: Ctx): GameQuestion | null {
  const { word, difficulty } = ctx;
  const tr = word.translations.filter(Boolean);
  if (!tr.length) return null;
  return {
    ...base(ctx, 'spell_drop', 'typed', 'spelling'),
    prompt: tr.slice(0, 2).join(', '),
    hint: difficulty === 'easy' ? firstLetterHint(word.word) : undefined,
    accepted: acceptedForWord(word.word),
    correctDisplay: word.word,
  };
}

function genSentenceBuild(ctx: Ctx): GameQuestion | null {
  const { word, rand } = ctx;
  const candidates = (word.examples || [])
    .map((e) => e.en)
    .filter((s) => s && tokenizeSentence(s).length >= 4 && tokenizeSentence(s).length <= 14);
  if (!candidates.length) return null;
  const sentence = pick(candidates, rand)!;
  const tokens = tokenizeSentence(sentence);
  let shuffled = shuffle(tokens, rand);
  // Aralashtirish asl tartibni qaytarib qo'ymasin
  let guard = 0;
  while (shuffled.join(' ') === tokens.join(' ') && guard++ < 5) shuffled = shuffle(tokens, rand);
  const uz = (word.examples || []).find((e) => e.en === sentence)?.uz;
  return {
    ...base(ctx, 'sentence_build', 'arrange', 'context'),
    prompt: uz ? `Jumlani tuzing: ${uz}` : `Jumlani to'g'ri tartibda tuzing ("${word.word}")`,
    tokens: shuffled,
    answerTokens: tokens,
    correctDisplay: sentence,
  };
}

/** `count` ta so'zdan juftlik savoli (match/memory). */
function genPairs(ctxBase: Omit<Ctx, 'word'>, words: GameWord[], kind: 'match_pairs' | 'memory_pairs'): GameQuestion | null {
  const { rand, difficulty, index, timeLimit } = ctxBase;
  const usable = words.filter((w) => w.translations.some(Boolean));
  if (usable.length < 3) return null;
  const lefts = usable.map((w, i) => ({ id: `l${i + 1}`, text: w.word, wordId: w.wordId }));
  const rightRaw = usable.map((w, i) => ({ id: `r${i + 1}`, text: pick(w.translations.filter(Boolean), rand)!, leftId: `l${i + 1}` }));
  // bir xil tarjimali ikki so'z bo'lsa noaniqlik — rad etamiz
  if (new Set(rightRaw.map((r) => norm(r.text))).size !== rightRaw.length) return null;
  const answerMap: Record<string, string> = {};
  rightRaw.forEach((r) => (answerMap[r.leftId] = r.id));
  const first = usable[0];
  return {
    qid: `q${index + 1}`,
    kind,
    inputType: 'match',
    skill: 'recall',
    wordId: first.wordId,
    categoryId: first.categoryId,
    word: usable.map((w) => w.word).join(', '),
    prompt: kind === 'memory_pairs' ? 'Kartalarni oching va juftliklarni toping' : "So'zlarni tarjimalari bilan juftlang",
    lefts: shuffle(lefts, rand),
    rights: shuffle(rightRaw.map((r) => ({ id: r.id, text: r.text })), rand),
    timeLimitSec: timeLimit,
    explanation: usable.map((w) => `${w.word} — ${w.translations[0]}`).join('; '),
    answerMap,
    ...(kind === 'memory_pairs' ? { memoryMap: answerMap } : {}),
    correctDisplay: usable.map((w) => `${w.word} = ${rightRaw.find((r) => r.leftId === lefts.find((l) => l.wordId === w.wordId)!.id)!.text}`).join('; '),
    difficulty,
  };
}

// ---------------------------------------------------------------------------
// Sessiya qurish
// ---------------------------------------------------------------------------
export interface BuildOptions {
  gameKey: GameKey;
  difficulty: Difficulty;
  /** O'yinga tanlangan (ustuvorlik bo'yicha tartiblangan) so'zlar. */
  words: GameWord[];
  /** Distraktorlar uchun qo'shimcha so'zlar (foydalanuvchining boshqa so'zlari). */
  distractorPool?: GameWord[];
  rand: Rand;
}

export interface BuiltSession {
  gameKey: GameKey;
  difficulty: Difficulty;
  questions: GameQuestion[];
  /** So'rov uchun so'z yetmadi/tayyor emas — sabab. */
  shortfall?: string;
}

const PAIR_SIZE: Record<Difficulty, number> = { easy: 4, medium: 5, hard: 6, expert: 6 };

type Generator = (ctx: Ctx) => GameQuestion | null;

const SIMPLE_GENERATORS: Record<string, Generator[]> = {
  multiple_choice: [genMcWord, genMcMeaning],
  speed_challenge: [genMcMeaning, genMcWord],
  definition_challenge: [genDefinition],
  synonym_antonym: [genSynAnt],
  listen_choose: [genListenChoose],
  listen_type: [genListenType],
  word_drop: [genSpellDrop],
  sentence_builder: [genSentenceBuild],
};

/** multiple_choice: easy → "so'zni tanlang" (mc_word), keyin ma'noni tanlash (TZ §8). */
function generatorsFor(gameKey: GameKey, difficulty: Difficulty, rand: Rand): Generator[] {
  if (gameKey === 'multiple_choice') {
    if (difficulty === 'easy') return [genMcWord, genMcMeaning];
    if (difficulty === 'medium') return rand() < 0.5 ? [genMcMeaning, genMcWord] : [genMcWord, genMcMeaning];
    return [genMcMeaning, genDefinition, genMcWord];
  }
  if (gameKey === 'fill_gap') {
    const typed = difficulty === 'hard' || difficulty === 'expert';
    return [(c) => genFill(c, typed), (c) => genFill(c, !typed)];
  }
  return SIMPLE_GENERATORS[gameKey] || [];
}

function dedupeWords(words: GameWord[]): GameWord[] {
  return uniqueBy(words, (w) => w.wordId);
}

export function buildGameSession(opts: BuildOptions): BuiltSession {
  const def = getGame(opts.gameKey);
  if (!def) throw new Error(`Noma'lum o'yin: ${opts.gameKey}`);
  const { difficulty, rand } = opts;
  const words = dedupeWords(opts.words);
  const pool = dedupeWords([...(opts.distractorPool || []), ...words]);
  const timeLimit = def.timePerQuestionSec[difficulty];
  const count = def.questionCount[difficulty];

  // Juftlik o'yinlari: har raundda PAIR_SIZE ta so'z.
  if (opts.gameKey === 'word_match' || opts.gameKey === 'memory') {
    const kind = opts.gameKey === 'memory' ? 'memory_pairs' : 'match_pairs';
    const size = Math.min(PAIR_SIZE[difficulty], words.length);
    if (words.length < 3) return { gameKey: opts.gameKey, difficulty, questions: [], shortfall: "Juftlik o'yini uchun kamida 3 ta tarjimali so'z kerak" };
    const questions: GameQuestion[] = [];
    let cursor = 0;
    const order = shuffle(words, rand);
    for (let r = 0; r < count; r++) {
      let chunk: GameWord[] = [];
      for (let i = 0; i < size; i++) chunk.push(order[(cursor + i) % order.length]);
      cursor += size;
      chunk = dedupeWords(chunk);
      if (chunk.length < 3) chunk = order.slice(0, size);
      const q = genPairs({ pool, difficulty, rand, index: questions.length, timeLimit }, chunk, kind);
      if (q) questions.push(q);
    }
    return { gameKey: opts.gameKey, difficulty, questions };
  }

  // Boss: bo'limlar bo'yicha kompozitsiya.
  if (opts.gameKey === 'vocabulary_boss') {
    return buildBoss(def, difficulty, words, pool, rand, timeLimit);
  }

  const gens = generatorsFor(opts.gameKey, difficulty, rand);
  const questions: GameQuestion[] = [];
  if (!words.length || !gens.length) return { gameKey: opts.gameKey, difficulty, questions };

  // Har so'z uchun generatorlarni navbat bilan sinab ko'ramiz; so'zlar aylanib takrorlanishi mumkin
  // (lekin ketma-ket emas) — kam so'z bo'lsa ham sessiya to'ladi.
  let guard = 0;
  let cursor = 0;
  const maxAttempts = count * Math.max(4, words.length) * 2;
  const usedCount = new Map<string, number>();
  while (questions.length < count && guard++ < maxAttempts) {
    const w = words[cursor % words.length];
    cursor += 1;
    // bir so'z kamida (questions.length/words.length) marta ishlatilsin, ortiqchasi keyin
    const used = usedCount.get(w.wordId) || 0;
    const fairShare = Math.floor(questions.length / Math.max(1, words.length)) + 1;
    if (used >= fairShare) continue;
    for (const gen of gens) {
      const q = gen({ word: w, pool, difficulty, rand, index: questions.length, timeLimit });
      if (q) {
        questions.push(q);
        usedCount.set(w.wordId, used + 1);
        break;
      }
    }
  }
  const shortfall = questions.length < count ? `Faqat ${questions.length}/${count} ta savol tuzildi (so'zlarda ma'lumot yetarli emas)` : undefined;
  return { gameKey: opts.gameKey, difficulty, questions, shortfall };
}

function buildBoss(def: GameDefinition, difficulty: Difficulty, words: GameWord[], pool: GameWord[], rand: Rand, timeLimit: number | null): BuiltSession {
  const total = def.questionCount[difficulty];
  const perSection = Math.max(1, Math.floor(total / 5));
  const sections: Array<{ name: string; gens: Generator[] }> = [
    { name: 'meaning', gens: [genMcMeaning, genMcWord] },
    { name: 'listening', gens: [genListenChoose] },
    { name: 'spelling', gens: [genListenType, genSpellDrop] },
    { name: 'context', gens: [(c) => genFill(c, difficulty === 'hard' || difficulty === 'expert'), (c) => genFill(c, false), genSentenceBuild] },
    { name: 'synonym', gens: [genSynAnt, genDefinition, genMcMeaning] },
  ];
  const questions: GameQuestion[] = [];
  if (!words.length) return { gameKey: 'vocabulary_boss', difficulty, questions };
  let cursor = 0;
  for (const section of sections) {
    let got = 0;
    let guard = 0;
    while (got < perSection && guard++ < perSection * Math.max(4, words.length) * 2) {
      const w = words[cursor % words.length];
      cursor += 1;
      for (const gen of section.gens) {
        const q = gen({ word: w, pool, difficulty, rand, index: questions.length, timeLimit });
        if (q) {
          questions.push(q);
          got += 1;
          break;
        }
      }
    }
  }
  const shortfall = questions.length < perSection * 5 ? `Boss uchun ${questions.length}/${perSection * 5} ta savol tuzildi` : undefined;
  return { gameKey: 'vocabulary_boss', difficulty, questions, shortfall };
}

// ---------------------------------------------------------------------------
// Mavjudlik: foydalanuvchi so'zlari bu o'yin uchun yetarlimi.
// ---------------------------------------------------------------------------
export interface Availability {
  available: boolean;
  reason: string | null;
}

export function availabilityFor(def: GameDefinition, words: GameWord[]): Availability {
  const n = words.length;
  if (n < def.minWords) {
    return { available: false, reason: `Kamida ${def.minWords} ta so'z kerak (hozir ${n})` };
  }
  if (def.key === 'definition_challenge' && words.filter((w) => (w.definitionEn || '').trim()).length < 4) {
    return { available: false, reason: "Kamida 4 ta so'zda inglizcha ta'rif bo'lishi kerak (AI bilan boyiting)" };
  }
  if (def.key === 'synonym_antonym' && words.filter((w) => (w.synonymsEn?.length || 0) + (w.antonyms?.length || 0) > 0).length < 4) {
    return { available: false, reason: "Kamida 4 ta so'zda sinonim/antonim bo'lishi kerak (AI bilan boyiting)" };
  }
  if (def.key === 'sentence_builder' && words.filter((w) => (w.examples || []).some((e) => tokenizeSentence(e.en || '').length >= 4)).length < 3) {
    return { available: false, reason: "Kamida 3 ta so'zda misol gap bo'lishi kerak" };
  }
  if (def.key === 'fill_gap' && words.filter((w) => (w.examples || []).some((e) => findWordInSentence(e.en || '', w.word))).length < 4) {
    return { available: false, reason: "Kamida 4 ta so'zda misol gap bo'lishi kerak (AI bilan boyiting)" };
  }
  if ((def.key === 'word_drop' || def.key === 'word_match' || def.key === 'memory' || def.key === 'speed_challenge') && words.filter((w) => w.translations.some(Boolean)).length < def.minWords) {
    return { available: false, reason: "Tarjimali so'zlar yetarli emas" };
  }
  return { available: true, reason: null };
}
