import { describe, it, expect, vi, beforeEach } from 'vitest';

// `vi.hoisted()` — worker/orchestrator/autoPublishGate.test.ts'da o'rganilgan
// darsga q.: `vi.mock` factory hoisted bo'lgani uchun tashqi `const`larga
// to'g'ridan-to'g'ri murojaat qilish batch-run'da beqaror `ReferenceError`
// beradi, `vi.hoisted()` shu muammoning rasmiy yechimi.
const mocks = vi.hoisted(() => ({
  examTestFindByIdMock: vi.fn((..._args: any[]) => Promise.resolve(null)),
  reviewItemUpdateOneMock: vi.fn((..._args: any[]) => Promise.resolve({})),
  reviewItemFindMock: vi.fn((..._args: any[]) => ({ lean: () => Promise.resolve([]) })),
  agentActionCreateMock: vi.fn((..._args: any[]) => Promise.resolve({})),
  agentActionCountMock: vi.fn((..._args: any[]) => Promise.resolve(0)),
  contentBookFindByIdMock: vi.fn((..._args: any[]) => ({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'autopilot' }) }) })),
  automationPolicyFindOneMock: vi.fn((..._args: any[]) => ({ lean: () => Promise.resolve(null) })),
  runAiStageMock: vi.fn(),
  requireStageOutputMock: vi.fn(),
}));

vi.mock('@/lib/models', () => ({
  ExamTest: { findById: mocks.examTestFindByIdMock },
  ReviewItem: { updateOne: mocks.reviewItemUpdateOneMock, find: mocks.reviewItemFindMock },
  AgentAction: { create: mocks.agentActionCreateMock, countDocuments: mocks.agentActionCountMock },
  ContentBook: { findById: mocks.contentBookFindByIdMock },
  AutomationPolicy: { findOne: mocks.automationPolicyFindOneMock },
}));

vi.mock('../lib/aiStageRunner', () => ({ runAiStage: (...args: unknown[]) => mocks.runAiStageMock(...args) }));
vi.mock('../lib/dependencies', () => ({ requireStageOutput: (...args: unknown[]) => mocks.requireStageOutputMock(...args) }));

import { runSelfHealForReviewItem, runSelfHealForBook } from './selfHeal';

const {
  examTestFindByIdMock,
  reviewItemUpdateOneMock,
  reviewItemFindMock,
  agentActionCreateMock,
  agentActionCountMock,
  contentBookFindByIdMock,
  automationPolicyFindOneMock,
  runAiStageMock,
  requireStageOutputMock,
} = mocks;

