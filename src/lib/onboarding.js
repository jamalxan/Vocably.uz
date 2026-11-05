// Vocably 2.0 onboarding (TZ 2.0 §6.1). Pure — tested in onboarding.test.js.
// The quiz runs BEFORE signup (public /start page, answers in localStorage), so this
// module is shared by the browser wizard and by POST /api/onboarding, which re-validates
// everything with normalizeAnswers — the server never trusts the client's shape.

export const ONBOARDING_STORAGE_KEY = 'vocably.onboarding.v1';

export const GOALS = ['ielts', 'general'];
export const EXAM_TYPES = ['academic', 'general'];
export const DAILY_MINUTES = [10, 20, 40, 60];
export const SKILLS = ['reading', 'listening', 'writing', 'speaking'];
export const SELF_LEVELS = ['beginner', 'intermediate', 'advanced'];
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
/** "Hali bilmayman" → plan for this many days (TZ §6.1.1). */
export const DEFAULT_PLAN_DAYS = 90;
const MAX_PLAN_DAYS = 730;

/**
 * Rough receptive vocabulary sizes. Not a scientific claim — a planning yardstick so the
 * result screen can say "you need ~Z words". Band targets follow the common
 * "6.5 ≈ 4–5k word families" rule of thumb used by IELTS teachers.
 */
const VOCAB_BY_CEFR = { A1: 500, A2: 1000, B1: 2000, B2: 3500, C1: 5500, C2: 8000 };
const VOCAB_BY_BAND = [
  [5, 2500], [5.5, 3000], [6, 3500], [6.5, 4500], [7, 5500], [7.5, 6500], [8, 7500], [8.5, 8500], [9, 9500],
];
/** Self-rated level → CEFR, used only when the diagnostic was skipped. */
const SELF_LEVEL_CEFR = { beginner: 'A2', intermediate: 'B1', advanced: 'B2' };
/** CEFR → typical IELTS band (Cambridge's published alignment, rounded). */
const BAND_BY_CEFR = { A1: 3, A2: 4, B1: 5, B2: 6, C1: 7, C2: 8.5 };

/** Minutes of vocabulary work per day, out of the daily budget (rest goes to skills). */
const VOCAB_SHARE = 0.4;
/** ~1.5 min per new word incl. its first reviews. */
const MIN_PER_NEW_WORD = 1.5;
const MAX_NEW_WORDS_PER_DAY = 30;

const DAY = 86400000;

function isBand(v) {
  return Number.isFinite(v) && v >= 5 && v <= 9 && Number.isInteger(v * 2);
}

/**
 * Whitelist + coerce raw answers. Unknown/invalid values become null, never throw —
 * a half-filled quiz must still round-trip through storage and the API.
 */
export function normalizeAnswers(raw = {}) {
  const a = raw && typeof raw === 'object' ? raw : {};
  const band = Number(a.targetBand);
  const minutes = Number(a.dailyMinutes);
  let examDate = null;
  if (a.examDate) {
    const d = new Date(a.examDate);
    if (!Number.isNaN(d.getTime())) examDate = d.toISOString().slice(0, 10);
  }
  return {
    goal: GOALS.includes(a.goal) ? a.goal : null,
    examType: EXAM_TYPES.includes(a.examType) ? a.examType : null,
    targetBand: isBand(band) ? band : null,
    examDate,
    examDateUnknown: a.examDateUnknown === true,
    selfLevel: SELF_LEVELS.includes(a.selfLevel) ? a.selfLevel : null,
    dailyMinutes: DAILY_MINUTES.includes(minutes) ? minutes : null,
    weakestSkill: SKILLS.includes(a.weakestSkill) ? a.weakestSkill : null,
    diagnosticLevel: CEFR_LEVELS.includes(a.diagnosticLevel) ? a.diagnosticLevel : null,
    diagnosticScore:
      Number.isFinite(Number(a.diagnosticScore)) && a.diagnosticScore !== null && a.diagnosticScore !== ''
        ? Math.max(0, Math.min(100, Math.round(Number(a.diagnosticScore))))
        : null,
  };
}

/** Which quiz steps apply. General-English learners skip module/band/exam date. */
export function stepsFor(answers) {
  const ielts = answers?.goal !== 'general';
  return [
    'goal',
    ...(ielts ? ['examType', 'targetBand', 'examDate'] : []),
    'selfLevel',
    'dailyMinutes',
    'weakestSkill',
  ];
}

