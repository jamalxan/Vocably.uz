import { describe, it, expect, vi } from 'vitest';
import { normalizeTyped, gradeGuest, slotsFor, comboMultiplier, speedBonus, maskAnswer, guestTypedQuestions, fromServerQuestion, missedTyped, charsPerMinute, typedFloorMs, matchesRevealed, hasCyrillic, canSkip, scheduleCounted, createSendHold, TYPED_MAX } from './typing';
import { RUN_BANK } from './runBank';
import { validateAnswer } from '../vocab/answering';
import { assessSession, minPlausibleMs } from '../vocab/antiCheat';
import { seededRandom } from '../vocab/rng';

describe('typing games — shared rules', () => {
  it('normalises like the server (case, spaces, apostrophes)', () => {
    expect(normalizeTyped('  Look   AFTER ')).toBe('look after');
    expect(normalizeTyped("o'g'il")).toBe('ogil');
    expect(normalizeTyped(null)).toBe('');
  });

  it('grades guests exactly like validateAnswer(typed) on the server', () => {
    const q = { word: 'environment', accepted: ['environment'] };
    const server = { inputType: 'typed', accepted: ['environment'] };
    for (const typed of ['environment', ' Environment ', 'enviroment', 'envirnment', 'e', '', 'environmental']) {
      const g = gradeGuest(q, typed);
      const v = validateAnswer(server, typed);
      expect(g.ok).toBe(v.isCorrect);
      expect(g.near).toBe(!!v.near);
      expect(g.correctDisplay).toBe('environment');
    }
  });

  it('shows letter slots only when the question carries answerLength', () => {
    expect(slotsFor({ answerLength: 7, hint: 'i_ _ _ _ _ _ (7 harf)' })).toEqual({ length: 7, first: 'i' });
    expect(slotsFor({ answerLength: 7 })).toEqual({ length: 7, first: '' });
    expect(slotsFor({ answerLength: 5, first: 'r' })).toEqual({ length: 5, first: 'r' });
    expect(slotsFor({})).toBeNull();
    expect(slotsFor({ answerLength: 0 })).toBeNull();
    expect(slotsFor({ answerLength: 999 }).length).toBe(TYPED_MAX);
  });

  it('caps the combo at ×2 and rewards fast answers relative to word length', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(5)).toBeCloseTo(1.5);
    expect(comboMultiplier(40)).toBe(2);
    expect(speedBonus(1000, 7)).toBe(1.5);
    expect(speedBonus(60_000, 7)).toBe(1);
    const mid = speedBonus(5000, 7);
    expect(mid).toBeGreaterThan(1);
    expect(mid).toBeLessThan(1.5);
    // a long word gets more time for the same bonus
    expect(speedBonus(3500, 13)).toBeGreaterThan(speedBonus(3500, 4));
  });

  it('masks the answer inside a definition', () => {
    expect(maskAnswer('to improve something', 'improve')).toBe('to _____ something');
    expect(maskAnswer('Improvements matter', 'improve')).toBe('_____ matter');
    expect(maskAnswer('nothing here', 'improve')).toBe('nothing here');
  });

  it('builds guest questions from the bank with the easy hint and Uzbek meanings first', () => {
    const qs = guestTypedQuestions(RUN_BANK, seededRandom(7), 20);
    expect(qs).toHaveLength(20);
    expect(new Set(qs.map((q) => q.word)).size).toBe(20);
    qs.slice(0, 3).forEach((q) => expect(q.promptKind).toBe('meaning'));
    for (const q of qs) {
      expect(q.answerLength).toBe(q.word.length);
      expect(q.first).toBe(q.word.charAt(0));
      expect(q.accepted).toEqual([q.word]);
      expect(q.prompt.toLowerCase()).not.toContain(q.word);
    }
    expect(guestTypedQuestions(RUN_BANK.slice(0, 5), seededRandom(1), 20)).toHaveLength(5);
  });

  it('maps server questions without inventing answer fields', () => {
    const q = fromServerQuestion({ qid: 'q1', kind: 'type_definition', prompt: 'not willing', answerLength: 9, hint: undefined, options: [] });
    expect(q).toEqual({ qid: 'q1', prompt: 'not willing', promptKind: 'definition', answerLength: 9, hint: undefined });
    expect(fromServerQuestion({ qid: 'q2', kind: 'spell_drop', prompt: 'ishonchli' }).promptKind).toBe('meaning');
    expect(Object.keys(fromServerQuestion({ qid: 'q3', prompt: 'x', word: 'leak', accepted: ['leak'] }))).not.toContain('word');
  });

  it('lists missed words once and measures typing speed', () => {
    const missed = missedTyped([
      { ok: false, word: 'a', prompt: 'pa', typed: ' ax ' },
      { ok: true, word: 'b', prompt: 'pb', typed: 'b' },
      { ok: false, word: 'a', prompt: 'pa', typed: 'ay' },
      { ok: null, word: 'c', prompt: 'pc', typed: 'c' },
      { ok: false, word: '', prompt: 'pd', typed: 'd' },
      { ok: false, word: 'e', prompt: 'pe', typed: '' }, // a skip or a breach: nothing typed
    ]);
    expect(missed).toEqual([
      { word: 'a', prompt: 'pa', yours: 'ax' },
      { word: 'e', prompt: 'pe', yours: '' },
    ]);
    expect(charsPerMinute(120, 60_000)).toBe(120);
    expect(charsPerMinute(10, 0)).toBe(0);
  });

  it('checks corrections against the revealed word, ignoring case, spaces and hyphens', () => {
    expect(matchesRevealed(' Long term', 'long-term')).toBe(true);
    expect(matchesRevealed('longterm', 'long-term')).toBe(true);
    expect(matchesRevealed('long', 'long-term')).toBe(false);
    expect(matchesRevealed('', '')).toBe(false);
    // the same forms the server accepts for a first attempt
    expect(matchesRevealed('look after', 'look after (sb)')).toBe(true);
    expect(matchesRevealed('achieve', 'to achieve')).toBe(true);
    expect(matchesRevealed('in charge of', 'in charge (of)')).toBe(true);
    expect(matchesRevealed('rely on', 'rely on sb/sth')).toBe(true);
    expect(matchesRevealed('color', 'colour / color')).toBe(true);
    expect(matchesRevealed('look after (sb)', 'look after (sb)')).toBe(true);
    expect(matchesRevealed('sth', 'rely on sb/sth')).toBe(false);
  });

  it('spots a Cyrillic keyboard layout', () => {
    expect(hasCyrillic('ымпрове')).toBe(true);
    expect(hasCyrillic('improve')).toBe(false);
    expect(hasCyrillic("o'zbek")).toBe(false);
  });

  it('unlocks Skip only after the prompt could have been read', () => {
    const floor = typedFloorMs('ishonchli');
    expect(canSkip('ishonchli', 1000, 1000 + floor - 1)).toBe(false);
    expect(canSkip('ishonchli', 1000, 1000 + floor)).toBe(true);
  });

  it('uses the same plausibility floor as the server', () => {
    expect(typedFloorMs('ishonchli')).toBe(minPlausibleMs({ inputType: 'typed', promptLength: 9, units: 1 }));
    expect(typedFloorMs('x'.repeat(500))).toBe(900 + 1200);
  });
});

