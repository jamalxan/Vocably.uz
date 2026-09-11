import { describe, it, expect } from 'vitest';
import { parseReadingDsl } from './dsl';

// TZ-vocably-v2.md §15.1'dagi namuna, so'zma-so'z.
const TZ_SAMPLE = `## PASSAGE 1
### The history of glass

[A] Glass has been used by humans...

[B] From the Middle Ages...

## QUESTIONS 1-6
type: true_false_notgiven
instruction: Do the following statements agree with the information given in Reading Passage 1?

1. Glass was first made in Mesopotamia. | TRUE | para:A
2. The Romans invented glassblowing. | NOT GIVEN`;

describe('parseReadingDsl', () => {
  it('parses the exact TZ §15.1 sample with no errors', () => {
    const { passages, errors } = parseReadingDsl(TZ_SAMPLE);
    expect(errors).toEqual([]);
    expect(passages).toHaveLength(1);
    expect(passages[0].order).toBe(1);
    expect(passages[0].title).toBe('The history of glass');
    expect(passages[0].paragraphs).toEqual([
      { label: 'A', html: '<p>Glass has been used by humans...</p>' },
      { label: 'B', html: '<p>From the Middle Ages...</p>' },
    ]);
    expect(passages[0].questionGroups).toHaveLength(1);
    const group = passages[0].questionGroups[0];
    expect(group.type).toBe('true_false_notgiven');
    expect(group.questions).toHaveLength(2);
    expect(group.questions[0]).toEqual({
      number: 1,
      promptHtml: 'Glass was first made in Mesopotamia.',
      answer: { accepted: ['TRUE'] },
      locatorParagraph: 'A',
    });
    expect(group.questions[1]).toEqual({
      number: 2,
      promptHtml: 'The Romans invented glassblowing.',
      answer: { accepted: ['NOT GIVEN'] },
      locatorParagraph: undefined,
    });
  });

  it('joins multi-line paragraph text with spaces', () => {
    const dsl = `## PASSAGE 1
### Title

[A] First sentence.
Second sentence continues here.

## QUESTIONS 1-1
type: short_answer
instruction: Answer briefly.

1. What is X? | answer one; alt answer`;
    const { passages, errors } = parseReadingDsl(dsl);
    expect(errors).toEqual([]);
    expect(passages[0].paragraphs[0].html).toBe('<p>First sentence. Second sentence continues here.</p>');
    expect(passages[0].questionGroups[0].questions[0].answer.accepted).toEqual(['answer one', 'alt answer']);
  });

  it('parses multiple_choice_single with options and an answer key', () => {
    const dsl = `## PASSAGE 1
### Title

[A] Some text.

## QUESTIONS 1-1
type: multiple_choice_single
instruction: Choose the correct letter.

1. What is the reason? | A) one; B) two; C) three | B`;
    const { passages, errors } = parseReadingDsl(dsl);
    expect(errors).toEqual([]);
    const q = passages[0].questionGroups[0].questions[0];
    expect(q.options).toEqual([
      { key: 'A', text: 'one' },
      { key: 'B', text: 'two' },
      { key: 'C', text: 'three' },
    ]);
    expect(q.answer.accepted).toEqual(['B']);
  });

  it('reports an error for an unsupported group type', () => {
    const dsl = `## PASSAGE 1
### Title

[A] Some text.

## QUESTIONS 1-1
type: summary_completion
instruction: Fill in the gaps.

1. anything | x`;
    const { errors } = parseReadingDsl(dsl);
    expect(errors.some((e) => e.message.includes("qo'llab-quvvatlamaydi"))).toBe(true);
  });

  it('reports an error when there is no PASSAGE marker at all', () => {
    const { errors } = parseReadingDsl('just some random text');
    expect(errors.some((e) => e.message.includes('PASSAGE'))).toBe(true);
  });

  it('reports an error for a question line with a missing answer', () => {
    const dsl = `## PASSAGE 1
### Title

[A] Some text.

## QUESTIONS 1-1
type: true_false_notgiven
instruction: x

1. Statement with no answer |`;
    const { errors } = parseReadingDsl(dsl);
    expect(errors.some((e) => e.message.includes('javob topilmadi'))).toBe(true);
  });

  it('supports multiple passages in one document', () => {
    const dsl = `## PASSAGE 1
### First

[A] Text one.

## QUESTIONS 1-1
type: short_answer
instruction: x

1. Q1? | ans1

## PASSAGE 2
### Second

[A] Text two.

## QUESTIONS 2-2
type: short_answer
instruction: x

2. Q2? | ans2`;
    const { passages, errors } = parseReadingDsl(dsl);
    expect(errors).toEqual([]);
    expect(passages).toHaveLength(2);
    expect(passages[1].title).toBe('Second');
    expect(passages[1].questionGroups[0].questions[0].number).toBe(2);
  });
});
