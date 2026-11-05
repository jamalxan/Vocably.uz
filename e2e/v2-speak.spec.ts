// "Gapir yoki yiqil" (TZ 2.0 §7) with Chromium's fake microphone (a steady beep tone).
import { test, expect } from '@playwright/test';

test.use({ permissions: ['microphone'], launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } });

test.describe('Gapir yoki yiqil', () => {
  test('topic → calibration → live round → result with a pause map', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'fake microphone flags are Chromium-only');
    await page.goto('/games/speak');
    await expect(page.getByRole('heading', { name: 'Gapir yoki yiqil' })).toBeVisible();
    await page.getByRole('button', { name: 'Mavzuni olish' }).click();
    await expect(page.getByText('Gapiring:')).toBeVisible();
    await page.getByRole('button', { name: 'Gapirishni boshlash' }).click();
    // Chromium's fake mic plays a beep tone — the round starts after calibration.
    await expect(page.getByRole('meter', { name: 'Ovoz darajasi' })).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: 'Tugatish' }).click();
    await expect(page.getByText('Pauza xaritasi')).toBeVisible();
    await expect(page.getByText("To'xtatildi")).toBeVisible(); // early stop is not a win
    await expect(page.getByRole('link', { name: 'Natijangni saqlash va rejangni olish' })).toBeVisible();
    const card = page.getByRole('region', { name: 'Natija kartasi (9:16)' });
    const dl = page.waitForEvent('download');
    await card.getByRole('link', { name: 'Yuklab olish' }).click();
    const file = await dl;
    expect(file.suggestedFilename()).toMatch(/^vocably-speak-\d+s\.png$/);
    const fs = await import('node:fs/promises');
    const buf = await fs.readFile((await file.path())!);
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([1080, 1920]);
  });
});
