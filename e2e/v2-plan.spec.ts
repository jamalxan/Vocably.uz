// Vocably 2.0 MVP: public onboarding quiz (/start) → saved after login, and the
// stored "Bugungi reja" card (GET /api/plan/today, manual tick for skill tasks).
import { test, expect } from '@playwright/test';
import { loginAs } from './auth';
import { E2E_FREE_PHONE, E2E_PHONE } from './global-setup';

test.describe('Vocably 2.0 — onboarding', () => {
  test('guest completes the quiz, sees prices, and the answers are saved after login', async ({ page }) => {
    await page.goto('/start');
    await page.getByRole('radio', { name: 'IELTS topshirish' }).click();
    await page.getByRole('radio', { name: 'Academic' }).click();
    await page.getByRole('radio', { name: '7.0' }).click();
    await page.getByRole('radio', { name: /Hali bilmayman/ }).click();
    await page.getByRole('radio', { name: /O'rta/ }).click();
    await page.getByRole('radio', { name: '40 daqiqa' }).click();
    await page.getByRole('radio', { name: 'Writing' }).click();
    await page.getByRole('button', { name: 'Testsiz davom etish' }).click();

    await expect(page.getByRole('heading', { name: 'Shaxsiy rejangiz tayyor' })).toBeVisible();
    // TZ §6.1.3: prices are on the result screen, not behind signup.
    await expect(page.getByText('129 000')).toBeVisible();
    await expect(page.getByText('69 000')).toBeVisible();

    // Reload keeps the result (resumable).
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Shaxsiy rejangiz tayyor' })).toBeVisible();

    // Log in → the dashboard posts the stored answers once.
    await loginAs(page, E2E_FREE_PHONE);
    const saved = page.waitForResponse((r) => r.url().endsWith('/api/onboarding') && r.request().method() === 'POST');
    await page.goto('/app');
    expect((await saved).ok()).toBeTruthy();
    const status = await page.request.get('/api/onboarding');
    expect((await status.json()).completed).toBe(true);
  });

  test('the onboarding API rejects incomplete answers', async ({ page }) => {
    await loginAs(page, E2E_FREE_PHONE);
    const r = await page.request.post('/api/onboarding', { data: { answers: { goal: 'ielts' } } });
    expect(r.status()).toBe(400);
  });
});

test.describe('Vocably 2.0 — today plan', () => {
  test('plan card shows stored tasks and a skill task can be ticked once', async ({ page }) => {
    await loginAs(page, E2E_PHONE);
    const res = await page.request.get('/api/plan/today');
    expect(res.ok()).toBeTruthy();
    const plan = await res.json();
    expect(plan.tasks.length).toBeGreaterThanOrEqual(3);
    expect(plan.tasks.length).toBeLessThanOrEqual(6);

    await page.goto('/app');
    const card = page.locator('section[aria-labelledby="plan-h"]');
    await expect(card).toBeVisible();
    const skill = plan.tasks.find((t: { type: string; status: string }) => t.type === 'skill' && t.status !== 'done');
    test.skip(!skill, 'skill task already done in this E2E database');

    await card.getByRole('button', { name: /^Bajardim:/ }).first().click();
    await expect(card.getByRole('status')).toContainText('XP');

    const second = await page.request.post(`/api/plan/tasks/${skill.key}/complete`);
    expect((await second.json()).xpPaid).toBe(0);
    const auto = await page.request.post('/api/plan/tasks/review/complete');
    expect([400, 404]).toContain(auto.status());
  });
});
