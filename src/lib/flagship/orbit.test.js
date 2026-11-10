import { describe, it, expect } from 'vitest';
import { ORBIT, questionMsFor, unlockMsFor, pointsFor, initialOrbit, resolveAnswer, summary, splitAtBlank, guestQuestions } from './orbit';
import { ORBIT_SENTENCES } from './orbitBank';
import { RUN_BANK } from './runBank';
import { seededRandom } from '../vocab/rng';
import { minPlausibleMs } from '../vocab/antiCheat';

const ans = (ok, word = 'w', extra = {}) => ({ ok, qid: word, word, prompt: `p-${word}`, responseMs: 3000, chosen: 0, fuelLeft: 0, ...extra });

describe("So'z orbitasi rules", () => {
  it('gives less fuel every 4 correct answers, never under the floor', () => {
    expect(questionMsFor(0)).toBe(ORBIT.questionMs);
    expect(questionMsFor(3)).toBe(ORBIT.questionMs);
    expect(questionMsFor(4)).toBe(Math.round(ORBIT.questionMs * 0.94));
    expect(questionMsFor(8)).toBeLessThan(questionMsFor(4));
    expect(questionMsFor(1000)).toBe(ORBIT.questionFloorMs);
  });

  it('scores base × combo × fuel bonus', () => {
    expect(pointsFor({ combo: 0, fuelLeft: 0 })).toBe(100);
    expect(pointsFor({ combo: 0, fuelLeft: 1 })).toBe(150);
    expect(pointsFor({ combo: 5, fuelLeft: 0 })).toBe(150);
    expect(pointsFor({ combo: 50, fuelLeft: 2 })).toBe(300); // combo ×2 cap, fuel clamped to 1
    expect(pointsFor({ combo: 0, fuelLeft: -1 })).toBe(100);
  });

  it('a wrong planet or an empty tank costs a shield and the combo; 0 shields ends the round', () => {
    let s = initialOrbit();
    s = resolveAnswer(s, ans(true, 'a'));
    s = resolveAnswer(s, ans(true, 'b'));
    expect(s).toMatchObject({ combo: 2, correct: 2, score: 100 + 110, shields: ORBIT.shields });
    s = resolveAnswer(s, ans(false, 'c'));
    expect(s).toMatchObject({ combo: 0, shields: 2, wrong: 1, over: false });
    s = resolveAnswer(s, ans(false, 'd', { timeout: true }));
    s = resolveAnswer(s, ans(false, 'e'));
    expect(s.over).toBe(true);
    expect(resolveAnswer(s, ans(true, 'f'))).toBe(s); // frozen once the round is over
    expect(s.maxCombo).toBe(2);
    expect(s.results[3].timeout).toBe(true);
  });

  it('an ungraded answer (offline) costs nothing', () => {
    const s = resolveAnswer(initialOrbit(), ans(null));
    expect(s).toMatchObject({ shields: ORBIT.shields, score: 0, combo: 0, correct: 0, wrong: 0 });
    expect(s.results).toHaveLength(1);
  });

  it('summarises a round and lists each missed word once', () => {
    let s = initialOrbit();
    for (const a of [ans(false, 'x'), ans(true, 'y'), ans(false, 'x'), ans(null, 'z')]) s = resolveAnswer(s, a);
    expect(summary(s, 61_400)).toMatchObject({ correct: 1, wrong: 2, accuracy: 33, seconds: 61, shields: 1, missed: [{ word: 'x', prompt: 'p-x' }] });
  });

  it('keeps the planets locked past the server floor for a choice answer', () => {
    for (const prompt of ['', 'Short _____ one.', 'x'.repeat(90), 'x'.repeat(400)]) {
      expect(unlockMsFor(prompt)).toBeGreaterThan(minPlausibleMs({ inputType: 'choice', promptLength: prompt.length }));
    }
    // the lock is short next to the fuel for a question
    expect(unlockMsFor('x'.repeat(400))).toBeLessThan(ORBIT.questionFloorMs / 4);
  });

  it('splits a sentence around its gap', () => {
    expect(splitAtBlank(`We need a ${ORBIT.blank} source.`)).toEqual(['We need a ', ' source.']);
    expect(splitAtBlank(`${ORBIT.blank} is key.`)).toEqual(['', ' is key.']);
    expect(splitAtBlank('No gap here.')).toEqual(['No gap here.', null]);
  });
});

describe("So'z orbitasi guest bank", () => {
  it('has one sentence per public-bank word, each containing the word once', () => {
    for (const b of RUN_BANK) {
      const s = ORBIT_SENTENCES[b.word];
      expect(s, b.word).toBeTruthy();
      const hits = s.en.toLowerCase().split(b.word.toLowerCase()).length - 1;
      expect(hits, b.word).toBe(1);
      expect(s.uz.length, b.word).toBeGreaterThan(5);
    }
    expect(Object.keys(ORBIT_SENTENCES)).toHaveLength(RUN_BANK.length);
  });

  it('builds questions with exactly one right planet and a blanked sentence', () => {
    const qs = guestQuestions(RUN_BANK, ORBIT_SENTENCES, seededRandom('orbit'));
    expect(qs).toHaveLength(ORBIT.guestQuestions);
    expect(new Set(qs.map((q) => q.word)).size).toBe(qs.length); // one question per word
    for (const q of qs) {
      expect(q.options).toHaveLength(ORBIT.planets);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(ORBIT.planets);
      expect(q.options.find((o) => o.id === q.answer)?.text).toBe(q.word);
      expect(q.prompt).toContain(ORBIT.blank);
      expect(q.prompt.toLowerCase()).not.toContain(q.word.toLowerCase());
      const [before, after] = splitAtBlank(q.prompt);
      expect(before + q.word + after).toBe(ORBIT_SENTENCES[q.word].en);
    }
  });

  it('skips words without a usable sentence', () => {
    const bank = RUN_BANK.slice(0, 6);
    const qs = guestQuestions(bank, { [bank[0].word]: ORBIT_SENTENCES[bank[0].word], [bank[1].word]: { en: 'Nothing to blank here.', uz: 'x' } }, seededRandom('s'));
    expect(qs.map((q) => q.word)).toEqual([bank[0].word]);
  });
});
