import { describe, it, expect } from 'vitest';
import { validateTest, hasBlockingErrors, checkMockEligibility, isMockEligible } from './contentValidator';
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

// AUDIT LEGAL-01 — "Publish gate: third_party_copyright + public = BLOCK."
describe('validateTest — checkCopyright (LEGAL-01)', () => {
  it('does not block when rights is entirely absent (legacy test, back-compat default own/public)', () => {
    const issues = validateTest(baseTest());
    expect(issues.some((i) => i.path === 'rights')).toBe(false);
  });

  it('does not block "own" content published publicly', () => {
    const issues = validateTest(baseTest({ rights: { sourceType: 'own', publishScope: 'public' } }));
    expect(hasBlockingErrors(issues.filter((i) => i.path === 'rights'))).toBe(false);
  });

  it('blocks third_party_copyright content with publishScope public', () => {
    const issues = validateTest(baseTest({ rights: { sourceType: 'third_party_copyright', publishScope: 'public' } }));
    const rightsIssues = issues.filter((i) => i.path === 'rights');
    expect(rightsIssues).toHaveLength(1);
    expect(rightsIssues[0].severity).toBe('error');
  });

  it('blocks third_party_copyright even when publishScope is omitted (defaults to public)', () => {
    const issues = validateTest(baseTest({ rights: { sourceType: 'third_party_copyright' } as never }));
    expect(hasBlockingErrors(issues.filter((i) => i.path === 'rights'))).toBe(true);
  });

  it('does not block third_party_copyright content scoped to organization or private', () => {
    const org = validateTest(baseTest({ rights: { sourceType: 'third_party_copyright', publishScope: 'organization' } }));
    const priv = validateTest(baseTest({ rights: { sourceType: 'third_party_copyright', publishScope: 'private' } }));
    expect(hasBlockingErrors(org.filter((i) => i.path === 'rights'))).toBe(false);
    expect(hasBlockingErrors(priv.filter((i) => i.path === 'rights'))).toBe(false);
  });

  it('requires a licence value when sourceType is "licensed"', () => {
    const issues = validateTest(baseTest({ rights: { sourceType: 'licensed', publishScope: 'public', licence: '' } }));
    expect(hasBlockingErrors(issues.filter((i) => i.path === 'rights'))).toBe(true);
  });

  it('allows "licensed" content once a licence value is provided', () => {
    const issues = validateTest(
      baseTest({ rights: { sourceType: 'licensed', publishScope: 'public', licence: 'Cambridge institutional license #123' } })
    );
    expect(hasBlockingErrors(issues.filter((i) => i.path === 'rights'))).toBe(false);
  });

  it('does not block public_domain or ai_generated_original content', () => {
    const pd = validateTest(baseTest({ rights: { sourceType: 'public_domain', publishScope: 'public' } }));
    const ai = validateTest(baseTest({ rights: { sourceType: 'ai_generated_original', publishScope: 'public' } }));
    expect(hasBlockingErrors(pd.filter((i) => i.path === 'rights'))).toBe(false);
    expect(hasBlockingErrors(ai.filter((i) => i.path === 'rights'))).toBe(false);
  });
});

// AUDIT EX-06/N-06 — "Mock imtihon uchun mos ekanligini alohida, BLOKLOVCHI
// tekshiruv" (checkMockEligibility/isMockEligible), validateTest'dan ALOHIDA.
function passageWithWords(order: 1 | 2 | 3, wordCount: number, questionNumbers: number[]) {
  return {
    order,
    title: `Passage ${order}`,
    paragraphs: [{ label: 'A', html: `<p>${'word '.repeat(wordCount)}</p>` }],
    questionGroups: [tfngGroup(questionNumbers)],
  };
}

function listeningPart(order: 1 | 2 | 3 | 4, questionNumbers: number[], audioUrl = `part-${order}.mp3`) {
  return {
    order,
    audioUrl,
    durationSec: 480,
    questionGroups: [tfngGroup(questionNumbers)],
  };
}

