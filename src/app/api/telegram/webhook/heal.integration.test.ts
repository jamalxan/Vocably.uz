// Dead inline buttons (prod, Nov 2026): the webhook was registered with allowed_updates ['message'], so quiz
// answers never reached the server. The webhook and the daily cron now repair the registration themselves.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let POST: any;
let DAILY: any;

const SECRET = 'hook-secret-123';
const CRON = 'cron-secret-123';
const HOOK = 'https://www.vocably.uz/api/telegram/webhook';
const calls: { method: string; body: any }[] = [];
let info: Record<string, unknown>;

const sent = (method: string) => calls.filter((c) => c.method === method);
const message = () =>
  POST(
    new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': SECRET },
      body: JSON.stringify({ message: { message_id: 1, chat: { id: 4242 }, from: { id: 4242 }, text: 'salom' } }),
    })
  );

describeDb('telegram webhook registration self-repair (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.TELEGRAM_WEBHOOK_SECRET = SECRET;
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.CRON_SECRET = CRON;
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    vi.stubGlobal('fetch', async (url: string, init: any) => {
      const method = String(url).split('/').pop() as string;
      calls.push({ method, body: init?.body ? JSON.parse(init.body) : null });
      return new Response(JSON.stringify({ ok: true, result: method === 'getWebhookInfo' ? info : { message_id: 1 } }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    await mongoose.connect(mongod.getUri());
    POST = (await import('./route')).POST;
    DAILY = (await import('../../internal/telegram/daily/route')).GET;
  }, 120_000);
  afterAll(async () => {
    vi.unstubAllGlobals();
    delete process.env.CRON_SECRET;
    await mongoose.disconnect();
    await mongod?.stop();
  });
  beforeEach(() => {
    calls.length = 0;
    info = { url: HOOK, allowed_updates: ['message'] };
  });

  it('an incoming message repairs a webhook that does not deliver button presses — once, not on every update', async () => {
    expect((await message()).status).toBe(200);
    expect(sent('setWebhook')).toHaveLength(1);
    expect(sent('setWebhook')[0].body).toEqual({ url: HOOK, secret_token: SECRET, allowed_updates: ['message', 'callback_query'] });
    expect(sent('sendMessage')).toHaveLength(1); // the update itself is still handled

    expect((await message()).status).toBe(200);
    expect(sent('getWebhookInfo')).toHaveLength(1);
    expect(sent('setWebhook')).toHaveLength(1);
  });

  it('the daily cron repairs the registration before it sends any quiz buttons', async () => {
    const res = await DAILY(new Request('http://localhost/api/internal/telegram/daily', { headers: { authorization: `Bearer ${CRON}` } }));
    expect(await res.json()).toMatchObject({ ok: true, webhook: 'repaired' });
    expect(sent('setWebhook')).toHaveLength(1);
    expect(sent('setWebhook')[0].body.allowed_updates).toContain('callback_query');
  });

  it('the daily cron leaves a healthy registration alone', async () => {
    info = { url: HOOK, allowed_updates: ['message', 'callback_query'] };
    const res = await DAILY(new Request('http://localhost/api/internal/telegram/daily', { headers: { authorization: `Bearer ${CRON}` } }));
    expect(await res.json()).toMatchObject({ ok: true, webhook: 'ok' });
    expect(sent('setWebhook')).toHaveLength(0);
  });
});
