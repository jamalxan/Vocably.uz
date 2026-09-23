import { describe, it, expect } from 'vitest';
import { buildAnswersPatchSetOps, extractErrorVocabulary } from './attemptServer';

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