describe('typing games — counted-answer timing (signed in)', () => {
  const PROMPTS = ['ishonarli', 'daromad', "o'sish", 'kamaymoq', 'foyda', "ta'sir", 'muhim', 'rivojlanish', 'atrof-muhit', 'tejamoq', 'yetarli', 'kafolat'];
  const assess = (times, end) =>
    assessSession({ answers: times.map((responseMs, i) => ({ responseMs, inputType: 'typed', promptLength: PROMPTS[i].length, units: 1 })), startedAt: new Date(0), completedAt: new Date(end) });

  it("So'z tunneli: a quick typist is never reported as impossibly fast, and the intervals never overlap", () => {
    // The tunnel shows the next prompt the moment a word is sent. Every third word is typed faster
    // than the server's floor for its prompt (0.45–0.85 s); the rest take 1.8–3.6 s.
    let shownAt = 1000;
    let last = 0;
    const raw = [];
    const sent = [];
    PROMPTS.forEach((prompt, i) => {
      const now = shownAt + (i % 3 === 0 ? 450 + ((i * 131) % 400) : 1800 + ((i * 577) % 1800));
      const r = scheduleCounted({ now, spawnedAt: shownAt, lastCountedAt: last, prompt });
      expect(r.sendAt).toBeGreaterThanOrEqual(now); // never before the player answered
      expect(r.responseMs).toBeGreaterThanOrEqual(typedFloorMs(prompt) + 150);
      expect(r.sendAt - r.responseMs).toBeGreaterThanOrEqual(last); // starts after the previous send
      raw.push(now - shownAt);
      sent.push(r.responseMs);
      last = r.sendAt;
      shownAt = now;
    });
    expect(sent.reduce((t, ms) => t + ms, 0)).toBeLessThanOrEqual(last - 1000);
    const end = last + 1500;
    // Sent as typed (the old behaviour), a third of the answers are under the floor: no XP.
    expect(assess(raw, end)).toMatchObject({ suspicious: true, flags: ['impossible_response_time'] });
    expect(assess(sent, end)).toMatchObject({ suspicious: false, flags: [] });
  });

  it('holds a send until its time; release() sends the rest at once, cancel() drops them', () => {
    vi.useFakeTimers();
    try {
      const out = [];
      const hold = createSendHold();
      hold.at(1000, 1000, () => out.push('now')); // not in the future: sent right away
      hold.at(1500, 1000, () => out.push('a'));
      hold.at(1800, 1000, () => out.push('b'));
      expect(out).toEqual(['now']);
      expect(hold.size).toBe(2);
      vi.advanceTimersByTime(500);
      expect(out).toEqual(['now', 'a']);
      hold.release(); // the round is ending: what is still held goes out now
      expect(out).toEqual(['now', 'a', 'b']);
      expect(hold.size).toBe(0);
      vi.advanceTimersByTime(1000);
      expect(out).toEqual(['now', 'a', 'b']); // and never twice
      hold.at(3000, 2000, () => out.push('c'));
      hold.cancel(); // the page was left
      vi.advanceTimersByTime(2000);
      expect(out).toEqual(['now', 'a', 'b']);
      expect(hold.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
