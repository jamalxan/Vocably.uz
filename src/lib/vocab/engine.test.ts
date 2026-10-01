import { describe, it, expect } from 'vitest';
import { selectWordsForGame, priorityScore, isDue, isNewWord, type SelectableWord } from './selection';
import { assessSession, isPlausibleResponse, minPlausibleMs } from './antiCheat';
import {
  QUEST_DEFS,
  applyQuestEvents,
  daysLeftInPeriod,
  isoWeekKey,
  periodKey,
  periodStartDate,
  questView,
  weeklyAccuracyProgress,
} from './quests';
import { buildDailyPlan, normalizeMinutes, rankGames } from './dailyPlan';
import { checkGameAccess, rolloutBucket, vocabEngineFlag } from './access';
import { buildEvent, sanitizePayload } from './events';
import { CEFR_PATH, buildCefrPath, estimateVocabularyCefr, recommendFromMock } from './recommendations';
import { evaluateAchievements } from './achievements';
import { seededRandom } from './rng';
import { SAMPLE_WORDS } from './fixtures';
import { buildSkillProfile } from './weakness';

const NOW = new Date('2026-10-01T12:00:00Z');
const DAY = 86400000;

const mk = (i: number, over: Partial<SelectableWord> = {}): SelectableWord => ({
  ...SAMPLE_WORDS[i % SAMPLE_WORDS.length],
  wordId: `s${i}`,
  ...over,
});

describe('selectWordsForGame (TZ §7.5 ustuvorlik)', () => {
  it('muddati o\'tgan va zaif so\'zlar ustuvorroq', () => {
    const overdue = mk(1, { srsState: 'review', reps: 5, nextReview: new Date(NOW.getTime() - 10 * DAY), weakness: 70, mastery: 20, lapses: 3 });
    const fine = mk(2, { srsState: 'review', reps: 5, nextReview: new Date(NOW.getTime() + 10 * DAY), weakness: 5, mastery: 90 });
    expect(priorityScore(overdue, NOW)).toBeGreaterThan(priorityScore(fine, NOW));
  });

  it('isDue / isNewWord', () => {
    expect(isNewWord(mk(1))).toBe(true);
    expect(isDue(mk(1), NOW)).toBe(false); // yangi so'z "due" emas
    expect(isDue(mk(1, { srsState: 'review', reps: 2, nextReview: new Date(NOW.getTime() - 1000) }), NOW)).toBe(true);
    expect(isDue(mk(1, { srsState: 'review', reps: 2, nextReview: new Date(NOW.getTime() + DAY) }), NOW)).toBe(false);
  });

  it("so'z kam bo'lsa hammasini qaytaradi", () => {
    const r = selectWordsForGame([mk(1), mk(2)], 10, 'mixed', seededRandom('a'), NOW);
    expect(r.selected.length).toBe(2);
    expect(r.distractors.length).toBe(0);
  });

  it('weak rejimi zaif so\'zlarni tanlaydi', () => {
    const words = [
      ...Array.from({ length: 8 }, (_, i) => mk(i, { weakness: 80, mastery: 10, srsState: 'review', reps: 4 })),
      ...Array.from({ length: 12 }, (_, i) => mk(20 + i, { weakness: 5, mastery: 95, srsState: 'review', reps: 9, nextReview: new Date(NOW.getTime() + 30 * DAY) })),
    ];
    const { selected } = selectWordsForGame(words, 6, 'weak', seededRandom('w'), NOW);
    expect(selected.length).toBe(6);
    expect(selected.every((w) => (w.weakness || 0) >= 40)).toBe(true);
  });

  it('review rejimi due so\'zlarni tanlaydi', () => {
    const due = Array.from({ length: 6 }, (_, i) => mk(i, { srsState: 'review', reps: 3, nextReview: new Date(NOW.getTime() - DAY) }));
    const later = Array.from({ length: 10 }, (_, i) => mk(30 + i, { srsState: 'review', reps: 3, nextReview: new Date(NOW.getTime() + 5 * DAY) }));
    const { selected } = selectWordsForGame([...due, ...later], 5, 'review', seededRandom('r'), NOW);
    expect(selected.every((w) => isDue(w, NOW))).toBe(true);
  });

  it('mixed: takrorsiz, n ta, qolganlari distraktor', () => {
    const words = Array.from({ length: 30 }, (_, i) => mk(i, { mastery: (i * 7) % 100, weakness: (i * 13) % 100 }));
    const r = selectWordsForGame(words, 10, 'mixed', seededRandom('m'), NOW);
    expect(r.selected.length).toBe(10);
    expect(new Set(r.selected.map((w) => w.wordId)).size).toBe(10);
    expect(r.selected.length + r.distractors.length).toBe(30);
  });
});

