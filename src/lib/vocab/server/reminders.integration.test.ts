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

  describe('mahalliy soat', () => {
    it('foydalanuvchining soati kelmaguncha kechiktiriladi (belgilanmaydi), keyin yuboriladi', async () => {
      const u = await mk({ timezone: 'Asia/Tokyo' }); // NOW da Tokioda 00:00
      const r1 = await runReminderSweep({ now: NOW });
      expect(r1).toMatchObject({ sent: 0, deferred: 1, done: true });
      expect((await User.findById(u._id).lean()).vocabReminders.lastCheckedOn).toBeFalsy();
      const r2 = await runReminderSweep({ now: new Date('2026-10-10T11:00:00Z') }); // Tokioda 20:00
      expect(r2.sent).toBe(1);
    });

    it('sendHour sozlamasi hurmat qilinadi: erta soat tanlansa kechqurun yetib oladi, tunda yubormaydi', async () => {
      await mk({ vocabReminders: { sendHour: 9 } });
      expect((await runReminderSweep({ now: new Date('2026-10-10T18:00:00Z') })).deferred).toBe(1); // Toshkentda 23:00
      expect((await runReminderSweep({ now: NOW })).sent).toBe(1); // 20:00 >= 9
    });

    it('UTC+14 foydalanuvchi har kuni qabul qiladi (UTC sanasidan oldinda bo‘lgan mahalliy sana)', async () => {
      const u = await mk({ timezone: 'Pacific/Kiritimati', vocabReminders: { sendHour: 8 } });
      const day1 = new Date('2026-10-09T18:30:00Z'); // Kiritimatida 10-oktabr 08:30
      const day2 = new Date('2026-10-10T18:30:00Z'); // 11-oktabr 08:30 (UTC sanasi = 1-kun mahalliy sanasi)
      expect((await runReminderSweep({ now: day1 })).sent).toBe(1);
      expect((await runReminderSweep({ now: day1 })).sent).toBe(0); // takroriy yo'q
      expect((await runReminderSweep({ now: day2 })).sent).toBe(1); // ertasi kuni yana yuboriladi
      expect(await Notification.countDocuments({ userId: u._id })).toBe(2);
    });
  });

  describe('Telegram kanali', () => {
    it('opt-in va bot ulangan bo‘lsa yuboradi; takroriy ishga tushirishda ikkinchi marta yubormaydi', async () => {
      await mk({ telegramChatId: 777, vocabReminders: { telegram: true } });
      const calls: Array<[number, string]> = [];
      const sendTelegram = async (id: number, text: string) => void calls.push([id, text]);
      expect((await runReminderSweep({ now: NOW, sendTelegram })).sent).toBe(1);
      expect(calls).toHaveLength(1);
      expect(calls[0][0]).toBe(777);
      expect(calls[0][1]).toContain('<b>');
      await runReminderSweep({ now: NOW, sendTelegram });
      expect(calls).toHaveLength(1);
    });

    it('standart holatda (opt-in qilinmagan) yoki bot ulanmagan bo‘lsa Telegram’ga yubormaydi, ilova ichidagi eslatma baribir ketadi', async () => {
      await mk({ telegramChatId: 777 }); // telegram: false (standart)
      await mk({ vocabReminders: { telegram: true } }); // chat id yo'q
      const sendTelegram = async () => {
        throw new Error('chaqirilmasligi kerak');
      };
      const r = await runReminderSweep({ now: NOW, sendTelegram });
      expect(r.sent).toBe(2);
      expect(await Notification.countDocuments()).toBe(2);
    });

    it('Telegram xatosi eslatmani buzmaydi; bot bloklangan bo‘lsa kanal o‘chiriladi', async () => {
      const u = await mk({ telegramChatId: 777, vocabReminders: { telegram: true } });
      const sendTelegram = async () => {
        throw new Error('Forbidden: bot was blocked by the user');
      };
      expect((await runReminderSweep({ now: NOW, sendTelegram })).sent).toBe(1);
      expect(await Notification.countDocuments({ userId: u._id })).toBe(1);
      expect((await User.findById(u._id).lean()).vocabReminders.telegram).toBe(false);
    });

    it('vaqtinchalik xatoda (tarmoq) kanal o‘chirilmaydi', async () => {
      const u = await mk({ telegramChatId: 777, vocabReminders: { telegram: true } });
      await runReminderSweep({ now: NOW, sendTelegram: async () => { throw new Error('timeout'); } });
      expect((await User.findById(u._id).lean()).vocabReminders.telegram).toBe(true);
    });
  });

  it('feature flag o‘chiq bo‘lsa yubormaydi', async () => {
    await mk();
    const r = await runReminderSweep({ now: NOW, flagEnv: { VOCAB_ENGINE_ENABLED: 'false' } as any });
    expect(r.sent).toBe(0);
  });
});
