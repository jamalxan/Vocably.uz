import { describe, it, expect } from 'vitest';
import { buildQuiz, questionMarkup, tashkentDate } from './telegramQuiz';

const word = (id, w, syn, due = true) => ({ _id: id, word: w, syns: syn ? [syn] : [], stats: due ? {} : { nextReview: '2099-01-01' } });
const cats = [
  {
    _id: 'c1',
    words: [word('1', 'arise', 'paydo bo‘lmoq'), word('2', 'resilient', 'bardoshli'), word('3', 'vast', 'ulkan', false), word('4', 'brief', 'qisqa'), word('5', 'rare', 'kamyob'), word('6', 'x', '')],
  },
];
let seed = 1;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('buildQuiz', () => {
  it('builds up to 5 four-option questions, due words first, skipping words without translation', () => {
    const q = buildQuiz(cats, { now: new Date('2026-09-29T10:00:00Z'), rnd });
    expect(q.items).toHaveLength(5);
    expect(q.items.slice(0, 4).every((i) => i.word !== 'vast')).toBe(true); // not due → last
    for (const i of q.items) {
      expect(i.options).toHaveLength(4);
      expect(new Set(i.options).size).toBe(4);
      expect(i.options[i.correct]).toBe(cats[0].words.find((w) => w.word === i.word).syns[0]);
    }
    expect(q.date).toBe('2026-09-29');
  });

  it('returns null when there are too few translated words', () => {
    expect(buildQuiz([{ _id: 'c', words: [word('1', 'a', 'x'), word('2', 'b', 'y')] }])).toBeNull();
  });

  it('question buttons carry date, index and choice', () => {
    const q = buildQuiz(cats, { rnd });
    const m = questionMarkup(q);
    expect(m.reply_markup.inline_keyboard[0].map((b) => b.callback_data)).toEqual([0, 1, 2, 3].map((c) => `tq:${q.date}:0:${c}`));
  });

  it('uses the Tashkent calendar day', () => {
    expect(tashkentDate(new Date('2026-09-29T20:30:00Z'))).toBe('2026-09-30');
  });
});
