import { describe, it, expect } from 'vitest';
import { mistakeVocabulary, wrongQuestions, isProperNounIn } from './mistakes';

const test = {
  sections: {
    reading: {
      passages: [
        {
          paragraphs: [{ label: 'B', html: '<p>Philanthropists financed extraordinary municipal institutions.</p>' }],
          questionGroups: [
            {
              questions: [
                { number: 1, promptHtml: 'The Library of Alexandria was open to the general public.', answer: { accepted: ['FALSE'] }, locatorParagraph: 'B' },
                { number: 2, promptHtml: 'Carnegie funded buildings through his ____.', answer: { accepted: ['philanthropy'] } },
                { number: 3, promptHtml: 'Choose one.', answer: { accepted: ['iv'] }, locatorParagraph: 'B' },
              ],
            },
          ],
        },
      ],
    },
    listening: {
      parts: [{ questionGroups: [{ questions: [{ number: 11, promptHtml: 'Accommodation: ____ hall', answer: { accepted: ['Wednesday'] } }] }] }],
    },
  },
};

describe('mistakeVocabulary', () => {
  it('prefers the accepted answer, then prompt paraphrases; skips choice answers', () => {
    const words = mistakeVocabulary(test, [
      { number: 1, correct: false },
      { number: 2, correct: false },
      { number: 11, correct: false },
    ]);
    expect(words).toContainEqual({ word: 'philanthropy', skill: 'reading' });
    expect(words).toContainEqual({ word: 'wednesday', skill: 'listening' });
    expect(words).toContainEqual({ word: 'alexandria', skill: 'reading' });
    expect(words.map((w) => w.word)).not.toContain('false');
  });

  it('falls back to the answer paragraph for Reading when the question gives nothing', () => {
    const words = mistakeVocabulary(test, [{ number: 3, correct: false }]).map((w) => w.word);
    expect(words).toEqual(['philanthropists', 'extraordinary']);
  });

  it('ignores correct answers and never repeats a word', () => {
    expect(mistakeVocabulary(test, [{ number: 2, correct: true }])).toEqual([]);
    const words = mistakeVocabulary(test, [{ number: 1, correct: false }, { number: 2, correct: false }, { number: 3, correct: false }]).map((w) => w.word);
    expect(new Set(words).size).toBe(words.length);
  });
});

describe('wrongQuestions', () => {
  it('lists wrong questions with the user answer and accepted answers', () => {
    const out = wrongQuestions(test, [{ number: 11, correct: false, userAnswer: 'wensday', accepted: ['Wednesday'] }]);
    expect(out).toEqual([{ section: 'listening', number: 11, promptText: 'Accommodation: ____ hall', userAnswer: 'wensday', accepted: ['Wednesday'], locatorParagraph: undefined }]);
  });
});

describe('isProperNounIn', () => {
  it('spots names as written in the source text', () => {
    expect(isProperNounIn('martin osei', 'The inventor Martin Osei built it.')).toBe(true);
    expect(isProperNounIn('beginner', 'Even a complete beginner could use it.')).toBe(false);
    expect(isProperNounIn('philanthropy', '')).toBe(false);
  });
});
