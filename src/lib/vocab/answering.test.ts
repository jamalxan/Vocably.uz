import { describe, it, expect } from 'vitest';
import { questionUnits, scoreSession, suggestDifficulty, validateAnswer } from './answering';
import { buildGameSession, type GameKey, type GameQuestion } from './games';
import { seededRandom } from './rng';
import { SAMPLE_WORDS } from './fixtures';

function firstOf(gameKey: GameKey, difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium'): GameQuestion {
  return buildGameSession({ gameKey, difficulty, words: SAMPLE_WORDS, rand: seededRandom(`a-${gameKey}`) }).questions[0];
}

describe('validateAnswer (server-side tekshiruv)', () => {
  it("choice: faqat to'g'ri option id to'g'ri", () => {
    const q = firstOf('multiple_choice');
    expect(validateAnswer(q, q.answer).isCorrect).toBe(true);
    const wrong = q.options!.find((o) => o.id !== q.answer)!.id;
    expect(validateAnswer(q, wrong).isCorrect).toBe(false);
    expect(validateAnswer(q, '').isCorrect).toBe(false);
    expect(validateAnswer(q, null).isCorrect).toBe(false);
    expect(validateAnswer(q, 'o999').isCorrect).toBe(false);
  });

  it("choice: variant MATNI emas, faqat id qabul qilinadi (matn bilan aldab bo'lmaydi)", () => {
    const q = firstOf('multiple_choice');
    const text = q.options!.find((o) => o.id === q.answer)!.text;
    expect(validateAnswer(q, text).isCorrect).toBe(false);
  });

  it("typed: katta-kichik harf va bo'shliqni e'tiborsiz qoldiradi", () => {
    const q = firstOf('listen_type');
    expect(validateAnswer(q, `  ${q.word.toUpperCase()}  `).isCorrect).toBe(true);
    expect(validateAnswer(q, q.word).isCorrect).toBe(true);
    expect(validateAnswer(q, '').isCorrect).toBe(false);
    expect(validateAnswer(q, 123 as unknown).isCorrect).toBe(false);
  });

  it("typed: 1 harf xato to'g'ri emas, lekin 'near' ogohlantirish", () => {
    const q = firstOf('listen_type');
    const typo = q.word.length >= 5 ? q.word.slice(0, -1) : q.word + 'x';
    const v = validateAnswer(q, typo);
    expect(v.isCorrect).toBe(false);
    if (q.word.length >= 5) expect(v.near).toBe(true);
  });

  it("typed fill: gapdagi tuslangan shakl ham, asosiy so'z ham qabul qilinadi", () => {
    const q = buildGameSession({ gameKey: 'fill_gap', difficulty: 'hard', words: SAMPLE_WORDS, rand: seededRandom('t') }).questions[0];
    for (const a of q.accepted!) expect(validateAnswer(q, a).isCorrect).toBe(true);
  });

  it("arrange: to'g'ri tartib to'g'ri, buzilgan tartib xato (tinish belgilarisiz)", () => {
    const q = firstOf('sentence_builder');
    expect(validateAnswer(q, q.answerTokens).isCorrect).toBe(true);
    expect(validateAnswer(q, q.answerTokens!.join(' ').toLowerCase()).isCorrect).toBe(true);
    expect(validateAnswer(q, q.tokens).isCorrect).toBe(false);
    expect(validateAnswer(q, []).isCorrect).toBe(false);
  });

  it("match: hamma juftlik to'g'ri; qisman to'g'ri hisoblanadi", () => {
    const q = firstOf('word_match');
    const full = validateAnswer(q, q.answerMap);
    expect(full.isCorrect).toBe(true);
    expect(full.correctParts).toBe(full.totalParts);

    const ids = Object.keys(q.answerMap!);
    const partial = { ...q.answerMap, [ids[0]]: q.answerMap![ids[1]], [ids[1]]: q.answerMap![ids[0]] };
    const pv = validateAnswer(q, partial);
    expect(pv.isCorrect).toBe(false);
    expect(pv.correctParts).toBe(ids.length - 2);
    expect(pv.partResults![ids[0]]).toBe(false);

    const empty = validateAnswer(q, {});
    expect(empty.correctParts).toBe(0);
    expect(validateAnswer(q, 'xyz').isCorrect).toBe(false);
  });

  it("questionUnits: juftlik savoli har juftlik uchun alohida", () => {
    const q = firstOf('word_match');
    expect(questionUnits(q)).toBe(Object.keys(q.answerMap!).length);
    expect(questionUnits(firstOf('multiple_choice'))).toBe(1);
  });
});

