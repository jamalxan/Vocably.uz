// Har bir savol turi (tanlov / yozma / jumla / juftlash) uchun umumiy haydovchi bilan P0 o'yinlarni oxirigacha o'tkazadi.
// Javoblar ataylab to'g'ri bo'lishi shart emas — tekshiriladigan narsa: UI ishlaydi, sessiya yakunlanadi, natija chiqadi.
import { expect, test, type Page } from '@playwright/test';
import { E2E_FREE_PHONE, E2E_PASSWORD, E2E_PHONE } from './global-setup';

const GAMES = [
  'fill_gap',
  'listen_choose',
  'listen_type',
  'sentence_builder',
  'word_match',
  'memory',
  'definition_challenge',
  'synonym_antonym',
  'speed_challenge',
  'word_drop',
  'image_to_word',
  'word_to_image',
  'vocabulary_boss', // premium: aralash savol turlari, 25+ savol
];
const TIMED = new Set(['speed_challenge', 'word_drop', 'vocabulary_boss']);

// Xotira kartalari DOM'da faqat ochilganda matn ko'rsatadi; juftlik xaritasi esa sessiya javobida (`memoryMap`).
// Javobni tinglab, juft matnlarini (chap<->o'ng) yig'amiz va oddiy o'yinchidek: ochilganini eslab qolib, juftini ochamiz.
const memoryPartner = new Map<string, string>();

function collectMemoryPairs(node: any) {
  if (!node || typeof node !== 'object') return;
  if (node.memoryMap && Array.isArray(node.lefts) && Array.isArray(node.rights)) {
    for (const l of node.lefts) {
      const r = node.rights.find((x: any) => x.id === node.memoryMap[l.id]);
      if (r) {
        memoryPartner.set(l.text, r.text);
        memoryPartner.set(r.text, l.text);
      }
    }
  }
  for (const v of Object.values(node)) collectMemoryPairs(v);
}

async function playMemory(page: Page) {
  const cards = page.locator('button[aria-pressed]');
  const n = await cards.count();
  const known: (string | undefined)[] = Array(n).fill(undefined);
  const matched = new Set<number>();
  const flip = async (i: number) => {
    await cards.nth(i).click();
    await expect(cards.nth(i)).not.toHaveAttribute('aria-label', 'Yopiq karta');
    known[i] = (await cards.nth(i).getAttribute('aria-label')) || '';
    return known[i]!;
  };
  for (let guard = 0; guard < n * 3 && matched.size < n; guard++) {
    const p = [...Array(n).keys()].find((i) => !matched.has(i))!;
    const text = await flip(p);
    const want = memoryPartner.get(text);
    let q = known.findIndex((t, i) => i !== p && !matched.has(i) && t === want);
    if (q < 0) q = [...Array(n).keys()].find((i) => i !== p && !matched.has(i) && known[i] === undefined) ?? -1;
    if (q < 0) break;
    const other = await flip(q);
    if (other === want) {
      matched.add(p);
      matched.add(q);
      await page.waitForTimeout(450);
    } else await page.waitForTimeout(1000); // mos emas — kartalar yopilishini kutamiz
  }
}

async function answerCurrent(page: Page, waitMs = 15_000) {
  const choice = page.getByRole('radiogroup', { name: 'Javob variantlari' });
  const typed = page.getByPlaceholder('Javobni yozing…');
  const arrange = page.locator('[aria-label="Mavjud so\'zlar"]');
  const lefts = page.locator('[aria-label="So\'zlar"] button');
  const memory = page.getByText(/juftlik topildi/);
  await expect(choice.or(typed).or(arrange).or(lefts).or(memory).first()).toBeVisible({ timeout: waitMs });
  const check = page.getByRole('button', { name: 'Tekshirish' });

  if (await memory.isVisible()) {
    await playMemory(page);
  } else if (await choice.isVisible()) {
    await choice.getByRole('radio').first().click();
  } else if (await typed.isVisible()) {
    await typed.fill('zzz');
    await check.click();
  } else if (await arrange.isVisible()) {
    const avail = page.locator('[aria-label="Mavjud so\'zlar"] button');
    while ((await avail.count()) > 0) await avail.first().click();
    await check.click();
  } else {
    const rights = page.locator('[aria-label="Tarjimalar"] button');
    const n = await lefts.count();
    for (let i = 0; i < n; i++) {
      await lefts.nth(i).click();
      await rights.nth(i).click();
    }
    await check.click();
  }
}

test("free foydalanuvchiga pullik o'yin qulflangan: boshlash tugmasi yo'q, Tariflar havolasi bor", async ({ page }) => {
  const res = await page.request.post('/api/auth/login', { data: { phone: E2E_FREE_PHONE, password: E2E_PASSWORD } });
  expect(res.ok(), await res.text()).toBeTruthy();
  await page.goto('/app/oyinlar/sentence_builder');
  await expect(page.getByRole('link', { name: 'Tariflar' })).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole('button', { name: "O'yinni boshlash" })).toHaveCount(0);
});

test.describe("P0 o'yinlar (desktop)", () => {
  test.skip(({ isMobile }) => isMobile, 'mobil uchun asosiy oqim vocab-games.spec.ts da');

  test.beforeEach(async ({ page }) => {
    const res = await page.request.post('/api/auth/login', { data: { phone: E2E_PHONE, password: E2E_PASSWORD } });
    expect(res.ok(), await res.text()).toBeTruthy();
  });

  for (const game of GAMES) {
    test(`${game} oxirigacha o'tadi`, async ({ page }) => {
      if (TIMED.has(game) || game === 'memory') test.setTimeout(game === 'vocabulary_boss' ? 300_000 : 150_000); // taymer / karta aylanishi o'yinni uzaytiradi
      memoryPartner.clear();
      page.on('response', async (r) => {
        if (r.request().method() !== 'POST' || !r.url().includes('/api/games')) return;
        collectMemoryPairs(await r.json().catch(() => null));
      });
      await page.goto(`/app/oyinlar/${game}`);
      const start = page.getByRole('button', { name: "O'yinni boshlash" });
      await expect(start).toBeVisible({ timeout: 45_000 });
      test.skip(await start.isDisabled(), `${game}: seed ma'lumotlari bilan mavjud emas`);
      await start.click();

      const counter = page.getByText(/Savol \d+ \/ \d+/);
      await expect(counter).toBeVisible({ timeout: 15_000 });
      const total = Number((await counter.textContent())!.match(/\/ (\d+)/)![1]);

      const xp = page.getByText(/XP/).first();
      if (TIMED.has(game)) {
        // Taymer savolni o'zi almashtirishi mumkin — qat'iy indeks o'rniga holatga qarab harakat qilamiz.
        const next = page.getByRole('button', { name: /Keyingisi|Yakunlash/ });
        page.setDefaultTimeout(1500); // bloklangan (javoblangan) savolda click uzoq kutmasin
        for (let guard = 0; guard < total * 4 && !(await xp.isVisible()); guard++) {
          if (await next.isVisible()) await next.click({ timeout: 2000 }).catch(() => {});
          else await answerCurrent(page, 1500).catch(() => {});
          await page.waitForTimeout(150);
        }
        await expect(xp).toBeVisible({ timeout: 15_000 });
        return;
      }

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