describe('antiCheat (TZ §39)', () => {
  const t0 = new Date('2026-10-01T10:00:00Z');
  const human = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ responseMs: 2200 + ((i * 731) % 2800), inputType: 'choice', promptLength: 12 }));

  it("odatiy o'yinchi shubhali emas", () => {
    const answers = human(10);
    const total = answers.reduce((s, a) => s + a.responseMs, 0);
    const r = assessSession({ answers, startedAt: t0, completedAt: new Date(t0.getTime() + total + 4000) });
    expect(r.suspicious).toBe(false);
    expect(r.flags).toEqual([]);
  });

  it("mumkin bo'lmagan tez javoblar (o'qish vaqtidan kam)", () => {
    const answers = Array.from({ length: 10 }, () => ({ responseMs: 60, inputType: 'choice', promptLength: 20 }));
    const r = assessSession({ answers, startedAt: t0, completedAt: new Date(t0.getTime() + 20000) });
    expect(r.suspicious).toBe(true);
    expect(r.flags).toContain('impossible_response_time');
  });

  it("klient bergan vaqtlar haqiqiy vaqtdan katta bo'lsa (soxta vaqt)", () => {
    const answers = human(10);
    const r = assessSession({ answers, startedAt: t0, completedAt: new Date(t0.getTime() + 3000) });
    expect(r.suspicious).toBe(true);
    expect(r.flags).toContain('response_time_exceeds_elapsed');
  });

  it("bir xil vaqtli javoblar — bot", () => {
    const answers = Array.from({ length: 12 }, () => ({ responseMs: 2000, inputType: 'choice', promptLength: 10 }));
    const r = assessSession({ answers, startedAt: t0, completedAt: new Date(t0.getTime() + 12 * 2000 + 2000) });
    expect(r.flags).toContain('bot_like_timing');
    expect(r.suspicious).toBe(true);
  });

  it("javobsiz sessiya shubhali emas; minPlausibleMs yozma/juftlikda katta", () => {
    expect(assessSession({ answers: [], startedAt: t0, completedAt: t0 }).suspicious).toBe(false);
    expect(minPlausibleMs({ inputType: 'typed', promptLength: 0 })).toBeGreaterThan(minPlausibleMs({ inputType: 'choice', promptLength: 0 }));
    expect(minPlausibleMs({ inputType: 'match', units: 5 })).toBeGreaterThan(minPlausibleMs({ inputType: 'match', units: 1 }));
    expect(isPlausibleResponse({ responseMs: 100, inputType: 'typed' })).toBe(false);
    expect(isPlausibleResponse({ responseMs: 3000, inputType: 'typed' })).toBe(true);
    expect(isPlausibleResponse({ responseMs: 11 * 60 * 1000, inputType: 'choice' })).toBe(false);
  });
});

