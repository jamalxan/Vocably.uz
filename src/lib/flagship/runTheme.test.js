import { describe, it, expect } from 'vitest';
import { RUN, speedFor } from './run';
import { RUN_THEMES, THEME_KEYS, THEME_EASE_MS, SIGN_TONES, levelFor, themeIndex, themeFor, themeBlend, hexToRgb, contrastRatio } from './runTheme';

const HEX = /^#[0-9a-f]{6}$/i;

describe('Vocably Run themes', () => {
  it('has six themes, each with every colour slot as a valid #rrggbb', () => {
    expect(RUN_THEMES).toHaveLength(6);
    expect(new Set(RUN_THEMES.map((t) => t.name)).size).toBe(6);
    for (const t of RUN_THEMES) {
      for (const k of THEME_KEYS) {
        expect(t[k], `${t.name}.${k}`).toMatch(HEX);
        expect(() => hexToRgb(t[k])).not.toThrow();
      }
    }
    expect(() => hexToRgb('#12345')).toThrow();
    expect(() => hexToRgb('red')).toThrow();
    expect(hexToRgb('#ff8000')).toEqual([1, 128 / 255, 0]);
  });

  it('starts on the brand palette: navy sky and Vocably coral', () => {
    expect(RUN_THEMES[0].skyTop).toBe('#0b1020');
    expect([RUN_THEMES[0].grid, RUN_THEMES[0].sunBottom]).toContain('#e0566a');
  });

  it('keeps the lanes, the grid, the arch and the sun readable in every theme', () => {
    for (const t of RUN_THEMES) {
      expect(contrastRatio(t.lane, t.floor), `${t.name} lane/floor`).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(t.grid, t.floor), `${t.name} grid/floor`).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(t.arch, t.horizon), `${t.name} arch/horizon`).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(t.sunTop, t.skyMid), `${t.name} sun/sky`).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(t.sunBottom, t.horizon), `${t.name} sun/haze`).toBeGreaterThanOrEqual(2);
      // the haze is darker than the lane lines, so the far road fades out instead of glaring
      expect(contrastRatio(t.lane, t.horizon), `${t.name} lane/haze`).toBeGreaterThanOrEqual(4);
    }
  });

  it('advances one level every RUN.speedStepEvery correct answers, in step with the speed', () => {
    expect(RUN.speedStepEvery).toBe(10);
    expect(levelFor(0)).toBe(0);
    expect(levelFor(9)).toBe(0);
    expect(levelFor(10)).toBe(1);
    expect(levelFor(59)).toBe(5);
    expect(levelFor(60)).toBe(6);
    expect(levelFor(-3)).toBe(0);
    expect(levelFor(undefined)).toBe(0);
    expect(levelFor(NaN)).toBe(0);
    for (let c = 1; c <= 100; c++) {
      const levelUp = levelFor(c) !== levelFor(c - 1);
      const speedUp = speedFor(c) !== speedFor(c - 1);
      expect(levelUp, `correct=${c}`).toBe(speedUp);
    }
  });

  it('wraps the level through the six themes and never leaves the range', () => {
    expect(themeIndex(0)).toBe(0);
    expect(themeIndex(5)).toBe(5);
    expect(themeIndex(6)).toBe(0);
    expect(themeIndex(13)).toBe(1);
    expect(themeIndex(-1)).toBe(5);
    expect(themeIndex(2.7)).toBe(2);
    expect(themeIndex(NaN)).toBe(0);
    expect(themeIndex(Infinity)).toBe(0);
    expect(themeFor(6)).toBe(RUN_THEMES[0]);
    expect(themeFor(levelFor(70))).toBe(RUN_THEMES[1]);
    for (let l = -20; l <= 40; l++) {
      const i = themeIndex(l);
      expect(Number.isInteger(i) && i >= 0 && i < RUN_THEMES.length).toBe(true);
    }
  });

  it('eases a palette change over about a second, bounded to [0, 1] and monotonic', () => {
    expect(THEME_EASE_MS).toBeGreaterThanOrEqual(800);
    expect(THEME_EASE_MS).toBeLessThanOrEqual(1500);
    expect(themeBlend(-50)).toBe(0);
    expect(themeBlend(0)).toBe(0);
    expect(themeBlend(THEME_EASE_MS / 2)).toBeCloseTo(0.5, 10);
    expect(themeBlend(THEME_EASE_MS)).toBe(1);
    expect(themeBlend(10 * THEME_EASE_MS)).toBe(1);
    expect(themeBlend(Infinity)).toBe(1);
    expect(themeBlend(-Infinity)).toBe(0);
    expect(themeBlend(NaN)).toBe(1); // never stuck halfway
    expect(themeBlend(100, 0)).toBe(1);
    // gentle at both ends: no jump in the first or last frame (60 fps)
    expect(themeBlend(16)).toBeLessThan(0.002);
    expect(1 - themeBlend(THEME_EASE_MS - 16)).toBeLessThan(0.002);
    let prev = -1;
    for (let ms = -100; ms <= THEME_EASE_MS + 100; ms += 7) {
      const v = themeBlend(ms);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('keeps every word-sign tone high-contrast (text on panel)', () => {
    expect(Object.keys(SIGN_TONES).sort()).toEqual(['dim', 'idle', 'locked', 'right', 'wrong']);
    for (const [name, tone] of Object.entries(SIGN_TONES)) {
      for (const k of ['panel', 'text', 'edge']) expect(tone[k], `${name}.${k}`).toMatch(HEX);
      if (tone.rim !== null) expect(tone.rim, `${name}.rim`).toMatch(HEX);
      expect(contrastRatio(tone.text, tone.panel), name).toBeGreaterThanOrEqual(4.5);
    }
    // the idle sign is the one players read at a distance: at least as clear as the old cream sign
    expect(contrastRatio(SIGN_TONES.idle.text, SIGN_TONES.idle.panel)).toBeGreaterThanOrEqual(contrastRatio('#1b2033', '#f6efe9'));
    // the tones that carry a verdict stay distinct from the idle panel
    for (const k of ['locked', 'right', 'wrong']) expect(contrastRatio(SIGN_TONES[k].panel, SIGN_TONES.idle.panel), k).toBeGreaterThanOrEqual(3);
  });

  it('computes WCAG contrast like the reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});
