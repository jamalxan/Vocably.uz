// Vocably 2.0 typing flagships: So'z tunneli (/games/tunnel) and Word Defense (/games/defense).
// Guest rounds run on the device word bank; signed-in rounds are graded on the server, and the
// client never receives an answer before its first attempt. Headless Chromium renders WebGL with
// SwiftShader (→ tier 'none' → 2D), so `?render=low` forces the 3D scene to prove it boots under
// the production CSP; `?render=2d` pins the DOM renderer.
import { test, expect, type Page } from '@playwright/test';
import { loginAs } from './auth';
import { E2E_PHONE } from './global-setup';
import { SAMPLE_WORDS } from '../src/lib/vocab/fixtures';

/** Fields that must never reach the client before an answer is graded. */
const ANSWER_FIELDS = ['answer', 'accepted', 'answerTokens', 'answerMap', 'correctDisplay', 'word', 'wordId', 'categoryId', 'explanation'];
/** The server's "type the meaning" prompt is the first two translations (games.ts genSpellDrop). */
const BY_PROMPT = new Map(SAMPLE_WORDS.map((w) => [w.translations.slice(0, 2).join(', '), w.word]));
/** Server plausibility floor for a typed answer (antiCheat.minPlausibleMs). */
const floorMs = (prompt: string) => 900 + Math.min(1200, prompt.length * 6);
/**
 * Verdicts are also announced in a polite live region, which keeps the last one. A guest verdict
 * is instant, so on a loaded CI box the 1.8 s visual pill can be gone before click()/press()
 * returns; the announcement is the stable thing to assert on.
 */
const announced = (page: Page, re: RegExp) => page.locator('p[aria-live="polite"]').filter({ hasText: re });

