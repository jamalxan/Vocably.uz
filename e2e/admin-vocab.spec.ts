// Admin lug'at sahifalari: fabrika (yuklash), kutubxona (yaratish, rasm yuklash, mashq ko'rib chiqish).
import { expect, test } from '@playwright/test';
import { E2E_ADMIN_PHONE, E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

// 1x1 shaffof PNG (haqiqiy baytlar — server magic-bytes tekshiradi)
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

test.describe('admin: lug‘at sahifalari (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'admin sahifalari desktop uchun');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, E2E_ADMIN_PHONE);
  });

  test('fabrika sahifasi ochiladi, 25 MB gacha yuklash haqida aytadi', async ({ page }) => {
    await page.goto('/admin/vocab-factory');
    await expect(page.getByRole('main').getByRole('heading', { name: /Lug'at fabrikasi/ })).toBeVisible({ timeout: 45_000 });
    await expect(page.getByRole('button', { name: /Fayl yuklash/ })).toBeVisible();
    await expect(page.getByText(/25 MB/)).toBeVisible();
  });

  test('kichik TXT fayl bo‘laklab yuklash oqimi orqali ish yaratadi (AI yo‘q — ish "Boshlash" kutadi yoki xato ko‘rsatadi)', async ({ page }) => {
    await page.goto('/admin/vocab-factory');
    await expect(page.getByRole('button', { name: /Fayl yuklash/ })).toBeVisible({ timeout: 45_000 });
    const text = ('Governments must mitigate the effects of rapid change in communities. '.repeat(8) + '\n\n').repeat(6);
    await page.getByLabel('PDF, DOCX yoki TXT faylni tanlang').setInputFiles({ name: 'e2e-book.txt', mimeType: 'text/plain', buffer: Buffer.from(text) });
    // Yuklash + yig'ish muvaffaqiyatli bo'lsa ro'yxatda fayl nomi ko'rinadi (AI kalitlari bo'lmasa bo'laklar xato bilan tugashi mumkin — bu testning predmeti emas).
    await expect(page.getByText('e2e-book.txt')).toBeVisible({ timeout: 30_000 });
  });

  test('kutubxona: yangi so‘z yaratish, rasm yuklash (haqiqiy PNG) va ro‘yxatda ko‘rinishi', async ({ page }) => {
    await page.goto('/admin/vocab-library');
    await page.getByRole('button', { name: /Yangi so'z|Qo'shish|Yangi/ }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 45_000 });
    await dialog.getByLabel(/^So'z \*/).fill('e2eword');
    await dialog.getByLabel(/O'zbekcha tarjima/).fill('sinov');
    await dialog.getByLabel(/Qisqa ta'rif/).fill('a word made for testing');
    await dialog.getByLabel(/Misol gap/).fill('The e2eword appears in this sentence.');

    // Rasm yuklash — server magic-bytes bilan tekshiradi; qaytgan URL formaga tushadi
    await dialog.getByLabel('Rasm faylini tanlang').setInputFiles({ name: 'dot.png', mimeType: 'image/png', buffer: PNG_1PX });
    await expect(dialog.getByAltText('Tanlangan rasm')).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByPlaceholder('https://…')).toHaveValue(/^\/api\/exam\/image\/[0-9a-f]{24}$/);

    // Yangi (v2) maydonlar
    await dialog.getByLabel(/Batafsil izoh/).fill("Sinov uchun yaratilgan so'z.");
    await dialog.getByLabel(/Ishlatish qaydi/).fill("Faqat testda.");
    await dialog.getByRole('button', { name: 'Saqlash' }).click();
    await expect(page.getByText('Saqlandi')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('e2eword').first()).toBeVisible();
  });

  test('rasm sifatida yashirilgan HTML rad etiladi (415) — XSS himoyasi', async ({ page }) => {
    const res = await page.request.post('/api/admin/vocab-library/image', {
      multipart: { file: { name: 'evil.png', mimeType: 'image/png', buffer: Buffer.from('<html><script>alert(1)</script></html>') } },
    });
    expect(res.status()).toBe(415);
  });
});

test('oddiy foydalanuvchi admin endpointlariga kira olmaydi (403)', async ({ page }) => {
  await loginAs(page, E2E_PHONE);
  const res = await page.request.post('/api/admin/vocab-library/image', {
    multipart: { file: { name: 'a.png', mimeType: 'image/png', buffer: PNG_1PX } },
  });
  expect(res.status()).toBe(403);
  expect((await page.request.get('/api/admin/vocab-factory')).status()).toBe(403);
});
