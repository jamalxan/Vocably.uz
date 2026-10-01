import { describe, expect, it } from 'vitest';
import { decideReminder, normalizePrefs } from './reminders';

const TZ = 'Asia/Tashkent';
const NOW = new Date('2026-10-10T15:00:00Z'); // 20:00 Toshkent -> bugun 2026-10-10
const streak = (over = {}) => ({ streak: 12, lastDate: '2026-10-09', freezes: 0, longest: 12, ...over });

describe('decideReminder', () => {
  it('bugun o‘qigan bo‘lsa — jim', () => {
    expect(decideReminder({ dueCount: 30, streak: streak({ lastDate: '2026-10-10' }), timeZone: TZ, now: NOW })).toBeNull();
  });

  it('seriya xavf ostida (kecha o‘qigan, bugun yo‘q) — seriya xabari', () => {
    const r = decideReminder({ dueCount: 18, streak: streak(), timeZone: TZ, now: NOW })!;
    expect(r.kind).toBe('streak');
    expect(r.title).toContain('12');
    expect(r.body).toContain('18');
  });

  it('seriya qisqa bo‘lsa va takrorlash kam bo‘lsa — jim', () => {
    expect(decideReminder({ dueCount: 2, streak: streak({ streak: 1 }), timeZone: TZ, now: NOW })).toBeNull();
  });

  it('seriya uzilgan bo‘lsa ayblamaydi: faqat takrorlash xabari', () => {
    const r = decideReminder({ dueCount: 20, streak: streak({ lastDate: '2026-10-01' }), timeZone: TZ, now: NOW })!;
    expect(r.kind).toBe('due');
    expect(r.title).toContain('20');
  });

  it('takrorlash minimumdan kam bo‘lsa — jim', () => {
    expect(decideReminder({ dueCount: 4, streak: streak({ lastDate: null, streak: 0 }), timeZone: TZ, now: NOW })).toBeNull();
  });

  it('o‘chirilgan bo‘lsa — jim', () => {
    expect(decideReminder({ dueCount: 30, streak: streak(), timeZone: TZ, now: NOW, prefs: { enabled: false } })).toBeNull();
  });

  it('chastota: every_2_days kecha yuborilgan bo‘lsa jim, 2 kun oldin bo‘lsa yuboradi', () => {
    const base = { dueCount: 30, streak: streak(), timeZone: TZ, now: NOW };
    expect(decideReminder({ ...base, prefs: { frequency: 'every_2_days', lastSentOn: '2026-10-09' } })).toBeNull();
    expect(decideReminder({ ...base, prefs: { frequency: 'every_2_days', lastSentOn: '2026-10-08' } })).not.toBeNull();
    expect(decideReminder({ ...base, prefs: { frequency: 'weekly', lastSentOn: '2026-10-05' } })).toBeNull();
    expect(decideReminder({ ...base, prefs: { frequency: 'weekly', lastSentOn: '2026-10-03' } })).not.toBeNull();
  });

  it('kuniga bir martadan ko‘p yuborilmaydi (daily, bugun yuborilgan)', () => {
    expect(decideReminder({ dueCount: 30, streak: streak(), timeZone: TZ, now: NOW, prefs: { lastSentOn: '2026-10-10' } })).toBeNull();
  });
});

describe('normalizePrefs', () => {
  it('standart: yoqilgan, daily; noto‘g‘ri chastota daily ga tushadi', () => {
    expect(normalizePrefs(null)).toEqual({ enabled: true, frequency: 'daily', lastSentOn: null });
    expect(normalizePrefs({ frequency: 'hourly' }).frequency).toBe('daily');
  });
});
