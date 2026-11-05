// TZ 2.0 §10 growth 3–4, §6.11 5: referral link → sign-up rewards both sides; promo / creator codes at checkout; admin panel.
import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { loginAs } from './auth';
import { E2E_PHONE, E2E_FREE_PHONE, E2E_ADMIN_PHONE, E2E_FRIEND_USERNAME } from './global-setup';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'checked on desktop');

const BOT = process.env.E2E_TELEGRAM_BOT_TOKEN || '424242:e2e-bot-token';
function signedTg(id: number) {
  const d: Record<string, string | number> = { id, first_name: 'Ref', username: `ref_${id}`, auth_date: Math.floor(Date.now() / 1000) };
  const check = Object.keys(d).sort().map((k) => `${k}=${d[k]}`).join('\n');
  const secret = crypto.createHash('sha256').update(BOT).digest();
  return { ...d, hash: crypto.createHmac('sha256', secret).update(check).digest('hex') };
}

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

test.beforeAll(async () => {
  await withDb(async (db) => {
    await db.collection('promocodes').deleteMany({ code: { $in: ['E2E25', 'E2ECREATOR'] } });
    const u: any = await db.collection('users').findOne({ phone: E2E_PHONE });
    await db.collection('referrals').deleteMany({ ownerId: u._id });
    await db.collection('paymentrequests').deleteMany({ userId: u._id, 'promo.code': { $exists: true } });
    await db.collection('users').updateOne({ _id: u._id }, { $set: { subscriptionTier: 'free', subscriptionExpiresAt: null, 'referral.rewardCount': 0, 'referral.rewardedDays': 0 } });
  });
});

test('profile shows my invite link; a friend who signs up through it gives us both 7 days of Premium', async ({ page, browser }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/profile');
  await expect(page.getByTestId('referral-card')).toBeVisible();
  const code = (await page.getByTestId('referral-code').textContent())!.trim();
  expect(code).toMatch(/^[A-Z2-9]{8}$/);
  await expect(page.getByTestId('referral-stats')).toContainText('0 ta');

  // The friend opens the invite link (any page remembers ?ref=), then signs up via Telegram.
  const ctx = await browser.newContext();
  const friend = await ctx.newPage();
  await friend.goto(`/start?ref=${code.toLowerCase()}`);
  await expect(friend.getByRole('heading', { name: /maqsad|goal/i })).toBeVisible();
  const cookies = await ctx.cookies();
  expect(cookies.find((c) => c.name === 'vocably_ref')?.value).toBe(code);
  const tgId = 800_000 + Math.floor(Math.random() * 99_999);
  const res = await friend.request.post('/api/auth/telegram', { data: signedTg(tgId) });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, isNew: true });
  expect((await ctx.cookies()).find((c) => c.name === 'vocably_ref')).toBeUndefined(); // used up
  await ctx.close();

  const [owner, joiner]: any[] = await withDb(async (db) => [
    await db.collection('users').findOne({ phone: E2E_PHONE }),
    await db.collection('users').findOne({ phone: `tg:${tgId}` }),
  ]);
  expect(owner.subscriptionTier).toBe('premium');
  expect(owner.referral.rewardCount).toBe(1);
  expect(String(joiner.referral.invitedBy)).toBe(String(owner._id));
  // Joiner: welcome trial (7 days) + referral (7 days) ≈ 14 days
  const days = (new Date(joiner.subscriptionExpiresAt).getTime() - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(13);
  expect(days).toBeLessThan(15);

  await page.reload();
  await expect(page.getByTestId('referral-stats')).toContainText('1 ta');
  await expect(page.getByTestId('referral-stats')).toContainText('7 kun');
});

