import { describe, it, expect } from 'vitest';
import { ISLAND, BEACONS, unlockMsFor, pointsFor, initialIsland, allResolved, resolveBeacon, summary, clampToIsland, stepHero, beaconInReach, nextBeacon } from './island';
import { minPlausibleMs } from '../vocab/antiCheat';

const ans = (index, ok, extra = {}) => ({ index, ok, qid: `q${index}`, word: `w${index}`, prompt: `p${index}`, responseMs: 3000, timeLeft: 0, ...extra });

describe("So'z oroli rules", () => {
  it('lays the beacons out on the plateau, apart from each other, the tower and the spawn', () => {
    expect(BEACONS).toHaveLength(8);
    for (let i = 0; i < BEACONS.length; i++) {
      const b = BEACONS[i];
      const r = Math.hypot(b.x, b.z);
      expect(r).toBeLessThan(ISLAND.walkRadius - 1);
      expect(r).toBeGreaterThan(ISLAND.towerRadius + ISLAND.reach);
      expect(Math.hypot(b.x - ISLAND.spawn.x, b.z - ISLAND.spawn.z)).toBeGreaterThan(ISLAND.reach + 1);
      for (let k = i + 1; k < BEACONS.length; k++) {
        // two beacons are never in reach at once
        expect(Math.hypot(b.x - BEACONS[k].x, b.z - BEACONS[k].z)).toBeGreaterThan(ISLAND.reach * 2);
      }
    }
  });

  it('scores base × combo × time bonus', () => {
    expect(pointsFor({ combo: 0, timeLeft: 0 })).toBe(100);
    expect(pointsFor({ combo: 0, timeLeft: 1 })).toBe(150);
    expect(pointsFor({ combo: 5, timeLeft: 0 })).toBe(150);
    expect(pointsFor({ combo: 99, timeLeft: 9 })).toBe(300);
  });

  it('lights a beacon on a right answer, breaks it on a wrong one, and never asks it twice', () => {
    let s = initialIsland();
    s = resolveBeacon(s, ans(0, true));
    s = resolveBeacon(s, ans(1, true));
    expect(s).toMatchObject({ lit: 2, combo: 2, score: 100 + 110, hearts: ISLAND.hearts });
    expect(s.beacons.slice(0, 3)).toEqual(['lit', 'lit', 'idle']);
    const again = resolveBeacon(s, ans(0, false));
    expect(again).toBe(s); // already resolved
    s = resolveBeacon(s, ans(2, false));
    expect(s).toMatchObject({ broken: 1, combo: 0, hearts: 2, over: false });
    expect(s.beacons[2]).toBe('broken');
    s = resolveBeacon(s, ans(3, false));
    s = resolveBeacon(s, ans(4, false));
    expect(s.over).toBe(true);
    expect(resolveBeacon(s, ans(5, true))).toBe(s); // frozen once the round is over
  });

  it('an ungraded answer (offline) leaves the beacon open and costs nothing', () => {
    const s = resolveBeacon(initialIsland(), ans(0, null));
    expect(s).toMatchObject({ hearts: ISLAND.hearts, score: 0, lit: 0, broken: 0 });
    expect(s.beacons[0]).toBe('idle');
    expect(s.results).toHaveLength(1);
  });

  it('knows when nothing is left, and summarises the round', () => {
    let s = initialIsland(3);
    expect(s.beacons).toHaveLength(3);
    expect(allResolved(s)).toBe(false);
    s = resolveBeacon(s, ans(0, true));
    s = resolveBeacon(s, ans(1, false));
    s = resolveBeacon(s, ans(2, true));
    expect(allResolved(s)).toBe(true);
    expect(summary(s, 75_300)).toMatchObject({ correct: 2, wrong: 1, total: 3, accuracy: 67, seconds: 75, hearts: 2, allLit: false, missed: [{ word: 'w1', prompt: 'p1' }] });
    let all = initialIsland(2);
    all = resolveBeacon(all, ans(0, true));
    all = resolveBeacon(all, ans(1, true));
    expect(summary(all, 1000).allLit).toBe(true);
    expect(initialIsland(99).beacons).toHaveLength(BEACONS.length);
  });

  it('keeps the options locked past the server floor for a choice answer', () => {
    for (const prompt of ['', 'imkoniyat', 'x'.repeat(120), 'x'.repeat(500)]) {
      expect(unlockMsFor(prompt)).toBeGreaterThan(minPlausibleMs({ inputType: 'choice', promptLength: prompt.length }));
    }
  });
});

