import { describe, it, expect } from 'vitest';
import {
  BRIDGE, PORTALS, SHORE, SPAWN, VILLAGE,
  groundHeightAt, isWalkable, nearestPortal, resolveMove, shortestAngleDelta,
} from './worldLayout';

describe('Vocabulary World layout', () => {
  it('spawn and every portal stand on walkable ground', () => {
    expect(isWalkable(SPAWN.x, SPAWN.z)).toBe(true);
    for (const p of PORTALS) expect(isWalkable(p.x, p.z), p.key).toBe(true);
  });

  it('lagoon between shore and village is water except on the bridge', () => {
    expect(isWalkable(5, -4.5)).toBe(false);
    expect(isWalkable(0, -4.5)).toBe(true);
    expect(groundHeightAt(0, -4.5)).toBe(BRIDGE.deckY);
  });

  it('shore and village are connected only through the bridge', () => {
    expect(isWalkable(0, SHORE.z - SHORE.walkRadius)).toBe(true);
    expect(isWalkable(0, VILLAGE.z + VILLAGE.walkRadius)).toBe(true);
    for (let z = VILLAGE.z + VILLAGE.walkRadius; z <= SHORE.z - SHORE.walkRadius; z += 0.25) {
      expect(isWalkable(0, z)).toBe(true);
      expect(isWalkable(4, z)).toBe(false);
    }
  });

  it('open water returns no ground height', () => {
    expect(groundHeightAt(40, 40)).toBeNull();
  });

  it('resolveMove blocks walking into water and slides along the edge', () => {
    const edgeZ = SHORE.z + SHORE.walkRadius;
    expect(resolveMove(0, edgeZ - 0.05, 0, 1)).toEqual({ x: 0, z: edgeZ - 0.05 });
    const slid = resolveMove(0, edgeZ - 0.05, 0.5, 1);
    expect(slid.x).toBeCloseTo(0.5);
    expect(slid.z).toBeCloseTo(edgeZ - 0.05);
  });

  it('nearestPortal finds a portal only within the radius', () => {
    const p = PORTALS[0];
    expect(nearestPortal(p.x + 1, p.z)?.key).toBe(p.key);
    expect(nearestPortal(SPAWN.x, SPAWN.z)).toBeNull();
  });

  it('portal keys are unique', () => {
    expect(new Set(PORTALS.map((p) => p.key)).size).toBe(PORTALS.length);
  });

  it('shortestAngleDelta wraps around ±PI', () => {
    expect(shortestAngleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2);
    expect(shortestAngleDelta(0.5, 0.2)).toBeCloseTo(-0.3);
  });
});
