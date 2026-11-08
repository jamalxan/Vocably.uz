// Win-back sweep — haqiqiy MongoDB ustida: kimga ketadi, ikki marta ketmaydi, Telegram limiti va bloklash.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as Models from '@/lib/models';
import { runWinbackSweep } from './winbackService';
import { claimTelegramSlot } from '@/lib/telegramCap';

const User: any = Models.User;
const Notification: any = Models.Notification;

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
const NOW = new Date('2026-11-08T13:00:00Z'); // Toshkentda 18:00, "bugun" = 2026-11-08
const past = new Date('2026-10-01T00:00:00Z');

const dueWords = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ word: `w${i}`, syns: ['t'], stats: { srsState: 'review', reps: 3, nextReview: past, intervalDays: 3 } }));

let phoneSeq = 0;
const mk = (over: Record<string, unknown> = {}) =>
  User.create({
    phone: `+99891${String(1000000 + ++phoneSeq)}`,
    name: 'Jamol Karimov',
    password: 'x',
    timezone: 'Asia/Tashkent',
    lastReviewDate: '2026-11-03', // 5 kun oldin
    categories: [{ name: 'c', words: dueWords(9) }],
    ...over,
  });

describeDb('win-back sweep (integration)', () => {
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

  it('nofaolga shaxsiy xabar ketadi, takroriy cron ikki marta yubormaydi', async () => {
    const send = vi.fn().mockResolvedValue({ message_id: 1 });
    const u = await mk({ telegramChatId: 777 });
    const r1 = await runWinbackSweep({ now: NOW, sendTelegram: send });
    expect(r1).toMatchObject({ sent: 1, done: true });
    const notes = await Notification.find({ userId: u._id }).lean();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Salom, Jamol 👋');
    expect(notes[0].body).toContain('5 kun oldin');
    expect(notes[0].body).toContain("9 ta so'z");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toBe(777);

    const r2 = await runWinbackSweep({ now: NOW, sendTelegram: send });
    expect(r2.sent).toBe(0);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('faol, so‘zsiz, hech qachon o‘qimagan va eslatmani o‘chirganlarga ketmaydi', async () => {
    await mk({ lastReviewDate: '2026-11-07' });
    await mk({ categories: [] });
    await mk({ lastReviewDate: null });
    await mk({ vocabReminders: { enabled: false } });
    const r = await runWinbackSweep({ now: NOW, sendTelegram: vi.fn() });
    expect(r.sent).toBe(0);
    expect(await Notification.countDocuments({})).toBe(0);
  });

  it('qaytib kelib yana yo‘qolsa — yangi davr, yana bir marta', async () => {
    const send = vi.fn().mockResolvedValue({});
    const u = await mk();
    await runWinbackSweep({ now: NOW, sendTelegram: send });
    await User.updateOne({ _id: u._id }, { $set: { lastReviewDate: '2026-11-10' } });
    const later = new Date('2026-11-15T13:00:00Z');
    expect((await runWinbackSweep({ now: later, sendTelegram: send })).sent).toBe(1);
    expect(await Notification.countDocuments({ userId: u._id })).toBe(2);
  });

  it('Telegram limiti to‘lgan bo‘lsa — belgilanmaydi, ertaga ketadi', async () => {
    const send = vi.fn().mockResolvedValue({});
    const u = await mk({ telegramChatId: 5 });
    await claimTelegramSlot(u._id, '2026-11-08');
    await claimTelegramSlot(u._id, '2026-11-08');
    expect(await runWinbackSweep({ now: NOW, sendTelegram: send })).toMatchObject({ sent: 0, capped: 1 });
    expect(send).not.toHaveBeenCalled();
    expect((await runWinbackSweep({ now: new Date('2026-11-09T13:00:00Z'), sendTelegram: send })).sent).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('botni bloklagan bo‘lsa — ilovada qoladi, bot xabarlari o‘chadi', async () => {
    const send = vi.fn().mockRejectedValue(new Error('Forbidden: bot was blocked by the user'));
    const u = await mk({ telegramChatId: 9 });
    expect((await runWinbackSweep({ now: NOW, sendTelegram: send })).sent).toBe(1);
    expect(await Notification.countDocuments({ userId: u._id })).toBe(1);
    expect((await User.findById(u._id).lean()).tgDailyPractice).toBe(false);
  });
});
