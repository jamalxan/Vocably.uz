import { describe, it, expect, vi } from 'vitest';
import { callTask, computeIdempotencyKey, hashInput, buildRequestBody, DEFAULT_MODEL_MATRIX, AiRouterError } from './aiRouter';

// TZ-vocably-v2.md §5.3 — bu fayl aiRouter.js'ning retry/fallback/
// idempotentlik mantig'ini haqiqiy tarmoqsiz sinaydi (chaqiruvchi mock
// `fetch` beradi). `sleepFn` doim darhol `resolve` qiladigan mock bilan
// almashtiriladi — aks holda haqiqiy backoff (1s/4s/16s) testlarni
// sekinlashtirar edi.
const noSleep = () => Promise.resolve();

function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
    json: async () => body,
  };
}

function chatCompletion(contentObj, usage = {}) {
  return { choices: [{ message: { content: JSON.stringify(contentObj) } }], usage };
}

describe('computeIdempotencyKey', () => {
  it('is deterministic for identical input', () => {
    const args = { taskKey: 'reading.parse', inputHash: 'abc', modelId: 'm1', promptVersion: 'v1' };
    expect(computeIdempotencyKey(args)).toBe(computeIdempotencyKey({ ...args }));
  });

  it('differs when any field changes', () => {
    const base = { taskKey: 'reading.parse', inputHash: 'abc', modelId: 'm1', promptVersion: 'v1' };
    const key1 = computeIdempotencyKey(base);
    expect(computeIdempotencyKey({ ...base, inputHash: 'xyz' })).not.toBe(key1);
    expect(computeIdempotencyKey({ ...base, modelId: 'm2' })).not.toBe(key1);
    expect(computeIdempotencyKey({ ...base, promptVersion: 'v2' })).not.toBe(key1);
  });
});

describe('hashInput', () => {
  it('hashes strings and objects consistently', () => {
    expect(hashInput('hello')).toBe(hashInput('hello'));
    expect(hashInput({ a: 1 })).toBe(hashInput({ a: 1 }));
    expect(hashInput('hello')).not.toBe(hashInput('world'));
  });
});

describe('buildRequestBody', () => {
  it('includes response_format only when jsonSchema is given', () => {
    const withoutSchema = buildRequestBody({ model: 'm', systemPrompt: 's', userContent: 'u', temperature: 0.1, maxTokens: 100 });
    expect(withoutSchema.response_format).toBeUndefined();

    const withSchema = buildRequestBody({
      model: 'm', systemPrompt: 's', userContent: 'u', temperature: 0.1, maxTokens: 100,
      jsonSchema: { name: 'passage', schema: { type: 'object' } },
    });
    expect(withSchema.response_format).toEqual({
      type: 'json_schema',
      json_schema: { name: 'passage', strict: true, schema: { type: 'object' } },
    });
  });
});

describe('callTask', () => {
  const config = { primary: 'model-a', fallback: ['model-b'], temperature: 0.1, maxTokens: 100, costCapUsd: 1 };

  it('succeeds on the first attempt with the primary model', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(chatCompletion({ ok: true }, { prompt_tokens: 10, completion_tokens: 5 })));
    const result = await callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: 'k', fetchImpl, sleepFn: noSleep });
    expect(result.data).toEqual({ ok: true });
    expect(result.model).toBe('model-a');
    expect(result.tokensIn).toBe(10);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries a 429 honoring Retry-After, then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 429, headers: { 'retry-after': '0' } }))
      .mockResolvedValueOnce(jsonResponse(chatCompletion({ retried: true })));
    const result = await callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: 'k', fetchImpl, sleepFn: noSleep });
    expect(result.data).toEqual({ retried: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('falls back to the next model after the primary exhausts retries on 500s', async () => {
    const fetchImpl = vi
      .fn()
      // primary: 4 total attempts (1 + 3 retries), all 500
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 500 }))
      // fallback model succeeds immediately
      .mockResolvedValueOnce(jsonResponse(chatCompletion({ fromFallback: true })));
    const result = await callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: 'k', fetchImpl, sleepFn: noSleep });
    expect(result.data).toEqual({ fromFallback: true });
    expect(result.model).toBe('model-b');
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts[0]).toMatchObject({ model: 'model-a', ok: false });
    expect(result.attempts[1]).toMatchObject({ model: 'model-b', ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(5);
  });

  it('does not retry a non-retryable 400 — moves straight to the next model', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, { status: 400 }))
      .mockResolvedValueOnce(jsonResponse(chatCompletion({ ok: true })));
    await callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: 'k', fetchImpl, sleepFn: noSleep });
    // 1 call for the failed primary (no retries — 400 is not retryable), 1 for the fallback.
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('throws AiRouterError with per-model attempts when every model fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, { status: 400 }));
    await expect(
      callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: 'k', fetchImpl, sleepFn: noSleep })
    ).rejects.toThrow(AiRouterError);
  });

  it('treats malformed JSON content as retryable', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => null }, json: async () => ({ choices: [{ message: { content: 'not json' } }] }) })
      .mockResolvedValueOnce(jsonResponse(chatCompletion({ recovered: true })));
    const result = await callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: 'k', fetchImpl, sleepFn: noSleep });
    expect(result.data).toEqual({ recovered: true });
  });

  it('rejects immediately when no API key is given', async () => {
    await expect(callTask({ taskKey: 'reading.parse', systemPrompt: 's', userContent: 'u', config, apiKey: '', fetchImpl: vi.fn() })).rejects.toThrow(
      /OPENROUTER_API_KEY/
    );
  });

  it('falls back to DEFAULT_MODEL_MATRIX when no config is passed', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(chatCompletion({ ok: true })));
    const result = await callTask({ taskKey: 'writing.grade', systemPrompt: 's', userContent: 'u', apiKey: 'k', fetchImpl, sleepFn: noSleep });
    expect(result.model).toBe(DEFAULT_MODEL_MATRIX['writing.grade'].primary);
  });

  it('rejects an unknown taskKey with no config', async () => {
    await expect(callTask({ taskKey: 'not.a.real.task', systemPrompt: 's', userContent: 'u', apiKey: 'k', fetchImpl: vi.fn() })).rejects.toThrow(
      /Noma'lum taskKey/
    );
  });
});