test('admin creates promo + creator codes; checkout prices with them on the server', async ({ page, browser }) => {
  const admin = await (await browser.newContext()).newPage();
  await loginAs(admin, E2E_ADMIN_PHONE);
  await admin.goto('/admin/promo');
  await expect(admin.getByTestId('promo-panel')).toBeVisible();
  await admin.getByLabel('Kod').fill('e2e25');
  await admin.getByLabel('Chegirma, %').fill('25');
  await admin.getByRole('button', { name: 'Yaratish' }).click();
  await expect(admin.getByTestId('promo-table')).toContainText('E2E25');
  // creator code owned by the friend account, 30% share, 1 use
  const bad = await admin.request.post('/api/admin/promo', { data: { code: 'E2ECREATOR', kind: 'creator', percentOff: 10, creatorUsername: 'nobody_e2e', creatorShare: 30 } });
  expect(bad.status()).toBe(400);
  const made = await admin.request.post('/api/admin/promo', { data: { code: 'E2ECREATOR', kind: 'creator', percentOff: 10, creatorUsername: E2E_FRIEND_USERNAME, creatorShare: 30, maxUses: 1 } });
  expect(made.status()).toBe(200);
  expect((await admin.request.post('/api/admin/promo', { data: { code: 'E2E25', percentOff: 5 } })).status()).toBe(409);

  await loginAs(page, E2E_PHONE);
  await page.goto('/app/billing?tier=standard&months=1');
  await expect(page.getByTestId('checkout-amount')).toHaveText(/69 000/);
  await page.getByLabel(/Promo kod|Promo code/).fill('nope');
  await page.getByRole('button', { name: /Qo‘llash|Apply/ }).click();
  await expect(page.getByTestId('promo-error')).toBeVisible();
  await page.getByLabel(/Promo kod|Promo code/).fill('e2e25');
  await page.getByRole('button', { name: /Qo‘llash|Apply/ }).click();
  await expect(page.getByTestId('promo-applied')).toContainText('25%');
  await expect(page.getByTestId('checkout-amount')).toHaveText(/51 800/); // 69 000 × 0.75 = 51 750 → 51 800
  // Switching the term re-prices: the quote no longer applies until re-applied.
  await page.getByRole('button', { name: /3 oy|3 months/ }).click();
  await expect(page.getByTestId('checkout-amount')).toHaveText(/176 000/);

  // Server-side: the creator can't use their own code; the amount comes from the server, not the client.
  const friend = await (await browser.newContext()).newPage();
  await loginAs(friend, E2E_FREE_PHONE);
  const own = await friend.request.post('/api/billing/promo', { data: { code: 'E2ECREATOR', tier: 'premium', months: 1 } });
  expect(own.status()).toBe(404);
  expect((await own.json()).code).toBe('own_code');
  const quote = await page.request.post('/api/billing/promo', { data: { code: 'e2ecreator', tier: 'premium', months: 1 } });
  expect(await quote.json()).toMatchObject({ code: 'E2ECREATOR', kind: 'creator', listPrice: 129000, amount: 116100, discount: 12900 });
  const req = await page.request.post('/api/billing/requests', { data: { tier: 'premium', months: 1, method: 'payme', promoCode: 'E2ECREATOR' } });
  const j = await req.json();
  // Payme may be unconfigured on the E2E server → 400 before the request is stored; the quote path above already proved pricing.
  if (req.ok()) {
    expect(j.request.amount).toBe(116100);
    expect(j.request.promo).toMatchObject({ code: 'E2ECREATOR', percentOff: 10 });
    expect((await page.request.post('/api/billing/promo', { data: { code: 'E2ECREATOR', tier: 'premium', months: 1 } })).status()).toBe(404); // slot reserved
  }
  await admin.context().close();
  await friend.context().close();
});

test('anonymous access is refused', async ({ request }) => {
  expect((await request.get('/api/referral')).status()).toBe(401);
  expect((await request.post('/api/billing/promo', { data: { code: 'E2E25', tier: 'standard', months: 1 } })).status()).toBe(401);
  expect((await request.get('/api/admin/promo')).status()).toBe(401);
});
