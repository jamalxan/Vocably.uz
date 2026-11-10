// Vocably 2.0 flagships So'z orbitasi (/games/orbit) and So'z oroli (/games/island).
// Guest rounds run on the device word bank; signed-in rounds are graded on the server and the client
// never receives an answer before it picks. Headless Chromium renders WebGL with SwiftShader
// (→ tier 'none' → 2D), so `?render=low` forces the 3D scene to prove it boots under the production
// CSP; `?render=2d` pins the DOM renderer.
import { test, expect, type Page } from '@playwright/test';
import { loginAs } from './auth';
import { E2E_PHONE } from './global-setup';
import { SAMPLE_WORDS } from '../src/lib/vocab/fixtures';
import { blankSentence, findWordInSentence } from '../src/lib/vocab/games';

/** Fields that must never reach the client before an answer is graded. */
const ANSWER_FIELDS = ['answer', 'accepted', 'answerTokens', 'answerMap', 'correctDisplay', 'word', 'wordId', 'categoryId', 'explanation'];
/** Server plausibility floor for a choice answer (antiCheat.minPlausibleMs). */
const floorMs = (prompt: string) => 350 + Math.min(1200, prompt.length * 6);
/** The blanked sentence the server asks → the word that fills it (games.ts genFill). */
const BY_SENTENCE = new Map<string, string>();
for (const w of SAMPLE_WORDS) {
  for (const ex of w.examples || []) {
    const found = findWordInSentence(ex.en || '', w.word);
    if (found) BY_SENTENCE.set(blankSentence(ex.en, found), found.surface);
  }
}
/** Verdicts are also announced in a polite live region, which keeps the last one. */
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
    expect(q.inputType).toBe('choice');
    expect(q.options).toHaveLength(3);
    for (const k of ANSWER_FIELDS) expect(q[k], `${q.qid}.${k}`).toBeUndefined();
  }
  expect(JSON.stringify(session)).not.toMatch(/"accepted"|"correctDisplay"|"wordId"/);
}

