// TZ 2.0 §6.2.4 / §10: weekly report — core for everyone, the personal part for Premium.
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import { loginAs } from './auth';
import { E2E_FREE_PHONE } from './global-setup';
import { weekKey, addDays, localParts } from '../src/lib/weeklyReport';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'report flow checked on desktop');

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

const TZ = 'Asia/Tashkent';
const lastWeek = () => weekKey(addDays(localParts(new Date(), TZ).date, -7));

test.beforeAll(async () => {
  await withDb(async (db) => {
    const u: any = await db.collection('users').findOne({ phone: E2E_FREE_PHONE });
    await db.collection('xpevents').deleteMany({ userId: u._id, reason: 'e2e_weekly' });
    // Midday a week ago, Tashkent — always inside last ISO week.
    const at = new Date(`${addDays(localParts(new Date(), TZ).date, -7)}T07:00:00Z`);
    await db.collection('xpevents').insertOne({ userId: u._id, amount: 150, reason: 'e2e_weekly', createdAt: at });
    await db.collection('users').updateOne({ _id: u._id }, { $set: { timezone: TZ, subscriptionTier: 'free', subscriptionExpiresAt: null } });
  });
});

test.afterAll(async () => {
  await withDb(async (db) => {
    const u: any = await db.collection('users').findOne({ phone: E2E_FREE_PHONE });
    await db.collection('xpevents').deleteMany({ userId: u._id, reason: 'e2e_weekly' });
    await db.collection('users').updateOne({ _id: u._id }, { $set: { subscriptionTier: 'free', subscriptionExpiresAt: null } });
  });
});

test('free user sees the core report and a Premium upsell; the dashboard links to it', async ({ page }) => {
  await loginAs(page, E2E_FREE_PHONE);
  await page.goto('/app');
  await page.getByTestId('plan-weekly-report').click();
  await expect(page).toHaveURL(/\/app\/report$/);
  await expect(page.getByTestId('weekly-report')).toBeVisible();

  await page.goto(`/app/report?week=${lastWeek()}`);
  await expect(page.getByTestId('report-xp')).toContainText('150');
  await expect(page.getByTestId('report-focus')).toBeVisible();
  await expect(page.getByTestId('report-locked')).toBeVisible();
  await expect(page.getByTestId('report-locked').getByRole('link')).toHaveAttribute('href', '/pricing');
  await expect(page.getByTestId('report-personal')).toHaveCount(0);

  // Navigation: forward one week lands on this week; no future weeks via the API.
  await page.getByRole('link', { name: 'Keyingi hafta' }).click();
  await expect(page.getByTestId('report-range')).toContainText('Shu hafta');
  const thisWeek = weekKey(localParts(new Date(), TZ).date);
  const future = weekKey(addDays(localParts(new Date(), TZ).date, 7));
  expect((await page.request.get(`/api/reports/weekly?week=${thisWeek}`)).status()).toBe(200);
  expect((await page.request.get(`/api/reports/weekly?week=${future}`)).status()).toBe(400);
  expect((await page.request.get('/api/reports/weekly?week=junk')).status()).toBe(400);
});

test('Premium user gets the personal part', async ({ page }) => {
  await withDb(async (db) => {
    await db.collection('users').updateOne({ phone: E2E_FREE_PHONE }, { $set: { subscriptionTier: 'premium', subscriptionExpiresAt: new Date(Date.now() + 30 * 86_400_000) } });
  });
  await loginAs(page, E2E_FREE_PHONE);
  await page.goto(`/app/report?week=${lastWeek()}`);
  await expect(page.getByTestId('report-personal')).toBeVisible();
  await expect(page.getByTestId('report-locked')).toHaveCount(0);
  await expect(page.getByTestId('report-next')).toBeVisible();
  await expect(page.getByLabel(/150 XP/)).toBeVisible();
});

test('anonymous request is refused', async ({ request }) => {
  expect((await request.get('/api/reports/weekly')).status()).toBe(401);
});
