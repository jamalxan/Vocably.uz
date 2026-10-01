// Haqiqiy MongoDB (mongodb-memory-server) ustida integratsiya testi:
// Game -> Result -> XP -> Mastery -> SRS -> Quest -> Achievement zanjiri (TZ §58).
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { SAMPLE_WORDS } from '../fixtures';
import { awardXpOnce } from './ledger';
import { abandonSession, completeSession, getActiveSession, startGameSession, submitAnswers, ServiceError } from './sessionService';
import { getQuestViews } from './questService';

// models.js — oddiy JS: Mongoose generik turlari TS'da mos kelmaydi (boshqa testlardagidek `any`).
const GameSession: any = Models.GameSession;
const User: any = Models.User;
const UserQuest: any = Models.UserQuest;
const XpEvent: any = Models.XpEvent;
const VocabEvent: any = Models.VocabEvent;

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;

const T0 = new Date('2026-10-01T10:00:00Z');

function makeWords() {
  return SAMPLE_WORDS.map((w) => ({
    word: w.word,
    syns: w.translations,
    enrichment: {
      definitionEn: w.definitionEn,
      examples: (w.examples || []).map((e) => ({ en: e.en, uz: e.uz || '' })),
      synonymsEn: w.synonymsEn,
      antonyms: w.antonyms,
      cefr: 'B2',
    },
  }));
}

async function createUser(over: Record<string, unknown> = {}) {
  return User.create({
    phone: `+99890${Math.floor(Math.random() * 1e7)}`,
    name: 'Test',
    password: 'x',
    timezone: 'Asia/Tashkent',
    categories: [{ name: 'IELTS', words: makeWords() }],
    ...over,
  });
}

/** Sessiyani bevosita bazadan o'qib, barcha savollarga TO'G'RI javob yuboradi (test yordamchisi). */
async function answerAll(sessionId: string, userId: string, opts: { wrongEvery?: number; startMs?: number } = {}) {
  const s = await GameSession.findById(sessionId).lean();
  const answers: Array<{ qid: string; answer: unknown; responseMs: number }> = [];
  let ms = opts.startMs ?? 2400;
  s!.questions.forEach((q: any, i: number) => {
    let answer: unknown;
    const wrong = opts.wrongEvery ? (i + 1) % opts.wrongEvery === 0 : false;
    if (q.inputType === 'choice') {
      answer = wrong ? q.options.find((o: any) => o.id !== q.answer).id : q.answer;
    } else if (q.inputType === 'typed') {
      answer = wrong ? 'zzzzzz' : q.accepted[0];
    } else if (q.inputType === 'arrange') {
      answer = wrong ? q.tokens : q.answerTokens;
    } else {
      answer = wrong ? {} : q.answerMap;
    }
    ms += 1150; // tabiiy tebranish (bot-ga o'xshamasligi uchun)
    answers.push({ qid: q.qid, answer, responseMs: 2500 + ((i * 937) % 2600) });
  });
  const total = answers.reduce((sum, a) => sum + a.responseMs, 0);
  const out = await submitAnswers({ userId, sessionId, answers, now: new Date(T0.getTime() + 1000) });
  return { out, total, answers };
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ binary: { version: process.env.MONGOMS_VERSION || '7.0.24' } });
  await mongoose.connect(mongod.getUri(), { dbName: 'vocab_test' });
  await Promise.all([GameSession.init(), XpEvent.init(), UserQuest.init()]);
}, 600_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
}, 60_000);

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), GameSession.deleteMany({}), XpEvent.deleteMany({}), UserQuest.deleteMany({}), VocabEvent.deleteMany({})]);
});

