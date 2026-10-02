import { expect, test } from '@playwright/test';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test.beforeEach(async ({ page }) => {
  // Kirish: cookie API javobi bilan o'rnatiladi (page.request va brauzer bir xil kontekst).
  await loginAs(page, E2E_PHONE);
});

test('o\'yinlar markazi ochiladi va o\'yinlar ko\'rinadi', async ({ page }) => {
  await page.goto('/app/oyinlar');
  // Dev serverda API yo'llari birinchi so'rovda kompilyatsiya qilinadi — uzoqroq kutamiz.
  await expect(page.getByRole('heading', { name: "Lug'at sayohatingiz" })).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('a[href="/app/oyinlar/multiple_choice"]').first()).toBeVisible();
  // Gorizontal skroll yo'q (mobil/desktop)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});

test('multiple_choice sessiyasi boshdan oxirigacha o\'tadi, natija ko\'rinadi', async ({ page }) => {
  await page.goto('/app/oyinlar/multiple_choice');
  await page.getByRole('button', { name: "O'yinni boshlash" }).click();

  const counter = page.getByText(/Savol \d+ \/ \d+/);
  // Sessiya yaratuvchi API dev serverda birinchi so'rovda kompilyatsiya qilinadi — standart 5 s yetmaydi.
  await expect(counter).toBeVisible({ timeout: 45_000 });
  const total = Number((await counter.textContent())!.match(/\/ (\d+)/)![1]);

  for (let i = 0; i < total; i++) {
    await expect(page.getByText(`Savol ${i + 1} / ${total}`)).toBeVisible();
    await page.getByRole('radiogroup', { name: 'Javob variantlari' }).getByRole('radio').first().click();
    // To'g'ri javobda o'yin o'zi o'tadi, noto'g'rida "Keyingisi/Yakunlash" tugmasi chiqadi.
    const next = page.getByRole('button', { name: /Keyingisi|Yakunlash/ });
    const after = i < total - 1 ? page.getByText(`Savol ${i + 2} / ${total}`) : page.getByText(/XP/).first();
    await expect(next.or(after)).toBeVisible({ timeout: 15_000 });
    if (await next.isVisible()) await next.click();
  }

  await expect(page.getByText(/XP/).first()).toBeVisible({ timeout: 15_000 });
});

test('sahifani yangilash faol sessiyani tiklaydi', async ({ page }) => {
  await page.goto('/app/oyinlar/multiple_choice');
  await page.getByRole('button', { name: "O'yinni boshlash" }).click();
  await expect(page.getByText(/Savol 1 \/ \d+/)).toBeVisible({ timeout: 45_000 });
  await page.reload();
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await expect(page.getByText(/Savol \d+ \/ \d+/)).toBeVisible();
});
