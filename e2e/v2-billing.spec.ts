// TZ 2.0 §10: 3-month plan (−15%), 14-day refund request from the checkout history, admin "Qaytarish" queue.
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import { loginAs } from './auth';
import { E2E_ADMIN_PHONE, E2E_FREE_PHONE } from './global-setup';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'billing + admin flow checked on desktop');

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

test('pricing and checkout offer 3 months at 15% off', async ({ page }) => {
  await page.goto('/pricing');
  await page.getByRole('button', { name: /3 oylik/ }).click();
  await expect(page.getByText(/176 000/)).toBeVisible();
  await expect(page.getByText(/329 000/)).toBeVisible();

  await loginAs(page, E2E_FREE_PHONE);
  await page.goto('/app/billing?tier=premium&months=3');
  await expect(page.getByRole('button', { name: /3 oy/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/329 000/).first()).toBeVisible();
});

test('a paid user asks for a refund; the admin returns it and the plan is shortened', async ({ page, browser }) => {
  const paymentId = await withDb(async (db) => {
    const u: any = await db.collection('users').findOne({ phone: E2E_FREE_PHONE });
    await db.collection('paymentrequests').deleteMany({ userId: u._id });
    await db.collection('users').updateOne({ _id: u._id }, { $set: { subscriptionTier: 'premium', subscriptionExpiresAt: new Date(Date.now() + 100 * 86_400_000) } });
    const r = await db.collection('paymentrequests').insertOne({
      userId: u._id, tier: 'premium', months: 3, amount: 329000, method: 'payme', status: 'approved', reviewedAt: new Date(Date.now() - 86_400_000), createdAt: new Date(Date.now() - 86_400_000),
    });
    return String(r.insertedId);
  });

  await loginAs(page, E2E_FREE_PHONE);
  await page.goto('/app/billing');
  await page.getByRole('button', { name: /Pulni qaytarish/ }).click();
  await page.getByLabel(/Sabab/).fill('E2E: not for me');
  await page.getByRole('button', { name: "So'rov yuborish" }).click();
  await expect(page.getByTestId('refund-status')).toContainText("so'rovi yuborildi");

  const ctx = await browser.newContext();
  const admin = await ctx.newPage();
  await loginAs(admin, E2E_ADMIN_PHONE);
  const list = await (await admin.request.get('/api/admin/payments?status=refund')).json();
  expect(list.refundCount).toBeGreaterThanOrEqual(1);
  expect(list.requests.map((r: any) => r.id)).toContain(paymentId);
  const decided = await admin.request.patch(`/api/admin/payments/${paymentId}`, { data: { action: 'refund_approve' } });
  expect(decided.ok()).toBeTruthy();
  expect((await admin.request.patch(`/api/admin/payments/${paymentId}`, { data: { action: 'refund_approve' } })).status()).toBe(409);
  await ctx.close();

  await page.reload();
  await expect(page.getByTestId('refund-status')).toContainText('Pul qaytarildi');
  const left = await withDb(async (db) => {
    const u: any = await db.collection('users').findOne({ phone: E2E_FREE_PHONE });
    await db.collection('users').updateOne({ _id: u._id }, { $set: { subscriptionTier: 'free', subscriptionExpiresAt: null } });
    return (new Date(u.subscriptionExpiresAt).getTime() - Date.now()) / 86_400_000;
  });
  expect(left).toBeGreaterThan(5);
  expect(left).toBeLessThan(15);
});
