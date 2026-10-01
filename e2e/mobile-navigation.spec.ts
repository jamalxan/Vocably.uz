// Mobil "orqaga" xatti-harakati (qurilma tugmasi = history.back) va profil "Sozlamalar" oynasi.
import { expect, test, type Page } from '@playwright/test';
import { E2E_PASSWORD, E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

const pathOf = (page: Page) => new URL(page.url()).pathname;

const loginApi = (page: Page) => loginAs(page, E2E_PHONE);

async function back(page: Page) {
  await page.goBack({ waitUntil: 'commit', timeout: 5000 }).catch(() => null);
  await page.waitForTimeout(600);
}

const tab = (page: Page, name: RegExp) => page.getByRole('navigation').getByRole('link', { name }).first();

test.describe('mobil navigatsiya', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobil qurilma');

  test('kirishdan keyin "orqaga" /app ni takrorlamaydi (replace, tuzoq yo‘q)', async ({ page }) => {
    await page.goto('/kirish');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/Telefon/i).first().fill('+998901234567');
    await page.getByLabel(/Parol/i).first().fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /Kirish/i }).last().click();
    await page.waitForURL(/\/app/, { timeout: 45_000 });
    await page.waitForTimeout(1200);
    await back(page);
    // Avval: yana /app (dublikat) — foydalanuvchi "orqaga" bossa hech narsa o'zgarmasdi. Endi ilovadan chiqadi.
    expect(pathOf(page).startsWith('/app')).toBe(false);
  });

  test('tablar: Bosh -> Mashq -> AI -> Profil, "orqaga" doim Bosh sahifaga (tasodifiy tabga emas)', async ({ page }) => {
    await loginApi(page);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    for (const [name, url] of [[/Practice/i, '**/app/mashq'], [/^AI$/i, '**/app/ai'], [/Profile/i, '**/app/profil']] as const) {
      await tab(page, name).click();
      await page.waitForURL(url, { timeout: 45_000 }); // dev serverda birinchi kompilyatsiya sekin bo'lishi mumkin
      await page.waitForLoadState('networkidle');
    }
    expect(pathOf(page)).toBe('/app/profil');
    await back(page);
    expect(pathOf(page)).toBe('/app'); // avval: /app/ai
    await back(page);
    expect(pathOf(page).startsWith('/app')).toBe(false); // keyingi "orqaga" — ilovadan chiqish
  });

  test('tabdan Bosh sahifaga tugma bilan qaytish tarixni o‘stirmaydi', async ({ page }) => {
    await loginApi(page);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    await tab(page, /Practice/i).click();
    await page.waitForURL('**/app/mashq', { timeout: 45_000 });
    await tab(page, /Today/i).click();
    await page.waitForURL((u) => u.pathname === '/app', { timeout: 45_000 });
    expect(pathOf(page)).toBe('/app');
    await back(page);
    expect(pathOf(page).startsWith('/app')).toBe(false); // Bosh sahifa dublikat bo'lmagan
  });

  test('AI panel ochiq paytda "orqaga" avval panelni yopadi, sahifa o‘zgarmaydi', async ({ page }) => {
    await loginApi(page);
    await page.goto('/app/profil');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /AI yordamchini ochish/ }).click();
    await expect(page.getByRole('dialog', { name: 'AI yordamchi' })).toBeVisible();
    await page.waitForTimeout(400);
    await back(page);
    await expect(page.getByRole('dialog', { name: 'AI yordamchi' })).toHaveCount(0);
    expect(pathOf(page)).toBe('/app/profil');
  });

  test('profil: Sozlamalar oynasi — bo‘limlar shu yerda, sahifada emas; "orqaga" yopadi; tugma bilan yopilsa tarix qo‘shimcha yozuv qoldirmaydi', async ({ page }) => {
    await loginApi(page);
    await page.goto('/app');
    await tab(page, /Profile/i).click();
    await page.waitForURL('**/app/profil');
    await page.waitForLoadState('networkidle');

    // Sahifada ko'chirilgan bo'limlar yo'q
    for (const h of ['IELTS tayyorgarlik', "Ko'rinish", 'Telegram']) {
      await expect(page.getByRole('main').getByRole('heading', { name: h })).toHaveCount(0);
    }
    await expect(page.getByRole('main').getByRole('heading', { name: /Statistika/ })).toBeVisible();

    // Oyna: barcha bo'limlar bor
    await page.getByRole('button', { name: 'Sozlamalar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sozlamalar' });
    await expect(dialog).toBeVisible();
    for (const h of ['IELTS tayyorgarlik', 'Telegram', "Ko'rinish"]) {
      await expect(dialog.getByRole('heading', { name: h })).toBeVisible();
    }
    await expect(dialog.getByRole('button', { name: 'Saqlash' })).toBeVisible({ timeout: 15_000 }); // /api/profile yuklandi
    // mavzu o'zgaradi
    await dialog.getByRole('button', { name: 'Tungi' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark/);
    await dialog.getByRole('button', { name: 'Yorug\'' }).click();

    // "orqaga" — oynani yopadi, sahifada qoladi
    await page.waitForTimeout(400);
    await back(page);
    await expect(dialog).toHaveCount(0);
    expect(pathOf(page)).toBe('/app/profil');

    // Qayta ochib, "Yopish" tugmasi bilan yopish — keyingi "orqaga" Bosh sahifaga olib borishi kerak (oyna yozuvi qolmaydi)
    await page.getByRole('button', { name: 'Sozlamalar' }).click();
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(400);
    await dialog.getByRole('button', { name: 'Yopish' }).click();
    await expect(dialog).toHaveCount(0);
    await page.waitForTimeout(500);
    await back(page);
    expect(pathOf(page)).toBe('/app');
  });

  test('profil: IELTS tayyorgarlik sozlamasi saqlanadi (Sozlamalar oynasida)', async ({ page }) => {
    await loginApi(page);
    await page.goto('/app/profil');
    await page.getByRole('button', { name: 'Sozlamalar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sozlamalar' });
    await expect(dialog.getByRole('button', { name: 'Saqlash' })).toBeVisible({ timeout: 15_000 });
    await dialog.getByLabel('Target band').selectOption('7');
    await dialog.getByRole('button', { name: 'Saqlash' }).click();
    await expect(dialog.getByText('Saqlandi')).toBeVisible();
    const saved = await (await page.request.get('/api/profile')).json();
    expect(saved.targetBand).toBe(7);
  });
});
