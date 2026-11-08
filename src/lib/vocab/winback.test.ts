import { describe, expect, it } from 'vitest';
import { decideWinback, firstName, formatWinback, winbackMarkup } from './winback';

const base = { lastReviewDate: '2026-11-01', today: '2026-11-08', dueCount: 12 };

describe('decideWinback', () => {
  it('3+ kun nofaol va so‘zi bor — yuboriladi, kunlar soni bilan', () => {
    expect(decideWinback(base)).toEqual({ days: 7 });
    expect(decideWinback({ ...base, lastReviewDate: '2026-11-05' })).toEqual({ days: 3 });
  });
  it('3 kundan kam — jim', () => {
    expect(decideWinback({ ...base, lastReviewDate: '2026-11-06' })).toBeNull();
  });
  it('takrorlanadigan so‘z yo‘q — jim', () => {
    expect(decideWinback({ ...base, dueCount: 0 })).toBeNull();
  });
  it('hech qachon takrorlamagan — jim', () => {
    expect(decideWinback({ ...base, lastReviewDate: null })).toBeNull();
  });
  it('eslatmalar o‘chirilgan — jim', () => {
    expect(decideWinback({ ...base, prefs: { enabled: false } })).toBeNull();
  });
  it('shu davr uchun yuborilgan — jim; yangi davr — yana yuboriladi', () => {
    expect(decideWinback({ ...base, prefs: { winbackFor: '2026-11-01' } })).toBeNull();
    expect(decideWinback({ ...base, prefs: { winbackFor: '2026-10-20' } })).toEqual({ days: 7 });
  });
});

describe('formatWinback', () => {
  it('ism, kun va so‘z sonini qo‘yadi', () => {
    const m = formatWinback({ name: 'Jamol Karimov', days: 5, due: 14, baseUrl: 'https://vocably.uz' });
    expect(m.title).toBe('Salom, Jamol 👋');
    expect(m.body).toContain("Vocably'da 5 kun oldin bo'lgansiz");
    expect(m.body).toContain("sizni 14 ta so'z kutyapti");
    expect(m.html).toContain('👉 Hozir takrorlash: <a href="https://vocably.uz/app">vocably.uz/app</a>');
    expect(m.url).toBe('/app');
  });
  it('ism bo‘sh bo‘lsa — vergulsiz salom; HTML ekranlanadi', () => {
    expect(formatWinback({ name: '  ', days: 3, due: 1, baseUrl: 'https://vocably.uz' }).title).toBe('Salom 👋');
    expect(formatWinback({ name: '<b>x</b>', days: 3, due: 1, baseUrl: 'https://vocably.uz' }).html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });
  it('firstName', () => {
    expect(firstName(null)).toBe('');
    expect(firstName(' Ali  Vali ')).toBe('Ali');
  });
  it('tugmalar: ochish + o‘chirish', () => {
    const k: any = winbackMarkup('https://vocably.uz').inline_keyboard;
    expect(k[0][0].url).toBe('https://vocably.uz/app');
    expect(k[1][0].callback_data).toBe('rm:off');
  });
});
