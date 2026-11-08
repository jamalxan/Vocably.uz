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

  test('a signed-in user opening /start from the dashboard sees no login / register prompts', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAs(page, E2E_FREE_PHONE);
    await page.goto('/app'); // sets the session flag, as a real visit does
    await expect.poll(() => page.evaluate(() => localStorage.getItem('vocably_authed')), { timeout: 20_000 }).toBe('1');
    await page.evaluate(() => localStorage.removeItem('vocably.onboarding.v1'));
    await page.goto('/start');
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: "Ilovaga o'tish" })).toHaveAttribute('href', '/app');
    await expect(header.getByRole('link', { name: 'Kirish' })).toHaveCount(0);
    await expect(header.getByRole('link', { name: 'Bepul boshlash' })).toHaveCount(0);

    await page.getByRole('radio', { name: 'IELTS topshirish' }).click();
    await page.getByRole('radio', { name: 'Academic' }).click();
    await page.getByRole('radio', { name: '7.0' }).click();
    await page.getByRole('radio', { name: /Hali bilmayman/ }).click();
    await page.getByRole('radio', { name: /O'rta/ }).click();
    await page.getByRole('radio', { name: '40 daqiqa' }).click();
    await page.getByRole('radio', { name: 'Writing' }).click();
    await page.getByRole('button', { name: 'Testsiz davom etish' }).click();
    await expect(page.getByRole('button', { name: 'Rejani saqlash' })).toBeVisible();
    await expect(page.getByRole('link', { name: /ro‘yxatdan o‘tish|Hisobim bor/ })).toHaveCount(0);
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
    // Wait for the stored plan, not the loading skeleton (first dev compile of the API is slow).
    await expect(card).not.toHaveAttribute('aria-busy', 'true', { timeout: 30_000 });
    const skill = plan.tasks.find((t: { type: string; status: string }) => t.type === 'skill' && t.status !== 'done');
    test.skip(!skill, 'skill task already done in this E2E database');

    const ticks = card.getByRole('button', { name: /^Bajardim:/ });
    const before = await ticks.count();
    const posted = page.waitForResponse((r) => r.url().includes('/api/plan/tasks/') && r.request().method() === 'POST');
    await ticks.first().click();
    const pr = await posted;
    expect(pr.ok(), `${pr.url()} → ${pr.status()} ${await pr.text()}`).toBeTruthy();
    await expect(ticks).toHaveCount(before - 1, { timeout: 15_000 });
    const after = await (await page.request.get('/api/plan/today')).json();
    expect(after.progress.xpEarned).toBeGreaterThanOrEqual(skill.xp);
    // TZ 2.0 §6.8.2: a done plan task makes today a streak day; the card shows it.
    expect(after.streakNow.todayDone).toBe(true);
    expect(after.streakNow.days).toBeGreaterThanOrEqual(1);
    await expect(card.getByText(/kunlik seriya/)).toBeVisible();

    const second = await page.request.post(`/api/plan/tasks/${skill.key}/complete`);
    expect((await second.json()).xpPaid).toBe(0);
    const auto = await page.request.post('/api/plan/tasks/review/complete');
    expect([400, 404]).toContain(auto.status());
  });
});

test.describe('Vocably 2.0 — writing word upgrades → SRS', () => {
  test('adds phrases to the system deck once and rejects junk', async ({ page }) => {
    await loginAs(page, E2E_PHONE);
    const items = [
      { original: 'a lot of', better: 'a considerable number of' },
      { original: 'big', better: 'substantial' },
    ];
    const first = await page.request.post('/api/words/upgrades', { data: { items } });
    expect(first.ok(), await first.text()).toBeTruthy();
    const j1 = await first.json();
    expect(j1.added + j1.skipped).toBe(2);

    const again = await page.request.post('/api/words/upgrades', { data: { items } });
    expect((await again.json()).added).toBe(0);

    const junk = await page.request.post('/api/words/upgrades', { data: { items: [{ original: '<b>x</b>', better: 'y'.repeat(200) }] } });
    expect(junk.status()).toBe(400);

    const cats = await page.request.get('/api/words');
    const body = await cats.json();
    const list = Array.isArray(body) ? body : body.categories || [];
    const deck = list.find((c: { name: string }) => c.name === "Writing: kuchliroq so'zlar");
    expect(deck).toBeTruthy();
  });
});

test.describe('Vocably 2.0 — SRS review modes', () => {
  test('"Yozish" asks for the word, grades it and remembers the mode', async ({ page }) => {
    await loginAs(page, E2E_PHONE);
    const words: { word: string; syns: string[] }[] = ((await (await page.request.get('/api/words')).json()).categories || [])
      .flatMap((c: { words: { word: string; syns: string[] }[] }) => c.words || []);
    await page.goto('/app/vocabulary/review');
    await page.getByRole('radio', { name: 'Yozish' }).click();
    const input = page.getByRole('textbox', { name: 'Inglizcha so‘zni yozing' });
    test.skip(!(await input.isVisible().catch(() => false)), 'no due words with a meaning in this E2E database');

    const meaning = (await page.locator('form p.text-accent').first().textContent())?.trim() || '';
    const target = words.find((w) => w.syns.join(', ') === meaning);
    expect(target, `word for meaning "${meaning}"`).toBeTruthy();

    await input.fill(target!.word);
    await page.getByRole('button', { name: 'Tekshirish' }).click();
    await expect(page.getByRole('status')).toContainText('To‘g‘ri!');
    const saved = page.waitForResponse((r) => r.url().endsWith('/api/words/review') && r.request().method() === 'PATCH');
    await page.getByRole('button', { name: 'Keyingi' }).click();
    const body = JSON.parse((await saved).request().postData() || '{}');
    expect(body).toMatchObject({ mode: 'typing', correct: true });
    expect([3, 4, 2]).toContain(body.rating);

    await page.reload();
    await expect(page.getByRole('radio', { name: 'Yozish' })).toHaveAttribute('aria-checked', 'true');
  });
});
