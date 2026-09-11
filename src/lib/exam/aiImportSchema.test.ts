import { describe, it, expect } from 'vitest';
import { normalizeAiPassages } from './aiImportSchema';

describe('normalizeAiPassages', () => {
  it('converts the AI flat shape into real Passage[] with escaped HTML', () => {
    const passages = normalizeAiPassages({
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
  });

  it('returns an empty array for a missing/malformed passages field', () => {
    expect(normalizeAiPassages({})).toEqual([]);
    expect(normalizeAiPassages({ passages: undefined })).toEqual([]);
  });

  it('drops falsy accepted-answer entries', () => {
    const passages = normalizeAiPassages({
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
});