describe('quests (TZ §16)', () => {
  it('davr kalitlari: kunlik sana, haftalik ISO hafta', () => {
    expect(periodKey('daily', NOW, 'Asia/Tashkent')).toBe('2026-10-01');
    expect(periodKey('weekly', NOW, 'Asia/Tashkent')).toBe('2026-W40');
    expect(isoWeekKey('2026-01-01')).toBe('2026-W01');
    expect(isoWeekKey('2025-12-29')).toBe('2026-W01');
    expect(isoWeekKey('2026-12-31')).toBe('2026-W53');
    expect(isoWeekKey('2024-12-30')).toBe('2025-W01');
  });
  it('haftalik boshlanish sanasi dushanba', () => {
    expect(periodStartDate('weekly', NOW, 'Asia/Tashkent')).toBe('2026-09-28'); // 2026-10-01 payshanba
    expect(daysLeftInPeriod('weekly', NOW, 'Asia/Tashkent')).toBe(3);
  });
  it('hodisalar progressni oshiradi va target bilan cheklanadi', () => {
    const defs = QUEST_DEFS.filter((d) => d.period === 'daily');
    let p = applyQuestEvents({}, defs, [{ metric: 'games', amount: 1 }]);
    expect(p.daily_games_2).toBe(1);
    p = applyQuestEvents(p, defs, [{ metric: 'games', amount: 5 }, { metric: 'new_words', amount: 3 }]);
    expect(p.daily_games_2).toBe(2); // target
    expect(p.daily_learn_10).toBe(3);
    expect(applyQuestEvents({}, defs, [{ metric: 'games', amount: 0 }])).toEqual({});
  });
  it("derived (aniqlik) vazifa hodisalardan o'zgarmaydi", () => {
    const weekly = QUEST_DEFS.filter((d) => d.period === 'weekly');
    const p = applyQuestEvents({}, weekly, [{ metric: 'weekly_accuracy', amount: 95 }]);
    expect(p.weekly_accuracy_90).toBeUndefined();
  });
  it("haftalik aniqlik: kamida 5 o'yin kerak", () => {
    const s = (c: number, w: number) => ({ correctCount: c, wrongCount: w });
    expect(weeklyAccuracyProgress([s(9, 1), s(10, 0), s(9, 1)])).toBe(0);
    expect(weeklyAccuracyProgress([s(9, 1), s(10, 0), s(9, 1), s(10, 0), s(10, 0)])).toBe(96);
  });
  it('questView', () => {
    const def = QUEST_DEFS.find((d) => d.key === 'daily_review_20')!;
    const v = questView(def, 25, false);
    expect(v.progress).toBe(20);
    expect(v.done).toBe(true);
    expect(v.ratio).toBe(1);
  });
  it('mukofotlar config orqali', () => {
    expect(QUEST_DEFS.filter((d) => d.period === 'daily').every((d) => d.rewardXp === 100)).toBe(true);
    expect(QUEST_DEFS.filter((d) => d.period === 'weekly').every((d) => d.rewardXp === 500)).toBe(true);
  });
});

describe('dailyPlan (TZ §19, §47)', () => {
  const base = { dueCount: 18, overdueCount: 6, weakCount: 5, newAvailable: 40, availableGames: ['word_match', 'listen_choose', 'fill_gap'] };

  it('normalizeMinutes', () => {
    expect(normalizeMinutes(7)).toBe(5);
    expect(normalizeMinutes(25)).toBe(20);
    expect(normalizeMinutes(60)).toBe(45);
    expect(normalizeMinutes(null)).toBe(10);
    expect(normalizeMinutes(0)).toBe(10);
  });

  it("5 daqiqalik reja qisqa: takrorlash birinchi, 5 daqiqadan oshmaydi", () => {
    const plan = buildDailyPlan({ ...base, minutes: 5 });
    expect(plan.items[0].type).toBe('review');
    expect(plan.totalMinutes).toBeLessThanOrEqual(7);
    expect(plan.summary.listening + plan.summary.writing + plan.summary.speaking).toBe(0);
  });

  it("45 daqiqalik reja barcha ko'nikmalarni o'z ichiga oladi", () => {
    const plan = buildDailyPlan({ ...base, minutes: 45 });
    const types = plan.items.map((i) => i.type);
    expect(types).toEqual(expect.arrayContaining(['review', 'weak', 'new', 'game', 'listening', 'writing', 'speaking']));
    expect(plan.summary.games).toBe(3);
  });

  it("reja vaqt oshgani sari kengayadi", () => {
    const short = buildDailyPlan({ ...base, minutes: 10 }).items.length;
    const long = buildDailyPlan({ ...base, minutes: 30 }).items.length;
    expect(long).toBeGreaterThan(short);
  });

  it("yangi so'z limiti (tarif) hurmat qilinadi", () => {
    const plan = buildDailyPlan({ ...base, minutes: 30, newWordsRemaining: 2 });
    expect(plan.summary.newWords).toBe(2);
    const none = buildDailyPlan({ ...base, minutes: 30, newWordsRemaining: 0 });
    expect(none.summary.newWords).toBe(0);
  });

  it("bugun bajarilgan takrorlash/o'yinlar rejadan ayiriladi", () => {
    const plan = buildDailyPlan({ ...base, minutes: 20, done: { reviews: 18, games: 2 } });
    expect(plan.summary.review).toBe(0);
    expect(plan.summary.games).toBe(0);
  });

  it("zaif ko'nikma o'yini birinchi o'rinda", () => {
    const profile = buildSkillProfile([{ skills: { listening: { correct: 1, wrong: 9 }, recall: { correct: 19, wrong: 1 } } }]);
    const ranked = rankGames(['word_match', 'listen_choose'], profile);
    expect(ranked[0]).toBe('listen_choose');
  });

  it("hech narsa yo'q (bo'sh holat) reja bo'sh", () => {
    const plan = buildDailyPlan({ minutes: 10, dueCount: 0, overdueCount: 0, weakCount: 0, newAvailable: 0, availableGames: [] });
    expect(plan.items).toEqual([]);
  });
});

