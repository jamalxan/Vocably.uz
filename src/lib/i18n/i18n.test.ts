import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES, MESSAGES, normalizeLocale, translate } from './index';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('i18n kalitlari', () => {
  const base = Object.keys(MESSAGES.uz);

  it.each(LOCALES.filter((l) => l !== DEFAULT_LOCALE))('%s: kalitlar uz bilan aynan bir xil (kamida/ortiqcha yo‘q)', (l) => {
    const keys = Object.keys((MESSAGES as any)[l]);
    expect(base.filter((k) => !keys.includes(k))).toEqual([]);
    expect(keys.filter((k) => !base.includes(k))).toEqual([]);
  });

  it.each(LOCALES.filter((l) => l !== DEFAULT_LOCALE))('%s: o‘rinbosarlar ({n}, {total}…) mos va matn bo‘sh emas', (l) => {
    for (const k of base) {
      const v = (MESSAGES as any)[l][k] as string;
      expect(v.trim().length, `${l}:${k} bo'sh`).toBeGreaterThan(0);
      expect(placeholders(v), `${l}:${k} o'rinbosarlari`).toEqual(placeholders((MESSAGES.uz as any)[k]));
    }
  });

  it('ruscha matnlar haqiqatan tarjima (lotin emas, kirill harflari bor) — ko‘rinadigan matnlarda', () => {
    const untranslatedAllowed = new Set(['settings.telegram', 'settings.title']); // Telegram — nom
    for (const k of base) {
      if (untranslatedAllowed.has(k)) continue;
      expect(/[А-Яа-яЁё]/.test((MESSAGES.ru as any)[k]), `ru:${k} kirillcha emas`).toBe(true);
    }
  });
});

describe('translate', () => {
  it('o‘rinbosar, zaxira (uz → kalit) va noma’lum til', () => {
    expect(translate('ru', 'offline.start', { n: 3 })).toBe('Начать (3)');
    expect(translate('uz', 'offline.start', { n: 3 })).toBe('Boshlash (3)');
    expect(translate('xx', 'offline.start', { n: 3 })).toBe('Boshlash (3)');
    expect(translate('ru', 'no.such.key')).toBe('no.such.key');
    expect(translate('ru', 'offline.downloadedMore', { n: 1 })).toContain('{total}'); // berilmagan o'rinbosar o'zi qoladi
  });

  it('normalizeLocale', () => {
    expect(normalizeLocale('ru')).toBe('ru');
    expect(normalizeLocale('de')).toBe('uz');
    expect(normalizeLocale(undefined)).toBe('uz');
  });
});
