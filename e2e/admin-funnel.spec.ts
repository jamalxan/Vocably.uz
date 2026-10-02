// Admin analitikasi: yangi foydalanuvchilar voronkasi (ro'yxatdan o'tish → birinchi o'yin → D1/D7).
import { expect, test } from '@playwright/test';
import { E2E_ADMIN_PHONE, E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test.describe('admin: voronka (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'admin sahifalari desktop uchun');

  test('API: voronka maydonlari bor; noto‘g‘ri "days" 30 ga tushadi; oddiy foydalanuvchiga yopiq', async ({ page, browser }) => {
    await loginAs(page, E2E_ADMIN_PHONE);
    const res = await page.request.get('/api/admin/vocab-analytics?days=999999');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.range).toBe(30);
    expect(data.funnel.signups).toBeGreaterThanOrEqual(4); // E2E seed foydalanuvchilari hozir yaratilgan
    expect(data.funnel.d1).toMatchObject({ eligible: expect.any(Number), retained: expect.any(Number) });
    expect(data.funnel.d7.rate === null || typeof data.funnel.d7.rate === 'number').toBe(true);

    const ctx = await browser.newContext();
    const userPage = await ctx.newPage();
    await loginAs(userPage, E2E_PHONE);
    expect((await userPage.request.get('/api/admin/vocab-analytics')).status()).toBe(403);
    await ctx.close();
  });

  test('sahifa: voronka bo‘limi ko‘rinadi', async ({ page }) => {
    await loginAs(page, E2E_ADMIN_PHONE);
    await page.goto('/admin/vocab');
    const section = page.getByRole('region', { name: "Ro'yxatdan o'tish voronkasi" });
    await expect(section).toBeVisible({ timeout: 60_000 });
    await expect(section.getByText('Ro\'yxatdan o\'tganlar')).toBeVisible();
    await expect(section.getByText('7-kun qaytish (D7)')).toBeVisible();
  });
});
