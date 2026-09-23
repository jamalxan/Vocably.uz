import { describe, it, expect, vi } from 'vitest';
import { mergeAnswerKey, mergeListeningAnswerKey, flagUnmatchedAnswerKeyEntries } from './assemble';

// AI-04 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) tekshiruvi — javob
// kaliti <-> parse qilingan savollar orasidagi bog'lash sof mantig'i.
// `runAssemble`ning o'zi (DB/AI chaqiruvlariga bog'liq) bu yerda
// sinalmaydi — faqat raqam bo'yicha moslashtirish/unmatched aniqlash.

function passage(questionNumbers: number[]) {
  return [
    {
      order: 1,
      title: 'P1',
      paragraphs: [],
      questionGroups: [
        {
          id: 'g1',
          type: 'short_answer',
          questions: questionNumbers.map((number) => ({ number })),
        },
      ],
    },
  ] as any;
}

function listeningPart(questionNumbers: number[]) {
  return [
    {
      order: 1,
      questionGroups: [
        {
          id: 'g1',
          type: 'short_answer',
          questions: questionNumbers.map((number) => ({ number })),
        },
      ],
    },
  ] as any;
}

describe('mergeAnswerKey', () => {
  it('attaches accepted answers to matching question numbers and reports them as matched', () => {
    const passages = passage([1, 2, 3]);
    const matched = mergeAnswerKey(passages, [
      { number: 1, accepted: ['A'] },
      { number: 2, accepted: ['B'] },
    ]);
    expect(passages[0].questionGroups[0].questions[0].answer).toEqual({ accepted: ['A'] });
    expect(passages[0].questionGroups[0].questions[1].answer).toEqual({ accepted: ['B'] });
    expect(passages[0].questionGroups[0].questions[2].answer).toBeUndefined();
    expect(matched).toEqual(new Set([1, 2]));
  });

  it('does not mark a number as matched when the answer key entry has no accepted values', () => {
    const passages = passage([1]);
    const matched = mergeAnswerKey(passages, [{ number: 1, accepted: [] }]);
    expect(passages[0].questionGroups[0].questions[0].answer).toBeUndefined();
    expect(matched.has(1)).toBe(false);
  });

  it('leaves an answer-key entry for a question number that does not exist in the content unmatched', () => {
    // Savol 1 va 2 parse qilingan, lekin javob kaliti 1 va 99 (99 hech
    // qaysi savolga tegishli emas) uchun javob beradi.
    const passages = passage([1, 2]);
    const matched = mergeAnswerKey(passages, [
      { number: 1, accepted: ['A'] },
      { number: 99, accepted: ['Z'] },
    ]);
    expect(matched).toEqual(new Set([1]));
  });
});

describe('mergeListeningAnswerKey', () => {
  it('mirrors mergeAnswerKey behaviour for listening parts', () => {
    const parts = listeningPart([10, 11]);
    const matched = mergeListeningAnswerKey(parts, [{ number: 10, accepted: ['X'] }]);
    expect(parts[0].questionGroups[0].questions[0].answer).toEqual({ accepted: ['X'] });
    expect(matched).toEqual(new Set([10]));
  });
});

describe('flagUnmatchedAnswerKeyEntries', () => {
  it('creates a warning ReviewItem for each answer-key number that was never matched', async () => {
    const created: any[] = [];
    const ReviewItemModel = { create: vi.fn(async (doc: any) => created.push(doc)) };

    await flagUnmatchedAnswerKeyEntries(
      ReviewItemModel,
      'book1',
      'test1',
      'reading',
      [
        { number: 1, accepted: ['A'] },
        { number: 99, accepted: ['Z'] },
      ],
      new Set([1])
    );

    expect(ReviewItemModel.create).toHaveBeenCalledTimes(1);
    expect(created[0]).toMatchObject({
      bookId: 'book1',
      testId: 'test1',
      target: { sectionKey: 'reading', questionNumber: 99 },
      reason: 'missing_answer',
      severity: 'warning',
      status: 'open',
    });
  });

  it('creates nothing when every answer-key entry was matched', async () => {
    const ReviewItemModel = { create: vi.fn() };
    await flagUnmatchedAnswerKeyEntries(ReviewItemModel, 'book1', 'test1', 'listening', [{ number: 1, accepted: ['A'] }], new Set([1]));
    expect(ReviewItemModel.create).not.toHaveBeenCalled();
  });

  it('ignores answer-key entries that have no accepted values at all (nothing to flag)', async () => {
    const ReviewItemModel = { create: vi.fn() };
    await flagUnmatchedAnswerKeyEntries(ReviewItemModel, 'book1', 'test1', 'reading', [{ number: 5, accepted: [] }], new Set());
    expect(ReviewItemModel.create).not.toHaveBeenCalled();
  });
});
