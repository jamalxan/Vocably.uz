import { describe, it, expect } from 'vitest';
import { buildAnswersPatchSetOps, extractErrorVocabulary, estimateFromHistory } from './attemptServer';

// AUDIT PERF-01 — bu faqat `buildAnswersPatchSetOps` (sof funksiya) sinaydi,
// `patchAttemptAnswers`ning O'ZINI EMAS (u DB'ga yozadi — bu faylning
// qolgan qismi kabi, DB-bog'liq funksiyalar bu kodbazada birlik test
// qilinmaydi, faqat sof, ajratilgan mantiq). Maqsad — nuqta-notatsiyali
// kalitlar TO'G'RI qurilishini tasdiqlash: bu aynan shu funksiyaning
// ishlashi Mongoose Mixed-tur "butun obyektni qayta yozish" muammosini
// (attemptServer.ts izohiga q.) chetlab o'tishini kafolatlaydi.
describe('buildAnswersPatchSetOps', () => {
  it('builds one dot-notation key per answer, not a single "answers" key', () => {
    const setOps = buildAnswersPatchSetOps({ answers: { q1: 'TRUE', q2: ['B', 'D'] } });
    expect(setOps).toEqual({ 'answers.q1': 'TRUE', 'answers.q2': ['B', 'D'] });
    expect(setOps).not.toHaveProperty('answers');
  });

  it('includes flagged and lastQuestion as plain top-level keys when present', () => {
    const setOps = buildAnswersPatchSetOps({ flagged: [3, 7], lastQuestion: 12 });
    expect(setOps).toEqual({ flagged: [3, 7], lastQuestion: 12 });
  });

  it('omits flagged/lastQuestion entirely when not provided, rather than writing null/undefined', () => {
    const setOps = buildAnswersPatchSetOps({ answers: { q1: 'x' } });
    expect(setOps).not.toHaveProperty('flagged');
    expect(setOps).not.toHaveProperty('lastQuestion');
  });

  it('builds essays.task1/essays.task2 dot-notation keys with a normalized wordCount and updatedAt', () => {
    const now = new Date('2026-09-22T10:00:00Z');
    const setOps = buildAnswersPatchSetOps({ essays: { task1: { text: 'hello world', wordCount: 2 } } }, now);
    expect(setOps).toEqual({ 'essays.task1': { text: 'hello world', wordCount: 2, updatedAt: now } });
  });

  it('defaults a missing/invalid wordCount to 0 rather than NaN', () => {
    const now = new Date();
    const setOps = buildAnswersPatchSetOps({ essays: { task2: { text: 'x' } } }, now);
    expect(setOps).toEqual({ 'essays.task2': { text: 'x', wordCount: 0, updatedAt: now } });
  });

  it('ignores an essays entry with no text (e.g. only wordCount sent)', () => {
    const setOps = buildAnswersPatchSetOps({ essays: { task1: { wordCount: 5 } as any } });
    expect(setOps).toEqual({});
  });

  describe('kirish chegaralari (xavfsizlik)', () => {
    it('nuqtali/operator/uzun kalitlarni tashlaydi (ichma-ich yo‘l yozish mumkin emas)', () => {
      const setOps = buildAnswersPatchSetOps({
        answers: { '1': 'A', 'a.b': 'x', '$set': 'x', '': 'x', ['k'.repeat(33)]: 'x', 'x y': 'x', '../z': 'x' } as any,
      });
      expect(setOps).toEqual({ 'answers.1': 'A' });
    });

    it('200 tadan ortiq kalitni kesadi', () => {
      const answers = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i + 1), 'A']));
      expect(Object.keys(buildAnswersPatchSetOps({ answers }))).toHaveLength(200);
    });

    it('qiymat turi/hajmi: matn ≤1000, massiv ≤20 matn; obyekt/raqam/mantiqiy tashlanadi; null saqlanadi', () => {
      const setOps = buildAnswersPatchSetOps({
        answers: {
          s: 'x'.repeat(5000),
          arr: Array.from({ length: 50 }, () => 'y'.repeat(2000)),
          mixed: ['a', 1, null, { $ne: 1 }, 'b'] as any,
          obj: { a: 1 } as any,
          num: 5 as any,
          nul: null,
        },
      });
      expect((setOps['answers.s'] as string).length).toBe(1000);
      expect(setOps['answers.arr']).toHaveLength(20);
      expect((setOps['answers.arr'] as string[])[0].length).toBe(1000);
      expect(setOps['answers.mixed']).toEqual(['a', 'b']);
      expect(setOps).not.toHaveProperty('answers.obj');
      expect(setOps).not.toHaveProperty('answers.num');
      expect(setOps['answers.nul']).toBeNull();
    });

    it('massiv ko‘rinishidagi answers rad etiladi', () => {
      expect(buildAnswersPatchSetOps({ answers: ['A', 'B'] as any })).toEqual({});
    });

    it('flagged/lastQuestion: faqat 0..999 butun sonlar', () => {
      expect(buildAnswersPatchSetOps({ flagged: [1, 2.5, -1, 1000, 'x', 7] as any, lastQuestion: 5000 })).toEqual({ flagged: [1, 7] });
      expect(buildAnswersPatchSetOps({ lastQuestion: 3.5 })).toEqual({});
      expect(Array.isArray(buildAnswersPatchSetOps({ flagged: Array.from({ length: 999 }, (_, i) => i) }).flagged)).toBe(true);
      expect((buildAnswersPatchSetOps({ flagged: Array.from({ length: 999 }, (_, i) => i) }).flagged as number[]).length).toBe(200);
    });

    it('insho matni 20 000 belgiga kesiladi; wordCount chegaralanadi (NaN/manfiy/ulkan)', () => {
      const now = new Date();
      const big = buildAnswersPatchSetOps({ essays: { task1: { text: 'w'.repeat(1_000_000), wordCount: 9e12 } } }, now)['essays.task1'] as any;
      expect(big.text.length).toBe(20_000);
      expect(big.wordCount).toBe(20_000);
      expect((buildAnswersPatchSetOps({ essays: { task2: { text: 'x', wordCount: -5 } } }, now)['essays.task2'] as any).wordCount).toBe(0);
      expect((buildAnswersPatchSetOps({ essays: { task2: { text: 'x', wordCount: NaN } } }, now)['essays.task2'] as any).wordCount).toBe(0);
    });
  });

  it('returns an empty object when nothing in the patch is actually settable', () => {
    expect(buildAnswersPatchSetOps({})).toEqual({});
    expect(buildAnswersPatchSetOps({ answers: {} })).toEqual({});
  });

  it('combines answers, flagged, lastQuestion, and essays into one flat set-ops object', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const setOps = buildAnswersPatchSetOps(
      { answers: { q5: 'A' }, flagged: [5], lastQuestion: 5, essays: { task2: { text: 'essay', wordCount: 250 } } },
      now
    );
    expect(setOps).toEqual({
      'answers.q5': 'A',
      flagged: [5],
      lastQuestion: 5,
      'essays.task2': { text: 'essay', wordCount: 250, updatedAt: now },
    });
  });
});

