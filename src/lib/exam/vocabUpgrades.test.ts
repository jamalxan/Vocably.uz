import { describe, it, expect } from 'vitest';
import { normalizeUpgrades, cleanPhrase, MAX_UPGRADES } from './vocabUpgrades';

describe('cleanPhrase', () => {
  it('keeps short English phrases and trims quotes/space', () => {
    expect(cleanPhrase('  "a considerable  number of" ')).toBe('a considerable number of');
    expect(cleanPhrase("people's well-being")).toBe("people's well-being");
  });
  it('rejects markup, long text, non-strings and non-latin text', () => {
    expect(cleanPhrase('<b>x</b>')).toBeNull();
    expect(cleanPhrase('a'.repeat(61))).toBeNull();
    expect(cleanPhrase(5)).toBeNull();
    expect(cleanPhrase("ko‘p")).toBeNull();
    expect(cleanPhrase('')).toBeNull();
  });
});

describe('normalizeUpgrades', () => {
  it('accepts string or array `better` and drops no-op / duplicate items', () => {
    const out = normalizeUpgrades([
      { original: 'a lot of', better: 'a considerable number of', noteUz: 'rasmiyroq' },
      { original: 'big', better: ['substantial', 'significant'] },
      { original: 'good', better: 'good' },
      { original: 'very big', better: 'Substantial' },
      null,
      { original: 'x' },
    ]);
    expect(out).toEqual([
      { original: 'a lot of', better: 'a considerable number of', noteUz: 'rasmiyroq' },
      { original: 'big', better: 'substantial' },
    ]);
  });
  it('caps the list', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ original: `w${'a'.repeat(i)}`, better: `b${'a'.repeat(i)}` }));
    expect(normalizeUpgrades(many)).toHaveLength(MAX_UPGRADES);
  });
  it('returns [] for garbage', () => {
    expect(normalizeUpgrades('nope')).toEqual([]);
    expect(normalizeUpgrades(undefined)).toEqual([]);
  });
});