describe('access: feature flag va tarif (TZ §48, §61)', () => {
  it('rolloutBucket deterministik 0..99', () => {
    const b = rolloutBucket('user-1');
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(100);
    expect(rolloutBucket('user-1')).toBe(b);
  });
  it("foiz oshganda avval yoqilganlar chiqib ketmaydi", () => {
    const ids = Array.from({ length: 200 }, (_, i) => `u${i}`);
    const at25 = ids.filter((id) => vocabEngineFlag(id, 'user', { VOCAB_ENGINE_ROLLOUT_PERCENT: '25' }).enabled);
    const at50 = ids.filter((id) => vocabEngineFlag(id, 'user', { VOCAB_ENGINE_ROLLOUT_PERCENT: '50' }).enabled);
    expect(at25.length).toBeGreaterThan(20);
    expect(at25.length).toBeLessThan(90);
    for (const id of at25) expect(at50).toContain(id);
  });
  it("0% da faqat admin va allowlist; 'false' hammasini o'chiradi", () => {
    expect(vocabEngineFlag('u1', 'user', { VOCAB_ENGINE_ROLLOUT_PERCENT: '0' }).enabled).toBe(false);
    expect(vocabEngineFlag('u1', 'admin', { VOCAB_ENGINE_ROLLOUT_PERCENT: '0' }).enabled).toBe(true);
    expect(vocabEngineFlag('u1', 'user', { VOCAB_ENGINE_ROLLOUT_PERCENT: '0', VOCAB_ENGINE_ALLOWLIST: 'x, u1' }).enabled).toBe(true);
    expect(vocabEngineFlag('u1', 'admin', { VOCAB_ENGINE_ENABLED: 'false' }).enabled).toBe(false);
    expect(vocabEngineFlag('u1', 'user', {}).enabled).toBe(true); // standart: 100%
  });
  it("tarif: premium o'yin free da yopiq; kunlik limit", () => {
    expect(checkGameAccess('free', 'vocabulary_boss', 0)).toMatchObject({ allowed: false, code: 'tier' });
    expect(checkGameAccess('free', 'listen_type', 0)).toMatchObject({ allowed: false, code: 'tier' });
    expect(checkGameAccess('free', 'word_match', 0).allowed).toBe(true);
    expect(checkGameAccess('free', 'word_match', 6)).toMatchObject({ allowed: false, code: 'daily_limit' });
    expect(checkGameAccess('standard', 'listen_type', 6).allowed).toBe(true);
    expect(checkGameAccess('premium', 'vocabulary_boss', 500).allowed).toBe(true);
    expect(checkGameAccess('premium', 'nope', 0).code).toBe('unknown_game');
  });
});

