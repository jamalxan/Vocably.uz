import { describe, expect, it } from 'vitest';
import { decideReminder, formatTelegramReminder, isReminderHour, isTelegramBlockedError, localHour, normalizePrefs, normalizeSendHour } from './reminders';

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
    expect(normalizePrefs(null)).toEqual({ enabled: true, frequency: 'daily', telegram: false, sendHour: 20, lastSentOn: null });
    expect(normalizePrefs({ frequency: 'hourly' }).frequency).toBe('daily');
  });
  it('Telegram faqat aniq true bo‘lsa yoqiladi (opt-in)', () => {
    expect(normalizePrefs({ telegram: true }).telegram).toBe(true);
    expect(normalizePrefs({ telegram: 'yes' as any }).telegram).toBe(false);
  });
});

describe('eslatma soati (mahalliy vaqt)', () => {
  const at = (iso: string) => new Date(iso);
  it('sendHour 8–21 oralig‘idan tashqarida yoki noto‘g‘ri bo‘lsa standart 20', () => {
    expect(normalizeSendHour(9)).toBe(9);
    for (const bad of [7, 22, -1, 8.5, 'x', null, undefined]) expect(normalizeSendHour(bad)).toBe(20);
  });
  it('localHour vaqt mintaqasini hisobga oladi; noto‘g‘ri mintaqada UTC', () => {
    expect(localHour(at('2026-10-10T15:00:00Z'), 'Asia/Tashkent')).toBe(20);
    expect(localHour(at('2026-10-10T15:00:00Z'), 'America/New_York')).toBe(11);
    expect(localHour(at('2026-10-10T15:00:00Z'), 'Not/AZone')).toBe(15);
  });
  it('tanlangan soatdan boshlab yuboriladi (kechiksa yetib oladi), tunda emas', () => {
    const tz = 'Asia/Tashkent';
    expect(isReminderHour({ sendHour: 20 }, at('2026-10-10T14:59:00Z'), tz)).toBe(false); // 19:59
    expect(isReminderHour({ sendHour: 20 }, at('2026-10-10T15:00:00Z'), tz)).toBe(true); // 20:00
    expect(isReminderHour({ sendHour: 20 }, at('2026-10-10T17:30:00Z'), tz)).toBe(true); // 22:30 — hali oraliqda (h=22)
    expect(isReminderHour({ sendHour: 9 }, at('2026-10-10T18:00:00Z'), tz)).toBe(false); // 23:00 — tun
    expect(isReminderHour(null, at('2026-10-10T15:00:00Z'), tz)).toBe(true); // standart 20
  });
});

describe('Telegram matni', () => {
  const r = { kind: 'due' as const, title: '🔔 8 ta <so\'z> & ko‘proq', body: 'Qisqa takrorlash', url: '/app/lugat/takrorlash' };
  it('HTML belgilarni ekranlaydi va to‘liq havola qo‘shadi', () => {
    const t = formatTelegramReminder(r, 'https://vocably.uz');
    expect(t).toContain('&lt;so\'z&gt; &amp; ko‘proq');
    expect(t).toContain('<a href="https://vocably.uz/app/lugat/takrorlash">');
  });
  it('faqat bloklash/o‘chirilgan chat xatolarini aniqlaydi', () => {
    expect(isTelegramBlockedError('Forbidden: bot was blocked by the user')).toBe(true);
    expect(isTelegramBlockedError('Bad Request: chat not found')).toBe(true);
    expect(isTelegramBlockedError('Too Many Requests: retry after 5')).toBe(false);
    expect(isTelegramBlockedError('timeout')).toBe(false);
  });
});
