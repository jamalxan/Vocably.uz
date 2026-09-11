import { describe, it, expect } from 'vitest';
import { sanitizeForExam } from './sanitize';
import type { Test } from './types';

// TZ-vocably-v2.md §22 Faza 1, qadam 2 — "Bu funksiya uchun test yozing."
// Eng muhim tekshiruv: hech qanday javob kaliti yoki "orqa fon" matn (transcript,
// sample answer, marking notes) sanitizatsiyadan keyin qolmasligi kerak — TZ §4.1.

function buildTest(): Test {
  return {
    _id: 't1',
    slug: 'cambridge-19-test-1',
    title: 'Cambridge IELTS 19 — Test 1',
    module: 'academic',
    difficulty: 'medium',
    isPublished: true,
    createdBy: 'admin1',
    createdAt: '2026-01-01T00:00:00.000Z',
    sections: {
      reading: {
        durationSec: 3600,
        passages: [
          {
            order: 1,
            title: 'The history of glass',
            paragraphs: [{ label: 'A', html: '<p>Glass has been used...</p>' }],
            questionGroups: [
              {
                id: 'g1',
                type: 'true_false_notgiven',
                instructionHtml: 'Do the following statements agree...',
                questions: [
                  {
                    number: 1,
                    promptHtml: 'Glass was first made in Mesopotamia.',
                    answer: { accepted: ['TRUE'] },
                    explanationHtml: 'Paragraph A states this explicitly.',
                    locatorParagraph: 'A',
                  },
                  {
                    number: 2,
                    promptHtml: 'The Romans invented glassblowing.',
                    answer: { accepted: ['NOT GIVEN'] },
                    explanationHtml: 'No mention of this in the text.',
                  },
                ],
              },
            ],
          },
        ],
      },
      listening: {
        durationSec: 1800,
        checkTimeSec: 120,
        parts: [
          {
            order: 1,
            audioUrl: 'https://cdn.example.com/part1.mp3',
            durationSec: 300,
            transcript: 'Hello, welcome to the library...',
            contextText: 'You will hear a conversation between a student and a librarian.',
            questionGroups: [
              {
                id: 'g2',
                type: 'form_completion',
                instructionHtml: 'Complete the form below.',
                wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
                questions: [{ number: 3, answer: { accepted: ['Smith'] }, explanationHtml: 'Spelled out at 00:42.' }],
              },
            ],
          },
        ],
      },
      writing: {
        durationSec: 3600,
        tasks: [
          {
            order: 1,
            minWords: 150,
            recommendedMin: 20,
            promptHtml: 'The chart below shows...',
            imageUrl: 'https://cdn.example.com/chart1.png',
            imageAlt: 'Bar chart of income brackets',
            sampleAnswer: 'The chart illustrates...',
            markingNotes: 'Expect candidates to compare at least 2 categories.',
          },
          {
            order: 2,
            minWords: 250,
            recommendedMin: 40,
            promptHtml: 'Some people believe...',
            sampleAnswer: 'In recent years...',
            markingNotes: 'Look for a clear position.',
          },
        ],
      },
    },
  };
}

describe('sanitizeForExam', () => {
  it('strips answer/explanationHtml/locatorParagraph from every reading question', () => {
    const sanitized = sanitizeForExam(buildTest());
    for (const q of sanitized.sections.reading!.passages[0].questionGroups[0].questions) {
      expect(q).not.toHaveProperty('answer');
      expect(q).not.toHaveProperty('explanationHtml');
      expect(q).not.toHaveProperty('locatorParagraph');
    }
  });

  it('strips answer/explanationHtml from listening questions and transcript from the part', () => {
    const sanitized = sanitizeForExam(buildTest());
    const part = sanitized.sections.listening!.parts[0];
    expect(part).not.toHaveProperty('transcript');
    for (const q of part.questionGroups[0].questions) {
      expect(q).not.toHaveProperty('answer');
      expect(q).not.toHaveProperty('explanationHtml');
    }
  });

  it('strips sampleAnswer/markingNotes from both writing tasks', () => {
    const sanitized = sanitizeForExam(buildTest());
    for (const task of sanitized.sections.writing!.tasks) {
      expect(task).not.toHaveProperty('sampleAnswer');
      expect(task).not.toHaveProperty('markingNotes');
    }
  });

  it('preserves everything else the client needs to render the exam', () => {
    const sanitized = sanitizeForExam(buildTest());
    expect(sanitized.title).toBe('Cambridge IELTS 19 — Test 1');

    const passage = sanitized.sections.reading!.passages[0];
    expect(passage.title).toBe('The history of glass');
    expect(passage.paragraphs[0]).toEqual({ label: 'A', html: '<p>Glass has been used...</p>' });
    expect(passage.questionGroups[0].questions[0].promptHtml).toBe('Glass was first made in Mesopotamia.');
    expect(passage.questionGroups[0].instructionHtml).toBe('Do the following statements agree...');

    const part = sanitized.sections.listening!.parts[0];
    expect(part.audioUrl).toBe('https://cdn.example.com/part1.mp3');
    expect(part.contextText).toBe('You will hear a conversation between a student and a librarian.');
    expect(part.questionGroups[0].wordLimit).toEqual({ maxWords: 2, label: 'NO MORE THAN TWO WORDS' });

    const task1 = sanitized.sections.writing!.tasks[0];
    expect(task1.promptHtml).toBe('The chart below shows...');
    expect(task1.imageUrl).toBe('https://cdn.example.com/chart1.png');
    expect(task1.imageAlt).toBe('Bar chart of income brackets');
  });

  it('does not mutate the original Test object', () => {
    const original = buildTest();
    sanitizeForExam(original);
    expect(original.sections.reading!.passages[0].questionGroups[0].questions[0]).toHaveProperty('answer');
    expect(original.sections.listening!.parts[0]).toHaveProperty('transcript');
    expect(original.sections.writing!.tasks[0]).toHaveProperty('sampleAnswer');
  });

  it('handles a test with only some sections present', () => {
    const readingOnly: Test = { ...buildTest(), sections: { reading: buildTest().sections.reading } };
    const sanitized = sanitizeForExam(readingOnly);
    expect(sanitized.sections.listening).toBeUndefined();
    expect(sanitized.sections.writing).toBeUndefined();
    expect(sanitized.sections.reading).toBeDefined();
  });
});