describe('events (TZ §35)', () => {
  it("noma'lum hodisa rad etiladi, schema versiyasi qo'shiladi", () => {
    expect(buildEvent({ name: 'hack_event' })).toBeNull();
    const e = buildEvent({ name: 'game_completed', payload: { game: 'word_match', score: 840 } })!;
    expect(e.schemaVersion).toBe(1);
    expect(e.payload).toEqual({ game: 'word_match', score: 840 });
  });
  it("payload tozalanadi: obyekt/massiv/uzun satr/noto'g'ri kalit tushib qoladi", () => {
    const p = sanitizePayload({ ok: 'x'.repeat(500), nested: { a: 1 }, arr: [1], 'bad key!': 1, n: NaN, t: true, z: null });
    expect(Object.keys(p).sort()).toEqual(['ok', 't', 'z']);
    expect((p.ok as string).length).toBe(120);
  });
});

describe('recommendations (TZ §26, §46)', () => {
  it("eng zaif ko'nikma aniqlanadi va ko'proq mashq tavsiya qilinadi", () => {
    const r = recommendFromMock({ listening: 5.0, reading: 6.5, writing: 6.0, speaking: 6.5 }, 7);
    expect(r.weakestSkill).toBe('listening');
    expect(r.listeningGames).toBeGreaterThan(r.readingExercises);
    expect(r.academicWords).toBeGreaterThan(10);
    expect(r.message).toContain('Tinglash');
  });
  it("ma'lumot yo'q — muvozanatli tavsiya", () => {
    const r = recommendFromMock({}, null);
    expect(r.weakestSkill).toBeNull();
    expect(r.academicWords).toBe(10);
  });
  it("CEFR yo'li va lug'at darajasini baholash", () => {
    expect(CEFR_PATH).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    expect(estimateVocabularyCefr([{ cefr: 'B1', mastery: 50 }])).toBeNull();
    const words = [
      ...Array.from({ length: 10 }, () => ({ cefr: 'A2', mastery: 80 })),
      ...Array.from({ length: 8 }, () => ({ cefr: 'B1', mastery: 70 })),
      ...Array.from({ length: 6 }, () => ({ cefr: 'B2', mastery: 60 })),
      { cefr: 'C1', mastery: 90 },
    ];
    expect(estimateVocabularyCefr(words)).toBe('B2');
  });
  it("buildCefrPath: har daraja bo'yicha son va holat; IELTS bilan aralashmaydi", () => {
    const words = [
      ...Array.from({ length: 10 }, () => ({ cefr: 'A2', mastery: 80 })),
      ...Array.from({ length: 8 }, () => ({ cefr: 'B1', mastery: 70 })),
      ...Array.from({ length: 6 }, () => ({ cefr: 'B2', mastery: 60 })),
      { cefr: 'C1', mastery: 10 },
      { mastery: 50 },
    ];
    const p = buildCefrPath(words);
    expect(p.current).toBe('B2');
    expect(p.steps.map((s) => s.status)).toEqual(['reached', 'reached', 'reached', 'current', 'upcoming', 'upcoming']);
    expect(p.steps.find((s) => s.level === 'C1')).toMatchObject({ total: 1, learned: 0 });
    expect(p.unlabeled).toBe(1);
    expect(buildCefrPath([]).current).toBeNull();
    expect(buildCefrPath([]).steps.every((s) => s.status === 'upcoming')).toBe(true);
  });
});

describe('achievements (TZ §17)', () => {
  it('statistikaga qarab faqat yangi yutuqlar qaytariladi', () => {
    const got = evaluateAchievements({ totalWords: 3, gamesCompleted: 1 }, []).map((d) => d.key);
    expect(got).toEqual(expect.arrayContaining(['first_word', 'first_game']));
    const again = evaluateAchievements({ totalWords: 3, gamesCompleted: 1 }, ['first_word', 'first_game']);
    expect(again).toEqual([]);
  });
  it('master yutuqlar yuqori chegaralar talab qiladi', () => {
    expect(evaluateAchievements({ listeningCorrect: 199 }, []).some((d) => d.key === 'listening_master')).toBe(false);
    expect(evaluateAchievements({ listeningCorrect: 200 }, []).some((d) => d.key === 'listening_master')).toBe(true);
  });
});