// EDU-03 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md — "Error-driven curriculum") —
// `extractErrorVocabulary` ham sof funksiya (DB/AI'siz), `buildAnswersPatchSetOps`
// bilan bir xil naqsh bo'yicha to'g'ridan-to'g'ri sinaladi. `autoAddErrorVocabulary`
// (DB'ga yozadi) va `submitAttempt` bog'lanishi bu yerda sinalmaydi.
describe('extractErrorVocabulary', () => {
  const fakeTest = (paragraphHtml: string, locatorParagraph = 'A') => ({
    sections: {
      reading: {
        passages: [
          {
            paragraphs: [{ label: 'A', html: paragraphHtml }],
            questionGroups: [{ questions: [{ number: 1, locatorParagraph }] }],
          },
        ],
      },
    },
  });

  it('extracts a small, deterministic word list from the wrong question\'s paragraph', () => {
    const test = fakeTest(
      '<p>The archaeological excavation uncovered remarkable artefacts beneath the ancient settlement.</p>'
    );
    const words = extractErrorVocabulary(test, [{ number: 1, correct: false }]);
    expect(words.length).toBeGreaterThan(0);
    expect(words.length).toBeLessThanOrEqual(4);
    // Faqat uzun (>=5 harf), stop-so'z bo'lmagan so'zlar bo'lishi kerak.
    for (const w of words) {
      expect(w.length).toBeGreaterThanOrEqual(5);
      expect(/^[a-z]+$/.test(w)).toBe(true);
    }
    // Deterministik — ikkinchi chaqiruv bir xil natija berishi kerak.
    expect(extractErrorVocabulary(test, [{ number: 1, correct: false }])).toEqual(words);
  });

  it('returns nothing when the question was answered correctly', () => {
    const test = fakeTest('<p>The archaeological excavation uncovered remarkable artefacts.</p>');
    expect(extractErrorVocabulary(test, [{ number: 1, correct: true }])).toEqual([]);
  });

  it('returns nothing when the question has no locatorParagraph', () => {
    const test = {
      sections: {
        reading: {
          passages: [
            {
              paragraphs: [{ label: 'A', html: '<p>The archaeological excavation uncovered remarkable artefacts.</p>' }],
              questionGroups: [{ questions: [{ number: 1 }] }], // locatorParagraph yo'q
            },
          ],
        },
      },
    };
    expect(extractErrorVocabulary(test, [{ number: 1, correct: false }])).toEqual([]);
  });

  it('returns nothing gracefully when there is no reading section at all', () => {
    expect(extractErrorVocabulary({ sections: {} }, [{ number: 1, correct: false }])).toEqual([]);
    expect(extractErrorVocabulary(null, [{ number: 1, correct: false }])).toEqual([]);
    expect(extractErrorVocabulary(undefined, undefined)).toEqual([]);
  });

  it('returns nothing when the locatorParagraph label does not match any paragraph', () => {
    const test = fakeTest('<p>The archaeological excavation uncovered remarkable artefacts.</p>', 'Z');
    expect(extractErrorVocabulary(test, [{ number: 1, correct: false }])).toEqual([]);
  });
});

describe('estimateFromHistory', () => {
  const row = (l: number | null, r: number | null, w: number | null, s: number | null) => ({ listening: l, reading: r, writing: w, speaking: s });

  it('takes the LATEST band per skill (input is newest-first)', () => {
    const est = estimateFromHistory([row(null, 7, null, null), row(null, 5, null, null), row(6, null, null, null)]);
    expect(est.bands).toEqual({ listening: 6, reading: 7, writing: null, speaking: null });
    expect(est.skillsCovered).toBe(2);
    expect(est.estimate).toBe(6.5);
  });

  it('returns null estimate when nothing has been graded', () => {
    const est = estimateFromHistory([]);
    expect(est.estimate).toBeNull();
    expect(est.skillsCovered).toBe(0);
  });

  it('treats a genuine 0 band as a band, not as missing', () => {
    const est = estimateFromHistory([row(null, 0, null, null)]);
    expect(est.bands.reading).toBe(0);
    expect(est.skillsCovered).toBe(1);
  });
});
