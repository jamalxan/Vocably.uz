import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, MESSAGES, normalizeLocale, translate } from './index';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('i18n kalitlari', () => {
  const base = Object.keys(MESSAGES.en);

  it.each(LOCALES.filter((l) => l !== DEFAULT_LOCALE))('%s: kalitlar en bilan aynan bir xil (kamida/ortiqcha yo‘q)', (l) => {
    const keys = Object.keys((MESSAGES as any)[l]);
    expect(base.filter((k) => !keys.includes(k))).toEqual([]);
    expect(keys.filter((k) => !base.includes(k))).toEqual([]);
  });

  it.each(LOCALES.filter((l) => l !== DEFAULT_LOCALE))('%s: o‘rinbosarlar ({n}, {total}…) mos va matn bo‘sh emas', (l) => {
    for (const k of base) {
      const v = (MESSAGES as any)[l][k] as string;
      expect(v.trim().length, `${l}:${k} bo'sh`).toBeGreaterThan(0);
      expect(placeholders(v), `${l}:${k} o'rinbosarlari`).toEqual(placeholders((MESSAGES.en as any)[k]));
    }
  });

  it("o'zbekcha matnlar haqiqatan tarjima (inglizcha nusxa emas) — ko'rinadigan matnlarda", () => {
    const same = base.filter((k) => (MESSAGES.uz as any)[k] === (MESSAGES.en as any)[k] && /[a-z]{4,}/i.test((MESSAGES.en as any)[k]));
    // Nomlar/atamalar (Telegram, Premium…) ikkala tilda bir xil bo'lishi mumkin — ularning ulushi kichik bo'lishi kerak.
    expect(same.length / base.length).toBeLessThan(0.1);
  });
});

describe('translate', () => {
  it('o‘rinbosar, zaxira (en → kalit) va noma’lum til', () => {
    expect(translate('en', 'offline.start', { n: 3 })).toBe('Start (3)');
    expect(translate('uz', 'offline.start', { n: 3 })).toBe('Boshlash (3)');
    expect(translate('xx', 'offline.start', { n: 3 })).toBe('Start (3)');
    expect(translate('en', 'no.such.key')).toBe('no.such.key');
    expect(translate('en', 'offline.downloadedMore', { n: 1 })).toContain('{total}'); // berilmagan o'rinbosar o'zi qoladi
  });

  it('normalizeLocale', () => {
    expect(normalizeLocale('uz')).toBe('uz');
    expect(normalizeLocale('ru')).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
    expect(DEFAULT_LOCALE).toBe('en');
  });
});