function mockEligibleTest(): Partial<Test> {
  return {
    title: 'Cambridge IELTS 19 — Test 1',
    slug: 'cambridge-19-test-1',
    module: 'academic',
    sections: {
      reading: {
        durationSec: 3600,
        passages: [
          passageWithWords(1, 800, range(1, 13)),
          passageWithWords(2, 800, range(14, 26)),
          passageWithWords(3, 800, range(27, 40)),
        ],
      },
      listening: {
        durationSec: 1800,
        checkTimeSec: 120,
        parts: [
          listeningPart(1, range(1, 10)),
          listeningPart(2, range(11, 20)),
          listeningPart(3, range(21, 30)),
          listeningPart(4, range(31, 40)),
        ],
      },
      writing: {
        durationSec: 3600,
        tasks: [
          { order: 1, minWords: 150, recommendedMin: 20, promptHtml: 'Task 1' },
          { order: 2, minWords: 250, recommendedMin: 40, promptHtml: 'Task 2' },
        ] as never,
      },
    },
  };
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

describe('checkMockEligibility / isMockEligible (EX-06/N-06)', () => {
  it('accepts a fully IELTS-shaped mock-eligible test with no issues', () => {
    const issues = checkMockEligibility(mockEligibleTest());
    expect(issues).toEqual([]);
    expect(isMockEligible(mockEligibleTest())).toBe(true);
  });

  it('requires a reading section at all', () => {
    const test = mockEligibleTest();
    delete test.sections!.reading;
    const issues = checkMockEligibility(test);
    expect(issues.some((i) => i.path === 'reading' && i.message.includes("bo'limi yo'q"))).toBe(true);
    expect(isMockEligible(test)).toBe(false);
  });

  it('requires exactly 3 reading passages', () => {
    const test = mockEligibleTest();
    test.sections!.reading!.passages = test.sections!.reading!.passages.slice(0, 2);
    const issues = checkMockEligibility(test);
    expect(issues.some((i) => i.path === 'reading' && i.message.includes('3 ta passage'))).toBe(true);
  });

  it('requires exactly 40 reading questions in total', () => {
    const test = mockEligibleTest();
    test.sections!.reading!.passages[0].questionGroups = [tfngGroup(range(1, 12))]; // 12 instead of 13 -> 39 total
    const issues = checkMockEligibility(test);
    expect(issues.some((i) => i.path === 'reading' && i.message.includes('40 ta savol'))).toBe(true);
  });

  it('requires reading word count within the inclusive [2150, 2750] range', () => {
    const tooShort = mockEligibleTest();
    tooShort.sections!.reading!.passages[0].paragraphs = [{ label: 'A', html: `<p>${'word '.repeat(100)}</p>` }];
    expect(checkMockEligibility(tooShort).some((i) => i.path === 'reading' && i.message.includes('2150-2750'))).toBe(true);

    const tooLong = mockEligibleTest();
    tooLong.sections!.reading!.passages[0].paragraphs = [{ label: 'A', html: `<p>${'word '.repeat(2000)}</p>` }];
    expect(checkMockEligibility(tooLong).some((i) => i.path === 'reading' && i.message.includes('2150-2750'))).toBe(true);

    // Exact boundary values (inclusive) must NOT be flagged.
    const atLowerBound = mockEligibleTest();
    atLowerBound.sections!.reading!.passages[0].paragraphs = [{ label: 'A', html: `<p>${'word '.repeat(550)}</p>` }]; // 550+800+800 = 2150
    expect(checkMockEligibility(atLowerBound).some((i) => i.path === 'reading' && i.message.includes('2150-2750'))).toBe(false);
  });

  it('requires a listening section at all', () => {
    const test = mockEligibleTest();
    delete test.sections!.listening;
    expect(checkMockEligibility(test).some((i) => i.path === 'listening' && i.message.includes("bo'limi yo'q"))).toBe(true);
  });

  it('requires exactly 4 listening parts', () => {
    const test = mockEligibleTest();
    test.sections!.listening!.parts = test.sections!.listening!.parts.slice(0, 3);
    expect(checkMockEligibility(test).some((i) => i.path === 'listening' && i.message.includes('4 ta part'))).toBe(true);
  });

  it('requires exactly 10 questions in every listening part', () => {
    const test = mockEligibleTest();
    test.sections!.listening!.parts[0].questionGroups = [tfngGroup(range(1, 9))];
    expect(checkMockEligibility(test).some((i) => i.path === 'listening.part[1]' && i.message.includes('10 ta savol'))).toBe(true);
  });

  it('requires every listening part to have a non-empty audioUrl', () => {
    const test = mockEligibleTest();
    test.sections!.listening!.parts[2].audioUrl = '';
    expect(checkMockEligibility(test).some((i) => i.path === 'listening.part[3]' && i.message.includes('audioUrl'))).toBe(true);
  });

  it('requires a writing section at all', () => {
    const test = mockEligibleTest();
    delete test.sections!.writing;
    expect(checkMockEligibility(test).some((i) => i.path === 'writing' && i.message.includes("bo'limi yo'q"))).toBe(true);
  });

  it('requires exactly 2 writing tasks', () => {
    const test = mockEligibleTest();
    test.sections!.writing!.tasks = [{ order: 1, minWords: 150, recommendedMin: 20, promptHtml: 'Task 1' }] as never;
    expect(checkMockEligibility(test).some((i) => i.path === 'writing' && i.message.includes('2 ta task'))).toBe(true);
  });

  it('every issue reported has severity "error" (all mock-eligibility issues are blocking)', () => {
    const test = mockEligibleTest();
    delete test.sections!.reading;
    delete test.sections!.listening;
    delete test.sections!.writing;
    const issues = checkMockEligibility(test);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((i) => i.severity === 'error')).toBe(true);
  });
});
