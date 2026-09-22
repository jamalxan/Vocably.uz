import { describe, it, expect } from 'vitest';
import { buildAnswersPatchSetOps } from './attemptServer';

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