async function endRound(page: Page) {
  await page.keyboard.press('Escape');
  const dialog = page.getByRole('dialog', { name: 'Pauza' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Raundni tugatish' }).click();
}

// Headless Chromium composites on the CPU; at the Pixel 7's 2.625× the forced 3D scenes starve the
// page. Real devices with a software renderer get 2D from detection (see v2-typing-games.spec.ts).
test.use({ deviceScaleFactor: 1 });

test.describe("So'z orbitasi", () => {
  const planets = (page: Page) => page.getByRole('button', { name: /^\d-sayyora: / });

  test('guest, 3D: the scene boots under the CSP, the planets unlock, a pick is graded, Esc pauses, the round ends with a card', async ({ page }) => {
    test.setTimeout(120_000); // SwiftShader renders the forced 3D scene on the CPU
    const errors = watchErrors(page);
    await page.goto('/games/orbit?render=low');
    await expect(page.getByRole('heading', { level: 1, name: "So'z orbitasi" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Ro'yxatdan o'tmasdan o'ynaysiz/)).toBeVisible();
    await page.getByRole('button', { name: 'Boshlash' }).click();

    const stage = page.getByRole('region', { name: "So'z orbitasi" });
    await expect(stage.locator('canvas')).toHaveCount(1, { timeout: 20_000 });
    await expect(stage.getByText("Gapni to'ldiring")).toBeVisible({ timeout: 10_000 });
    await expect(planets(page)).toHaveCount(3);
    // the words stay locked while the planets fly in (the server's floor for a choice answer)
    await expect(planets(page).first()).toBeEnabled({ timeout: 20_000 });
    await planets(page).nth(1).click();
    await expect(announced(page, /^To'g'ri!$|^Xato\. To'g'risi: \S/)).toBeAttached({ timeout: 8_000 });

    await page.keyboard.press('Escape');
    const dialog = page.getByRole('dialog', { name: 'Pauza' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Davom etish' })).toBeFocused();
    await expect(stage.getByText("Gapni to'ldiring")).toBeVisible(); // the label stays, the sentence is hidden
    await dialog.getByRole('button', { name: 'Davom etish' }).click();
    await expect(dialog).toBeHidden();

    await endRound(page);
    const result = page.getByRole('heading', { level: 2 });
    await expect(result).toBeVisible({ timeout: 15_000 });
    await expect(result).toBeFocused();
    await expect(result).toHaveText(/^\d+$/);
    await expect(page.getByText('Raund tugadi')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Natijangni saqlash va rejangni olish' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Natija kartasi (9:16)' }).getByRole('img', { name: 'Natija kartasi' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('guest, 2D: no WebGL canvas; the keyboard picks a planet; an empty tank costs a shield and shows the word', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/games/orbit?render=2d');
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const stage = page.getByRole('region', { name: "So'z orbitasi" });
    await expect(planets(page)).toHaveCount(3, { timeout: 20_000 });
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(stage.getByRole('img', { name: 'Qalqon: 3' })).toBeVisible();

    // the translation is offered as a hint and stays hidden until asked for
    await stage.getByRole('button', { name: 'Tarjima' }).click();
    await expect(stage.getByRole('button', { name: 'Tarjima' })).toHaveCount(0);

    await expect(planets(page).first()).toBeEnabled({ timeout: 10_000 });
    await page.keyboard.press('2');
    await expect(announced(page, /^To'g'ri!$|^Xato\. To'g'risi: \S/)).toBeAttached({ timeout: 6_000 });
    const afterPick = await stage.getByRole('img', { name: /^Qalqon: \d$/ }).getAttribute('aria-label');

    // next sentence: let the fuel run out (14 s at the start of a round)
    await expect(announced(page, /^Gapni to'ldiring: /)).toBeAttached({ timeout: 6_000 });
    await expect(announced(page, /^Yoqilg'i tugadi\. To'g'risi: \S/)).toBeAttached({ timeout: 25_000 });
    const left = Number(afterPick!.slice(-1)) - 1;
    await expect(stage.getByRole('img', { name: `Qalqon: ${left}` })).toBeVisible();

    await endRound(page);
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Xato qilingan so'zlar")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('signed in: sentences arrive without answers and the right planet is graded on the server', async ({ page }) => {
    const errors = watchErrors(page);
    await loginAs(page, E2E_PHONE);
    await page.goto('/app/games/word_orbit?render=2d');
    await expect(page.getByText(/o'z lug'atingizdagi so'zlarning misollaridan/)).toBeVisible({ timeout: 20_000 });
    const started = page.waitForResponse((r) => r.url().includes('/api/games/word_orbit/start'));
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const startRes = await started;
    expect(startRes.ok()).toBeTruthy();
    const session = await startRes.json();
    expectNoAnswers(session);
    for (const q of session.questions) expect(q.prompt).toContain('_____');
    expect(new Set(session.questions.map((q: { prompt: string }) => q.prompt)).size).toBe(session.questions.length);

    const stage = page.getByRole('region', { name: "So'z orbitasi" });
    const q = session.questions[0];
    const word = BY_SENTENCE.get(q.prompt);
    expect(word, `no fixture sentence for "${q.prompt}"`).toBeTruthy();
    const planet = stage.getByRole('button', { name: new RegExp(`^\\d-sayyora: ${word}$`) });
    await expect(planet).toBeEnabled({ timeout: 15_000 });
    const answered = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/answer`));
    await planet.click();
    const res = await answered;
    expect(res.ok()).toBeTruthy();
    const sent = res.request().postDataJSON().answers[0];
    expect(sent).toMatchObject({ qid: q.qid, attempt: 1 });
    expect(sent.isCorrect).toBeUndefined(); // the client sends the option id only
    expect(sent.responseMs).toBeGreaterThan(floorMs(q.prompt)); // the planets were locked past the floor
    const graded = (await res.json()).results.find((r: { qid: string }) => r.qid === q.qid);
    expect(graded.isCorrect).toBe(true);
    await expect(announced(page, /^To'g'ri!$/)).toBeAttached({ timeout: 6_000 });

    const completed = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/complete`));
    await endRound(page);
    expect((await completed).ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Bu raund tekshiruv uchun belgilandi')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("So'z oroli", () => {
  const words = (page: Page) => page.getByRole('button', { name: /^\d-so'z: / });

  /** Walks up and to the left from the spawn point until the first beacon opens its question. */
  async function walkToBeacon(page: Page) {
    await page.keyboard.down('KeyA');
    await page.keyboard.down('KeyW');
    await expect(words(page)).toHaveCount(3, { timeout: 20_000 });
    await page.keyboard.up('KeyA');
    await page.keyboard.up('KeyW');
  }

  test('guest, 2D map: walking to a beacon opens its question; a pick is graded and the beacon is resolved', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/games/island?render=2d');
    await expect(page.getByRole('heading', { level: 1, name: "So'z oroli" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Ro'yxatdan o'tmasdan o'ynaysiz/)).toBeVisible();
    await page.getByRole('button', { name: 'Boshlash' }).click();

    const stage = page.getByRole('region', { name: "So'z oroli" });
    await expect(stage.getByRole('img', { name: 'Mayoqlar: 0 / 8' })).toBeVisible({ timeout: 20_000 });
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(stage.getByText(/^Eng yaqin mayoq: \d+ m$/)).toBeVisible();
    await expect(words(page)).toHaveCount(0); // nothing is asked until the hero reaches a beacon

    await walkToBeacon(page);
    await expect(stage.getByText(/Ma'nosi|Definition/).first()).toBeVisible(); // the label sits next to an icon
    await expect(stage.getByText(/^Eng yaqin mayoq:/)).toHaveCount(0); // the guide hides while a beacon is open
    await expect(words(page).first()).toBeEnabled({ timeout: 10_000 }); // locked past the server floor
    await page.keyboard.press('1');
    await expect(announced(page, /^To'g'ri! Mayoq yondi$|^Xato\. To'g'risi: \S/)).toBeAttached({ timeout: 6_000 });
    const lit = (await announced(page, /^To'g'ri!/).count()) > 0;
    await expect(stage.getByRole('img', { name: `Mayoqlar: ${lit ? 1 : 0} / 8` })).toBeVisible();
    await expect(stage.getByRole('img', { name: `Jon: ${lit ? 3 : 2}` })).toBeVisible();
    // the sheet closes by itself and the hero can walk on; the resolved beacon is not asked again
    await expect(words(page)).toHaveCount(0, { timeout: 8_000 });
    await expect(stage.getByText(/^Eng yaqin mayoq: \d+ m$/)).toBeVisible();

    await page.keyboard.press('Escape');
    const dialog = page.getByRole('dialog', { name: 'Pauza' });
    await expect(dialog.getByRole('button', { name: 'Davom etish' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Raundni tugatish' }).click();
    const result = page.getByRole('heading', { level: 2 });
    await expect(result).toBeVisible({ timeout: 15_000 });
    await expect(result).toBeFocused();
    await expect(page.getByText(`${lit ? 1 : 0}/8`)).toBeVisible();
    await expect(page.getByRole('region', { name: 'Natija kartasi (9:16)' }).getByRole('img', { name: 'Natija kartasi' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('guest, 2D map: a tap on the map walks the hero to a beacon', async ({ page }) => {
    await page.goto('/games/island?render=2d');
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const stage = page.getByRole('region', { name: "So'z oroli" });
    await expect(stage.getByRole('img', { name: 'Mayoqlar: 0 / 8' })).toBeVisible({ timeout: 20_000 });
    // The map is a square centred on the tower; its half-width is walkRadius + 4.5 = 17.7 world units.
    // Beacon 1 stands at (−5.4, 6.2).
    const map = stage.locator('div.aspect-square');
    const box = (await map.boundingBox())!;
    await page.mouse.click(box.x + box.width * (0.5 + -5.4 / 17.7 / 2), box.y + box.height * (0.5 + 6.2 / 17.7 / 2));
    await expect(words(page)).toHaveCount(3, { timeout: 20_000 });
  });

  test('guest, 3D: the island boots under the CSP and a beacon opens when the hero reaches it', async ({ page }) => {
    test.setTimeout(120_000); // SwiftShader renders the forced 3D scene on the CPU
    const errors = watchErrors(page);
    await page.goto('/games/island?render=low');
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const stage = page.getByRole('region', { name: "So'z oroli" });
    await expect(stage.locator('canvas')).toHaveCount(1, { timeout: 20_000 });
    await expect(stage.getByRole('img', { name: 'Mayoqlar: 0 / 8' })).toBeVisible({ timeout: 20_000 });
    await walkToBeacon(page);
    await expect(words(page).first()).toBeEnabled({ timeout: 30_000 });
    await words(page).first().click();
    await expect(announced(page, /^To'g'ri! Mayoq yondi$|^Xato\. To'g'risi: \S/)).toBeAttached({ timeout: 10_000 });
    expect(errors).toEqual([]);
  });

  test('signed in: one question per beacon arrives without answers and a pick is graded on the server', async ({ page }) => {
    const errors = watchErrors(page);
    await loginAs(page, E2E_PHONE);
    await page.goto('/app/games/word_island?render=2d');
    await expect(page.getByText(/o'z lug'atingizdan olinadi/)).toBeVisible({ timeout: 20_000 });
    const started = page.waitForResponse((r) => r.url().includes('/api/games/word_island/start'));
    await page.getByRole('button', { name: 'Boshlash' }).click();
    const startRes = await started;
    expect(startRes.ok()).toBeTruthy();
    const session = await startRes.json();
    expectNoAnswers(session);
    expect(session.questions).toHaveLength(8);

    const stage = page.getByRole('region', { name: "So'z oroli" });
    await walkToBeacon(page);
    // beacon 1 asks the first question of the session
    const q = session.questions[0];
    await expect(stage.getByText(q.prompt, { exact: true })).toBeVisible();
    await expect(words(page).first()).toBeEnabled({ timeout: 10_000 });
    const answered = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/answer`));
    await words(page).first().click();
    const res = await answered;
    expect(res.ok()).toBeTruthy();
    const sent = res.request().postDataJSON().answers[0];
    expect(sent).toMatchObject({ qid: q.qid, attempt: 1, answer: q.options[0].id });
    expect(sent.isCorrect).toBeUndefined();
    expect(sent.responseMs).toBeGreaterThan(floorMs(q.prompt));
    const graded = (await res.json()).results.find((r: { qid: string }) => r.qid === q.qid);
    // the screen shows what the server decided, not a guess of its own
    await expect(announced(page, graded.isCorrect ? /^To'g'ri! Mayoq yondi$/ : /^Xato\. To'g'risi: \S/)).toBeAttached({ timeout: 6_000 });
    await expect(stage.getByRole('img', { name: `Mayoqlar: ${graded.isCorrect ? 1 : 0} / 8` })).toBeVisible();

    await expect(words(page)).toHaveCount(0, { timeout: 8_000 });
    const completed = page.waitForResponse((r) => r.url().includes(`/api/games/sessions/${session.sessionId}/complete`));
    await endRound(page);
    expect((await completed).ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Bu raund tekshiruv uchun belgilandi')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
