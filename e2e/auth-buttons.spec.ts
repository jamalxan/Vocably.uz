// Login / register buttons: every state a user can tap in must either act or say why it does not.
import { test, expect, type Page } from '@playwright/test';
import { E2E_PASSWORD, E2E_PHONE } from './global-setup';

const usable = (page: Page) => expect(page.locator('[aria-busy="false"]')).toBeVisible({ timeout: 45_000 });
const submit = (page: Page) => page.locator('form button[type=submit]');

// Hold the navigation into the app back, like a slow phone fetching the app bundle.
const holdApp = (page: Page, ms: number) =>
  page.route(
    (u) => u.pathname === '/app' || u.pathname.startsWith('/app/'),
    async (route) => {
      await new Promise((r) => setTimeout(r, ms));
      await route.continue().catch(() => {});
    }
  );

test('after a successful sign-in the button stays busy until the app is on screen', async ({ page }) => {
  await page.goto('/login');
  await usable(page);
  await holdApp(page, 3000);
  await page.locator('input[type=tel]').fill(E2E_PHONE);
  await page.locator('input[autocomplete="current-password"]').fill(E2E_PASSWORD);
  const answered = page.waitForResponse((r) => r.url().endsWith('/api/auth/login'));
  await submit(page).click();
  expect((await answered).status()).toBe(200);

  // The session exists but /app is still loading: an idle "Kirish" here reads as "nothing happened".
  await page.waitForTimeout(1000);
  expect(new URL(page.url()).pathname).toBe('/login');
  await expect(submit(page)).toBeDisabled();
  await page.waitForURL(/\/app/, { timeout: 45_000 });
});

test('a wrong password gives the button back with the reason', async ({ page }) => {
  await page.goto('/login');
  await usable(page);
  await page.locator('input[type=tel]').fill('+998 90 555 00 11');
  await page.locator('input[autocomplete="current-password"]').fill('not-the-password');
  await submit(page).click();
  await expect(page.locator('form').locator('xpath=..').getByRole('alert').first()).toBeVisible();
  await expect(submit(page)).toBeEnabled();
});

test('while a signed-in visitor is being sent on to the app, the form shows it is busy', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vocably_authed', '1'));
  await holdApp(page, 3000);
  await page.goto('/login');
  // Not ready: the card ignores taps, so the button must not look like one that can be pressed.
  await expect(page.locator('[aria-busy="true"]')).toBeVisible();
  await expect(submit(page)).toBeDisabled();
});

test.describe('Telegram button', () => {
  test('a popup the browser refuses to open does not leave the button spinning', async ({ page }) => {
    await page.goto('/login');
    await usable(page);
    const tg = page.getByTestId('telegram-login').getByRole('button');
    await expect(tg).toBeEnabled({ timeout: 30_000 }); // Telegram's script is in
    // In-app browsers and popup blockers: window.open returns null and Telegram's script never calls back.
    await page.evaluate(() => {
      window.open = () => null;
    });
    await tg.click();
    await expect(page.getByTestId('telegram-login').getByRole('alert')).toBeVisible();
    await expect(tg).toBeEnabled();
  });

  test("the page may ask Telegram for the sign-in result (its script's fallback when the popup cannot report back)", async ({ page }) => {
    const res = await page.goto('/login');
    const csp = res?.headers()['content-security-policy'] || '';
    const connect = csp.split(';').find((d) => d.trim().startsWith('connect-src')) || '';
    expect(connect).toContain('https://oauth.telegram.org');
  });
});