describeDb('XP ledger idempotentligi', () => {
  it('bir xil idempotencyKey ikki marta XP bermaydi', async () => {
    const u = await createUser();
    const a = await awardXpOnce(u._id, 50, { reason: 'game', sourceType: 'game', idempotencyKey: 'k1' });
    const b = await awardXpOnce(u._id, 50, { reason: 'game', sourceType: 'game', idempotencyKey: 'k1' });
    expect(a.awarded).toBe(true);
    expect(b.duplicate).toBe(true);
    expect((await User.findById(u._id))!.xp).toBe(50);
    expect(await XpEvent.countDocuments({ idempotencyKey: 'k1' })).toBe(1);
  });
  it("parallel so'rovlarda ham bir marta", async () => {
    const u = await createUser();
    const rs = await Promise.all(Array.from({ length: 8 }, () => awardXpOnce(u._id, 30, { reason: 'quest', sourceType: 'quest', idempotencyKey: 'par' })));
    expect(rs.filter((r) => r.awarded).length).toBe(1);
    expect((await User.findById(u._id))!.xp).toBe(30);
  });
  it('kalitsiz eski XP yozuvlari (review) bir nechta bo\'la oladi', async () => {
    const u = await createUser();
    await XpEvent.create({ userId: u._id, amount: 3, reason: 'review' });
    await XpEvent.create({ userId: u._id, amount: 3, reason: 'review' });
    expect(await XpEvent.countDocuments({ userId: u._id })).toBe(2);
  });
});

describeDb('O\'yin sessiyasi: start', () => {
  it("klientga javobsiz savollar qaytadi, serverda javoblar saqlanadi", async () => {
    const u = await createUser();
    const view: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', difficulty: 'medium', now: T0 });
    expect(view.questions.length).toBe(10);
    for (const q of view.questions) {
      expect(q.answer).toBeUndefined();
      expect(q.accepted).toBeUndefined();
      expect(q.correctDisplay).toBeUndefined();
    }
    const stored: any = await GameSession.findById(view.sessionId).lean();
    expect(stored.questions[0].answer).toBeTruthy();
    expect(stored.status).toBe('active');
    expect(await VocabEvent.countDocuments({ name: 'game_started' })).toBe(1);
  });

  it("'auto' qiyinlik mastery bo'yicha tanlanadi", async () => {
    const u = await createUser();
    const view: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', difficulty: 'auto', now: T0 });
    expect(['easy', 'medium']).toContain(view.difficulty);
    expect(view.suggestedDifficulty).toBe(view.difficulty);
  });

  it('bepul tarifda premium/standard o\'yinlar yopiq (backend)', async () => {
    const u = await createUser();
    await expect(startGameSession({ user: u.toObject(), gameKey: 'vocabulary_boss', now: T0 })).rejects.toMatchObject({ status: 403, code: 'tier' });
    await expect(startGameSession({ user: u.toObject(), gameKey: 'listen_type', now: T0 })).rejects.toMatchObject({ status: 403 });
    const std = await createUser({ subscriptionTier: 'standard' });
    await expect(startGameSession({ user: std.toObject(), gameKey: 'listen_type', now: T0 })).resolves.toBeTruthy();
  });

  it("kam so'z — 422 va sabab", async () => {
    const u = await createUser({ categories: [{ name: 'x', words: makeWords().slice(0, 2) }] });
    await expect(startGameSession({ user: u.toObject(), gameKey: 'word_match', now: T0 })).rejects.toMatchObject({ status: 422, code: 'not_enough_words' });
  });

  it('kunlik sessiya limiti majburlanadi (free: 6)', async () => {
    const u = await createUser();
    for (let i = 0; i < 6; i++) {
      await startGameSession({ user: u.toObject(), gameKey: 'word_match', now: new Date(T0.getTime() + i * 90_000) });
    }
    await expect(startGameSession({ user: u.toObject(), gameKey: 'word_match', now: new Date(T0.getTime() + 7 * 90_000) })).rejects.toMatchObject({ code: 'daily_limit' });
  });

  it("daqiqada ko'p sessiya boshlash cheklanadi", async () => {
    const u = await createUser({ subscriptionTier: 'premium' });
    let err: any = null;
    for (let i = 0; i < 8; i++) {
      try {
        await startGameSession({ user: u.toObject(), gameKey: 'word_match', now: new Date(T0.getTime() + i * 1000) });
      } catch (e) {
        err = e;
      }
    }
    expect(err).toBeInstanceOf(ServiceError);
    expect(err.status).toBe(429);
  });

  it('faol sessiyani qayta tiklash (refresh)', async () => {
    const u = await createUser();
    const view: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const again: any = await getActiveSession({ userId: u._id, gameKey: 'multiple_choice', now: new Date(T0.getTime() + 60_000) });
    expect(again.sessionId).toBe(view.sessionId);
    expect(again.questions[0].answer).toBeUndefined();
  });
});