/** Collects uncaught page errors and CSP violations; each test asserts the list stays empty. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    const t = m.text();
    if (/Refused to|Content Security Policy/i.test(t)) errors.push(`csp: ${t}`);
  });
  return errors;
}

function expectNoAnswers(session: { questions: Record<string, unknown>[] }) {
  expect(session.questions.length).toBeGreaterThan(0);
  for (const q of session.questions) {
    expect(q.inputType).toBe('typed');
    for (const k of ANSWER_FIELDS) expect(q[k], `${q.qid}.${k}`).toBeUndefined();
  }
  expect(JSON.stringify(session)).not.toMatch(/"accepted"|"correctDisplay"|"wordId"/);
}

async function endRound(page: Page) {
  await page.keyboard.press('Escape');
  const dialog = page.getByRole('dialog', { name: 'Pauza' }); // the pause dialog covers the whole stage
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Tugatish' }).click();
}

test.describe("So'z tunneli", () => {
  test('guest, 3D: the scene boots under the CSP, a wrong word is revealed, Esc pauses, the round ends with a card', async ({ page }) => {
    test.setTimeout(120_000); // SwiftShader renders the forced 3D scene on the CPU
    const errors = watchErrors(page);
    await page.goto('/games/tunnel?render=low');
    await expect(page.getByRole('heading', { level: 1, name: "So'z tunneli" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Ro'yxatdan o'tmasdan o'ynaysiz/)).toBeVisible();
    await page.getByRole('button', { name: 'Boshlash' }).click();

    const stage = page.getByRole('region', { name: "So'z tunneli" });
    const input = stage.getByRole('textbox', { name: "Inglizcha so'zni yozing" });
    await expect(input).toBeFocused(); // focus inside the click, so a phone keyboard opens
    await expect(stage.locator('canvas')).toHaveCount(1, { timeout: 20_000 });
    await expect(stage.getByText(/^(Ma'nosi|Definition)$/)).toBeVisible({ timeout: 10_000 });
    // a tap on the scene or the prompt keeps the focus (and a phone keyboard) on the input
    await stage.locator('canvas').click({ position: { x: 24, y: 24 } });
    await expect(input).toBeFocused();
    await stage.getByText(/^(Ma'nosi|Definition)$/).click();
    await expect(input).toBeFocused();

    await input.pressSequentially('zzzq', { delay: 40 });
    await input.press('Enter');
    await expect(announced(page, /^Xato\. To'g'risi: \S/)).toBeAttached({ timeout: 6_000 });

    await page.keyboard.press('Escape');
    const dialog = page.getByRole('dialog', { name: 'Pauza' });
    await expect(dialog).toBeVisible();
    // focus starts on Resume and Tab / Shift+Tab stay inside the dialog
    const resume = dialog.getByRole('button', { name: 'Davom etish' });
    await expect(resume).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Tugatish' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(resume).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Tugatish' })).toBeFocused();
    await resume.click();
    await expect(dialog).toBeHidden();
    await expect(input).toBeFocused();

    await endRound(page);
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    // focus moves to the result, whose heading reads out how the round ended and the score
    await expect(page.getByRole('heading', { level: 2 })).toBeFocused();
    await expect(page.getByRole('heading', { level: 2 })).toHaveAccessibleName(/^Raund tugadi\. Ball: \d+$/);
    await expect(page.getByText("Xato qilingan so'zlar")).toBeVisible();
    await expect(page.getByText('Siz yozdingiz: zzzq')).toBeVisible(); // the hidden stage keeps its 2D trail, so match the result line
    await expect(page.getByRole('link', { name: 'Natijangni saqlash va rejangni olish' })).toBeVisible();
    const card = page.getByRole('region', { name: 'Natija kartasi (9:16)' });
    await expect(card.getByRole('img', { name: 'Natija kartasi' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('guest, 2D: no WebGL canvas; skipping is offered after the floor and reveals the word', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/games/tunnel?render=2d');
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const stage = page.getByRole('region', { name: "So'z tunneli" });
    const skip = stage.getByRole('button', { name: "O'tkazish" });
    await expect(stage.getByText(/^(Ma'nosi|Definition)$/)).toBeVisible({ timeout: 10_000 });
    await expect(skip).toBeEnabled({ timeout: 5_000 });
    await skip.click();
    await expect(announced(page, /^O'tkazildi\. To'g'risi: \S/)).toBeAttached({ timeout: 6_000 });
    await expect(stage.locator('canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('guest, 2D: a round that ends by itself pays no bonus for skips, and Play again focuses the input', async ({ page }) => {
    test.setTimeout(120_000); // 20 skips, each after the plausibility floor
    const errors = watchErrors(page);
    await page.goto('/games/tunnel?render=2d');
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const stage = page.getByRole('region', { name: "So'z tunneli" });
    const skip = stage.getByRole('button', { name: "O'tkazish" });
    const result = page.getByRole('heading', { level: 2 });
    await expect(stage.getByText(/^(Ma'nosi|Definition)$/)).toBeVisible({ timeout: 10_000 });
    // Skip every word (20 for a guest): the round then ends on its own ("every word typed"), not
    // through "End round". Skip unlocks once the prompt's plausibility floor has passed.
    for (let i = 0; i < 25 && !(await result.isVisible()); i++) {
      const ready = await expect(skip).toBeEnabled({ timeout: 6_000 }).then(() => true, () => false);
      if (!ready) break; // the last word was sent and the round is ending
      await skip.click();
    }
    await expect(result).toHaveAccessibleName(/^Hamma so'z yozildi!\. Ball: 0$/, { timeout: 15_000 });
    await expect(page.getByText(/vaqt bonusi/)).toHaveCount(0); // 0 % accuracy earns no early-finish bonus

    await page.getByRole('button', { name: 'Yana o‘ynash' }).click();
    // The last round ended by itself, so its HUD said "ending": the input must still be focusable now.
    await expect(stage.getByRole('textbox', { name: "Inglizcha so'zni yozing" })).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('signed in: questions arrive without answers and a typed word is graded on the server', async ({ page }) => {
    const errors = watchErrors(page);
    await loginAs(page, E2E_PHONE);
    await page.goto('/app/games/word_tunnel?render=2d');
    await expect(page.getByText(/o'z lug'atingizdan/)).toBeVisible({ timeout: 20_000 });
    const started = page.waitForResponse((r) => r.url().includes('/api/games/word_tunnel/start'));
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const startRes = await started;
    expect(startRes.ok()).toBeTruthy();
    const session = await startRes.json();
    expectNoAnswers(session);

    const stage = page.getByRole('region', { name: "So'z tunneli" });
    const input = stage.getByRole('textbox', { name: "Inglizcha so'zni yozing" });
    const q = session.questions[0];
    await expect(stage.getByText(q.prompt, { exact: true })).toBeVisible({ timeout: 10_000 });
    const word = BY_PROMPT.get(q.prompt);
    const answered = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/answer`));
    if (word) await input.pressSequentially(word, { delay: 40 });
    else await input.pressSequentially('zzzq', { delay: 40 }); // a definition prompt (hard level): just check grading
    await input.press('Enter');
    const res = await answered;
    expect(res.ok()).toBeTruthy();
    const sent = res.request().postDataJSON().answers[0];
    expect(sent).toMatchObject({ qid: q.qid, attempt: 1 });
    expect(sent.isCorrect).toBeUndefined(); // the client sends raw text only
    expect(sent.responseMs).toBeGreaterThanOrEqual(floorMs(q.prompt) + 150); // a quick answer is held to the floor
    const graded = (await res.json()).results.find((r: { qid: string }) => r.qid === q.qid);
    expect(graded.isCorrect).toBe(Boolean(word));
    await expect(stage.getByText(word ? /^To'g'ri! \+\d+$/ : /^Xato\. To'g'risi: \S/)).toBeVisible();

    const completed = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/complete`));
    await endRound(page);
    expect((await completed).ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Bu raund tekshiruv uchun belgilandi')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe('Word Defense', () => {
  // Headless Chromium composites on the CPU (SwiftShader). At the Pixel 7's 2.625× a keystroke takes
  // seconds, so the targeted enemy reaches the base mid-word, which clears the field by design. The
  // forced low tier draws the canvas at DPR 1 anyway and the layout is in CSS px, so render at 1×.
  test.use({ deviceScaleFactor: 1 });

  test('guest, 3D: an enemy is targeted, a miss reveals the word and retyping it destroys the enemy', async ({ page }) => {
    test.setTimeout(120_000); // SwiftShader renders the forced 3D scene on the CPU
    const errors = watchErrors(page);
    await page.goto('/games/defense?render=low');
    await expect(page.getByRole('heading', { level: 1, name: 'Word Defense' })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Boshlash' }).click();

    const stage = page.getByRole('region', { name: 'Word Defense' });
    const input = stage.getByRole('textbox', { name: "Nishondagi so'zni inglizcha yozing" });
    await expect(input).toBeFocused();
    await expect(stage.locator('canvas')).toHaveCount(1, { timeout: 20_000 });
    const chips = stage.getByRole('group', { name: 'Nishon' }).getByRole('button');
    await expect(chips.first()).toBeVisible({ timeout: 10_000 });

    await input.pressSequentially('zzzq', { delay: 40 });
    // The first letter locks the target: the enemy closest to the base, which need not be the first
    // chip (chips are ordered by lane, and another enemy may spawn while the word is typed).
    await expect(stage.getByRole('group', { name: 'Nishon' }).getByRole('button', { pressed: true })).toHaveCount(1);
    await input.press('Enter');
    const reveal = stage.getByText(/^To'g'risi: \S/);
    await expect(reveal).toBeVisible({ timeout: 6_000 });
    const word = (await reveal.innerText()).replace(/^To'g'risi:\s*/, '').trim();
    expect(word.length).toBeGreaterThan(1);
    await input.pressSequentially(word, { delay: 30 });
    await input.press('Enter');
    await expect(announced(page, /^Tuzatildi! \+25$/)).toBeAttached({ timeout: 4_000 });

    await endRound(page);
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Xato qilingan so'zlar")).toBeVisible();
    await expect(page.getByText(word, { exact: true }).first()).toBeVisible(); // the missed word…
    await expect(page.getByText('Siz yozdingiz: zzzq')).toBeVisible(); // …and what was typed
    await expect(page.getByRole('region', { name: 'Natija kartasi (9:16)' }).getByRole('img', { name: 'Natija kartasi' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('signed in: answers carry no verdict, wait for the plausibility floor and are graded on the server', async ({ page }) => {
    const errors = watchErrors(page);
    await loginAs(page, E2E_PHONE);
    await page.goto('/app/games/word_defense?render=2d');
    await expect(page.getByText(/o'z lug'atingizdan/)).toBeVisible({ timeout: 20_000 });
    const started = page.waitForResponse((r) => r.url().includes('/api/games/word_defense/start'));
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const startRes = await started;
    expect(startRes.ok()).toBeTruthy();
    const session = await startRes.json();
    expectNoAnswers(session);

    const stage = page.getByRole('region', { name: 'Word Defense' });
    const input = stage.getByRole('textbox', { name: "Nishondagi so'zni inglizcha yozing" });
    const chip = stage.getByRole('group', { name: 'Nishon' }).getByRole('button').first();
    await expect(chip).toBeVisible({ timeout: 10_000 });
    const prompt = (await chip.getAttribute('aria-label'))!.replace(/^\d+-dushmanni nishonga olish: /, '');
    const q = session.questions.find((x: { prompt: string }) => x.prompt === prompt);
    expect(q).toBeTruthy();
    const word = BY_PROMPT.get(prompt);

    const answered = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/answer`));
    await input.pressSequentially(word || 'zzzq', { delay: 25 });
    await input.press('Enter');
    const res = await answered;
    expect(res.ok()).toBeTruthy();
    const sent = res.request().postDataJSON().answers[0];
    expect(sent.qid).toBe(q.qid);
    expect(sent.isCorrect).toBeUndefined();
    expect(sent.responseMs).toBeGreaterThanOrEqual(floorMs(prompt) + 150);
    const graded = (await res.json()).results.find((r: { qid: string }) => r.qid === q.qid);
    expect(graded.isCorrect).toBe(Boolean(word));
    await expect(stage.getByText(word ? /^Yo'q qilindi! \+\d+$/ : /^Xato\. To'g'risi: \S/)).toBeVisible();

    const completed = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/complete`));
    await endRound(page);
    expect((await completed).ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    expect(errors).toEqual([]);
  });
});
