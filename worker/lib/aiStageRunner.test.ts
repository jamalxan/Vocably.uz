import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// `@/lib/contentAgent/aiCallStore` DB'ga bog'liq (connectToDatabase) — bu
// birlik testida DB kerak emas, shuning uchun to'liq mock qilinadi. `@/lib/
// contentAgent/aiRouter`ning O'ZI DB'siz sof modul (aiRouter.test.js buni
// allaqachon to'liq sinaydi), shuning uchun bu yerda FAQAT `callTask`ning
// o'zini mock qilamiz — `AiRouterError`ning HAQIQIY klassini ishlatamiz,
// aks holda `instanceof` tekshiruvi (`aiStageRunner.ts`dagi `toStageError`)
// ishlamay qoladi.
const recordAiCallMock = vi.fn().mockResolvedValue({});
const getTaskConfigMock = vi.fn();
vi.mock('@/lib/contentAgent/aiCallStore', () => ({
  getTaskConfig: (...args: unknown[]) => getTaskConfigMock(...args),
  recordAiCall: (...args: unknown[]) => recordAiCallMock(...args),
  hashInput: (input: unknown) => `hash(${JSON.stringify(input)})`,
}));

const callTaskMock = vi.fn();
vi.mock('@/lib/contentAgent/aiRouter', async () => {
  // `AiRouterError`ning HAQIQIY klassi kerak (quyida `instanceof` bilan
  // solishtiriladi) — faqat `callTask`ning o'zi almashtiriladi.
  const actual = await vi.importActual('@/lib/contentAgent/aiRouter');
  return { ...actual, callTask: (...args: unknown[]) => callTaskMock(...args) };
});

import { runAiStage } from './aiStageRunner';
import { AiRouterError } from '@/lib/contentAgent/aiRouter';
import { RetryableStageError, UnrecoverableStageError } from './errors';

describe('runAiStage', () => {
  const originalKey = process.env.OPENROUTER_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'test-key';
    getTaskConfigMock.mockResolvedValue({ primary: 'google/gemini-2.5-flash', fallback: [], temperature: 0.1, maxTokens: 4000 });
  });

  afterAll(() => {
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  });

  it('returns the parsed data and records a successful AiCall', async () => {
    callTaskMock.mockResolvedValue({ data: { hello: 'world' }, model: 'google/gemini-2.5-flash', tokensIn: 10, tokensOut: 20, costUsd: 0.001, attempts: [] });

    const result = await runAiStage({
      taskKey: 'segment',
      bookId: 'book1',
      jobId: 'job1',
      systemPrompt: 'sys',
      userContent: 'user',
      jsonSchema: { type: 'object' },
      promptVersion: 'v1',
      inputForHash: 'user',
    });

    expect(result.data).toEqual({ hello: 'world' });
    expect(result.model).toBe('google/gemini-2.5-flash');
    expect(recordAiCallMock).toHaveBeenCalledTimes(1);
    expect(recordAiCallMock.mock.calls[0][0]).toMatchObject({ ok: true, taskKey: 'segment', bookId: 'book1', jobId: 'job1' });
  });

  it('throws UnrecoverableStageError (not retryable) when OPENROUTER_API_KEY is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(
      runAiStage({ taskKey: 'segment', bookId: 'b', jobId: 'j', systemPrompt: 's', jsonSchema: {}, promptVersion: 'v1', inputForHash: 's' })
    ).rejects.toBeInstanceOf(UnrecoverableStageError);
    process.env.OPENROUTER_API_KEY = originalKey || 'test-key';
  });

  it('throws UnrecoverableStageError for an unknown taskKey', async () => {
    getTaskConfigMock.mockResolvedValue(null);
    await expect(
      runAiStage({ taskKey: 'not.a.real.task', bookId: 'b', jobId: 'j', systemPrompt: 's', jsonSchema: {}, promptVersion: 'v1', inputForHash: 's' })
    ).rejects.toBeInstanceOf(UnrecoverableStageError);
  });

  it('maps a retryable AiRouterError (e.g. all models rate-limited) to RetryableStageError and still logs the failed AiCall', async () => {
    callTaskMock.mockRejectedValue(new AiRouterError('Tezlik chegarasi', { retryable: true }));

    await expect(
      runAiStage({ taskKey: 'segment', bookId: 'b', jobId: 'j', systemPrompt: 's', jsonSchema: {}, promptVersion: 'v1', inputForHash: 's' })
    ).rejects.toBeInstanceOf(RetryableStageError);

    expect(recordAiCallMock).toHaveBeenCalledTimes(1);
    expect(recordAiCallMock.mock.calls[0][0]).toMatchObject({ ok: false });
  });

  it('maps a non-retryable AiRouterError (e.g. all fallbacks exhausted) to UnrecoverableStageError', async () => {
    callTaskMock.mockRejectedValue(new AiRouterError('Barcha modellar muvaffaqiyatsiz', { retryable: false }));

    await expect(
      runAiStage({ taskKey: 'segment', bookId: 'b', jobId: 'j', systemPrompt: 's', jsonSchema: {}, promptVersion: 'v1', inputForHash: 's' })
    ).rejects.toBeInstanceOf(UnrecoverableStageError);
  });
});