describe("So'z oroli movement", () => {
  it('keeps the hero on the plateau and out of the tower', () => {
    const out = clampToIsland(40, 0);
    expect(Math.hypot(out.x, out.z)).toBeCloseTo(ISLAND.walkRadius);
    const diag = clampToIsland(30, -30);
    expect(Math.hypot(diag.x, diag.z)).toBeCloseTo(ISLAND.walkRadius);
    const tower = clampToIsland(0.5, 0);
    expect(Math.hypot(tower.x, tower.z)).toBeCloseTo(ISLAND.towerRadius);
    expect(clampToIsland(0, 0)).toEqual({ x: 0, z: ISLAND.towerRadius });
    expect(clampToIsland(3, 4)).toEqual({ x: 3, z: 4 });
  });

  it('walks with the stick at a fixed speed, facing the way it goes', () => {
    const hero = { x: 0, z: 9, angle: 0, moving: false };
    const up = stepHero(hero, { dir: { x: 0, z: -1 }, dt: 0.016 });
    expect(up.z).toBeCloseTo(9 - ISLAND.speed * 0.016);
    expect(up.angle).toBeCloseTo(0);
    expect(up.moving).toBe(true);
    const right = stepHero(hero, { dir: { x: 1, z: 0 }, dt: 0.016 });
    expect(right.angle).toBeCloseTo(Math.PI / 2);
    // an over-long direction (two keys, a stick pushed past its rim) is not faster
    const diag = stepHero(hero, { dir: { x: 1, z: -1 }, dt: 0.016 });
    expect(Math.hypot(diag.x - hero.x, diag.z - hero.z)).toBeCloseTo(ISLAND.speed * 0.016);
    // a long frame (tab switch) cannot teleport the hero
    const jump = stepHero(hero, { dir: { x: 0, z: -1 }, dt: 5 });
    expect(hero.z - jump.z).toBeCloseTo(ISLAND.speed * 0.05);
    // standing still keeps the facing
    expect(stepHero({ ...hero, angle: 1.2 }, { dt: 0.016 })).toMatchObject({ x: 0, z: 9, angle: 1.2, moving: false });
  });

  it('walks to a tapped point and stops there; the stick cancels the tap', () => {
    let hero = { x: 0, z: 9, angle: 0, moving: false, dest: { x: 4, z: 9 } };
    for (let i = 0; i < 200 && hero.dest; i++) hero = stepHero(hero, { dest: hero.dest, dt: 0.016 });
    expect(hero.dest).toBeNull();
    expect(hero.x).toBeCloseTo(4, 0);
    expect(hero.z).toBeCloseTo(9, 0);
    const steered = stepHero({ x: 0, z: 9, angle: 0 }, { dir: { x: -1, z: 0 }, dest: { x: 4, z: 9 }, dt: 0.016 });
    expect(steered.dest).toBeNull();
    expect(steered.x).toBeLessThan(0);
    // a tap in the sea is dropped once the hero is stopped by the shore
    let shore = { x: 0, z: ISLAND.walkRadius - 0.1, angle: 0, dest: { x: 0, z: 40 } };
    for (let i = 0; i < 100 && shore.dest; i++) shore = stepHero(shore, { dest: shore.dest, dt: 0.016 });
    expect(shore.dest).toBeNull();
    expect(shore.z).toBeLessThanOrEqual(ISLAND.walkRadius + 1e-6);
  });

  it('finds the beacon in reach and the next one to walk to', () => {
    const idle = initialIsland().beacons;
    expect(beaconInReach(ISLAND.spawn.x, ISLAND.spawn.z, idle)).toBe(-1);
    expect(beaconInReach(BEACONS[2].x + 1, BEACONS[2].z, idle)).toBe(2);
    const done = idle.slice();
    done[2] = 'lit';
    expect(beaconInReach(BEACONS[2].x + 1, BEACONS[2].z, done)).toBe(-1);
    const next = nextBeacon(BEACONS[2].x, BEACONS[2].z, done);
    expect(next.index).not.toBe(2);
    expect(next.distance).toBeGreaterThan(ISLAND.reach);
    // bearing: a beacon straight up the screen (toward −z) is at 0, one to the right at +90°
    const only = idle.map((_, i) => (i === 4 ? 'idle' : 'lit'));
    expect(nextBeacon(BEACONS[4].x, BEACONS[4].z + 5, only).bearing).toBeCloseTo(0);
    expect(nextBeacon(BEACONS[4].x - 5, BEACONS[4].z, only).bearing).toBeCloseTo(Math.PI / 2);
    expect(nextBeacon(0, 0, idle.map(() => 'lit'))).toBeNull();
  });
});
