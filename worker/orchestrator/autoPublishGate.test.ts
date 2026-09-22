import { describe, it, expect, vi, beforeEach } from 'vitest';

// `@/lib/models` DB'ga bog'liq — bu birlik testida real Mongo kerak emas,
// shuning uchun to'liq mock qilinadi. `canAutoPublish`ning O'ZI mock
// QILINMAYDI (real, `autopilotGuards.test.js`da allaqachon 8 ta holat bilan
// tasdiqlangan funksiya) — bu test faqat ORCHESTRATOR simini (to'g'ri
// inputlarni DB'dan yig'ib shu funksiyaga uzatish, natijaga qarab to'g'ri
// yozish) tekshiradi, LEGAL-01 qoidasining o'zini QAYTA emas.
//
// `vi.mock(...)` factory FAYL BOSHIGA ko'chiriladi (hoisted) — oddiy
// tashqi `const`larga (TDZ) murojaat qilish ba'zan (batch ishga
// tushirishda) `ReferenceError` beradi (qo'lda aniqlandi: alohida faylda
// ishlaydi, to'liq suite bilan birga esa YO'Q). `vi.hoisted()` — shu
// muammoning rasmiy, hujjatlashtirilgan yechimi.
const mocks = vi.hoisted(() => {
  const testDoc: any = { _id: 't1', isPublished: false, qa: { score: 0.97, blockers: 0 }, rights: { sourceType: 'own', publishScope: 'public' }, source: { testIndex: 1 }, save: vi.fn() };
  return {
    testDoc,
    findByIdMock: vi.fn((..._args: any[]) => Promise.resolve(testDoc)),
    contentBookFindByIdMock: vi.fn((..._args: any[]) => ({ select: () => ({ lean: () => Promise.resolve({ automationLevel: null }) }) })),
    contentBookUpdateOneMock: vi.fn((..._args: any[]) => Promise.resolve({})),
    automationPolicyFindOneMock: vi.fn((..._args: any[]) => ({ lean: () => Promise.resolve(null) })),
    agentActionCreateMock: vi.fn((..._args: any[]) => Promise.resolve({})),
    reviewItemCountMock: vi.fn((..._args: any[]) => Promise.resolve(0)),
    reviewItemExistsMock: vi.fn((..._args: any[]) => Promise.resolve(false)),
  };
});

vi.mock('@/lib/models', () => ({
  ExamTest: { findById: mocks.findByIdMock },
  ContentBook: { findById: mocks.contentBookFindByIdMock, updateOne: mocks.contentBookUpdateOneMock },
  AutomationPolicy: { findOne: mocks.automationPolicyFindOneMock },
  AgentAction: { create: mocks.agentActionCreateMock },
  ReviewItem: { countDocuments: mocks.reviewItemCountMock, exists: mocks.reviewItemExistsMock },
}));

import { runAutoPublishGate, runAutoPublishGateForBook } from './autoPublishGate';

const { testDoc, findByIdMock, contentBookFindByIdMock, contentBookUpdateOneMock, automationPolicyFindOneMock, agentActionCreateMock, reviewItemCountMock, reviewItemExistsMock } = mocks;