/** Is this step answered well enough to move on? */
export function stepDone(step, a) {
  switch (step) {
    case 'goal': return !!a.goal;
    case 'examType': return !!a.examType;
    case 'targetBand': return a.targetBand != null;
    case 'examDate': return !!a.examDate || a.examDateUnknown;
    case 'selfLevel': return !!a.selfLevel;
    case 'dailyMinutes': return a.dailyMinutes != null;
    case 'weakestSkill': return !!a.weakestSkill;
    default: return false;
  }
}

export function isComplete(a) {
  return stepsFor(a).every((s) => stepDone(s, a));
}

/** Index of the first unanswered step — where a resumed quiz continues. */
export function resumeStep(a) {
  const steps = stepsFor(a);
  const i = steps.findIndex((s) => !stepDone(s, a));
  return i === -1 ? steps.length : i;
}

function vocabForBand(band) {
  let need = VOCAB_BY_BAND[0][1];
  for (const [b, n] of VOCAB_BY_BAND) if (band >= b) need = n;
  return need;
}

/**
 * Result screen numbers: "Sizga X kun, kuniga Y daqiqa, Z ta so'z kerak".
 * @param {ReturnType<typeof normalizeAnswers>} a
 * @param {Date} [now]
 */
export function planSummary(a, now = new Date()) {
  const cefr = a.diagnosticLevel || SELF_LEVEL_CEFR[a.selfLevel] || 'B1';
  const minutesPerDay = a.dailyMinutes || 20;
  let days = DEFAULT_PLAN_DAYS;
  if (a.examDate && !a.examDateUnknown) {
    const diff = Math.ceil((new Date(`${a.examDate}T00:00:00Z`).getTime() - now.getTime()) / DAY);
    days = Math.max(1, Math.min(MAX_PLAN_DAYS, diff));
  }
  const known = VOCAB_BY_CEFR[cefr];
  // General English: aim one CEFR level up.
  const target = a.goal === 'general' || a.targetBand == null
    ? VOCAB_BY_CEFR[CEFR_LEVELS[Math.min(CEFR_LEVELS.length - 1, CEFR_LEVELS.indexOf(cefr) + 1)]]
    : vocabForBand(a.targetBand);
  const wordsNeeded = Math.max(0, target - known);

  const capacityPerDay = Math.min(
    MAX_NEW_WORDS_PER_DAY,
    Math.max(3, Math.floor((minutesPerDay * VOCAB_SHARE) / MIN_PER_NEW_WORD)),
  );
  const wordsPerDay = wordsNeeded === 0 ? capacityPerDay : Math.min(capacityPerDay, Math.max(3, Math.ceil(wordsNeeded / days)));
  const reachable = wordsPerDay * days;
  const estBand = BAND_BY_CEFR[cefr];

  return {
    cefr,
    estBand,
    days,
    minutesPerDay,
    wordsNeeded,
    wordsPerDay,
    /** false = the gap won't close by the exam date at this pace — the UI suggests more minutes. */
    onTrack: reachable >= wordsNeeded,
    targetBand: a.targetBand,
    weakestSkill: a.weakestSkill || 'writing',
  };
}

/** Map answers onto the User document fields (POST /api/onboarding). */
export function toUserUpdate(a, now = new Date()) {
  const examDate = a.examDate && !a.examDateUnknown
    ? new Date(`${a.examDate}T00:00:00Z`)
    : new Date(now.getTime() + DEFAULT_PLAN_DAYS * DAY);
  const update = {
    goal: a.goal,
    examType: a.goal === 'general' ? null : a.examType,
    targetBand: a.goal === 'general' ? null : a.targetBand,
    examDate: a.goal === 'general' ? null : examDate,
    examDateEstimated: a.goal !== 'general' && !(a.examDate && !a.examDateUnknown),
    currentLevel: a.selfLevel,
    dailyStudyMinutes: a.dailyMinutes,
    weakestSkill: a.weakestSkill,
    onboardingCompletedAt: now,
  };
  if (a.diagnosticLevel) {
    update['vocabOnboarding.completedAt'] = now;
    update['vocabOnboarding.estimatedLevel'] = a.diagnosticLevel;
    if (a.diagnosticScore != null) update['vocabOnboarding.estimatedScore'] = a.diagnosticScore;
  }
  return update;
}
