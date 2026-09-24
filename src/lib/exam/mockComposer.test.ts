import { describe, it, expect } from 'vitest';
import { composeMock, composedTitle, MOCK_SECTION_KEYS } from './mockComposer';

function source(id: string, key: string) {
  return { testId: id, title: `Test ${id}`, module: 'academic', content: { marker: `${id}-${key}` } };
}

function pools(ids: Record<string, string[]>) {
  return {
    listening: (ids.listening || []).map((id) => source(id, 'listening')),
    reading: (ids.reading || []).map((id) => source(id, 'reading')),
    writing: (ids.writing || []).map((id) => source(id, 'writing')),
  };
}

describe('composeMock', () => {
  it("har bo'lim uchun manba tanlaydi", () => {
    const composed = composeMock(pools({ listening: ['a'], reading: ['b'], writing: ['c'] }));
    expect(composed).not.toBeNull();
    expect(Object.keys(composed!.sections).sort()).toEqual([...MOCK_SECTION_KEYS].sort());
    expect(composed!.composedFrom.map((c) => c.testId)).toEqual(['a', 'b', 'c']);
    expect(composed!.mixed).toBe(true);
  });

  it("bo'limlardan biri uchun manba bo'lmasa null qaytaradi", () => {
    expect(composeMock(pools({ listening: ['a'], reading: [], writing: ['c'] }))).toBeNull();
  });

  it('imkon bo\'lsa har bo\'limni BOSHQA testdan oladi', () => {
    // Har uchala bo'limda ham 'a' va 'b' bor — birinchi tanlov 'a' bo'lsa
    // ham, keyingilari 'b'ga o'tishi kerak.
    const composed = composeMock(pools({ listening: ['a', 'b'], reading: ['a', 'b'], writing: ['a', 'b'] }), { rng: () => 0 });
    const used = new Set(composed!.composedFrom.map((c) => c.testId));
    expect(used.size).toBeGreaterThan(1);
  });

  it('yaqinda ishlangan testlardan qochadi', () => {
    const composed = composeMock(pools({ listening: ['a', 'b'], reading: ['a', 'b'], writing: ['a', 'b'] }), {
      rng: () => 0,
      avoidTestIds: ['a'],
    });
    expect(composed!.composedFrom.every((c) => c.testId === 'b')).toBe(true);
  });

  it("boshqa manba umuman bo'lmasa, yaqinda ishlanganini ham ishlatadi (mock ochilmay qolmasin)", () => {
    const composed = composeMock(pools({ listening: ['a'], reading: ['a'], writing: ['a'] }), { avoidTestIds: ['a'] });
    expect(composed).not.toBeNull();
    expect(composed!.mixed).toBe(false);
  });

  it('tasodifiylik bilan turli kombinatsiyalar chiqadi', () => {
    const p = pools({ listening: ['a', 'b', 'c'], reading: ['a', 'b', 'c'], writing: ['a', 'b', 'c'] });
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const composed = composeMock(p);
      seen.add(composed!.composedFrom.map((c) => c.testId).join('-'));
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('composedTitle', () => {
  it("aralash bo'lsa manbalar sonini yozadi", () => {
    const composed = composeMock(pools({ listening: ['a'], reading: ['b'], writing: ['c'] }))!;
    expect(composedTitle(composed)).toContain('Aralash mock');
  });

  it("bitta manbadan bo'lsa o'sha testning nomini qaytaradi", () => {
    const composed = composeMock(pools({ listening: ['a'], reading: ['a'], writing: ['a'] }))!;
    expect(composedTitle(composed)).toBe('Test a');
  });
});
