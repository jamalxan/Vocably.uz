// Kategoriya qo'shish granular endpoint orqali (POST /api/categories): serverdagi so'zlarga tegmaydi, _id server beradi.
import { expect, test } from '@playwright/test';
import { E2E_PASSWORD, E2E_PHONE } from './global-setup';

test.describe('kategoriyalar (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'kategoriya almashtirgich desktop sidebar/sarlavhasida');

  test('yangi kategoriya qo‘shiladi, yangilangandan keyin ham qoladi, mavjud so‘zlar o‘zgarmaydi', async ({ page }) => {
    const login = await page.request.post('/api/auth/login', { data: { phone: E2E_PHONE, password: E2E_PASSWORD } });
    expect(login.ok()).toBeTruthy();

    const wordsBefore = await (await page.request.get('/api/words')).json();
    const countBefore = wordsBefore.categories.reduce((n: number, c: any) => n + c.words.length, 0);
    const name = `E2E-kat-${Date.now() % 100000}`;

    await page.goto('/app/lugat/jadval');
    await page.getByRole('button', { name: /so'z$/ }).first().click(); // kategoriya almashtirgich (nom + "N so'z")
    await page.getByLabel('Yangi kategoriya nomi').fill(name);
    await page.getByLabel('Yangi kategoriya nomi').press('Enter');

    // Server holatida: kategoriya _id bilan bor, so'zlar soni o'zgarmagan
    await expect
      .poll(async () => (await (await page.request.get('/api/words')).json()).categories.some((c: any) => c.name === name && c._id), { timeout: 15_000 })
      .toBe(true);
    const after = await (await page.request.get('/api/words')).json();
    expect(after.categories.reduce((n: number, c: any) => n + c.words.length, 0)).toBe(countBefore);
    expect(after.categories).toHaveLength(wordsBefore.categories.length + 1);

    // Yangi kategoriyaga so'z qo'shish ishlaydi (client server bergan _id ni ishlatadi)
    const created = after.categories.find((c: any) => c.name === name);
    const add = await page.request.post('/api/words/add', { data: { categoryId: created._id, words: [{ word: 'newcatword', syns: ['sinov'] }] } });
    expect(add.ok()).toBeTruthy();

    // Tozalash: kategoriyani o'chirish (keyingi yugurishlar uchun holat toza qolsin)
    const del = await page.request.delete('/api/categories', { data: { categoryId: created._id } });
    expect(del.ok()).toBeTruthy();
  });
});
