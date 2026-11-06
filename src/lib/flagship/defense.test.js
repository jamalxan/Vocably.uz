import { describe, it, expect } from 'vitest';
import {
  DEFENSE, travelMsFor, spawnIntervalFor, maxAliveFor, pickNextQuestion, pickSlot, advance, frontTarget, cycleTarget,
  responseMsFor, breachResponseMs, initialDefense, killPoints, resolveShot, resolveCorrection, resolveBreach, noteWord, summary,
} from './defense';
import { scheduleCounted } from './typing';
import { assessSession, minPlausibleMs } from '../vocab/antiCheat';
import { seededRandom } from '../vocab/rng';

const enemy = (id, progress, extra = {}) => ({ id, progress, alive: true, pending: false, ...extra });

/**
 * Deterministic model of a round: the player always works on the front enemy, needs `answerMs`
 * (±20 %) per word, is right on the first try with probability `accuracy`, and after a miss types
 * the revealed word in 60 % of the time. Server latency is ignored (pending enemies are frozen anyway).
 */
function simulate({ answerMs, accuracy, seed, total = 20 }) {
  const rand = seededRandom(seed);
  const dt = 50;
  let t = 0;
  let state = initialDefense();
  const enemies = [];
  let nextSpawn = DEFENSE.firstSpawnMs;
  let spawned = 0;
  let workingOn = null;
  let doneAt = 0;
  while (t < DEFENSE.roundMs && !state.over && (spawned < total || enemies.some((e) => e.alive))) {
    t += dt;
    if (spawned < total && t >= nextSpawn && enemies.filter((e) => e.alive).length < maxAliveFor(state.kills)) {
      enemies.push({ id: spawned, travelled: 0, travelMs: travelMsFor(state.kills), alive: true, pending: false, missed: false, progress: 0 });
      spawned += 1;
      nextSpawn = t + spawnIntervalFor(state.kills);
    }
    for (const e of enemies) {
      if (!e.alive || advance(e, dt) < 1) continue;
      e.alive = false;
      state = resolveBreach(state, { qid: String(e.id), answered: e.missed });
      if (workingOn === e.id) workingOn = null;
    }
    if (workingOn === null) {
      workingOn = frontTarget(enemies);
      doneAt = t + answerMs * (0.8 + 0.4 * rand());
    } else if (t >= doneAt) {
      const e = enemies.find((x) => x.id === workingOn);
      if (e?.alive && e.missed) {
        e.alive = false;
        state = resolveCorrection(state);
        workingOn = null;
      } else if (e?.alive && rand() < accuracy) {
        e.alive = false;
        state = resolveShot(state, { ok: true, qid: String(e.id), typed: 'abcdef', progress: e.progress });
        workingOn = null;
      } else if (e?.alive) {
        e.missed = true;
        state = resolveShot(state, { ok: false, qid: String(e.id) });
        doneAt = t + answerMs * 0.6;
      } else {
        workingOn = null;
      }
    }
  }
  return { t, state, spawned };
}

