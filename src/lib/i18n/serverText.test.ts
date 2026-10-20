import { describe, expect, it } from 'vitest';
import { pluralForm, renderTemplate } from './index';
import { hasServerTranslation, translateServerText } from './serverText';
import { GAME_CATALOG, availabilityFor } from '../vocab/games';
import { QUEST_DEFS } from '../vocab/quests';
import { NEW_ACHIEVEMENT_DEFS } from '../vocab/achievements';
import { LEVEL_NAMES } from '../vocab/config';
import { WEAK_REASON_LABELS } from '../vocab/weakness';
import { buildDailyPlan } from '../vocab/dailyPlan';
import { buildDailyPlan as studyPlan } from '../studyPlan';

describe('ko‘plik (inglizcha)', () => {
  const f = ['word', 'words'];
  it.each([[1, 'word'], [2, 'words'], [5, 'words'], [0, 'words'], [101, 'words']])('%i → %s', (n, expected) => expect(pluralForm('en', n, f)).toBe(expected));

  it('uz da birinchi shakl; renderTemplate o‘rinbosar va ko‘plikni birga qo‘llaydi', () => {
    expect(pluralForm('uz', 5, f)).toBe('word');
    expect(renderTemplate('en', 'Review {n} {n#word|words}', { n: 3 })).toBe('Review 3 words');
    expect(renderTemplate('en', '{a} and {b}', { a: 1 })).toBe('1 and {b}'); // berilmagani o'zi qoladi
  });
});

describe('translateServerText', () => {
  it('aniq moslik, shablon (ko‘plik bilan), uz va noma’lum matn', () => {
    expect(translateServerText('en', "So'z juftligi")).toBe('Word Pairs');
    expect(translateServerText('en', "5 ta so'zni takrorlang")).toBe('Review 5 words');
    expect(translateServerText('en', "1 ta so'zni takrorlang")).toBe('Review 1 word');
    expect(translateServerText('en', "22 ta yangi so'z")).toBe('22 new words');
    expect(translateServerText('en', 'Premium rejada ochiladi')).toBe('Unlocks on the Premium plan');
    expect(translateServerText('uz', "So'z juftligi")).toBe("So'z juftligi");
    expect(translateServerText('en', 'noma’lum matn')).toBe('noma’lum matn');
    expect(translateServerText('en', undefined as any)).toBeUndefined();
  });

  it('shablon regex belgilaridan xavfsiz (matn ichida maxsus belgilar)', () => {
    expect(() => translateServerText('en', 'Kamida (.*+?) ta so\'z kerak (hozir [x])')).not.toThrow();
  });
});

describe('qamrov: serverdagi har bir ko‘rinadigan matn tarjima qilingan', () => {
  const missing = (texts: (string | undefined)[]) => [...new Set(texts.filter((t): t is string => !!t))].filter((t) => !hasServerTranslation('en', t));

  it('o‘yinlar (nom + tavsif)', () => {
    expect(missing(GAME_CATALOG.flatMap((g) => [g.title, g.description]))).toEqual([]);
  });

  it('vazifalar va yutuqlar', () => {
    expect(missing(QUEST_DEFS.flatMap((q) => [q.title, q.description]))).toEqual([]);
    expect(missing(NEW_ACHIEVEMENT_DEFS.flatMap((a) => [a.label, a.description]))).toEqual([]);
  });

  it('zaif so‘z sabablari', () => {
    expect(missing(Object.values(WEAK_REASON_LABELS))).toEqual([]);
  });

  it('daraja nomlari', () => {
    expect(missing([...LEVEL_NAMES])).toEqual([]);
  });

  it('o‘yin mavjud emasligi sabablari (hamma o‘yin, bo‘sh lug‘at bilan)', () => {
    const reasons = GAME_CATALOG.map((g) => availabilityFor(g, []).reason);
    expect(missing(reasons)).toEqual([]);
  });

  it('Bugun sahifasi reja kartasi (studyPlan.js): sarlavhalar va vazifalar', () => {
    const texts: string[] = [];
    for (const dl of [null, -3, 0, 1, 10, 30, 100]) {
      for (const day of [0, 1, 2, 3, 5, 6, 7, 14]) {
        for (const due of [0, 7, 60]) {
          for (const mistakes of [0, 4, 30]) {
            const plan = studyPlan({
              due, newAvailable: 12, reviewsToday: 0, goal: 20, daysLeft: dl, targetBand: dl === 1 ? 7 : null,
              skillBands: { listening: 6, reading: null, writing: 5, speaking: 7 }, sectionsDoneToday: [], mistakeWordsDue: mistakes, dailyMinutes: 45,
              now: new Date(Date.UTC(2026, 0, 1 + day)),
            });
            texts.push(plan.headline, ...plan.tasks.map((t: any) => t.title));
          }
        }
      }
    }
    expect(missing(texts)).toEqual([]);
  });

  it('kunlik reja matnlari (turli vaqt/holatlarda)', () => {
    const texts: string[] = [];
    for (const minutes of [5, 10, 20, 30, 45]) {
      for (const dueCount of [0, 3, 40]) {
        for (const overdueCount of [0, 2]) {
          const plan = buildDailyPlan({ minutes, dueCount, overdueCount, weakCount: 6, newAvailable: 12, availableGames: ['multiple_choice', 'word_match'], profile: { vocabulary: { level: 'weak' } } as any });
          plan.items.forEach((i) => texts.push(i.label, i.reason as string));
        }
      }
    }
    expect(missing(texts)).toEqual([]);
  });
});

describe('tarif va mock matnlari', () => {
  it('mock tavsiyasi va tarif imkoniyatlari inglizcha', () => {
    expect(translateServerText('en', "Reading bo'limingiz eng past ko'rsatkichga ega (6.5) — shu bo'limga ko'proq mashq qiling.")).toBe(
      'Your Reading section has the lowest score (6.5) — practice it more.',
    );
    expect(translateServerText('en', "To'liq Mock testlar")).toBe('Full Mock tests');
    expect(translateServerText('uz', "To'liq Mock testlar")).toBe("To'liq Mock testlar");
  });
});

describe('chat matnlari', () => {
  it('nisbiy vaqt va oxirgi faollik inglizcha ko‘plik bilan', () => {
    expect(translateServerText('en', '5 daqiqa oldin')).toBe('5 minutes ago');
    expect(translateServerText('en', '1 soat oldin')).toBe('1 hour ago');
    expect(translateServerText('en', "oxirgi marta ko'rilgan 2 kun oldin")).toBe('last seen 2 days ago');
    expect(translateServerText('en', '📷 Rasm')).toBe('📷 Photo');
  });
});