describe('scoreSession', () => {
  it('bo\'sh sessiya 0', () => {
    const r = scoreSession([]);
    expect(r.score).toBe(0);
    expect(r.accuracy).toBe(0);
  });
  it("to'g'ri javoblar tezlik va combo bilan ko'proq ball", () => {
    const fast = scoreSession([
      { isCorrect: true, responseMs: 1000 },
      { isCorrect: true, responseMs: 1000 },
      { isCorrect: true, responseMs: 1000 },
    ]);
    const slow = scoreSession([
      { isCorrect: true, responseMs: 9500 },
      { isCorrect: true, responseMs: 9500 },
      { isCorrect: true, responseMs: 9500 },
    ]);
    expect(fast.score).toBeGreaterThan(slow.score);
    expect(fast.maxCombo).toBe(3);
    expect(fast.accuracy).toBe(1);
  });
  it("xato combo ni uzadi", () => {
    const r = scoreSession([
      { isCorrect: true, responseMs: 2000 },
      { isCorrect: true, responseMs: 2000 },
      { isCorrect: false, responseMs: 2000 },
      { isCorrect: true, responseMs: 2000 },
    ]);
    expect(r.maxCombo).toBe(2);
    expect(r.correctUnits).toBe(3);
    expect(r.wrongUnits).toBe(1);
    expect(r.accuracy).toBeCloseTo(0.75);
  });
  it("juftlik savoli birliklar bo'yicha hisoblanadi", () => {
    const r = scoreSession([{ isCorrect: false, responseMs: 5000, correctParts: 3, totalParts: 5 }]);
    expect(r.correctUnits).toBe(3);
    expect(r.wrongUnits).toBe(2);
    expect(r.score).toBeGreaterThan(0);
  });
  it("o'rtacha javob vaqti", () => {
    expect(scoreSession([{ isCorrect: true, responseMs: 1000 }, { isCorrect: false, responseMs: 3000 }]).avgResponseMs).toBe(2000);
  });
});

describe('suggestDifficulty (TZ §10)', () => {
  it("tarix yo'q: mastery bo'yicha", () => {
    expect(suggestDifficulty({ history: [], avgMastery: 10 })).toBe('easy');
    expect(suggestDifficulty({ history: [], avgMastery: 40 })).toBe('medium');
    expect(suggestDifficulty({ history: [], avgMastery: 70 })).toBe('hard');
    expect(suggestDifficulty({ history: [], avgMastery: 90 })).toBe('expert');
    expect(suggestDifficulty({ history: [] })).toBe('medium');
  });
  it("past aniqlik — osonlashadi", () => {
    expect(suggestDifficulty({ history: [{ difficulty: 'hard', accuracy: 0.4, avgResponseMs: 6000 }] })).toBe('medium');
    expect(suggestDifficulty({ history: [{ difficulty: 'easy', accuracy: 0.4, avgResponseMs: 6000 }] })).toBe('easy');
  });
  it("yuqori aniqlik va tezlik — qiyinlashadi", () => {
    expect(suggestDifficulty({ history: [{ difficulty: 'medium', accuracy: 0.95, avgResponseMs: 2500 }] })).toBe('hard');
    expect(suggestDifficulty({ history: [{ difficulty: 'expert', accuracy: 1, avgResponseMs: 1500 }] })).toBe('expert');
  });
  it("o'rtacha natija — o'zgarmaydi", () => {
    expect(suggestDifficulty({ history: [{ difficulty: 'medium', accuracy: 0.75, avgResponseMs: 5000 }] })).toBe('medium');
  });
  it("ketma-ket yaxshi sessiyalar sekin bo'lsa ham qiyinlashtiradi", () => {
    const h = [
      { difficulty: 'medium' as const, accuracy: 0.9, avgResponseMs: 8000 },
      { difficulty: 'medium' as const, accuracy: 0.88, avgResponseMs: 8000 },
    ];
    expect(suggestDifficulty({ history: h })).toBe('hard');
  });
});