describe('runAutoPublishGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(testDoc, { isPublished: false, publishedBy: undefined, autoPublishedAt: undefined, qa: { score: 0.97, blockers: 0 }, rights: { sourceType: 'own', publishScope: 'public' } });
    findByIdMock.mockResolvedValue(testDoc);
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'autopilot' }) }) });
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve(null) });
    reviewItemCountMock.mockResolvedValue(0);
  });

  it('returns not-published when the ExamTest does not exist', async () => {
    findByIdMock.mockResolvedValueOnce(null);
    const result = await runAutoPublishGate('book1', 'missing');
    expect(result).toEqual({ testId: 'missing', published: false, reason: 'ExamTest topilmadi' });
  });

  it('treats an already-published test as a no-op success (idempotent)', async () => {
    testDoc.isPublished = true;
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(true);
    expect(testDoc.save).not.toHaveBeenCalled();
    expect(agentActionCreateMock).not.toHaveBeenCalled();
  });

  it('publishes when every gate condition is satisfied (autopilot level, high qa score, no open blockers, own content)', async () => {
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(true);
    expect(testDoc.isPublished).toBe(true);
    expect(testDoc.publishedBy).toBe('ai-agent');
    expect(testDoc.autoPublishedAt).toBeInstanceOf(Date);
    expect(testDoc.save).toHaveBeenCalledTimes(1);
    expect(agentActionCreateMock).toHaveBeenCalledWith(expect.objectContaining({ bookId: 'book1', testId: 't1', action: 'auto_publish' }));
  });

  it('refuses to publish when there are open blocker ReviewItems', async () => {
    reviewItemCountMock.mockResolvedValue(2);
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(false);
    expect(result.reason).toMatch(/blocker/);
    expect(testDoc.isPublished).toBe(false);
    expect(testDoc.save).not.toHaveBeenCalled();
  });

  it('refuses to publish when automationLevel is manual, even with a perfect score', async () => {
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'manual' }) }) });
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(false);
    expect(result.reason).toMatch(/manual/);
  });

  it('LEGAL-01: refuses third_party_copyright + public scope regardless of qa score or automation level', async () => {
    testDoc.rights = { sourceType: 'third_party_copyright', publishScope: 'public' };
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(false);
    expect(result.reason).toMatch(/third_party_copyright/);
    expect(testDoc.isPublished).toBe(false);
  });

  it('allows third_party_copyright content scoped to organization (not public)', async () => {
    testDoc.rights = { sourceType: 'third_party_copyright', publishScope: 'organization' };
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(true);
  });

  it('falls back to the global AutomationPolicy level when the book has no override', async () => {
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: null }) }) });
    automationPolicyFindOneMock.mockImplementation((query: any) =>
      query.scope === 'global' ? { lean: () => Promise.resolve({ level: 'assisted', autoPublishMinQaScore: 0.9 }) } : { lean: () => Promise.resolve(null) }
    );
    const result = await runAutoPublishGate('book1', 't1');
    expect(result.published).toBe(true);
  });
});

describe('runAutoPublishGateForBook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(testDoc, { isPublished: false, qa: { score: 0.97, blockers: 0 }, rights: { sourceType: 'own', publishScope: 'public' } });
    findByIdMock.mockResolvedValue(testDoc);
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'autopilot' }) }) });
    automationPolicyFindOneMock.mockReturnValue({ lean: () => Promise.resolve(null) });
    reviewItemCountMock.mockResolvedValue(0);
    reviewItemExistsMock.mockResolvedValue(false);
  });

  it('sets ContentBook.status to published when every test in the book was auto-published', async () => {
    await runAutoPublishGateForBook('book1', ['t1']);
    expect(contentBookUpdateOneMock).toHaveBeenCalledWith({ _id: 'book1' }, { $set: expect.objectContaining({ status: 'published' }) });
  });

  it('sets ContentBook.status to needs_review when open blockers remain', async () => {
    reviewItemCountMock.mockResolvedValue(1);
    reviewItemExistsMock.mockResolvedValue(true);
    await runAutoPublishGateForBook('book1', ['t1']);
    expect(contentBookUpdateOneMock).toHaveBeenLastCalledWith({ _id: 'book1' }, { $set: expect.objectContaining({ status: 'needs_review' }) });
  });

  it('sets ContentBook.status to ready when the gate declines to publish for a non-blocker reason (e.g. manual level)', async () => {
    contentBookFindByIdMock.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ automationLevel: 'manual' }) }) });
    await runAutoPublishGateForBook('book1', ['t1']);
    expect(contentBookUpdateOneMock).toHaveBeenLastCalledWith({ _id: 'book1' }, { $set: expect.objectContaining({ status: 'ready' }) });
  });
});
