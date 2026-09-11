import { describe, it, expect } from 'vitest';
import { validateTest, hasBlockingErrors } from './contentValidator';
import type { Test, QuestionGroup } from './types';

function tfngGroup(numbers: number[]): QuestionGroup {
  return {
    id: 'g1',
    type: 'true_false_notgiven',
    instructionHtml: 'Do the statements agree?',
    questions: numbers.map((n) => ({ number: n, promptHtml: `Statement ${n}`, answer: { accepted: ['TRUE'] } })),
  };
}

function baseTest(overrides: Partial<Test> = {}): Partial<Test> {
  return {
    title: 'Cambridge IELTS 19 — Test 1',
    slug: 'cambridge-19-test-1',
    module: 'academic',
    sections: {
      reading: {
        durationSec: 3600,
        passages: [
          {
            order: 1,
            title: 'The history of glass',
            paragraphs: [{ label: 'A', html: '<p>Glass has been used...</p>' }],
            questionGroups: [tfngGroup([1, 2, 3])],
          },
        ],
      },
    },
    ...overrides,
  };
}

describe('validateTest', () => {
  it('accepts a well-formed test with no issues', () => {
    const issues = validateTest(baseTest());
    expect(hasBlockingErrors(issues)).toBe(false);
  });

  it('requires a title and slug', () => {
    const issues = validateTest(baseTest({ title: '', slug: '' }));
    expect(issues.some((i) => i.path === 'title')).toBe(true);
    expect(issues.some((i) => i.path === 'slug')).toBe(true);
  });

  it('rejects a slug with invalid characters', () => {
    const issues = validateTest(baseTest({ slug: 'Not A Slug!' }));
    expect(issues.some((i) => i.path === 'slug')).toBe(true);
  });

  it('requires at least one section', () => {
    const issues = validateTest(baseTest({ sections: {} }));
    expect(issues.some((i) => i.path === 'sections')).toBe(true);
  });

  it('flags non-contiguous question numbering', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [tfngGroup([1, 2, 4])];
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('uzilishsiz emas'))).toBe(true);
  });

  it('flags duplicate question numbers', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [tfngGroup([1, 2, 2])];
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('takrorlangan'))).toBe(true);
  });

  it('flags a question with no accepted answers', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [
      {
        id: 'g1',
        type: 'true_false_notgiven',
        instructionHtml: 'x',
        questions: [{ number: 1, promptHtml: 'x', answer: { accepted: [] } }],
      },
    ];
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('accepted'))).toBe(true);
  });

  it('flags matching_headings groups with an empty bank', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [
      {
        id: 'g1',
        type: 'matching_headings',
        instructionHtml: 'x',
        questions: [{ number: 1, promptHtml: 'x', answer: { accepted: ['i'] } }],
      },
    ];
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('bank'))).toBe(true);
  });

  it('flags an image with no imageAlt', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [
      { ...tfngGroup([1]), imageUrl: 'https://example.com/x.png', imageAlt: '' },
    ];
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('imageAlt'))).toBe(true);
  });

  it('flags a listening part with no audioUrl', () => {
    const test = baseTest({
      sections: {
        listening: {
          durationSec: 1800,
          checkTimeSec: 120,
          parts: [{ order: 1, audioUrl: '', durationSec: 300, questionGroups: [tfngGroup([1])] }],
        },
      },
    });
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('audioUrl'))).toBe(true);
  });

  it('requires exactly 2 writing tasks', () => {
    const test = baseTest({
      sections: {
        writing: { durationSec: 3600, tasks: [{ order: 1, minWords: 150, recommendedMin: 20, promptHtml: 'Task 1' }] as never },
      },
    });
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('2 ta task'))).toBe(true);
  });

  it('warnings alone do not block publishing', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].paragraphs = [];
    const issues = validateTest(test);
    expect(issues.every((i) => i.severity === 'warning')).toBe(true);
    expect(hasBlockingErrors(issues)).toBe(false);
  });
});
