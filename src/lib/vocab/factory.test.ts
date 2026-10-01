import { describe, expect, it } from 'vitest';
import { buildFactoryPrompt, chunkText, selectCandidates, validateFactoryOutput } from './factory';

describe('chunkText', () => {
  it('bo‘sh matn — bo‘sh ro‘yxat', () => expect(chunkText('  \n ')).toEqual([]));

  it('abzatslarni chegarada bo‘ladi va hech narsani yo‘qotmaydi', () => {
    const para = (n: number) => `Paragraph ${n}. ` + 'word '.repeat(100).trim() + '.';
    const text = [1, 2, 3, 4, 5, 6].map(para).join('\n\n');
    const chunks = chunkText(text, 1000, 100);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 1100)).toBe(true);
    for (let n = 1; n <= 6; n++) expect(chunks.join(' ')).toContain(`Paragraph ${n}.`);
  });

  it('juda uzun abzatsni gaplar bo‘yicha kesadi', () => {
    const long = Array.from({ length: 80 }, (_, i) => `Sentence number ${i} is here.`).join(' ');
    const chunks = chunkText(long, 500, 50);
    expect(chunks.length).toBeGreaterThan(3);
    expect(chunks.every((c) => c.length <= 600)).toBe(true);
  });

  it('juda qisqa oxirgi bo‘lak oldingisiga qo‘shiladi', () => {
    const text = 'a'.repeat(900) + '\n\n' + 'b'.repeat(900) + '\n\ntiny tail.';
    const chunks = chunkText(text, 1000, 300);
    expect(chunks[chunks.length - 1]).toContain('tiny tail.');
    expect(chunks.some((c) => c === 'tiny tail.')).toBe(false);
  });
});

describe('selectCandidates', () => {
  const chunk = 'The government must mitigate unprecedented risks. Mitigate costs, said Smith. London is big. Resilient communities adapt; resilient systems recover.';
  it('stop-so‘z, maxsus ism va ma‘lum so‘zlarni chiqaradi, chastota bo‘yicha tartiblaydi', () => {
    const c = selectCandidates(chunk, new Set());
    expect(c).toEqual(expect.arrayContaining(['mitigate', 'resilient', 'unprecedented', 'government']));
    expect(c).not.toContain('london');
    expect(c).not.toContain('smith');
    expect(c.indexOf('resilient')).toBeLessThan(c.indexOf('government')); // 2x vs 1x
  });
  it('ma‘lum so‘z (hosila shakl bilan ham) chiqarilmaydi', () => {
    const c = selectCandidates(chunk, new Set(['mitigate', 'resilient']));
    expect(c).not.toContain('mitigate');
    expect(c).not.toContain('resilient');
  });
});

describe('validateFactoryOutput', () => {
  const chunk = 'Governments must mitigate unprecedented risks to resilient communities.';
  const cands = ['mitigate', 'unprecedented', 'resilient'];
  const good = (over: Record<string, unknown> = {}) => ({
    word: 'mitigate',
    pos: 'verb',
    cefr: 'C1',
    translationUz: 'yumshatmoq',
    shortDefinition: 'to make something less harmful',
    example: 'Trees mitigate the effects of heat.',
    ...over,
  });

  it('yaroqli yozuvni qabul qiladi va manbani yozadi', () => {
    const r = validateFactoryOutput({ words: [good()] }, chunk, cands, { sourceName: 'book.pdf' });
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].source).toBe('factory: book.pdf');
    expect(r.rejected).toEqual([]);
  });

  it('gallyutsinatsiyalarni rad etadi', () => {
    const r = validateFactoryOutput(
      {
        words: [
          good({ word: 'banana' }), // nomzod emas
          good({ word: 'unprecedented', example: 'Nothing like it.' }), // misolda so'z yo'q
          good({ cefr: 'Z9' }),
          good({ word: 'resilient', translationUz: '' }),
          good(), // yaroqli
          good(), // takror
        ],
      },
      chunk,
      cands
    );
    expect(r.entries.map((e) => e.word)).toEqual(['mitigate']);
    expect(r.rejected.map((x) => x.reason)).toEqual(expect.arrayContaining(["nomzodlar ro'yxatida yo'q", "misolda so'zning o'zi yo'q", "CEFR noto'g'ri", 'takror']));
    expect(r.rejected).toHaveLength(5);
  });

  it('matnda bo‘lmagan nomzodni rad etadi, noto‘g‘ri shaklni (null/string) bardosh bilan o‘tadi', () => {
    expect(validateFactoryOutput({ words: [good()] }, 'Totally unrelated text.', cands).rejected[0].reason).toBe('matnda uchramaydi');
    expect(validateFactoryOutput(null, chunk, cands).entries).toEqual([]);
    expect(validateFactoryOutput({ words: 'x' }, chunk, cands).entries).toEqual([]);
  });

  it('limit: maxWords dan ortig‘i rad etiladi', () => {
    const r = validateFactoryOutput({ words: [good(), good({ word: 'resilient', example: 'A resilient plant.' })] }, chunk, cands, { maxWords: 1 });
    expect(r.entries).toHaveLength(1);
    expect(r.rejected[0].reason).toBe('limitdan ortiq');
  });
});

describe('buildFactoryPrompt', () => {
  it('nomzodlar va matnni o‘z ichiga oladi', () => {
    const p = buildFactoryPrompt('Some text.', ['alpha', 'beta']);
    expect(p).toContain('alpha, beta');
    expect(p).toContain('Some text.');
  });
});
