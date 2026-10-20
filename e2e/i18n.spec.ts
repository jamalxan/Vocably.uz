// Interfeys tili (en/uz): standart — inglizcha; Sozlamalarda va landing menyusida almashadi, cookie'da saqlanadi, kirish/ro'yxat sahifalarida tanlagich yo'q.
import { expect, test } from '@playwright/test';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

// playwright.config har kontekstni `vocably_lang=uz` bilan boshlaydi — bu spec standart (cookie'siz) holatni tekshiradi.
test.use({ storageState: { cookies: [], origins: [] } });

test('kirish va ro‘yxat sahifalarida til tanlagich yo‘q; standart til inglizcha', async ({ page }) => {
  for (const path of ['/login', '/register']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 60_000 });
    await expect(page.getByRole('button', { name: "O'zbekcha" })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'English' })).toHaveCount(0);
  }
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 60_000 });
});

test('landing menyusida til almashadi va cookie’da saqlanadi', async ({ page, context }) => {
  await page.goto('/');
  const header = page.getByRole('banner');
  await expect(header.getByRole('link', { name: 'Pricing' }).first()).toBeVisible({ timeout: 60_000 });
  await header.getByRole('button', { name: "O'zbekcha" }).first().click();
  await expect(header.getByRole('link', { name: 'Narxlar' }).first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
  expect((await context.cookies()).find((c) => c.name === 'vocably_lang')?.value).toBe('uz');
  await page.reload();
  await expect(header.getByRole('link', { name: 'Narxlar' }).first()).toBeVisible({ timeout: 60_000 });
});

test('kirgandan keyin til Sozlamalarda almashadi va qayta yuklanganda saqlanadi', async ({ page, context }) => {
  test.setTimeout(240_000);
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/profile');
  await page.getByRole('button', { name: 'Settings' }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible({ timeout: 60_000 });
  await dialog.getByRole('button', { name: "O'zbekcha" }).click();
  await expect(page.getByRole('dialog', { name: 'Sozlamalar' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
  expect((await context.cookies()).find((c) => c.name === 'vocably_lang')?.value).toBe('uz');
  await page.goto('/app/practice');
  await expect(page.getByRole('heading', { name: 'Mashq' })).toBeVisible({ timeout: 60_000 });
});

test('noto‘g‘ri cookie qiymati xavfsiz — inglizchaga tushadi', async ({ page, context }) => {
  await context.addCookies([{ name: 'vocably_lang', value: 'ru', url: 'http://localhost:3100' }]);
  await page.goto('/login');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en', { timeout: 60_000 });
});
