// "Bugungi reja" server flow against in-memory MongoDB.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod;
let M, P;

// 10:00 Tashkent on 2026-11-04 (a non-mock weekday for the engine: dayIndex % 7 = 6).
const NOW = new Date('2026-11-04T05:00:00Z');

describeDb('today plan (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
    M = await import('@/lib/models');
    await M.DailyPlan.init();
    await M.XpEvent.init();
    P = await import('./server');
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await Promise.all([M.User.deleteMany({}), M.DailyPlan.deleteMany({}), M.XpEvent.deleteMany({}), M.ReviewEvent.deleteMany({})]);
  });

  async function makeUser() {
    const past = new Date(NOW.getTime() - 86400000);
    const words = Array.from({ length: 12 }, (_, i) => ({
      word: `w${i}`, translation: 't',
      stats: { level: 2, nextReview: past, srsState: 'review', intervalDays: 3, ease: 2.5, reps: 3 },
    }));
    return M.User.create({
      phone: '+998900000009', password: 'x', name: 'Plan',
      dailyStudyMinutes: 20, weakestSkill: 'speaking', examDate: new Date('2027-02-01'),
      categories: [{ name: 'Mine', words }],
    });
  }

  it('builds one plan per day even under concurrent first reads', async () => {
    const u = await makeUser();
    const [a, b] = await Promise.all([P.getTodayPlan(u._id, NOW), P.getTodayPlan(u._id, NOW)]);
    expect(a.date).toBe('2026-11-04');
    expect(a.tasks[0].key).toBe('review');
    expect(b.tasks.map((t) => t.key)).toEqual(a.tasks.map((t) => t.key));
    expect(await M.DailyPlan.countDocuments({ userId: u._id })).toBe(1);
  });

  it('marks the review task done from review events and pays XP exactly once', async () => {
    const u = await makeUser();
    const plan = await P.getTodayPlan(u._id, NOW);
    const review = plan.tasks.find((t) => t.key === 'review');
    const cat = u.categories[0];
    await M.ReviewEvent.insertMany(
      Array.from({ length: review.target }, (_, i) => ({
        userId: u._id, categoryId: cat._id, wordId: cat.words[i % cat.words.length]._id,
        rating: 3, isCorrect: true, prevState: 'review', reviewedAt: new Date(NOW.getTime() + 1000),
      }))
    );
    const later = new Date(NOW.getTime() + 60_000);
    const [r1, r2] = await Promise.all([P.getTodayPlan(u._id, later), P.getTodayPlan(u._id, later)]);
    expect(r1.tasks.find((t) => t.key === 'review').status).toBe('done');
    expect(r1.xpPaid + r2.xpPaid).toBe(review.xp);
    const fresh = await M.User.findById(u._id).select('xp').lean();
    expect(fresh.xp).toBe(review.xp);
  });

  it('manual completion works only for skill tasks and only pays once', async () => {
    const u = await makeUser();
    const plan = await P.getTodayPlan(u._id, NOW);
    const skill = plan.tasks.find((t) => t.type === 'skill');
    expect(await P.completeTask(u._id, 'review', NOW)).toMatchObject({ error: 'auto_task' });
    const [x, y] = await Promise.all([P.completeTask(u._id, skill.key, NOW), P.completeTask(u._id, skill.key, NOW)]);
    expect(x.xpPaid + y.xpPaid).toBe(skill.xp);
    const again = await P.getTodayPlan(u._id, NOW);
    expect(again.tasks.find((t) => t.key === skill.key).status).toBe('done');
  });

  it('rebuilds when the exam date changes, keeping finished tasks', async () => {
    const u = await makeUser();
    const plan = await P.getTodayPlan(u._id, NOW);
    const skill = plan.tasks.find((t) => t.type === 'skill');
    await P.completeTask(u._id, skill.key, NOW);
    await M.User.updateOne({ _id: u._id }, { $set: { dailyStudyMinutes: 60 } });
    const rebuilt = await P.getTodayPlan(u._id, NOW);
    expect(rebuilt.minutes).toBe(60);
    expect(rebuilt.tasks.find((t) => t.key === skill.key)?.status).toBe('done');
  });

  it('a new local day gets a new plan and carries half of the unfinished skill work', async () => {
    const u = await makeUser();
    await P.getTodayPlan(u._id, NOW);
    const tomorrow = new Date(NOW.getTime() + 86400000);
    const next = await P.getTodayPlan(u._id, tomorrow);
    expect(next.date).toBe('2026-11-05');
    expect(next.tasks.some((t) => t.carried)).toBe(true);
    expect(await M.DailyPlan.countDocuments({ userId: u._id })).toBe(2);
  });
});
