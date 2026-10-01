import { describe, expect, it } from 'vitest';
import { searchWords, normalizeQuery } from './search';
import { SAMPLE_WORDS } from './fixtures';
import type { SelectableWord } from './selection';

const words: SelectableWord[] = SAMPLE_WORDS.map((w, i) => ({ ...w, mastery: i * 10, weakness: i % 2 ? 60 : 10 }));

describe('searchWords', () => {
  it("aniq so'z moslik birinchi", () => {
    const hits = searchWords(words, 'Maintain');
    expect(hits[0].word.word).toBe('maintain');
    expect(hits[0].matchedIn).toBe('word');
  });

  it("o'zbekcha tarjima bo'yicha topadi (apostrof variantlari bir xil)", () => {
    const hits = searchWords(words, "qo’llab-quvvatlamoq");
    expect(hits.map((h) => h.word.word)).toContain('maintain');
    expect(hits.find((h) => h.word.word === 'maintain')?.matchedIn).toBe('translation');
  });

  it("sinonim va ta'rif bo'yicha; past ustuvorlik", () => {
    const hits = searchWords(words, 'preserve');
    expect(hits[0].word.word).toBe('maintain');
    expect(hits[0].matchedIn).toBe('synonym');
  });

  it("bo'sh so'rov + filtr: faqat zaif so'zlar", () => {
    const hits = searchWords(words, '', { weakOnly: true });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => (h.word.weakness || 0) >= 40)).toBe(true);
  });

  it('limit va topilmasa bo\'sh', () => {
    expect(searchWords(words, '', {}, 3)).toHaveLength(3);
    expect(searchWords(words, 'zzzzqq')).toEqual([]);
  });

  it('normalizeQuery', () => {
    expect(normalizeQuery("  Oʻz  ")).toBe("o'z");
  });
});