function makeTest() {
  return {
    _id: 'test1',
    source: { bookId: 'book1', testIndex: 1 },
    sections: {
      reading: {
        passages: [
          {
            order: 1,
            questionGroups: [{ type: 'short_answer', questions: [{ number: 5, answer: { accepted: ['wrong answer'] } }] }],
          },
        ],
      },
    },
    markModified: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeReviewItem(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'rev1',
    testId: 'test1',
    bookId: 'book1',
    target: { sectionKey: 'reading', questionNumber: 5 },
    reason: 'qa_disagreement',
    confidence: 0.4,
    evidence: { rawText: "Javob manba matnga mos kelmaydi" },
    ...overrides,
  };
}

const splitSectionsOutput = { tests: [{ index: 1, sections: { reading: 'The correct answer is right answer.' } }], answerKeyText: '', audioscriptText: '' };

describe('runSelfHealForReviewItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    examTestFindByIdMock.mockResolvedValue(makeTest());
    agentActionCountMock.mockResolvedValue(0);
    requireStageOutputMock.mockResolvedValue(splitSectionsOutput);
  });

  it('skips items outside reading/listening (e.g. writing)', async () => {
    const item = makeReviewItem({ target: { sectionKey: 'writing', questionNumber: null } });
    const result = await runSelfHealForReviewItem(item, { maxAttempts: 2, autoAcceptConfidence: 0.93 });
    expect(result.outcome).toBe('skipped');
    expect(runAiStageMock).not.toHaveBeenCalled();
  });

  it('skips items with no questionNumber (cannot target a specific question)', async () => {
    const item = makeReviewItem({ target: { sectionKey: 'reading', questionNumber: null } });
    const result = await runSelfHealForReviewItem(item, { maxAttempts: 2, autoAcceptConfidence: 0.93 });
    expect(result.outcome).toBe('skipped');
  });

  it('skips items with no testId', async () => {
    const item = makeReviewItem({ testId: null });
    const result = await runSelfHealForReviewItem(item, { maxAttempts: 2, autoAcceptConfidence: 0.93 });
    expect(result.outcome).toBe('skipped');
  });

  it('marks the item self_heal_exhausted (without calling AI again) once attempts >= maxAttempts', async () => {
    agentActionCountMock.mockResolvedValue(2);
    const item = makeReviewItem();
    const result = await runSelfHealForReviewItem(item, { maxAttempts: 2, autoAcceptConfidence: 0.93 });
    expect(result.outcome).toBe('exhausted');
    expect(runAiStageMock).not.toHaveBeenCalled();
    expect(reviewItemUpdateOneMock).toHaveBeenCalledWith({ _id: 'rev1' }, { $set: { reason: 'self_heal_exhausted' } });
  });

  it('does not re-flag an already-exhausted item a second time', async () => {
    agentActionCountMock.mockResolvedValue(2);
    const item = makeReviewItem({ reason: 'self_heal_exhausted' });
    await runSelfHealForReviewItem(item, { maxAttempts: 2, autoAcceptConfidence: 0.93 });
    expect(reviewItemUpdateOneMock).not.toHaveBeenCalled();
  });

  it('heals: applies the fix and marks the ReviewItem fixed when both the fix and the independent verification succeed', async () => {
    runAiStageMock
      .mockResolvedValueOnce({ data: { accepted: ['right answer'], confidence: 0.9 }, costUsd: 0.01 }) // fix call (reading.parse)
      .mockResolvedValueOnce({ data: { matches: true, confidence: 0.97 }, costUsd: 0.02 }); // verify call (qa.validate)

    const test = makeTest();
    examTestFindByIdMock.mockResolvedValue(test);

    const item = makeReviewItem();
    const result = await runSelfHealForReviewItem(item, { maxAttempts: 2, autoAcceptConfidence: 0.93 });

    expect(result.outcome).toBe('healed');
    expect(test.sections.reading.passages[0].questionGroups[0].questions[0].answer.accepted).toEqual(['right answer']);
    expect(test.markModified).toHaveBeenCalledWith('sections');
    expect(test.save).toHaveBeenCalledTimes(1);
    expect(reviewItemUpdateOneMock).toHaveBeenCalledWith({ _id: 'rev1' }, { $set: { status: 'fixed', fixedBy: 'ai-agent', fixedAt: expect.any(Date) } });
    expect(agentActionCreateMock).toHaveBeenCalledWith(expect.objectContaining({ action: 'self_heal', reviewItemId: 'rev1' }));

    // taskKey routing: fix call must use reading.parse (matches the original parse stage), verify must use qa.validate
    expect(runAiStageMock.mock.calls[0][0]).toMatchObject({ taskKey: 'reading.parse' });
    expect(runAiStageMock.mock.calls[1][0]).toMatchObject({ taskKey: 'qa.validate' });
  });

  it('does not apply the fix when independent verification disagrees, even if the fix call itself was confident', async () => {
    runAiStageMock
      .mockResolvedValueOnce({ data: { accepted: ['plausible but wrong'], confidence: 0.95 }, costUsd: 0.01 })
      .mockResolvedValueOnce({ data: { matches: false, confidence: 0.9 }, costUsd: 0.02 });

    const test = makeTest();
    examTestFindByIdMock.mockResolvedValue(test);

    const result = await runSelfHealForReviewItem(makeReviewItem(), { maxAttempts: 2, autoAcceptConfidence: 0.93 });

    expect(result.outcome).toBe('retrying');
    expect(test.save).not.toHaveBeenCalled();
    expect(test.sections.reading.passages[0].questionGroups[0].questions[0].answer.accepted).toEqual(['wrong answer']);
  });

  it('marks self_heal_exhausted (not just retrying) when verification fails on the final allowed attempt', async () => {
    agentActionCountMock.mockResolvedValue(1); // this will be attempt #2 of maxAttempts:2
    runAiStageMock
      .mockResolvedValueOnce({ data: { accepted: ['still wrong'], confidence: 0.8 }, costUsd: 0.01 })
      .mockResolvedValueOnce({ data: { matches: false, confidence: 0.5 }, costUsd: 0.02 });

    const result = await runSelfHealForReviewItem(makeReviewItem(), { maxAttempts: 2, autoAcceptConfidence: 0.93 });

    expect(result.outcome).toBe('exhausted');
    expect(reviewItemUpdateOneMock).toHaveBeenCalledWith({ _id: 'rev1' }, { $set: { reason: 'self_heal_exhausted' } });
  });

  it('treats a low-confidence "match" as not healed (confidence must meet the policy threshold, not just be truthy)', async () => {
    runAiStageMock
      .mockResolvedValueOnce({ data: { accepted: ['maybe right'], confidence: 0.6 }, costUsd: 0 })
      .mockResolvedValueOnce({ data: { matches: true, confidence: 0.5 }, costUsd: 0 }); // matches:true but confidence below 0.93 threshold

    const test = makeTest();
    examTestFindByIdMock.mockResolvedValue(test);

    const result = await runSelfHealForReviewItem(makeReviewItem(), { maxAttempts: 2, autoAcceptConfidence: 0.93 });
    expect(result.outcome).toBe('retrying');
    expect(test.save).not.toHaveBeenCalled();
  });
});

describe('runSelfHealForBook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'autopilot' }) }) });
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve(null) });
    reviewItemFindMock.mockReturnValue({ lean: () => Promise.resolve([]) });
  });

  it('does nothing when automationLevel is manual (self-heal is autonomous AI action, gated like everything else)', async () => {
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'manual' }) }) });
    reviewItemFindMock.mockReturnValue({ lean: () => Promise.resolve([makeReviewItem()]) });

    const counts = await runSelfHealForBook('book1');
    expect(counts).toEqual({ healed: 0, exhausted: 0, skipped: 0, retrying: 0 });
    expect(reviewItemFindMock).not.toHaveBeenCalled();
  });

  it('only queries open, blocker-severity qa_disagreement items for the book', async () => {
    reviewItemFindMock.mockReturnValue({ lean: () => Promise.resolve([]) });
    await runSelfHealForBook('book1');
    expect(reviewItemFindMock).toHaveBeenCalledWith({ bookId: 'book1', severity: 'blocker', status: 'open', reason: 'qa_disagreement' });
  });

  it('aggregates outcomes across multiple items', async () => {
    reviewItemFindMock.mockReturnValue({ lean: () => Promise.resolve([makeReviewItem({ _id: 'a', target: { sectionKey: 'writing' } }), makeReviewItem({ _id: 'b', testId: null })]) });
    const counts = await runSelfHealForBook('book1');
    expect(counts.skipped).toBe(2);
  });
});
