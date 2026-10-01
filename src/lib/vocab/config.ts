// Vocabulary & Gamification Engine — yagona KONFIGURATSIYA manbai.
// Vocably_Gamified_Vocabulary_Engine_TZ.md §7.1 / §12.1 / §14 / §31 talabi: XP qiymatlari,
// daraja formulasi, SRS intervallari, o'yin parametrlari HARD-CODE qilinmaydi — barchasi
// shu bitta faylda, admin/config orqali almashtirilishi mumkin bo'lgan obyektlar sifatida.
// Hech bir boshqa fayl o'z nusxasini saqlamaydi.

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

// ---------------------------------------------------------------------------
// XP (TZ §12.1) — qiymatlar config orqali boshqariladi.
// ---------------------------------------------------------------------------
export const XP_TABLE = {
  newWord: 10,
  correctAnswer: 5,
  gameComplete: 30,
  dailyQuest: 100,
  weeklyChallenge: 500,
  wordMastered: 50,
  perfectSessionBonus: 25,
} as const;

/** Qiyinlik bo'yicha XP ko'paytirgichi — qiyinroq o'yin ko'proq XP beradi. */
export const DIFFICULTY_XP_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.8,
  medium: 1,
  hard: 1.25,
  expert: 1.5,
};

/** Bir kunda o'yinlardan olinishi mumkin bo'lgan maksimal XP (anti-cheat, TZ §39). */
export const DAILY_GAME_XP_CAP = 4000;

// ---------------------------------------------------------------------------
// Daraja tizimi (TZ §14) — 20 daraja, formula config orqali.
// ---------------------------------------------------------------------------
export const LEVEL_NAMES = [
  'Beginner',
  'Explorer',
  'Learner',
  'Builder',
  'Achiever',
  'Scholar',
  'Wordsmith',
  'Linguist',
  'Orator',
  'Expert',
  'Sage',
  'Virtuoso',
  'Luminary',
  'Champion',
  'Elite',
  'Grandmaster',
  'Legend',
  'Mythic',
  'Titan',
  'Master',
];

export const LEVEL_CONFIG = {
  maxLevel: LEVEL_NAMES.length,
  /** Daraja N ga yetish uchun kerakli jami XP = round(base * (N-1) ^ exponent / 10) * 10 */
  base: 90,
  exponent: 1.85,
};

// ---------------------------------------------------------------------------
// Mastery (TZ §6) — versiyalangan algoritm.
// ---------------------------------------------------------------------------
export const MASTERY_ALGORITHM_VERSION = 'mastery_algorithm_v1';

export type MasteryStatus = 'new' | 'learning' | 'familiar' | 'strong' | 'advanced' | 'mastered';

export const MASTERY_BANDS: Array<{ status: MasteryStatus; min: number; max: number; label: string }> = [
  { status: 'new', min: 0, max: 20, label: 'Yangi' },
  { status: 'learning', min: 21, max: 40, label: "O'rganilmoqda" },
  { status: 'familiar', min: 41, max: 60, label: 'Tanish' },
  { status: 'strong', min: 61, max: 80, label: 'Kuchli' },
  { status: 'advanced', min: 81, max: 95, label: 'Ilg\'or' },
  { status: 'mastered', min: 96, max: 100, label: "O'zlashtirilgan" },
];

export type SkillKey = 'recall' | 'listening' | 'spelling' | 'context' | 'synonym' | 'writing' | 'speaking';
export const SKILL_KEYS: SkillKey[] = ['recall', 'listening', 'spelling', 'context', 'synonym', 'writing', 'speaking'];

/** Mastery inputlari va vaznlari (yig'indisi 1). Yo'q (hali sinalmagan) o'lchovlar qayta normallanadi. */
export const MASTERY_WEIGHTS = {
  recall: 0.22,
  listening: 0.12,
  spelling: 0.14,
  context: 0.14,
  synonym: 0.04,
  writing: 0.05,
  speaking: 0.04,
  speed: 0.05,
  repeatedSuccess: 0.1,
  srsRetention: 0.1,
};

/** Bitta formatni ko'p takrorlash sun'iy mastery bermasin (TZ §7.3): muvaffaqiyatli formatlar soniga qarab shift. */
export const MASTERY_FORMAT_CAPS: Record<number, number> = { 0: 15, 1: 60, 2: 78, 3: 92, 4: 100 };

/** Javob tezligi "ideal" deb hisoblanadigan oyna (ms): shundan tez = 1.0, sekin = 0. */
export const SPEED_IDEAL_MS = 2500;
export const SPEED_SLOW_MS = 12000;