describeDb('Javoblar (batch, idempotent, server-side tekshiruv)', () => {
  it("noto'g'ri javob correctDisplay + tushuntirish bilan, to'g'ri javob ham", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const s: any = await GameSession.findById(v.sessionId).lean();
    const q = s.questions[0];
    const wrongId = q.options.find((o: any) => o.id !== q.answer).id;
    const r1 = await submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: [{ qid: q.qid, answer: wrongId, responseMs: 2500 }], now: T0 });
    expect(r1.results[0]).toMatchObject({ isCorrect: false });
    expect((r1.results[0] as any).correctDisplay).toBe(q.correctDisplay);
    expect((r1.results[0] as any).explanation.length).toBeGreaterThan(3);
  });

  it("takroriy yuborish bir xil natija qaytaradi va ikki marta sanalmaydi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const s: any = await GameSession.findById(v.sessionId).lean();
    const q = s.questions[0];
    const payload = [{ qid: q.qid, answer: q.answer, responseMs: 3000 }];
    const a = await submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: payload, now: T0 });
    const b = await submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: payload, now: T0 });
    expect(a.results[0]).toMatchObject({ isCorrect: true });
    expect(b.results[0]).toMatchObject({ isCorrect: true });
    const fresh: any = await GameSession.findById(v.sessionId).lean();
    expect(fresh.answers.length).toBe(1);
    expect(fresh.correctCount).toBe(1);
  });

  it("parallel takroriy yuborish bitta yozuv qoldiradi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const s: any = await GameSession.findById(v.sessionId).lean();
    const q = s.questions[0];
    await Promise.all(Array.from({ length: 6 }, () => submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: [{ qid: q.qid, answer: q.answer, responseMs: 3000 }], now: T0 })));
    const fresh: any = await GameSession.findById(v.sessionId).lean();
    expect(fresh.answers.length).toBe(1);
    expect(fresh.correctCount).toBe(1);
  });

  it("klientning 'isCorrect'/'xp' maydonlari e'tiborsiz: faqat xom javob hisoblanadi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const s: any = await GameSession.findById(v.sessionId).lean();
    const q = s.questions[0];
    const wrongId = q.options.find((o: any) => o.id !== q.answer).id;
    const r = await submitAnswers({
      userId: u._id,
      sessionId: v.sessionId,
      answers: [{ qid: q.qid, answer: wrongId, responseMs: 2000, isCorrect: true, xp: 100000 } as any],
      now: T0,
    });
    expect(r.results[0]).toMatchObject({ isCorrect: false });
  });

  it("noma'lum savol va boshqa foydalanuvchi sessiyasi rad etiladi", async () => {
    const u = await createUser();
    const other = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const r = await submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: [{ qid: 'q999', answer: 'o1', responseMs: 2000 }], now: T0 });
    expect((r.results[0] as any).error).toBeTruthy();
    await expect(submitAnswers({ userId: other._id, sessionId: v.sessionId, answers: [{ qid: 'q1', answer: 'o1', responseMs: 2000 }], now: T0 })).rejects.toMatchObject({ status: 404 });
    await expect(submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: [], now: T0 })).rejects.toMatchObject({ status: 400 });
    await expect(submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: Array.from({ length: 61 }, () => ({ qid: 'q1', answer: 'o1', responseMs: 1 })), now: T0 })).rejects.toMatchObject({ status: 400 });
  });

  it("muddati o'tgan sessiyaga javob berib bo'lmaydi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    await expect(submitAnswers({ userId: u._id, sessionId: v.sessionId, answers: [{ qid: 'q1', answer: 'o1', responseMs: 2000 }], now: new Date(T0.getTime() + 5 * 3600 * 1000) })).rejects.toMatchObject({ status: 410 });
  });

  it("so'z statistikasi yangilanadi: skills, mastery, SRS; xato so'z lapse oladi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    await answerAll(v.sessionId, String(u._id), { wrongEvery: 4 });
    const fresh: any = await User.findById(u._id).lean();
    const words = fresh.categories[0].words;
    const touched = words.filter((w: any) => (w.stats.skills?.recall?.correct || 0) + (w.stats.skills?.recall?.wrong || 0) > 0);
    expect(touched.length).toBeGreaterThan(3);
    expect(touched.some((w: any) => w.stats.mastery > 0)).toBe(true);
    expect(touched.some((w: any) => (w.stats.skills.recall.wrong || 0) > 0 && w.stats.lapses >= 0 && w.stats.srsState)).toBe(true);
    const wrongWord = touched.find((w: any) => (w.stats.skills.recall.wrong || 0) > 0);
    expect(wrongWord.stats.lastWrongAt).toBeTruthy();
    expect(wrongWord.stats.streakCount).toBe(0);
    const goodWord = touched.find((w: any) => (w.stats.skills.recall.correct || 0) > 0 && !(w.stats.skills.recall.wrong > 0));
    expect(goodWord.stats.masteryVersion).toBe('mastery_algorithm_v1');
  });
});

