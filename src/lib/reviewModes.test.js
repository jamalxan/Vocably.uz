import { describe, it, expect } from 'vitest';
import { cardModeFor, gradeTyped, ratingForTyped, blankOut } from './reviewModes';

const w = (id, syns = ['katta']) => ({ _id: id, word: 'enormous', syns });

describe('cardModeFor', () => {
  it('follows the chosen mode', () => {
    expect(cardModeFor('recognition', w('a'))).toBe('recognition');
    expect(cardModeFor('production', w('a'))).toBe('production');
  });
  it('mixed gives both sides across words and is stable per word', () => {
    const modes = Array.from({ length: 20 }, (_, i) => cardModeFor('mixed', w(`id${i}`)));
    expect(new Set(modes)).toEqual(new Set(['recognition', 'production']));
    expect(cardModeFor('mixed', w('id3'))).toBe(cardModeFor('mixed', w('id3')));
  });
  it('falls back to recognition when the word has no meaning to prompt with', () => {
    expect(cardModeFor('production', w('a', []))).toBe('recognition');
    expect(cardModeFor('production', w('a', ['  ']))).toBe('recognition');
  });
});

describe('gradeTyped', () => {
  it('accepts exact answers ignoring case/space/apostrophes', () => {
    expect(gradeTyped('  Enormous ', 'enormous').verdict).toBe('exact');
    expect(gradeTyped("dont", "don't").verdict).toBe('exact');
  });
  it('treats a one-letter slip on a long word as close', () => {
    expect(gradeTyped('enormus', 'enormous').verdict).toBe('close');
  });
  it('is strict on short words and real mistakes', () => {
    expect(gradeTyped('cat', 'car').verdict).toBe('wrong');
    expect(gradeTyped('huge', 'enormous').verdict).toBe('wrong');
    expect(gradeTyped('', 'enormous').verdict).toBe('wrong');
  });
});

describe('ratingForTyped', () => {
  it('maps verdicts to SRS ratings', () => {
    expect(ratingForTyped('wrong', 1000)).toBe(1);
    expect(ratingForTyped('close', 1000)).toBe(2);
    expect(ratingForTyped('exact', 2000)).toBe(4);
    expect(ratingForTyped('exact', 5000)).toBe(3);
    expect(ratingForTyped('exact', 12000)).toBe(2);
  });
});

describe('blankOut', () => {
  it('hides the word and its inflections', () => {
    expect(blankOut('The costs were enormous and enormously high.', 'enormous')).toBe('The costs were _____ and _____ high.');
  });
  it('returns empty when the word is not in the sentence', () => {
    expect(blankOut('Nothing here.', 'enormous')).toBe('');
  });
});
