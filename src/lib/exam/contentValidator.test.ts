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

  it('accepts numbering that continues across passages (real IELTS: passage 2 starts at 14, not 1)', () => {
    const test = baseTest();
    test.sections!.reading!.passages = [
      { order: 1, title: 'P1', paragraphs: [{ label: 'A', html: '<p>x</p>' }], questionGroups: [tfngGroup([1, 2, 3])] },
      { order: 2, title: 'P2', paragraphs: [{ label: 'A', html: '<p>x</p>' }], questionGroups: [tfngGroup([4, 5, 6])] },
    ];
    const issues = validateTest(test);
    expect(issues.some((i) => i.message.includes('uzilishsiz emas'))).toBe(false);
    expect(hasBlockingErrors(issues)).toBe(false);
  });

  it('flags numbering that wrongly restarts at 1 in a later passage', () => {
    const test = baseTest();
    test.sections!.reading!.passages = [
      { order: 1, title: 'P1', paragraphs: [{ label: 'A', html: '<p>x</p>' }], questionGroups: [tfngGroup([1, 2, 3])] },
      { order: 2, title: 'P2', paragraphs: [{ label: 'A', html: '<p>x</p>' }], questionGroups: [tfngGroup([1, 2, 3])] },
    ];
    const issues = validateTest(test);
    expect(issues.some((i) => i.path === 'reading' && i.message.includes('takrorlangan'))).toBe(true);
  });

  it('warnings alone do not block publishing', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].paragraphs = [];
    const issues = validateTest(test);
    expect(issues.every((i) => i.severity === 'warning')).toBe(true);
    expect(hasBlockingErrors(issues)).toBe(false);
  });

  // VOCABLY-TZ.md (AI Content Ingestion Agent) §13 W01/W02/W03 — sof,
  // AI'siz tekshiriladigan ogohlantirishlar.
  it('warns when a reading passage is outside the 650-1000 word range', () => {
    const shortTest = baseTest(); // default passage is a single short sentence
    expect(validateTest(shortTest).some((i) => i.message.includes("so'z (IELTS normasi 650-1000)"))).toBe(true);

    const longTest = baseTest();
    const longParagraph = { label: 'A', html: `<p>${'word '.repeat(1200)}</p>` };
    longTest.sections!.reading!.passages[0].paragraphs = [longParagraph];
    expect(validateTest(longTest).some((i) => i.message.includes("so'z (IELTS normasi 650-1000)"))).toBe(true);

    const rightSizedTest = baseTest();
    rightSizedTest.sections!.reading!.passages[0].paragraphs = [{ label: 'A', html: `<p>${'word '.repeat(800)}</p>` }];
    expect(validateTest(rightSizedTest).some((i) => i.message.includes('IELTS normasi 650-1000'))).toBe(false);
  });

  it('warns when total listening audio duration is outside 25-35 minutes', () => {
    const test = baseTest({
      sections: {
        listening: {
          durationSec: 1800,
          checkTimeSec: 120,
          parts: [{ order: 1, audioUrl: 'a.mp3', durationSec: 300, questionGroups: [tfngGroup([1])] }],
        },
      },
    });
    expect(validateTest(test).some((i) => i.message.includes('IELTS normasi 25-35 daqiqa'))).toBe(true);
  });

  it('warns when a question type is used more than twice in one test', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [
      { ...tfngGroup([1]), id: 'g1' },
      { ...tfngGroup([2]), id: 'g2' },
      { ...tfngGroup([3]), id: 'g3' },
    ];
    expect(validateTest(test).some((i) => i.message.includes("2 martadan ko'p emas"))).toBe(true);
  });

  it('warns when questions are missing explanationHtml', () => {
    // baseTest()'s default questions have no explanationHtml.
    expect(validateTest(baseTest()).some((i) => i.message.includes('explanationHtml'))).toBe(true);
  });

  it('does not warn about explanations when every question has one', () => {
    const test = baseTest();
    test.sections!.reading!.passages[0].questionGroups = [
      {
        ...tfngGroup([1, 2, 3]),
        questions: [1, 2, 3].map((n) => ({ number: n, promptHtml: `Statement ${n}`, answer: { accepted: ['TRUE'] }, explanationHtml: 'Because...' })),
      },
    ];
    expect(validateTest(test).some((i) => i.message.includes('explanationHtml'))).toBe(false);
  });

  it('warns when a listening part has no audioscript/transcript', () => {
    const test = baseTest({
      sections: {
        listening: {
          durationSec: 1800,
          checkTimeSec: 120,
          parts: [{ order: 1, audioUrl: 'a.mp3', durationSec: 300, questionGroups: [tfngGroup([1])] }],
        },
      },
    });
    expect(validateTest(test).some((i) => i.message.includes('Audioscript'))).toBe(true);
  });

  it('warns when reading difficulty does not increase from the first to the last passage', () => {
    const easySentence = 'The cat sat. It was a big cat. The cat ran fast.';
    const test = baseTest();
    test.sections!.reading!.passages = [
      { order: 1, title: 'P1', paragraphs: [{ label: 'A', html: `<p>${easySentence}</p>` }], questionGroups: [tfngGroup([1])] },
      { order: 2, title: 'P2', paragraphs: [{ label: 'A', html: `<p>${easySentence}</p>` }], questionGroups: [tfngGroup([2])] },
      // Passage 3 is a simple repeat of the easiest possible sentence — its
      // difficulty is certainly not HIGHER than passage 1's, so this should warn.
      { order: 3, title: 'P3', paragraphs: [{ label: 'A', html: `<p>${easySentence}</p>` }], questionGroups: [tfngGroup([3])] },
    ];
    expect(validateTest(test).some((i) => i.message.includes('Flesch-Kincaid'))).toBe(true);
  });
});
