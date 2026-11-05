// TZ 2.0 §6.10.1: Telegram Login Widget — the widget's signed data goes to /api/auth/telegram and opens a session.
// The real widget only works on the bot's domain, so this signs the payload with the E2E server's bot token.
import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';

const BOT = process.env.E2E_TELEGRAM_BOT_TOKEN || '424242:e2e-bot-token';
function signed(id: number) {
  const d: Record<string, string | number> = { id, first_name: 'E2E', username: `e2e_${id}`, auth_date: Math.floor(Date.now() / 1000) };
  const check = Object.keys(d).sort().map((k) => `${k}=${d[k]}`).join('\n');
  const secret = crypto.createHash('sha256').update(BOT).digest();
  return { ...d, hash: crypto.createHmac('sha256', secret).update(check).digest('hex') };
}

test('login page shows the Telegram option; signed widget data signs the user in', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByTestId('telegram-login')).toBeVisible();

  const id = 700_000 + Math.floor(Math.random() * 99_999);
  const res = await page.request.post('/api/auth/telegram', { data: signed(id) });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, isNew: true });

  await page.goto('/app');
  await expect(page).toHaveURL(/\/app/);
  const plan = await page.request.get('/api/plan/today');
  expect(plan.status()).toBe(200);

  // tampered data never opens a session
  const bad = await page.request.post('/api/auth/telegram', { data: { ...signed(id), id: id + 1 } });
  expect(bad.status()).toBe(401);
});
