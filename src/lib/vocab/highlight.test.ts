import { describe, expect, it } from 'vitest';
import { splitByWords } from './highlight';

describe('splitByWords', () => {
  it('so‘zni va uning shakllarini belgilaydi, matn butun qoladi', () => {
    const parts = splitByWords('She walked and walks; resilient people adapt.', ['walk', 'resilient']);
    expect(parts.map((p) => p.text).join('')).toBe('She walked and walks; resilient people adapt.');
    expect(parts.filter((p) => p.hit).map((p) => p.text)).toEqual(['walked', 'walks', 'resilient']);
  });

  it('katta-kichik harfga e‘tibor bermaydi, so‘z ichidagi qismni belgilamaydi', () => {
    const parts = splitByWords('Cat category CAT', ['cat']);
    expect(parts.filter((p) => p.hit).map((p) => p.text)).toEqual(['Cat', 'CAT']);
  });

  it('maxsus regex belgilari xavfsiz (inyeksiya/yiqilish yo‘q)', () => {
    expect(() => splitByWords('a (b) c.d', ['(b)', 'c.d', '[x', '*'])).not.toThrow();
  });

  it('bo‘sh kirishlar', () => {
    expect(splitByWords('', ['a'])).toEqual([]);
    expect(splitByWords('hello', [])).toEqual([{ text: 'hello', hit: false }]);
    expect(splitByWords(null as any, ['a'])).toEqual([]);
  });
});
