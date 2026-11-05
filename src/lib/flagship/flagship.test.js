import { describe, it, expect } from 'vitest';
import { RUN, speedFor, travelMsFor, pointsFor, comboMultiplier, initialRun, resolveGate, moveLane, missedWords, summary, guestQuestions } from './run';
import { RUN_BANK, bankEntry } from './runBank';
import { silenceLimitAt, dangerLevel, hasFallen, rmsLevel, createVad, createSilenceTracker, countFillers, speakSummary, PART2_TOPICS, pickTopic } from './speak';
import { seededRandom } from '../vocab/rng';

const gate = (ok, word = 'w', extra = {}) => ({ ok, qid: word, wordId: '', word, prompt: `p-${word}`, responseMs: 2000, chosen: 0, ...extra });

describe('Vocably Run rules', () => {
  it('speeds up 8% every 10 correct answers', () => {
    expect(speedFor(0)).toBe(1);
    expect(speedFor(9)).toBe(1);
    expect(speedFor(10)).toBeCloseTo(1.08);
    expect(speedFor(25)).toBeCloseTo(1.08 * 1.08);
    expect(travelMsFor(10)).toBeLessThan(travelMsFor(0));
  });

  it('scores correct × speed × combo, capped at ×2 combo', () => {
    expect(pointsFor({ correct: 0, combo: 0 })).toBe(100);
    expect(pointsFor({ correct: 0, combo: 5 })).toBe(150);
    expect(comboMultiplier(50)).toBe(2);
    expect(pointsFor({ correct: 10, combo: 0 })).toBe(108);
  });

  it('loses a life and the combo on a wrong lane; ends at 0 lives', () => {
    let s = initialRun();
    s = resolveGate(s, gate(true, 'a'));
    s = resolveGate(s, gate(true, 'b'));
    expect(s).toMatchObject({ combo: 2, correct: 2, score: 100 + 110 });
    s = resolveGate(s, gate(false, 'c'));
    expect(s).toMatchObject({ combo: 0, lives: 2, wrong: 1, over: false });
    s = resolveGate(s, gate(false, 'd'));
    s = resolveGate(s, gate(false, 'e'));
    expect(s.over).toBe(true);
    expect(resolveGate(s, gate(true, 'f'))).toBe(s); // frozen after game over
    expect(s.maxCombo).toBe(2);
  });

  it('an ungraded gate (offline) costs nothing', () => {
    const s = resolveGate(initialRun(), gate(null));
    expect(s).toMatchObject({ lives: RUN.lives, score: 0, combo: 0, correct: 0, wrong: 0 });
    expect(s.results).toHaveLength(1);
  });

  it('clamps lane moves', () => {
    expect(moveLane(0, -1)).toBe(0);
    expect(moveLane(0, 1)).toBe(1);
    expect(moveLane(2, 1)).toBe(2);
  });

  it('lists missed words once, and summarises', () => {
    let s = initialRun();
    for (const g of [gate(false, 'x'), gate(true, 'y'), gate(false, 'x'), gate(null, 'z')]) s = resolveGate(s, g);
    expect(missedWords(s.results)).toEqual([{ word: 'x', prompt: 'p-x' }]);
    expect(summary(s, 42_400)).toMatchObject({ correct: 1, wrong: 2, accuracy: 33, seconds: 42 });
  });

  it('builds 3-lane guest gates with exactly one right word', () => {
    const qs = guestQuestions(RUN_BANK, seededRandom('t'), 30);
    expect(qs).toHaveLength(30);
    for (const q of qs) {
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(3);
      const right = q.options.find((o) => o.id === q.answer);
      expect(right.text).toBe(q.word);
      const entry = bankEntry(q.word);
      expect(q.prompt).toBe(q.promptKind === 'definition' ? entry.definition : entry.uz);
    }
  });

  it('bank words are unique and complete', () => {
    expect(new Set(RUN_BANK.map((w) => w.word)).size).toBe(RUN_BANK.length);
    for (const w of RUN_BANK) expect(w.uz && w.definition && w.cefr && w.word === w.word.toLowerCase()).toBeTruthy();
    expect(bankEntry('  Mitigate ')).toMatchObject({ word: 'mitigate' });
    expect(bankEntry('hack')).toBeNull();
  });
});

describe('Gapir yoki yiqil rules', () => {
  it('shrinks the allowed pause every 15 s: 12/8/5/3', () => {
    expect([0, 14_999, 15_000, 30_000, 45_000, 59_000, 70_000].map(silenceLimitAt)).toEqual([12000, 12000, 8000, 5000, 3000, 3000, 3000]);
    expect(hasFallen(4_999, 31_000)).toBe(false);
    expect(hasFallen(5_000, 31_000)).toBe(true);
    expect(dangerLevel(1_500, 50_000)).toBeCloseTo(0.5);
  });

  it('computes RMS', () => {
    expect(rmsLevel(new Float32Array([0.5, -0.5, 0.5, -0.5]))).toBeCloseTo(0.5);
    expect(rmsLevel(new Float32Array())).toBe(0);
  });

  it('VAD calibrates to the room, then bridges short gaps between words', () => {
    const vad = createVad({ calibrationMs: 100, hangoverMs: 300 });
    for (let t = 0; t < 100; t += 20) expect(vad.feed(0.03, t).calibrating).toBe(true); // noisy room
    expect(vad.feed(0.05, 120).speaking).toBe(false); // below 0.03 × 2.5
    expect(vad.feed(0.2, 140).speaking).toBe(true);
    expect(vad.feed(0.01, 400).speaking).toBe(true); // hangover
    expect(vad.feed(0.01, 500).speaking).toBe(false);
  });

  it('tracks silence, falls past the limit, and maps pauses ≥ 1 s', () => {
    const tr = createSilenceTracker();
    expect(tr.tick(false, 11_000).fallen).toBe(false); // thinking at the start
    tr.tick(true, 11_500);
    tr.tick(false, 20_000);
    tr.tick(true, 20_400); // 0.4 s — breathing, not a pause
    tr.tick(false, 30_000);
    expect(tr.tick(false, 34_000)).toMatchObject({ silentMs: 4_000, fallen: false });
    expect(tr.tick(false, 35_000).fallen).toBe(true); // 5 s limit in 30–45 s
    expect(tr.finish(35_000)).toEqual([{ startMs: 30_000, endMs: 35_000 }]);
  });

  it('counts fillers but not "like"', () => {
    expect(countFillers('Um, I like it, you know, uh… I mean erm')).toEqual({ total: 5, byWord: { um: 1, 'you know': 1, uh: 1, 'i mean': 1, erm: 1 } });
    expect(countFillers('')).toEqual({ total: 0, byWord: {} });
  });

  it('summarises a round', () => {
    const s = speakSummary({ survivedMs: 60_000, pauses: [{ startMs: 1000, endMs: 3500 }], transcript: 'one two three um', fell: false });
    expect(s).toMatchObject({ seconds: 60, survived: true, pauses: 1, longestPauseSec: 2.5, words: 4, wpm: 4 });
    expect(s.fillers.total).toBe(1);
    expect(speakSummary({ survivedMs: 4_000, pauses: [], transcript: '', fell: false })).toMatchObject({ survived: false, stopped: true, wpm: null });
    expect(speakSummary({ survivedMs: 30_000, pauses: [], transcript: '', fell: true })).toMatchObject({ survived: false, stopped: false });
  });

  it('has topics with 4 points and never repeats the last one', () => {
    for (const t of PART2_TOPICS) expect(t.points).toHaveLength(4);
    expect(pickTopic(() => 0, 0)).toBe(1);
  });
});
