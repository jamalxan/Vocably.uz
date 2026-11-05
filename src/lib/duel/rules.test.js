import { describe, it, expect } from 'vitest';
import {
  DUEL, rng, duelCode, cleanPool, buildDuelQuestions, publicQuestion, gradeAnswer, timeoutAnswer, tally, isSuspicious,
  decideWinner, eloUpdate, resultFor, xpFor, missedWords, reviewRows,
} from './rules';
import { RUN_BANK } from '../flagship/runBank';

const POOL = RUN_BANK.map((e) => ({ word: e.word, uz: e.uz, cefr: e.cefr }));

describe('question set', () => {
  it('same seed → same 10 questions (both players see the same duel)', () => {
    const a = buildDuelQuestions(POOL, 42);
    const b = buildDuelQuestions(POOL, 42);
    expect(a).toEqual(b);
    expect(a).toHaveLength(10);
    expect(buildDuelQuestions(POOL, 43)).not.toEqual(a);
  });
  it('10 distinct words, 4 distinct options, the right one present, directions alternate', () => {
    const qs = buildDuelQuestions(POOL, 7);
    expect(new Set(qs.map((q) => q.word)).size).toBe(10);
    qs.forEach((q, i) => {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.dir).toBe(i % 2 === 0 ? 'en_uz' : 'uz_en');
      expect(q.options[q.answer]).toBe(q.dir === 'en_uz' ? q.uz : q.word);
      expect(q.prompt).toBe(q.dir === 'en_uz' ? q.word : q.uz);
    });
  });
  it('the right option lands in every position across seeds (no positional tell)', () => {
    const pos = new Set();
    for (let s = 1; s < 40; s++) for (const q of buildDuelQuestions(POOL, s)) pos.add(q.answer);
    expect([...pos].sort()).toEqual([0, 1, 2, 3]);
  });
  it('distractors prefer the same CEFR level', () => {
    const qs = buildDuelQuestions(POOL, 11);
    const levelOf = (opt, dir) => POOL.find((p) => (dir === 'en_uz' ? p.uz : p.word) === opt)?.cefr;
    for (const q of qs) for (const o of q.options) expect(levelOf(o, q.dir)).toBe(q.cefr);
  });
  it('too small or dirty pool → null; duplicates and blanks are dropped', () => {
    expect(buildDuelQuestions(POOL.slice(0, 9), 1)).toBeNull();
    expect(cleanPool([{ word: 'a', uz: 'x' }, { word: 'A ', uz: 'y' }, { word: 'b', uz: 'X' }, { word: '', uz: 'z' }, { word: 'c', uz: '' }, null]))
      .toEqual([{ word: 'a', uz: 'x', cefr: '' }]);
  });
  it('public question never carries the answer or the source word', () => {
    const q = buildDuelQuestions(POOL, 5)[1];
    const pub = publicQuestion(q, 1);
    expect(pub).toEqual({ index: 1, dir: 'uz_en', prompt: q.uz, options: q.options, total: 10, limitMs: 7000 });
    expect(JSON.stringify(pub)).not.toContain('"answer"');
  });
});

describe('grading with the server clock', () => {
  const q = { options: ['a', 'b', 'c', 'd'], answer: 2 };
  it('right and fast = up to 150, right and slow = 100+, wrong = 0', () => {
    expect(gradeAnswer(q, 2, 700)).toEqual({ ok: true, late: false, implausible: false, ms: 700, points: 145 });
    expect(gradeAnswer(q, 2, 7000)).toMatchObject({ ok: true, points: 100 });
    expect(gradeAnswer(q, 1, 900)).toMatchObject({ ok: false, points: 0 });
  });
  it('the 1.5 s network allowance; after it the answer is a timeout', () => {
    expect(gradeAnswer(q, 2, 8400)).toMatchObject({ ok: true, late: false, points: 100 });
    expect(gradeAnswer(q, 2, 8600)).toEqual({ ok: false, late: true, implausible: false, ms: 8500, points: 0 });
  });
  it('inhumanly fast answers are counted but flagged', () => {
    expect(gradeAnswer(q, 2, 120)).toMatchObject({ ok: true, implausible: true });
    expect(gradeAnswer(q, 1, 120)).toMatchObject({ ok: false, implausible: false });
  });
  it('junk choices are wrong, negative time is clamped', () => {
    for (const c of [-1, 4, 1.5, '2', null]) expect(gradeAnswer(q, c, 1000).ok).toBe(false);
    expect(gradeAnswer(q, 2, -50)).toMatchObject({ ms: 0, implausible: true });
  });
  it('tally and suspicion', () => {
    const answers = [gradeAnswer(q, 2, 100), gradeAnswer(q, 2, 100), gradeAnswer(q, 2, 100), gradeAnswer(q, 0, 3000), timeoutAnswer()];
    const t = tally(answers);
    expect(t).toMatchObject({ correct: 3, implausible: 3 });
    expect(t.score).toBe(3 * 149);
    expect(isSuspicious(t)).toBe(false);
    expect(isSuspicious(tally([...answers, gradeAnswer(q, 2, 50)]))).toBe(true);
  });
});

describe('winner and rating', () => {
  const t = (score, correct, totalMs) => ({ score, correct, totalMs });
  it('score, then correct answers, then time, then draw', () => {
    expect(decideWinner(t(900, 7, 30000), t(800, 8, 20000))).toBe('a');
    expect(decideWinner(t(800, 6, 30000), t(800, 7, 40000))).toBe('b');
    expect(decideWinner(t(800, 7, 25000), t(800, 7, 30000))).toBe('a');
    expect(decideWinner(t(800, 7, 30000), t(800, 7, 30000))).toBe('draw');
  });
  it('ELO: equal players ±16, upsets pay more, zero-sum', () => {
    expect(eloUpdate(1000, 1000, 1)).toEqual({ a: 1016, b: 984, deltaA: 16, deltaB: -16 });
    expect(eloUpdate(1000, 1000, 0.5)).toEqual({ a: 1000, b: 1000, deltaA: 0, deltaB: -0 });
    const upset = eloUpdate(900, 1300, 1);
    expect(upset.deltaA).toBe(29);
    expect(upset.deltaA + upset.deltaB).toBe(0);
    expect(eloUpdate(1300, 900, 1).deltaA).toBe(3);
  });
  it('result and XP per side', () => {
    expect(resultFor('a', 'a')).toBe(1);
    expect(resultFor('a', 'b')).toBe(0);
    expect(resultFor('draw', 'b')).toBe(0.5);
    expect([xpFor('a', 'a'), xpFor('a', 'b'), xpFor('draw', 'a')]).toEqual([DUEL.xp.win, DUEL.xp.loss, DUEL.xp.draw]);
  });
});

describe('misc', () => {
  it('codes are 8 safe characters', () => {
    const r = rng(1);
    for (let i = 0; i < 50; i++) expect(duelCode(r)).toMatch(/^[a-hjkmnp-z2-9]{8}$/);
  });
  it('missed words and review rows', () => {
    const qs = buildDuelQuestions(POOL, 3);
    const answers = qs.map((q, i) => (i < 7 ? gradeAnswer(q, q.answer, 2000) : gradeAnswer(q, (q.answer + 1) % 4, 2000)));
    answers.pop(); // the last one never answered
    expect(missedWords(qs, answers).map((m) => m.word)).toEqual(qs.slice(7).map((q) => q.word));
    const rows = reviewRows(qs, answers);
    expect(rows[0]).toMatchObject({ word: qs[0].word, ok: true, points: 136 });
    expect(rows[9]).toMatchObject({ ok: false, ms: null, points: 0 });
  });
});
