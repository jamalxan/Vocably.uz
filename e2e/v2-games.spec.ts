// Vocably 2.0 flagship game Vocably Run (guest + signed-in, server-graded), plus saving a
// guest's missed words after login. "Gapir yoki yiqil" is in v2-speak.spec.ts (needs a fake mic).
import { test, expect } from '@playwright/test';
import { loginAs } from './auth';
import { E2E_FREE_PHONE, E2E_PHONE } from './global-setup';

const lanes = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /^(\d)-yo'lak:/ });

test.describe('Vocably Run', () => {
  test('a guest plays without an account; each gate is graded and the HUD updates', async ({ page }) => {
    await page.goto('/games/run');
    await expect(page.getByRole('heading', { name: 'Vocably Run' })).toBeVisible();
    await expect(page.getByText(/Ro'yxatdan o'tmasdan o'ynaysiz/)).toBeVisible();
    await page.getByRole('button', { name: 'Boshlash' }).click();

    await expect(lanes(page)).toHaveCount(3);
    await expect(page.getByText(/Ma'nosi|Definition/).first()).toBeVisible();
    // Keyboard moves the lane (aria-pressed follows).
    await page.keyboard.press('ArrowLeft');
    await expect(lanes(page).first()).toHaveAttribute('aria-pressed', 'true');
    await lanes(page).nth(2).click();
    await expect(lanes(page).nth(2)).toHaveAttribute('aria-pressed', 'true');
    // First gate arrives after ~4.2 s and shows a verdict.
    await expect(page.getByRole('region', { name: 'Vocably Run' }).getByText(/^To'g'ri!$|^Xato\. To'g'risi:/)).toBeVisible({ timeout: 8_000 });

    // Pause stops the clock.
    await page.getByRole('button', { name: 'Pauza' }).click();
    await expect(page.getByRole('button', { name: 'Davom etish' })).toBeVisible();
  });

  test('signed in: the round uses the server session and answers are graded there', async ({ page }) => {
    await loginAs(page, E2E_PHONE);
    await page.goto('/app/games/vocably_run');
    await expect(page.getByText(/o'z lug'atingizdan/)).toBeVisible();
    const started = page.waitForResponse((r) => r.url().includes('/api/games/vocably_run/start'));
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const startRes = await started;
    expect(startRes.ok()).toBeTruthy();
    const session = await startRes.json();
    // The client view must not reveal the right lane.
    for (const q of session.questions) {
      expect(q.options).toHaveLength(3);
      expect(q.word).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(q.answer).toBeUndefined();
    }
    const answered = await page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/answer`), { timeout: 10_000 });
    expect(answered.ok()).toBeTruthy();
    const body = await answered.json();
    expect(typeof body.results[0].isCorrect).toBe('boolean');
    await expect(page.getByRole('region', { name: 'Vocably Run' }).getByText(/^To'g'ri!$|^Xato\. To'g'risi:/)).toBeVisible();
  });

  test('signed in: a short round (3 lives lost) completes on the server and reports the mistakes', async ({ page }) => {
    await loginAs(page, E2E_PHONE);
    const start = await page.request.post('/api/games/vocably_run/start', { data: { difficulty: 'easy' } });
    expect(start.ok()).toBeTruthy();
    const session = await start.json();
    // Answer the first few gates with every lane in turn: some must be wrong.
    const answers = session.questions.slice(0, 6).map((q: { qid: string; options: { id: string }[] }, i: number) => ({ qid: q.qid, answer: q.options[i % 3].id, responseMs: 2500 + i * 100 }));
    const ans = await page.request.post(`/api/games/sessions/${session.sessionId}/answer`, { data: { answers } });
    expect(ans.ok()).toBeTruthy();
    const graded = (await ans.json()).results;
    expect(graded).toHaveLength(6);
    const done = await page.request.post(`/api/games/sessions/${session.sessionId}/complete`, { data: {} });
    expect(done.ok()).toBeTruthy();
    const r = await done.json();
    expect(typeof r.xp.earned).toBe('number');
    const wrong = graded.filter((g: { isCorrect: boolean }) => !g.isCorrect).length;
    expect(wrong).toBeGreaterThan(0); // lanes 0,1,2,0,1,2 can't all be right
    expect(r.mistakes.length).toBeGreaterThan(0);
    expect(r.mistakes.length).toBeLessThanOrEqual(wrong);
  });

  test('missed words from a guest round are saved to a deck after login (bank words only)', async ({ page }) => {
    await loginAs(page, E2E_FREE_PHONE);
    const bad = await page.request.post('/api/flagship/run/claim', { data: { words: ['<script>', 'notaword'] } });
    expect(bad.status()).toBe(400);

    // Simulate a finished guest round, then open the dashboard (it claims once).
    await page.goto('/games/run');
    await page.evaluate(() => localStorage.setItem('vocably.run.guest.v1', JSON.stringify({ words: ['mitigate', 'ubiquitous', 'hack'], at: Date.now(), claimed: false })));
    const claimed = page.waitForResponse((r) => r.url().endsWith('/api/flagship/run/claim'));
    await page.goto('/app');
    const res = await claimed;
    expect(res.ok()).toBeTruthy();
    const j = await res.json();
    expect(j.added + j.skipped).toBe(2); // "hack" is not in the public bank
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vocably.run.guest.v1') || '{}').claimed)).toBe(true);

    const words = await (await page.request.get('/api/words')).json();
    const deck = words.categories.find((c: { name: string }) => c.name === 'Vocably Run: xatolar');
    expect(deck.words.map((w: { word: string }) => w.word)).toEqual(expect.arrayContaining(['mitigate', 'ubiquitous']));
  });
});
