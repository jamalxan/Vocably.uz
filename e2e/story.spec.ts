// AI hikoya kartasi (/app/oyinlar): premium foydalanuvchi hikoya oladi (AI kalitsiz — zaxira: o'z misol gaplari),
// free foydalanuvchi sababini va "Tariflar" havolasini ko'radi.
import { expect, test } from '@playwright/test';
import { E2E_FREE_PHONE, E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test('premium: "Hikoya yaratish" hikoya, ajratilgan so‘zlar va AI belgisini ko‘rsatadi', async ({ page }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/oyinlar');
  const card = page.getByRole('region', { name: 'AI hikoya' });
  await expect(card).toBeVisible({ timeout: 45_000 });
  await card.getByRole('button', { name: /Hikoya yaratish/ }).click();
  await expect(card.getByRole('article')).toBeVisible({ timeout: 60_000 });
  await expect(card.getByRole('heading', { level: 3 })).not.toBeEmpty();
  await expect(card.getByText(/AI tomonidan yaratilgan|AI hozir band/)).toBeVisible();
  await expect(card.getByRole('button', { name: /Yangisi/ })).toBeVisible();
});

test('free: sabab va Tariflar havolasi ko‘rsatiladi, hikoya yo‘q', async ({ page }) => {
  await loginAs(page, E2E_FREE_PHONE);
  await page.goto('/app/oyinlar');
  const card = page.getByRole('region', { name: 'AI hikoya' });
  await expect(card).toBeVisible({ timeout: 45_000 });
  await card.getByRole('button', { name: /Hikoya yaratish/ }).click();
  await expect(card.getByRole('alert')).toContainText('Premium');
  await expect(card.getByRole('link', { name: 'Tariflar' })).toHaveAttribute('href', '/narxlar');
  await expect(card.getByRole('article')).toHaveCount(0);
});
