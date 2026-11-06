import { describe, it, expect } from 'vitest';
import { TUNNEL, initialTunnel, wordPoints, resolveWord, finishBonus, summary, ringHue } from './tunnel';

const word = (ok, w = 'improve', extra = {}) => ({ ok, qid: w, word: w, prompt: `p-${w}`, typed: ok ? w : 'nope', responseMs: 2500, ...extra });

describe("So'z tunneli rules", () => {
  it('is a 90 s round', () => {
    expect(TUNNEL.roundMs).toBe(90_000);
  });

  it('scores base × combo × speed and builds the combo', () => {
    expect(wordPoints({ combo: 0, responseMs: 1000, typedLength: 7 })).toBe(150);
    expect(wordPoints({ combo: 0, responseMs: 60_000, typedLength: 7 })).toBe(100);
    let s = initialTunnel();
    s = resolveWord(s, word(true, 'a1', { typed: 'achieve', responseMs: 60_000 }));
    s = resolveWord(s, word(true, 'a2', { typed: 'achieve', responseMs: 60_000 }));
    expect(s).toMatchObject({ correct: 2, combo: 2, maxCombo: 2, score: 100 + 110, correctChars: 14 });
  });

  it('a wrong word resets the combo; an empty answer is a skip', () => {
    let s = initialTunnel();
    s = resolveWord(s, word(true, 'a'));
    s = resolveWord(s, word(false, 'b'));
    expect(s).toMatchObject({ combo: 0, wrong: 1, skipped: 0, maxCombo: 1 });
    s = resolveWord(s, word(false, 'c', { typed: '   ' }));
    expect(s).toMatchObject({ wrong: 2, skipped: 1 });
  });

  it('an ungraded word (no connection) changes nothing but is recorded', () => {
    let s = resolveWord(initialTunnel(), word(true, 'a'));
    const before = { ...s };
    s = resolveWord(s, word(null, 'b'));
    expect(s).toMatchObject({ score: before.score, combo: before.combo, correct: 1, wrong: 0 });
    expect(s.results).toHaveLength(2);
  });

  it('adds up to 10 points per second left, only when every word was answered, scaled by accuracy', () => {
    expect(finishBonus(12_400, true)).toBe(120);
    expect(finishBonus(12_400, false)).toBe(0);
    expect(finishBonus(-5, true)).toBe(0);
    expect(finishBonus(12_400, true, 0.5)).toBe(60);
    expect(finishBonus(12_400, true, 0)).toBe(0);
  });

  it('pays no early-finish bonus for skipping or mistyping every word', () => {
    let s = initialTunnel();
    for (let i = 0; i < 12; i++) s = resolveWord(s, word(false, `w${i}`, { typed: i % 2 ? 'x' : '' }));
    const sum = summary(s, 14_000, { msLeft: 76_000, allAnswered: true });
    expect(sum).toMatchObject({ bonus: 0, score: 0, correct: 0, accuracy: 0 });
  });

  it('summarises a round', () => {
    let s = initialTunnel();
    s = resolveWord(s, word(true, 'reliable', { typed: 'reliable', responseMs: 60_000 }));
    s = resolveWord(s, word(false, 'obtain'));
    s = resolveWord(s, word(false, 'obtain'));
    const sum = summary(s, 30_000, { msLeft: 5_000, allAnswered: true });
    expect(sum).toMatchObject({ score: 100 + 17, bonus: 17, correct: 1, wrong: 2, accuracy: 33, maxCombo: 1, cpm: 16, seconds: 30 }); // 5 s × 10 × 1/3
    expect(sum.missed).toEqual([{ word: 'obtain', prompt: 'p-obtain', yours: 'nope' }]);
    expect(summary(initialTunnel(), 0).accuracy).toBe(0);
  });

  it('walks hue around the wheel', () => {
    expect(ringHue(0)).toBe(0);
    expect(ringHue(1)).toBeCloseTo(23 / 360);
    for (let i = 0; i < 100; i++) expect(ringHue(i)).toBeLessThan(1);
  });
});
