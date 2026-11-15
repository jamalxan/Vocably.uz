// Webhook self-repair: Telegram delivers only the update types the webhook was registered with, so a webhook
// registered with an old list keeps receiving messages while every inline button of the bot is dead.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const HOOK = 'https://www.vocably.uz/api/telegram/webhook';
const HOUR = 60 * 60 * 1000;
let calls;
let info;
let failing;
let T;

const sent = (method) => calls.filter((c) => c.method === method);

beforeEach(async () => {
  calls = [];
  failing = false;
  info = { url: HOOK, allowed_updates: ['message'] };
  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_WEBHOOK_SECRET = 'hook-secret';
  vi.stubGlobal('fetch', async (url, init) => {
    const method = String(url).split('/').pop();
    calls.push({ method, body: JSON.parse(init.body) });
    const body = failing ? { ok: false, description: 'Bad Gateway' } : { ok: true, result: method === 'getWebhookInfo' ? info : true };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.resetModules(); // the hourly throttle is module state
  T = await import('./telegram');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ensureWebhookUpdates', () => {
  it('re-registers the same url with the secret when button presses are not delivered', async () => {
    expect(await T.ensureWebhookUpdates()).toBe('repaired');
    expect(sent('setWebhook')).toHaveLength(1);
    expect(sent('setWebhook')[0].body).toEqual({ url: HOOK, secret_token: 'hook-secret', allowed_updates: ['message', 'callback_query'] });
  });

  it('leaves a webhook that already gets messages and button presses alone', async () => {
    info = { url: HOOK, allowed_updates: ['callback_query', 'message', 'poll'] };
    expect(await T.ensureWebhookUpdates()).toBe('ok');
    expect(sent('setWebhook')).toHaveLength(0);
  });

  it('treats a webhook without a list as fine (Telegram default delivers both)', async () => {
    info = { url: HOOK };
    expect(await T.ensureWebhookUpdates()).toBe('ok');
    expect(sent('setWebhook')).toHaveLength(0);
  });

  it('does nothing when no webhook is registered (local dev)', async () => {
    info = { url: '', allowed_updates: ['message'] };
    expect(await T.ensureWebhookUpdates()).toBe('unset');
    expect(sent('setWebhook')).toHaveLength(0);
  });

  it('never re-registers without the secret (that would strip it from the webhook)', async () => {
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    expect(await T.ensureWebhookUpdates()).toBe('no-secret');
    expect(sent('setWebhook')).toHaveLength(0);
  });
});

describe('healWebhook', () => {
  it('checks at most once an hour per instance, unless forced', async () => {
    const t0 = 1_800_000_000_000;
    expect(await T.healWebhook({ now: t0 })).toBe('repaired');
    info = { url: HOOK, allowed_updates: ['message', 'callback_query'] };
    expect(await T.healWebhook({ now: t0 + HOUR - 1 })).toBe('skipped');
    expect(sent('getWebhookInfo')).toHaveLength(1);
    expect(await T.healWebhook({ now: t0 + HOUR })).toBe('ok');
    expect(await T.healWebhook({ now: t0 + HOUR + 1, force: true })).toBe('ok');
    expect(sent('getWebhookInfo')).toHaveLength(3);
    expect(sent('setWebhook')).toHaveLength(1);
  });

  it('never throws, and retries on the next update after a failed check', async () => {
    const t0 = 1_800_000_000_000;
    failing = true;
    expect(await T.healWebhook({ now: t0 })).toBe('error');
    failing = false;
    expect(await T.healWebhook({ now: t0 + 1000 })).toBe('repaired');
  });
});
