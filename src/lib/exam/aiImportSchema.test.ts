import { describe, it, expect } from 'vitest';
import { normalizeAiPassages } from './aiImportSchema';

describe('normalizeAiPassages', () => {
  it('converts the AI flat shape into real Passage[] with escaped HTML', () => {
    const { passages, needsReview } = normalizeAiPassages({
      passages: [
        {
          order: 1,
          title: 'The <history> of glass',
          paragraphs: [{ label: 'A', text: 'Glass & sand.' }],
          questionGroups: [
            {
              type: 'true_false_notgiven',
              instruction: 'Do the statements agree?',
              questions: [{ number: 1, prompt: 'Glass is old.', accepted: ['TRUE'], locatorParagraph: 'A' }],
            },
          ],
        },
      ],
    });

    expect(passages).toHaveLength(1);
    expect(passages[0].order).toBe(1);
    expect(passages[0].title).toBe('The <history> of glass');
    expect(passages[0].paragraphs[0]).toEqual({ label: 'A', html: '<p>Glass &amp; sand.</p>' });
    const q = passages[0].questionGroups[0].questions[0];
    expect(q.promptHtml).toBe('Glass is old.');
    expect(q.answer.accepted).toEqual(['TRUE']);
    expect(q.locatorParagraph).toBe('A');
    expect(needsReview).toEqual([]);
  });

  it('returns an empty array for a missing/malformed passages field', () => {
    expect(normalizeAiPassages({})).toEqual({ passages: [], needsReview: [] });
    expect(normalizeAiPassages({ passages: undefined })).toEqual({ passages: [], needsReview: [] });
  });

  it('drops falsy accepted-answer entries', () => {
    const { passages } = normalizeAiPassages({
      passages: [
        {
          order: 1,
          title: 'T',
          paragraphs: [],
          questionGroups: [
            { type: 'short_answer', instruction: 'x', questions: [{ number: 1, prompt: 'p', accepted: ['a', '', null as never] }] },
          ],
        },
      ],
    });
    expect(passages[0].questionGroups[0].questions[0].answer.accepted).toEqual(['a']);
  });

  it('carries through group-level bank for matching_headings (audit P0-01)', () => {
    const { passages, needsReview } = normalizeAiPassages({
      passages: [
        {
          order: 1,
          title: 'T',
          paragraphs: [],
          questionGroups: [
            {
              type: 'matching_headings',
              instruction: 'Choose the correct heading.',
              bank: [{ key: 'i', text: 'A brief history' }, { key: 'ii', text: 'Modern applications' }],
              questions: [{ number: 1, prompt: 'Paragraph A', accepted: ['i'] }],
            },
          ],
        },
      ],
    });
    expect(passages[0].questionGroups[0].type).toBe('matching_headings');
    expect(passages[0].questionGroups[0].bank).toEqual([
      { key: 'I', text: 'A brief history' },
      { key: 'II', text: 'Modern applications' },
    ]);
    expect(needsReview).toEqual([]);
  });

  it('carries through group-level stemHtml + wordLimit for stem-based types like table_completion', () => {
    const { passages, needsReview } = normalizeAiPassages({
      passages: [
        {
          order: 1,
          title: 'T',
          paragraphs: [],
          questionGroups: [
            {
              type: 'table_completion',
              instruction: 'Complete the table.',
              stemHtml: '<table><tr><td>Year</td><td>{{q14}}</td></tr></table>',
              wordLimit: { maxWords: 2, label: 'NO MORE THAN TWO WORDS' },
              questions: [{ number: 14, accepted: ['1932'] }],
            },
          ],
        },
      ],
    });
    expect(passages[0].questionGroups[0].stemHtml).toBe('<table><tr><td>Year</td><td>{{q14}}</td></tr></table>');
    expect(passages[0].questionGroups[0].wordLimit).toEqual({ maxWords: 2, maxNumbers: undefined, label: 'NO MORE THAN TWO WORDS' });
    expect(needsReview).toEqual([]);
  });

  it('flags a group as needsReview when the AI explicitly says so, without forcing a type substitution', () => {
    const { passages, needsReview } = normalizeAiPassages({
      passages: [
        {
          order: 2,
          title: 'T',
          paragraphs: [],
          questionGroups: [
            {
              type: 'diagram_label' as never, // not in the allowed enum (image-dependent)
              instruction: 'Label the diagram.',
              needsReview: true,
              reviewReason: 'Rasm matn ichida yo‘q.',
              questions: [{ number: 5, accepted: ['pump'] }],
            },
          ],
        },
      ],
    });
    // Unknown/disallowed type -> safely falls back to short_answer, but is flagged, never silently substituted.
    expect(passages[0].questionGroups[0].type).toBe('short_answer');
    expect(needsReview).toHaveLength(1);
    expect(needsReview[0]).toMatchObject({ passageOrder: 2, type: 'diagram_label' });
  });

  it('flags needsReview when a bank-based type is missing its bank (structural check, not just AI self-report)', () => {
    const { needsReview } = normalizeAiPassages({
      passages: [
        {
          order: 1,
          title: 'T',
          paragraphs: [],
          questionGroups: [
            { type: 'matching_features', instruction: 'x', questions: [{ number: 1, prompt: 'p', accepted: ['A'] }] },
          ],
        },
      ],
    });
    expect(needsReview).toHaveLength(1);
    expect(needsReview[0].reason).toMatch(/bank/);
  });

  it('does not require a bank for matching_information (auto-filled from paragraph labels downstream)', () => {
    const { needsReview } = normalizeAiPassages({
      passages: [
        {
          order: 1,
          title: 'T',
          paragraphs: [],
          questionGroups: [
            { type: 'matching_information', instruction: 'x', questions: [{ number: 1, prompt: 'p', accepted: ['A'] }] },
          ],
        },
      ],
    });
    expect(needsReview).toEqual([]);
  });
});
