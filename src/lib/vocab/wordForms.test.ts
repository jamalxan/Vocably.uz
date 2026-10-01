import { describe, expect, it } from 'vitest';
import { buildFormIndex, inflectionForms, lemmaCandidates, tokenize } from './wordForms';

describe('inflectionForms', () => {
  it('oddiy va maxsus qoidalar', () => {
    const f = inflectionForms('abandon');
    expect(f).toEqual(expect.arrayContaining(['abandon', 'abandons', 'abandoned', 'abandoning']));
    expect(inflectionForms('study')).toEqual(expect.arrayContaining(['studies', 'studied']));
    expect(inflectionForms('make')).toEqual(expect.arrayContaining(['making', 'maked']));
    expect(inflectionForms('stop')).toEqual(expect.arrayContaining(['stopped', 'stopping']));
    expect(inflectionForms('dramatic')).toContain('dramatically');
  });
  it('birikmalar faqat o‘zi', () => {
    expect(inflectionForms('carry out')).toEqual(['carry out']);
  });
});

describe('lemmaCandidates', () => {
  it('matndagi shakldan asos topiladi', () => {
    expect(lemmaCandidates('abandoned')).toContain('abandon');
    expect(lemmaCandidates('studies')).toContain('study');
    expect(lemmaCandidates('making')).toContain('make');
    expect(lemmaCandidates('stopped')).toContain('stop');
    expect(lemmaCandidates('significantly')).toContain('significant');
    expect(lemmaCandidates('Dramatically')).toContain('dramatic');
  });
  it('shaklning o‘zi birinchi, apostrof normallashadi', () => {
    expect(lemmaCandidates('Word')[0]).toBe('word');
    expect(lemmaCandidates('')).toEqual([]);
  });
});

describe('buildFormIndex', () => {
  const words = [{ word: 'abandon', id: 1 }, { word: 'abandoned', id: 2 }, { word: 'carry out', id: 3 }];
  it('aniq moslik hosila shakldan ustun', () => {
    const idx = buildFormIndex(words);
    expect(idx.get('abandoned')!.id).toBe(2); // o'z so'zi bor
    expect(idx.get('abandoning')!.id).toBe(1);
    expect(idx.get('carry out')).toBeUndefined();
  });
});

describe('tokenize', () => {
  it('so‘zlar va joylashuvi', () => {
    const t = tokenize("It's well-known, 2 dogs.");
    expect(t.map((x) => x.token)).toEqual(["It's", 'well-known', 'dogs']);
    expect("It's well-known, 2 dogs.".slice(t[2].start, t[2].end)).toBe('dogs');
  });
});
