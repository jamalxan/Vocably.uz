// Ruscha interfeys (B1): Sozlamalarda til tanlash, saqlanishi (cookie), <html lang>, tarjima qilingan yuzalar, orqaga qaytish.
import { expect, test } from '@playwright/test';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test('til Sozlamalarda almashadi, qayta yuklanganda saqlanadi, <html lang> mos, orqaga uz', async ({ page, context }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/profil');
  await page.getByRole('button', { name: 'Sozlamalar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Sozlamalar' });
  await expect(dialog).toBeVisible({ timeout: 60_000 });

  await dialog.getByRole('button', { name: 'Русский' }).click();
  // Dialog darhol ruscha: sarlavha va bo'limlar
  await expect(page.getByRole('dialog', { name: 'Настройки' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Настройки' }).getByRole('heading', { name: 'Безопасность' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  const cookie = (await context.cookies()).find((c) => c.name === 'vocably_lang');
  expect(cookie?.value).toBe('ru');

  // Mashq sahifasi va yangi kartalar ruscha (qayta yuklashdan keyin ham)
  await page.goto('/app/mashq');
  await expect(page.getByRole('heading', { name: 'Практика' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('Над каким навыком будете работать?')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Офлайн-повторение' })).toBeVisible();
  await expect(page.getByText('Полный пробный экзамен из 4 разделов')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

  // O'yinlar markazidagi hikoya kartasi ham ruscha
  await page.goto('/app/oyinlar');
  await expect(page.getByRole('region', { name: 'ИИ-рассказ' })).toBeVisible({ timeout: 60_000 });

  // Orqaga o'zbekchaga
  await page.goto('/app/profil');
  await page.getByRole('button', { name: /Настройки/ }).click();
  await page.getByRole('dialog', { name: 'Настройки' }).getByRole('button', { name: "O'zbekcha" }).click();
  await expect(page.getByRole('dialog', { name: 'Sozlamalar' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
});

test('noto‘g‘ri cookie qiymati uz ga tushadi (inyeksiya/yiqilish yo‘q)', async ({ page, context }) => {
  await loginAs(page, E2E_PHONE);
  await context.addCookies([{ name: 'vocably_lang', value: 'xx"<script>', url: 'http://localhost:3100' }]).catch(() => {});
  await page.goto('/app/mashq');
  await expect(page.getByRole('heading', { name: 'Mashq' })).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('html')).toHaveAttribute('lang', 'uz');
});
