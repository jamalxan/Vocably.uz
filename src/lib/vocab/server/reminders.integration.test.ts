// Eslatma sweep'i — haqiqiy MongoDB ustida: yuboriladi, takroriy ishga tushirishda ikki marta yuborilmaydi, sozlamalar hurmat qilinadi.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { runReminderSweep } from './reminderService';

const User: any = Models.User;
const Notification: any = Models.Notification;

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
const NOW = new Date('2026-10-10T15:00:00Z'); // Toshkentda 20:00, "bugun" = 2026-10-10
const past = new Date('2026-09-01T00:00:00Z');

const dueWords = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    word: `w${i}`,
    syns: ['t'],
    stats: { srsState: 'review', reps: 3, nextReview: past, intervalDays: 3 },
  }));

let phoneSeq = 0;
const mk = (over: Record<string, unknown> = {}) =>
  User.create({
    phone: `+99890${String(1000000 + ++phoneSeq)}`,
    name: 'T',
    password: 'x',
    timezone: 'Asia/Tashkent',
    reviewStreak: 12,
    lastReviewDate: '2026-10-09', // kecha o'qigan, bugun yo'q -> seriya xavf ostida
    categories: [{ name: 'c', words: dueWords(8) }],
    ...over,
  });

describeDb('vocab reminders (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
  });

  it('eslatma yuboradi va takroriy ishga tushirishda ikki marta yubormaydi', async () => {
    const u = await mk();
    const r1 = await runReminderSweep({ now: NOW });
    expect(r1).toMatchObject({ sent: 1, done: true });
    const notes = await Notification.find({ userId: u._id }).lean();
    expect(notes).toHaveLength(1);
    expect(notes[0].type).toBe('vocab_reminder');
    expect(notes[0].title).toContain('12');

    const r2 = await runReminderSweep({ now: NOW });
    expect(r2.sent).toBe(0);
    expect(await Notification.countDocuments({ userId: u._id })).toBe(1);
  });

  it('bugun o‘qigan, o‘chirgan va takrorlashi yo‘q foydalanuvchiga yubormaydi', async () => {
    await mk({ lastReviewDate: '2026-10-10' }); // bugun o'qigan
    await mk({ vocabReminders: { enabled: false } });
    await mk({ reviewStreak: 0, lastReviewDate: '2026-09-01', categories: [{ name: 'c', words: dueWords(2) }] }); // kam due, seriya yo'q
    const r = await runReminderSweep({ now: NOW });
    expect(r.sent).toBe(0);
    expect(await Notification.countDocuments()).toBe(0);
  });

  it('chastota sozlamasi: every_2_days kecha yuborilgan bo‘lsa jim', async () => {
    await mk({ vocabReminders: { frequency: 'every_2_days', lastSentOn: '2026-10-09' } });
    expect((await runReminderSweep({ now: NOW })).sent).toBe(0);
  });

  it('feature flag o‘chiq bo‘lsa yubormaydi', async () => {
    await mk();
    const r = await runReminderSweep({ now: NOW, flagEnv: { VOCAB_ENGINE_ENABLED: 'false' } as any });
    expect(r.sent).toBe(0);
  });
});
