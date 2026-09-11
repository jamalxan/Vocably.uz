import { describe, it, expect } from 'vitest';
import { countWords } from './wordCount';

describe('countWords', () => {
  it('counts space-separated words', () => {
    expect(countWords('The quick brown fox')).toBe(4);
  });

  it('counts a hyphenated word as one word', () => {
    expect(countWords('This is a well-known fact')).toBe(5);
  });

  it('counts a standalone number as one word', () => {
    expect(countWords('In 1932 the factory opened')).toBe(5);
  });

  it('collapses multiple spaces/newlines between words', () => {
    expect(countWords('One   two\nthree')).toBe(3);
  });

  it('ignores leading/trailing whitespace', () => {
    expect(countWords('   padded text   ')).toBe(2);
  });

  it('returns 0 for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('does not count a standalone punctuation token as a word', () => {
    expect(countWords('Wait... really?')).toBe(2);
    expect(countWords('one -- two')).toBe(2);
  });
});