// Sinov so'zlari hammasi yangi: birinchi o'yinning o'zi "10 ta yangi so'z" kvestini ham yakunlaydi (to'g'ri xatti-harakat).
const questXp = (done: any) => (done.questsCompleted || []).reduce((sum: number, q: any) => sum + (q.rewardXp || 0), 0);

describeDb('Yakunlash: XP -> streak -> kvest -> yutuq (idempotent)', () => {
  async function playFull(u: any, now = T0, gameKey = 'multiple_choice', opts: any = {}) {
    const v: any = await startGameSession({ user: (await User.findById(u._id))!.toObject(), gameKey, difficulty: 'medium', now });
    const { total } = await answerAll(v.sessionId, String(u._id), opts);
    const done = await completeSession({ userId: u._id, sessionId: v.sessionId, now: new Date(now.getTime() + total + 6000) });
    return { v, done };
  }

  it("to'liq zanjir: XP serverda hisoblanadi, ledger yoziladi, streak/kvest/statistika yangilanadi", async () => {
    const u = await createUser();
    const { done } = await playFull(u);
    expect(done.accuracy).toBe(100);
    expect(done.xp.earned).toBeGreaterThan(0);
    expect(done.suspicious ?? false).toBe(false);
    expect(done.xp.breakdown.correct).toBe(10 * 5);

    const user: any = await User.findById(u._id).lean();
    expect(user.xp).toBe(done.xp.earned + questXp(done));
    expect(user.reviewStreak).toBe(1);
    expect(user.lastReviewDate).toBe('2026-10-01');
    expect(user.gameStats.gamesCompleted).toBe(1);
    expect(user.gameStats.perfectSessions).toBe(1);

    const ledger = await XpEvent.find({ userId: u._id, sourceType: 'game' }).lean();
    expect(ledger.length).toBe(1);
    expect(ledger[0].idempotencyKey).toBe(`game:${done.sessionId}:complete`);

    const quests = await getQuestViews({ userId: u._id, timeZone: 'Asia/Tashkent', now: T0 });
    expect(quests.daily.find((q) => q.key === 'daily_games_2')!.progress).toBe(1);
    expect(user.badges.map((b: any) => b.key)).toEqual(expect.arrayContaining(['first_word', 'first_game']));
    expect(await VocabEvent.countDocuments({ name: 'game_completed' })).toBe(1);
  });

  it('complete ikki marta chaqirilsa XP ikki marta berilmaydi', async () => {
    const u = await createUser();
    const { v, done } = await playFull(u);
    const again = await completeSession({ userId: u._id, sessionId: v.sessionId, now: new Date(T0.getTime() + 999999) });
    expect(again.duplicate).toBe(true);
    expect(again.xp.earned).toBe(done.xp.earned);
    expect((await User.findById(u._id))!.xp).toBe(done.xp.earned + questXp(done));
    expect(await XpEvent.countDocuments({ userId: u._id, sourceType: 'game' })).toBe(1);
  });

  it("parallel complete — XP bir marta", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', difficulty: 'medium', now: T0 });
    const { total } = await answerAll(v.sessionId, String(u._id));
    const at = new Date(T0.getTime() + total + 6000);
    const rs = await Promise.all(Array.from({ length: 5 }, () => completeSession({ userId: u._id, sessionId: v.sessionId, now: at })));
    expect(new Set(rs.map((r) => r.sessionId)).size).toBe(1);
    expect(await XpEvent.countDocuments({ userId: u._id, sourceType: 'game' })).toBe(1);
    const user: any = await User.findById(u._id).lean();
    expect(user.gameStats.gamesCompleted).toBe(1);
    const quests = await getQuestViews({ userId: u._id, timeZone: 'Asia/Tashkent', now: T0 });
    expect(quests.daily.find((q) => q.key === 'daily_games_2')!.progress).toBe(1);
  });

  it("ikkinchi o'yin kunlik kvestni yakunlaydi va 100 XP beradi (bir marta)", async () => {
    const u = await createUser();
    await playFull(u, T0);
    const second = await playFull(u, new Date(T0.getTime() + 3 * 60_000));
    expect(second.done.questsCompleted.map((q: any) => q.key)).toContain('daily_games_2');
    const quest: any = await UserQuest.findOne({ userId: u._id, questKey: 'daily_games_2' }).lean();
    expect(quest.completedAt).toBeTruthy();
    expect(quest.rewardClaimedAt).toBeTruthy();
    const gamesQuestKey = /^quest:daily_games_2:/;
    expect(await XpEvent.countDocuments({ userId: u._id, sourceType: 'quest', idempotencyKey: gamesQuestKey })).toBe(1);
    // uchinchi o'yin yana kvest XP bermaydi
    await playFull(u, new Date(T0.getTime() + 6 * 60_000));
    expect(await XpEvent.countDocuments({ userId: u._id, sourceType: 'quest', idempotencyKey: gamesQuestKey })).toBe(1);
  });

  it("bot-ga o'xshash (bir xil vaqtli) sessiya XP olmaydi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', difficulty: 'medium', now: T0 });
    const s: any = await GameSession.findById(v.sessionId).lean();
    const answers = s.questions.map((q: any) => ({ qid: q.qid, answer: q.answer, responseMs: 2500 }));
    await submitAnswers({ userId: u._id, sessionId: v.sessionId, answers, now: T0 });
    const done = await completeSession({ userId: u._id, sessionId: v.sessionId, now: new Date(T0.getTime() + 10 * 2500 + 3000) });
    expect(done.xp.earned).toBe(0);
    expect(done.notice).toBeTruthy();
    expect((await User.findById(u._id))!.xp).toBe(0);
    const stored: any = await GameSession.findById(v.sessionId).lean();
    expect(stored.suspicious).toBe(true);
    expect(stored.flags).toContain('bot_like_timing');
    // shubhali sessiya kvest/streakni oshirmaydi
    const user: any = await User.findById(u._id).lean();
    expect(user.reviewStreak || 0).toBe(0);
  });

  it("mumkin bo'lmagan tez javoblar (soxta vaqt) — XP yo'q", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', difficulty: 'medium', now: T0 });
    const s: any = await GameSession.findById(v.sessionId).lean();
    const answers = s.questions.map((q: any, i: number) => ({ qid: q.qid, answer: q.answer, responseMs: 30 + i }));
    await submitAnswers({ userId: u._id, sessionId: v.sessionId, answers, now: T0 });
    const done = await completeSession({ userId: u._id, sessionId: v.sessionId, now: new Date(T0.getTime() + 500) });
    expect(done.xp.earned).toBe(0);
  });

  it("javobsiz yakunlash 0 XP, streak oshmaydi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const done = await completeSession({ userId: u._id, sessionId: v.sessionId, now: new Date(T0.getTime() + 5000) });
    expect(done.xp.earned).toBe(0);
    expect(done.skipped).toBeGreaterThan(0);
    expect((await User.findById(u._id))!.reviewStreak || 0).toBe(0);
  });

  it("xatolar ro'yxati: sizning javobingiz, to'g'ri javob, izoh", async () => {
    const u = await createUser();
    const { done } = await playFull(u, T0, 'multiple_choice', { wrongEvery: 3 });
    expect(done.mistakes.length).toBeGreaterThan(0);
    const m = done.mistakes[0];
    expect(m.correctAnswer).toBeTruthy();
    expect(m.explanation).toBeTruthy();
    expect(m.yourAnswer).not.toBe(m.correctAnswer);
    expect(done.weakWordCount).toBeGreaterThan(0);
    expect(done.accuracy).toBeLessThan(100);
  });

  it("juftlik o'yini (match) juftliklar bo'yicha hisoblanadi", async () => {
    const u = await createUser();
    const { done } = await playFull(u, T0, 'word_match');
    expect(done.accuracy).toBe(100);
    expect(done.total).toBe(3 * 5);
  });

  it("yozma o'yin (fill_gap hard) va tinglab yozish ishlaydi; listening/spelling statistikasi yig'iladi", async () => {
    const u = await createUser({ subscriptionTier: 'standard' });
    await playFull(u, T0, 'listen_type');
    const user: any = await User.findById(u._id).lean();
    expect(user.gameStats.spellingCorrect).toBeGreaterThan(0);
    expect(user.gameStats.listeningCorrect).toBeGreaterThan(0);
  });

  it("kunlik XP chegarasi: o'yinlardan olingan XP cheklanadi", async () => {
    const u = await createUser();
    await XpEvent.create({ userId: u._id, amount: 3990, reason: 'game', sourceType: 'game', idempotencyKey: 'pre', createdAt: T0 });
    await User.updateOne({ _id: u._id }, { $set: { xp: 3990 } });
    const { done } = await playFull(u, new Date(T0.getTime() + 60_000));
    expect(done.xp.earned).toBeLessThanOrEqual(10);
    expect(done.xp.breakdown.capped).toBe(true);
  });

  it("abandonSession XP bermaydi", async () => {
    const u = await createUser();
    const v: any = await startGameSession({ user: u.toObject(), gameKey: 'multiple_choice', now: T0 });
    const r = await abandonSession({ userId: u._id, sessionId: v.sessionId });
    expect(r.abandoned).toBe(true);
    await expect(completeSession({ userId: u._id, sessionId: v.sessionId, now: T0 })).rejects.toMatchObject({ status: 410 });
    expect((await User.findById(u._id))!.xp).toBe(0);
  });
});

describeDb('Streak va freeze (o\'yin orqali)', () => {
  it("ketma-ket kunlar streak ni oshiradi; o'tkazib yuborilgan kun uzadi", async () => {
    const u = await createUser({ subscriptionTier: 'premium' });
    const play = async (now: Date) => {
      const v: any = await startGameSession({ user: (await User.findById(u._id))!.toObject(), gameKey: 'multiple_choice', difficulty: 'medium', now });
      const { total } = await answerAll(v.sessionId, String(u._id));
      return completeSession({ userId: u._id, sessionId: v.sessionId, now: new Date(now.getTime() + total + 6000) });
    };
    const d1 = await play(T0);
    expect(d1.streak.streak).toBe(1);
    const d2 = await play(new Date(T0.getTime() + 24 * 3600 * 1000));
    expect(d2.streak.streak).toBe(2);
    const d4 = await play(new Date(T0.getTime() + 3 * 24 * 3600 * 1000));
    expect(d4.streak.streak).toBe(1);
    expect(d4.streak.broke).toBe(true);
  });
});
