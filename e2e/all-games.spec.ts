// Har bir savol turi (tanlov / yozma / jumla) uchun umumiy haydovchi bilan P0 o'yinlarni oxirigacha o'tkazadi.
// Javoblar ataylab to'g'ri bo'lishi shart emas — tekshiriladigan narsa: UI ishlaydi, sessiya yakunlanadi, natija chiqadi.
import { expect, test, type Page } from '@playwright/test';
import { E2E_FREE_PHONE, E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

const GAMES = [
  'fill_gap',
  'listen_choose',
  'listen_type',
  'sentence_builder',
  'definition_challenge',
  'synonym_antonym',
];

// 2026-11-06 olib tashlangan eski 2D o'yinlar (yangi 3D o'yinlar o'rnini egalladi).
const RETIRED = ['word_match', 'memory', 'word_drop', 'speed_challenge', 'image_to_word', 'word_to_image', 'vocabulary_boss'];
const RETIRED_TITLES = ["So'z juftligi", 'Xotira kartalari', "So'z yomg'iri", 'Tezlik sinovi', "Rasm → so'z", "So'z → rasm", 'Vocabulary Boss'];

async function answerCurrent(page: Page, waitMs = 15_000) {
  const choice = page.getByRole('radiogroup', { name: 'Javob variantlari' });
  const typed = page.getByPlaceholder('Javobni yozing…');
  const arrange = page.locator('[aria-label="Mavjud so\'zlar"]');
  await expect(choice.or(typed).or(arrange).first()).toBeVisible({ timeout: waitMs });
  const check = page.getByRole('button', { name: 'Tekshirish' });

  if (await choice.isVisible()) {
    await choice.getByRole('radio').first().click();
  } else if (await typed.isVisible()) {
    await typed.fill('zzz');
    await check.click();
  } else {
    const avail = page.locator('[aria-label="Mavjud so\'zlar"] button');
    while ((await avail.count()) > 0) await avail.first().click();
    await check.click();
  }
}

test("free foydalanuvchiga pullik o'yin qulflangan: boshlash tugmasi yo'q, Tariflar havolasi bor", async ({ page }) => {
  await loginAs(page, E2E_FREE_PHONE);
  await page.goto('/app/games/sentence_builder');
  await expect(page.getByRole('link', { name: 'Tariflar' })).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole('button', { name: "O'yinni boshlash" })).toHaveCount(0);
});

test.describe("P0 o'yinlar (desktop)", () => {
  test.skip(({ isMobile }) => isMobile, 'mobil uchun asosiy oqim vocab-games.spec.ts da');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, E2E_PHONE);
  });

  for (const game of GAMES) {
    test(`${game} oxirigacha o'tadi`, async ({ page }) => {
      await page.goto(`/app/games/${game}`);
      const start = page.getByRole('button', { name: "O'yinni boshlash" });
      await expect(start).toBeVisible({ timeout: 45_000 });
      test.skip(await start.isDisabled(), `${game}: seed ma'lumotlari bilan mavjud emas`);
      // Ilovaning "juda tez-tez o'yin boshlayapsiz" himoyasi (anti-abuse): ketma-ket ko'p o'yin bir daqiqada boshlansa — kutib, qayta urinamiz.
      const tooFast = page.getByRole('alert').filter({ hasText: /Juda tez-tez/ });
      for (let attempt = 0; attempt < 4; attempt++) {
        await start.click();
        const started = await page.getByText(/Savol \d+ \/ \d+/).first().waitFor({ timeout: 8000 }).then(() => true, () => false);
        if (started || !(await tooFast.isVisible())) break;
        await page.waitForTimeout(20_000);
      }

      const counter = page.getByText(/Savol \d+ \/ \d+/);
      await expect(counter).toBeVisible({ timeout: 15_000 });
      const total = Number((await counter.textContent())!.match(/\/ (\d+)/)![1]);

      for (let i = 0; i < total; i++) {
        await expect(page.getByText(`Savol ${i + 1} / ${total}`)).toBeVisible();
        await answerCurrent(page);
        const next = page.getByRole('button', { name: /Keyingisi|Yakunlash/ });
        const after = i < total - 1 ? page.getByText(`Savol ${i + 2} / ${total}`) : page.getByText(/XP/).first();
        await expect(next.or(after)).toBeVisible({ timeout: 15_000 });
        if (await next.isVisible()) await next.click();
      }
      await expect(page.getByText(/XP/).first()).toBeVisible({ timeout: 15_000 });
    });
  }
});

test.describe("olib tashlangan eski o'yinlar", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, E2E_PHONE);
  });

  for (const game of RETIRED) {
    test(`${game}: eski havola o'yinlar ro'yxatiga yo'naltiriladi`, async ({ page }) => {
      await page.goto(`/app/games/${game}`);
      await expect(page).toHaveURL(/\/app\/games$/);
    });
  }

  test("o'yinlar ro'yxatida eski o'yinlar yo'q, yangi 3D o'yinlar bor", async ({ page }) => {
    await page.goto('/app/games');
    await expect(page.getByRole('link', { name: /Vocably Run/ }).first()).toBeVisible({ timeout: 45_000 });
    for (const title of RETIRED_TITLES) {
      await expect(page.getByRole('link', { name: new RegExp(`^${title}`) })).toHaveCount(0);
    }
  });
});
