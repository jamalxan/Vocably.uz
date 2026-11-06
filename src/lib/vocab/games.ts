// O'yin katalogi va savol generatsiyasi (TZ §9-§11, §8).
// "Games alohida modul emas — vocabulary engine'ga ulanadigan learning interface":
// barcha o'yinlar bitta generatordan o'tadi, har bir savol mastery o'lchovi (skill)ga bog'langan.
// Bu yerdagi savollarning to'g'ri javobi SERVERda saqlanadi — klientga faqat `toClientQuestion`
// qaytargan (javobsiz) ko'rinish beriladi.
import { levenshtein } from '../levenshtein';
import { normalizeForCompare } from '../textCompare';
import { type Difficulty, type SkillKey, type Tier } from './config';
import { pick, sample, shuffle, type Rand } from './rng';
import { typedAcceptedForWord } from './typedForms';

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
  /** Kutubxonadagi rasm (hozir hech bir o'yin ishlatmaydi; eski sessiyalar uchun). */
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Katalog
// ---------------------------------------------------------------------------
export type GameKey =
  | 'multiple_choice'
  | 'listen_choose'
  | 'listen_type'
  | 'fill_gap'
  | 'sentence_builder'
  | 'definition_challenge'
  | 'synonym_antonym'
  | 'vocably_run'
  | 'word_tunnel'
  | 'word_defense';

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
    // Flagship (TZ 2.0 §7): 3 lanes, a prompt overhead, one right word per gate. The round ends on
    // 3 lost lives or 90 s, so most rounds use only part of the question set.
    key: 'vocably_run',
    title: 'Vocably Run',
    description: "3 yo'lakli yugurish: to'g'ri so'z turgan yo'lakka o'ting",
    priority: 'P0',
    minTier: 'free',
    icon: 'Footprints',
    skill: 'recall',
    minWords: 4,
    questionCount: cnt(30, 30, 30, 30),
    timePerQuestionSec: tm(null, null, null, null),
    lives: 3,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    // Flagship typing game (concept adapted from cooltypinggame, Apache-2.0 — THIRD_PARTY_NOTICES.md):
    // the meaning is shown, the English word is typed, every typed letter becomes a ring in a 3D tunnel.
    // Graded on the server from the raw text (typed input); the round is timed on the device.
    key: 'word_tunnel',
    title: "So'z tunneli",
    description: "Ma'nosini ko'ring, inglizchasini yozing — har bir harf 3D tunnelga aylanadi",
    priority: 'P0',
    minTier: 'free',
    icon: 'Keyboard',
    skill: 'spelling',
    // One question per word (every verdict reveals the answer), so a round needs a few distinct words.
    minWords: 5,
    // 90 s round: the server's 80 % "completed" bar then needs ≥ 7.5 s per word on every level.
    questionCount: cnt(12, 12, 14, 15),
    timePerQuestionSec: tm(null, null, null, null),
    lives: null,
    instantFeedback: true,
    needsAudio: false,
  },
  {
    // Flagship typing defence: enemies carry a meaning toward the base; typing the English word for the
    // targeted enemy shoots it. A breach costs one of 5 lives and is recorded as a wrong (empty) answer.
    key: 'word_defense',
    title: 'Word Defense',
    description: "Ma'no ko'targan dushmanlar bazaga yaqinlashadi — inglizchasini yozib, ularni urib tushiring",
    priority: 'P0',
    minTier: 'free',
    icon: 'Crosshair',
    skill: 'spelling',
    minWords: 8,
    questionCount: cnt(16, 20, 24, 26),
    timePerQuestionSec: tm(null, null, null, null),
    lives: 5,
    instantFeedback: true,
    needsAudio: false,
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
  | 'spell_drop'
  | 'image_word'
  | 'word_image'
  | 'type_definition';

export type InputType = 'choice' | 'typed' | 'arrange' | 'match';

export interface QuestionOption {
  id: string;
  text: string;
  /** word_image: variant rasm (matn o'rniga). */
  imageUrl?: string;
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
  /** image_word: savol rasmi. */
  imageUrl?: string;
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
   * Typed flagship games (word_tunnel / word_defense): number of characters in the answer, shown as
   * empty slots. Only on easy/medium — never on hard/expert. It is not the answer, only its length.
   */
  answerLength?: number;
  // --- faqat server ---
  answer?: string; // choice: option id
  accepted?: string[]; // typed: normallashgan qabul qilinadigan javoblar
  answerTokens?: string[]; // arrange
  answerMap?: Record<string, string>; // match: leftId -> rightId
  correctDisplay: string; // javobdan keyin ko'rsatiladigan to'g'ri javob matni
  difficulty: Difficulty;
}

export const SERVER_ONLY_FIELDS = ['answer', 'accepted', 'answerTokens', 'answerMap', 'correctDisplay', 'word', 'wordId', 'categoryId', 'explanation'] as const;

/**
 * Klientga yuboriladigan (javobsiz) ko'rinish. `word`/`explanation` ham yashiriladi: tanlov
 * savollarida ular to'g'ri javobning o'zi (mc_word'da word === to'g'ri variant), wordId esa
 * /api/words orqali so'zga aylantirilishi mumkin. Javobdan keyin revealFor() ularni beradi.
 */
export function toClientQuestion(q: GameQuestion): Omit<GameQuestion, (typeof SERVER_ONLY_FIELDS)[number]> {
  const { answer, accepted, answerTokens, answerMap, correctDisplay, word, wordId, categoryId, explanation, ...rest } = q;
  void answer;
  void accepted;
  void answerTokens;
  void answerMap;
  void correctDisplay;
  void word;
  void wordId;
  void categoryId;
  void explanation;
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


/** Uzbek meaning → type the English word (spell_drop); the typing games add their hints on top. */
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


type Generator = (ctx: Ctx) => GameQuestion | null;

const SIMPLE_GENERATORS: Record<string, Generator[]> = {
  multiple_choice: [genMcWord, genMcMeaning],
  definition_challenge: [genDefinition],
  synonym_antonym: [genSynAnt],
  listen_choose: [genListenChoose],
  listen_type: [genListenType],
  sentence_builder: [genSentenceBuild],
};

/** multiple_choice: easy → "so'zni tanlang" (mc_word), keyin ma'noni tanlash (TZ §8). */
function generatorsFor(gameKey: GameKey, difficulty: Difficulty, rand: Rand): Generator[] {
  if (gameKey === 'multiple_choice') {
    if (difficulty === 'easy') return [genMcWord, genMcMeaning];
    if (difficulty === 'medium') return rand() < 0.5 ? [genMcMeaning, genMcWord] : [genMcWord, genMcMeaning];
    return [genMcMeaning, genDefinition, genMcWord];
  }
  if (gameKey === 'vocably_run') return [runQuestion];
  if (gameKey === 'word_tunnel' || gameKey === 'word_defense') return [typedQuestion];
  if (gameKey === 'fill_gap') {
    const typed = difficulty === 'hard' || difficulty === 'expert';
    return [(c) => genFill(c, typed), (c) => genFill(c, !typed)];
  }
  return SIMPLE_GENERATORS[gameKey] || [];
}

/**
 * Vocably Run: always 3 lanes — an Uzbek meaning or an English definition above, English words in
 * the lanes. Easy asks meanings only; harder levels mix in definitions per question.
 */
const threeLanes = (gen: Generator): Generator => (c) => {
  const q = gen({ ...c, difficulty: 'easy' }); // 'easy' = 3 options
  return q && { ...q, difficulty: c.difficulty };
};
const runMeaning = threeLanes(genMcWord);
const runDefinition = threeLanes(genDefinition);
const runQuestion: Generator = (c) => {
  if (c.difficulty === 'easy') return runMeaning(c) || runDefinition(c);
  return c.rand() < 0.5 ? runDefinition(c) || runMeaning(c) : runMeaning(c) || runDefinition(c);
};

/**
 * Typed flagship games (word_tunnel, word_defense): the English word is typed from a prompt.
 * Hints shrink with difficulty — easy: first letter + length, medium: length only, hard/expert: none.
 * `answerLength` is the only extra the client gets; the answer itself stays in `accepted` (server-only).
 */
function withTypedHints(q: GameQuestion, word: string, difficulty: Difficulty): GameQuestion {
  // Hints describe the primary accepted form ("look after (sb)" → "look after", "colo(u)r" → "color").
  const accepted = typedAcceptedForWord(word);
  const primary = accepted[0] || word.trim();
  const length = primary.length;
  if (difficulty === 'easy') return { ...q, accepted, hint: firstLetterHint(primary), answerLength: length };
  if (difficulty === 'medium') return { ...q, accepted, hint: undefined, answerLength: length };
  return { ...q, accepted, hint: undefined, answerLength: undefined };
}

// Accepted typed forms live in typedForms.ts (shared with the device-side correction check).
export { typedAcceptedForWord };

/**
 * Longest headword a typing game asks. The answer input holds 40 characters (flagship/typing.js
 * TYPED_MAX); brackets, labels and placeholders that are not typed leave room for the rest.
 */
const TYPEABLE_MAX_CHARS = 60;
/** The answer input's length (flagship/typing.js TYPED_MAX): a longer typed form cannot be entered. */
const TYPED_INPUT_MAX = 40;

/**
 * Idioms and long multi-word headwords are not fair "type it from the meaning" questions. Judged by
 * what the player types, the primary accepted form ("look after (sb)" → "look after", "colo(u)r" →
 * "color"): at most 3 words, and short enough for the answer input. A headword over
 * TYPEABLE_MAX_CHARS is refused before it is parsed.
 */
function typeableWord(word: GameWord): boolean {
  const raw = String(word.word || '');
  if (raw.length > TYPEABLE_MAX_CHARS || (word.pos || '').toLowerCase() === 'idiom') return false;
  const primary = typedAcceptedForWord(raw)[0] || '';
  const typedWords = primary.split(' ').filter(Boolean).length;
  return typedWords > 0 && typedWords <= 3 && primary.length <= TYPED_INPUT_MAX;
}

/** Typed flagship games build at most one question per word: a verdict reveals the answer. */
export const ONE_QUESTION_PER_WORD = new Set<GameKey>(['word_tunnel', 'word_defense']);

/** Apostrophes other than the straight one that textCompare also ignores: ` ʻ ʼ ‘ ’. */
const OTHER_APOSTROPHES = /[`ʻʼ‘’]/g;

/**
 * Hides the answer (and its inflected forms) inside an English definition: "to maintain …" → "to _____ …".
 * Both get straight apostrophes first, so the headword "o'clock" is hidden in "twelve o’clock"
 * (AI-written definitions often have curly ones); the text comes back with straight apostrophes.
 */
export function maskWordIn(text: string, word: string): string {
  const target = String(word || '').replace(OTHER_APOSTROPHES, "'");
  let out = String(text || '').replace(OTHER_APOSTROPHES, "'");
  // Every form findWordInSentence matches starts with the word minus its last letter. For an ASCII
  // stem a substring check is exact enough to skip building its regexes (a typing round masks every
  // other question's forms in each definition, so most words are simply not there).
  const stem = target.trim().slice(0, -1);
  if (stem && !/[^\x20-\x7e]/.test(stem) && !out.toLowerCase().includes(stem.toLowerCase())) return out;
  for (let guard = 0; guard < 6; guard++) {
    const found = findWordInSentence(out, target);
    if (!found) break;
    out = blankSentence(out, found);
  }
  return out;
}

/** Uzbek meaning → type the English word, with the typed-game hints. */
function genTypedMeaning(ctx: Ctx): GameQuestion | null {
  if (!typeableWord(ctx.word)) return null;
  const q = genSpellDrop(ctx);
  return q && withTypedHints({ ...q, secondarySkill: 'recall' }, ctx.word.word, ctx.difficulty);
}

/** A masked definition must still say something: one left with fewer than 6 letters is not asked. */
function enoughLetters(prompt: string): boolean {
  return prompt.replace(/_+/g, '').replace(/[^A-Za-z]/g, '').length >= 6;
}

/** English definition (answer masked) → type the word. Only words that have a definition qualify. */
function genTypedDefinition(ctx: Ctx): GameQuestion | null {
  const { word, difficulty } = ctx;
  if (!typeableWord(word)) return null;
  const def = (word.definitionEn || '').trim();
  if (!def) return null;
  let prompt = maskWordIn(def, word.word);
  for (const form of typedAcceptedForWord(word.word)) prompt = maskWordIn(prompt, form);
  // A definition that is (almost) only the word itself would be an empty prompt after masking.
  // (Other questions' answers are masked once the round is final: maskOtherAnswers.)
  if (!enoughLetters(prompt)) return null;
  return withTypedHints(
    {
      ...base(ctx, 'type_definition', 'typed', 'spelling'),
      secondarySkill: 'recall',
      prompt,
      accepted: acceptedForWord(word.word),
      correctDisplay: word.word,
    },
    word.word,
    difficulty
  );
}

/** Easy/medium ask Uzbek meanings; hard/expert mix in masked English definitions (≈ half the time). */
const typedQuestion: Generator = (c) => {
  if (c.difficulty === 'easy' || c.difficulty === 'medium') return genTypedMeaning(c) || genTypedDefinition(c);
  return c.rand() < 0.5 ? genTypedDefinition(c) || genTypedMeaning(c) : genTypedMeaning(c) || genTypedDefinition(c);
};

/**
 * Typing rounds, once their questions are final: a definition must not show another question's
 * answer either ("scarce": "not available in large quantities" in a round that also asks
 * "available"). Defense shows every live enemy's prompt, and the client holds the whole round.
 * Every other question's headword and accepted forms are masked in each type_definition prompt; one
 * left with too few letters is asked by its meaning instead, or dropped when the word has none.
 * `asked[i]` is the word of `questions[i]`. Runs before the session is stored, so the stored prompt
 * (whose length sets the server's plausibility floor, antiCheat.minPlausibleMs) is exactly the one
 * the client gets (typing.js typedFloorMs).
 */
function maskOtherAnswers(questions: GameQuestion[], asked: GameWord[], ctx: Omit<Ctx, 'word' | 'index'>): GameQuestion[] {
  const out: GameQuestion[] = [];
  questions.forEach((q, i) => {
    if (q.kind !== 'type_definition') {
      out.push(q);
      return;
    }
    let prompt = q.prompt;
    for (const other of questions) {
      if (other === q) continue;
      for (const form of [other.word, ...(other.accepted || [])]) prompt = maskWordIn(prompt, form);
    }
    if (enoughLetters(prompt)) {
      out.push(prompt === q.prompt ? q : { ...q, prompt });
      return;
    }
    const meaning = genTypedMeaning({ ...ctx, word: asked[i], index: i });
    if (meaning) out.push(meaning);
  });
  // A dropped question leaves no gap in the qids (q1, q2, …).
  return out.map((q, i) => (q.qid === `q${i + 1}` ? q : { ...q, qid: `q${i + 1}` }));
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

  const gens = generatorsFor(opts.gameKey, difficulty, rand);
  const questions: GameQuestion[] = [];
  if (!words.length || !gens.length) return { gameKey: opts.gameKey, difficulty, questions };

  // Har so'z uchun generatorlarni navbat bilan sinab ko'ramiz; so'zlar aylanib takrorlanishi mumkin
  // (lekin ketma-ket emas) — kam so'z bo'lsa ham sessiya to'ladi.
  let guard = 0;
  let cursor = 0;
  const maxAttempts = count * Math.max(4, words.length) * 2;
  const usedCount = new Map<string, number>();
  // One-question-per-word games: entries that share an accepted answer ("significant" saved in two
  // decks, "to improve" and "improve") are one word — the first verdict would reveal the other's answer.
  const oneShot = ONE_QUESTION_PER_WORD.has(opts.gameKey);
  const usedForms = new Set<string>();
  const asked: GameWord[] = [];
  // Typed forms only for a word the typing games can ask (so a huge headword is refused by its
  // length and never parsed, typedForms.ts), worked out once: a skipped word comes round again.
  const formsByWord = new Map<string, string[] | null>();
  const formsFor = (w: GameWord): string[] | null => {
    if (!formsByWord.has(w.wordId)) formsByWord.set(w.wordId, typeableWord(w) ? typedAcceptedForWord(w.word) : null);
    return formsByWord.get(w.wordId) ?? null;
  };
  while (questions.length < count && guard++ < maxAttempts) {
    const w = words[cursor % words.length];
    cursor += 1;
    // bir so'z kamida (questions.length/words.length) marta ishlatilsin, ortiqchasi keyin
    const used = usedCount.get(w.wordId) || 0;
    const fairShare = Math.floor(questions.length / Math.max(1, words.length)) + 1;
    if (used >= fairShare) continue;
    if (used >= 1 && oneShot) continue;
    const forms = oneShot ? formsFor(w) : [];
    if (!forms || forms.some((f) => usedForms.has(f))) continue;
    for (const gen of gens) {
      const q = gen({ word: w, pool, difficulty, rand, index: questions.length, timeLimit });
      if (q) {
        questions.push(q);
        asked.push(w);
        usedCount.set(w.wordId, used + 1);
        for (const f of forms) usedForms.add(f);
        break;
      }
    }
  }
  const final = oneShot ? maskOtherAnswers(questions, asked, { pool, difficulty, rand, timeLimit }) : questions;
  // One-question-per-word games are expected to be shorter than `count` when the deck is small.
  const shortfall = final.length < count && !oneShot ? `Faqat ${final.length}/${count} ta savol tuzildi (so'zlarda ma'lumot yetarli emas)` : undefined;
  return { gameKey: opts.gameKey, difficulty, questions: final, shortfall };
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
  const needsTranslations = ['word_tunnel', 'word_defense'].includes(def.key);
  if (needsTranslations && words.filter((w) => w.translations.some(Boolean)).length < def.minWords) {
    return { available: false, reason: "Tarjimali so'zlar yetarli emas" };
  }
  return { available: true, reason: null };
}
