// Vocabulary World (3D hub): sahna yuklanadi, personaj klaviatura bilan yuradi va
// portal haqiqiy o'yin sahifasiga (/app/games/:key) olib boradi.
import { expect, test } from '@playwright/test';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test.describe('Vocabulary World', () => {
  // Dev-server birinchi ochilishda sahifa va API'larni kompilyatsiya qiladi; WebGL (SwiftShader) ham sekin.
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await loginAs(page, E2E_PHONE);
  });

  test('3D world renders with HUD and no page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/app/vocabulary-world');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByRole('img', { name: /xarita|карта/i })).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible({ timeout: 60_000 });
    expect(errors).toEqual([]);
  });

  test('keyboard moves the player (minimap marker follows)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'klaviatura — desktop');
    await page.goto('/app/vocabulary-world');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 90_000 });
    const marker = page.locator('svg[role="img"] g');
    const before = await marker.getAttribute('transform');
    await page.locator('canvas').click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1200);
    await page.keyboard.up('KeyW');
    await expect.poll(() => marker.getAttribute('transform')).not.toBe(before);
  });

  test('portal opens the real game page', async ({ page, isMobile }) => {
    test.skip(isMobile, "portallar ro'yxati — md+ ekranda");
    await page.goto('/app/vocabulary-world');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 90_000 });
    await page.getByRole('button', { name: /Xotira kartalari/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /O'yinga kirish|Batafsil/ }).click();
    await expect(page).toHaveURL(/\/app\/games\/memory$/, { timeout: 90_000 });
  });
});