// ---------------------------------------------------------------------------
// SRS (TZ §7.1) — boshlang'ich interval namunasi (daqiqalarda), config orqali.
// Haqiqiy rejalashtirish src/lib/srs.ts (SM-2) — bu ro'yxat "format navbati" va
// retention xavfini baholash uchun ishlatiladi.
// ---------------------------------------------------------------------------
export const SRS_INTERVAL_LADDER_MIN = [10, 1440, 4320, 10080, 20160, 43200, 86400, 172800];

/** Bir so'z uchun tavsiya etilgan recall formatlar ketma-ketligi (TZ §7.3). */
export const FORMAT_LADDER: Array<{ minDays: number; format: RecallFormat }> = [
  { minDays: 0, format: 'meaning' },
  { minDays: 1, format: 'multiple_choice' },
  { minDays: 3, format: 'listening' },
  { minDays: 6, format: 'fill_gap' },
  { minDays: 12, format: 'context' },
  { minDays: 25, format: 'writing' },
  { minDays: 50, format: 'speaking' },
];
export type RecallFormat = 'meaning' | 'multiple_choice' | 'listening' | 'fill_gap' | 'context' | 'writing' | 'speaking';

// ---------------------------------------------------------------------------
// Anti-cheat chegaralari (TZ §39)
// ---------------------------------------------------------------------------
export const ANTI_CHEAT = {
  /** Savol turiga qarab bir javob uchun MINIMAL ishonchli vaqt (ms). */
  minResponseMs: { choice: 350, typed: 900, arrange: 1200, match: 1500 } as Record<string, number>,
  /** Sessiyaning umumiy davomiyligi savollar yig'indisining shu ulushidan kam bo'lsa shubhali. */
  minSessionFraction: 0.6,
  /** Hamma javoblar shu tebranishdan (ms) kam farq qilsa — bot-ga o'xshash. */
  botVarianceMs: 40,
  /** Faol sessiya shundan keyin eskiradi (ms). */
  sessionTtlMs: 4 * 60 * 60 * 1000,
  /** Bir kunda boshlanadigan sessiyalar maksimal soni. */
  maxSessionsPerDay: 60,
  /** Bir daqiqada boshlanadigan sessiyalar maksimal soni. */
  maxSessionStartsPerMinute: 6,
};

// ---------------------------------------------------------------------------
// Tarif cheklovlari (TZ §48) — backend'da majburlanadi.
// ---------------------------------------------------------------------------
export type Tier = 'free' | 'standard' | 'premium';

export const TIER_VOCAB_LIMITS: Record<
  Tier,
  { dailySessions: number | null; dailyNewWords: number | null; games: 'basic' | 'core' | 'all'; aiExercises: boolean; aiCoach: boolean }
> = {
  free: { dailySessions: 6, dailyNewWords: 10, games: 'basic', aiExercises: false, aiCoach: false },
  standard: { dailySessions: 40, dailyNewWords: 40, games: 'core', aiExercises: false, aiCoach: false },
  premium: { dailySessions: null, dailyNewWords: null, games: 'all', aiExercises: true, aiCoach: true },
};

// ---------------------------------------------------------------------------
// Quests (TZ §16) — definitsiyalar quests.ts'da, mukofotlar shu yerda.
// ---------------------------------------------------------------------------
export const QUEST_REWARD_XP = { daily: XP_TABLE.dailyQuest, weekly: XP_TABLE.weeklyChallenge };

// ---------------------------------------------------------------------------
// Kunlik reja (TZ §19/§47): vaqt (daqiqa) va har faoliyat "narxi" (daqiqa).
// ---------------------------------------------------------------------------
export const PLAN_TIME_OPTIONS = [5, 10, 20, 30, 45] as const;
export const PLAN_COST_MIN = {
  reviewWord: 0.35,
  newWord: 0.6,
  game: 3,
  listening: 5,
  writing: 8,
  speaking: 5,
};

// ---------------------------------------------------------------------------
// Analytics hodisalari (TZ §35) — schema versiyalangan.
// ---------------------------------------------------------------------------
export const EVENT_SCHEMA_VERSION = 1;
export const EVENT_NAMES = [
  'vocabulary_viewed',
  'vocabulary_started',
  'vocabulary_mastered',
  'review_started',
  'review_completed',
  'review_answered',
  'game_started',
  'game_answered',
  'game_completed',
  'quest_completed',
  'achievement_unlocked',
  'streak_extended',
  'ai_exercise_generated',
  'word_added_from_reading',
  'word_added_from_listening',
  'writing_word_used',
  'speaking_word_used',
  'reminder_sent',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];
