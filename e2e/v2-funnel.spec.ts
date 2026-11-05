// TZ 2.0 §6.12.3: an anonymous visit to the landing and onboarding shows up in the admin sales funnel.
import { test, expect } from '@playwright/test';
import { loginAs } from './auth';
import { E2E_ADMIN_PHONE } from './global-setup';

test.skip(({ isMobile }) => isMobile, 'admin page checked on desktop');

test('anonymous landing → onboarding is counted once; admin sees the funnel', async ({ page, browser }) => {
  const admin = await (await browser.newContext()).newPage();
  await loginAs(admin, E2E_ADMIN_PHONE);
  const before = await (await admin.request.get('/api/admin/funnel?days=7')).json();
  const count = (r: any, k: string) => r.steps.find((s: any) => s.key === k).count;

  // /start sends two beacons (landing + onboarding_start); wait for both, then reload: same visitor, same day.
  const twoBeacons = () => {
    let n = 0;
    return page.waitForRequest((r) => r.url().endsWith('/api/funnel') && ++n === 2, { timeout: 15_000 });
  };
  let sent = twoBeacons();
  await page.goto('/start');
  await sent;
  sent = twoBeacons();
  await page.reload();
  await sent;

  await expect
    .poll(async () => count(await (await admin.request.get('/api/admin/funnel?days=7')).json(), 'onboarding_start'), { timeout: 15_000 })
    .toBe(count(before, 'onboarding_start') + 1);
  const after = await (await admin.request.get('/api/admin/funnel?days=7')).json();
  expect(count(after, 'landing')).toBe(count(before, 'landing') + 1);

  await admin.goto('/admin');
  const section = admin.getByRole('region', { name: 'Sotuv voronkasi' });
  await expect(section).toBeVisible();
  await expect(section.getByTestId('funnel-payment')).toBeVisible();

  // a regular user can't read it
  expect((await page.request.get('/api/admin/funnel')).status()).toBe(401);
});