describe('Word Defense rules', () => {
  it('ramps by kills: travel −5 % every 4 kills (floor 9 s), spawn 5 s → 2.6 s, 2 → 3 → 4 alive', () => {
    expect(travelMsFor(0)).toBe(18_000);
    expect(travelMsFor(3)).toBe(18_000);
    expect(travelMsFor(4)).toBe(Math.round(18_000 * 0.95));
    expect(travelMsFor(500)).toBe(DEFENSE.travelFloorMs);
    expect(spawnIntervalFor(0)).toBe(5000);
    expect(spawnIntervalFor(10)).toBe(3800);
    expect(spawnIntervalFor(100)).toBe(2600);
    expect([maxAliveFor(0), maxAliveFor(3), maxAliveFor(4), maxAliveFor(9), maxAliveFor(10), maxAliveFor(40)]).toEqual([2, 2, 3, 3, 4, 4]);
  });

  it('a 4.5 s / 75 % phone player survives at least a minute (or clears the wave)', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const r = simulate({ answerMs: 4500, accuracy: 0.75, seed });
      expect(r.state.over === false || r.t >= 60_000).toBe(true);
    }
  });

  it('a fast typist is still challenged, a very slow one eventually loses', () => {
    const fast = simulate({ answerMs: 2500, accuracy: 0.9, seed: 11, total: 26 });
    expect(fast.state.over).toBe(false);
    expect(fast.state.kills).toBeGreaterThan(18);
    const slow = simulate({ answerMs: 9000, accuracy: 0.5, seed: 12, total: 26 });
    expect(slow.state.breaches).toBeGreaterThan(0);
  });

  it('never spawns a second enemy with the same label', () => {
    const qs = [{ qid: 'a', prompt: 'ishonchli' }, { qid: 'b', prompt: 'Ishonchli ' }, { qid: 'c', prompt: 'foyda' }];
    expect(pickNextQuestion(qs, new Set(), [])).toBe(0);
    expect(pickNextQuestion(qs, new Set(['a']), ['ishonchli'])).toBe(2);
    expect(pickNextQuestion(qs, new Set(['a', 'c']), ['ishonchli'])).toBe(-1);
    expect(pickNextQuestion(qs, new Set(['a', 'c']), [])).toBe(1);
  });

  it('picks a free lateral slot', () => {
    const rand = seededRandom(3);
    for (let i = 0; i < 20; i++) expect([0, 1]).toContain(pickSlot([2, 3], rand));
    expect([0, 1, 2, 3]).toContain(pickSlot([0, 1, 2, 3], rand));
  });

  it('advances enemies, but a pending enemy is frozen', () => {
    const e = { travelled: 0, travelMs: 10_000, pending: false };
    expect(advance(e, 5000)).toBeCloseTo(0.5);
    e.pending = true;
    expect(advance(e, 5000)).toBeCloseTo(0.5);
    e.pending = false;
    expect(advance(e, 5000)).toBeCloseTo(1);
  });

  it('targets the enemy closest to the base and cycles through the others', () => {
    const list = [enemy('a', 0.2), enemy('b', 0.7), enemy('c', 0.5), enemy('d', 0.9, { pending: true }), enemy('e', 0.95, { alive: false })];
    expect(frontTarget(list)).toBe('b');
    expect(cycleTarget(list, 'b', 1)).toBe('c');
    expect(cycleTarget(list, 'c', 1)).toBe('a');
    expect(cycleTarget(list, 'a', 1)).toBe('b');
    expect(cycleTarget(list, 'b', -1)).toBe('a');
    expect(cycleTarget(list, 'zzz', 1)).toBe('b');
    expect(frontTarget([])).toBeNull();
  });

  it('kills score more the earlier they happen; misses reset the combo and keep the enemy', () => {
    expect(killPoints({ combo: 0, progress: 0 })).toBe(150);
    expect(killPoints({ combo: 0, progress: 1 })).toBe(100);
    let s = initialDefense();
    s = resolveShot(s, { ok: true, qid: 'a', word: 'improve', prompt: 'p', typed: 'improve', progress: 1 });
    s = resolveShot(s, { ok: true, qid: 'b', word: 'obtain', prompt: 'p', typed: 'obtain', progress: 1 });
    expect(s).toMatchObject({ kills: 2, combo: 2, score: 100 + 110, correctChars: 13 });
    s = resolveShot(s, { ok: false, qid: 'c', word: 'sustain', prompt: 'p', typed: 'sustian' });
    expect(s).toMatchObject({ kills: 2, wrong: 1, combo: 0, hp: DEFENSE.hp });
    s = resolveCorrection(s);
    expect(s).toMatchObject({ corrections: 1, score: 210 + DEFENSE.correctionPoints, combo: 0 });
    const offline = resolveShot(s, { ok: null, qid: 'd' });
    expect(offline).toMatchObject({ kills: 2, wrong: 1, score: s.score, hp: s.hp });
  });

  it('a breach costs HP; an unanswered breach becomes a missed word; 0 HP ends the round', () => {
    let s = initialDefense();
    s = resolveBreach(s, { qid: 'a', prompt: 'pa' });
    expect(s).toMatchObject({ hp: DEFENSE.hp - 1, breaches: 1, unanswered: 1 });
    s = noteWord(s, 'a', 'adequate');
    expect(s.results.at(-1)).toMatchObject({ qid: 'a', word: 'adequate', ok: false });
    s = resolveShot(s, { ok: false, qid: 'b', word: 'decline', prompt: 'pb' });
    s = resolveBreach(s, { qid: 'b', prompt: 'pb', answered: true });
    expect(s).toMatchObject({ breaches: 2, unanswered: 1 });
    expect(s.results.filter((r) => r.qid === 'b')).toHaveLength(1);
    for (let i = 0; i < 3; i++) s = resolveBreach(s, { qid: `x${i}`, prompt: 'p' });
    expect(s.over).toBe(true);
    expect(resolveBreach(s, { qid: 'late' })).toBe(s);
    expect(resolveCorrection(s)).toBe(s);
    // a shot fired before the base fell is still counted (the server counts it too)
    const after = resolveShot(s, { ok: true, qid: 'inflight', word: 'w', prompt: 'p', typed: 'w', progress: 0.9 });
    expect(after).toMatchObject({ kills: 1, over: true });
    expect(after.results.at(-1)).toMatchObject({ qid: 'inflight', ok: true });
  });

  it('summarises: accuracy counts kills against misses and unanswered breaches', () => {
    let s = initialDefense();
    s = resolveShot(s, { ok: true, qid: 'a', word: 'w', prompt: 'p', typed: 'abc', progress: 0.5 });
    s = resolveShot(s, { ok: false, qid: 'b', word: 'v', prompt: 'p' });
    s = resolveBreach(s, { qid: 'c', word: 'u', prompt: 'p' });
    s = resolveShot(s, { ok: null, qid: 'd', word: '', prompt: 'p' });
    const sum = summary(s, 60_000, { resolved: 4 });
    expect(sum).toMatchObject({ kills: 1, wrong: 1, breaches: 1, accuracy: 33, waves: 4, cpm: 3, seconds: 60, hp: DEFENSE.hp - 1 });
    expect(sum.missed.map((m) => m.word)).toEqual(['v', 'u']);
  });

  it('reports non-overlapping response times, so a busy round never trips the elapsed-time check', () => {
    // Four enemies on screen at once; answers come in back to back.
    const spawns = [0, 3500, 7000, 10_500, 14_000, 17_500];
    const submits = [6000, 9000, 11_000, 16_000, 19_000, 21_000];
    let lastCountedAt = 0;
    const times = submits.map((now, i) => {
      const ms = responseMsFor({ now, spawnedAt: spawns[i], lastCountedAt });
      lastCountedAt = now;
      return ms;
    });
    const sum = times.reduce((a, b) => a + b, 0);
    expect(sum).toBeLessThanOrEqual(submits.at(-1));
    // naive "since spawn" times would overlap
    const naive = submits.reduce((a, now, i) => a + (now - spawns[i]), 0);
    expect(naive).toBeGreaterThan(sum);
    const answers = [...times, breachResponseMs('kamaymoq'), breachResponseMs('foyda')].map((responseMs, i) => ({ responseMs: responseMs + i * 37, inputType: 'typed', promptLength: 8, units: 1 }));
    const a = assessSession({ answers, startedAt: new Date(0), completedAt: new Date(23_000) });
    expect(a.flags).not.toContain('response_time_exceeds_elapsed');
    expect(breachResponseMs('kamaymoq')).toBeGreaterThan(minPlausibleMs({ inputType: 'typed', promptLength: 8, units: 1 }));
  });

  it('holds a back-to-back answer until the plausibility floor, keeping intervals disjoint', () => {
    const prompt = 'ishonchli';
    const floor = minPlausibleMs({ inputType: 'typed', promptLength: prompt.length, units: 1 });
    // a slow answer goes out immediately
    expect(scheduleCounted({ now: 6000, spawnedAt: 1000, lastCountedAt: 0, prompt })).toEqual({ sendAt: 6000, responseMs: 5000 });
    // a second enemy, read while typing the first, answered 0.4 s later → held to floor + 150 ms
    const b = scheduleCounted({ now: 6400, spawnedAt: 2000, lastCountedAt: 6000, prompt });
    expect(b.responseMs).toBe(floor + 150);
    expect(b.sendAt).toBe(6000 + floor + 150);
    // a burst of four: every reported time clears the floor, and their sum never exceeds the clock
    let last = 0;
    let sum = 0;
    let sendAt = 0;
    for (const now of [5000, 5200, 5300, 5350]) {
      const r = scheduleCounted({ now, spawnedAt: 0, lastCountedAt: last, prompt });
      expect(r.responseMs).toBeGreaterThan(floor);
      expect(r.sendAt).toBeGreaterThanOrEqual(now);
      sum += r.responseMs;
      last = r.sendAt;
      sendAt = r.sendAt;
    }
    expect(sum).toBeLessThanOrEqual(sendAt);
    const answers = [5000, floor + 150, floor + 151, floor + 152].map((responseMs) => ({ responseMs, inputType: 'typed', promptLength: prompt.length, units: 1 }));
    const a = assessSession({ answers, startedAt: new Date(0), completedAt: new Date(sendAt + 500) });
    expect(a.flags).not.toContain('impossible_response_time');
    expect(a.flags).not.toContain('response_time_exceeds_elapsed');
  });
});
