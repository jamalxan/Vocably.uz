// TZ 2.0 §6.8.4 / §7 / §7.4: word duel — link duel played by two real users, friend invite,
// random matchmaking, server-side timing and access rules.
import { test, expect, type Page } from '@playwright/test';
import mongoose from 'mongoose';
import { loginAs } from './auth';
import { E2E_PHONE, E2E_FREE_PHONE, E2E_FRIEND_USERNAME } from './global-setup';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'duel flow checked on desktop');

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

async function reset() {
  await withDb(async (db) => {
    const users = await db.collection('users').find({ phone: { $in: [E2E_PHONE, E2E_FREE_PHONE] } }).toArray();
    const ids = users.map((u) => u._id);
    await db.collection('duels').deleteMany({ $or: [{ 'a.userId': { $in: ids } }, { 'b.userId': { $in: ids } }] });
    await db.collection('xpevents').deleteMany({ userId: { $in: ids }, sourceType: 'duel' });
    await db.collection('notifications').deleteMany({ userId: { $in: ids }, type: 'duel' });
    await db.collection('users').updateMany({ _id: { $in: ids } }, { $unset: { duel: '' }, $pull: { categories: { name: "So'z dueli: xatolar" } } as any });
  });
}
test.beforeAll(reset);
test.afterAll(reset);

/** Answers the 10 questions in the browser; `right(i)` decides whether to click the right option (read from the DB). */
async function playAll(page: Page, code: string, right: (i: number) => boolean) {
  for (let i = 0; i < 10; i++) {
    await expect(page.getByTestId('duel-qnum')).toHaveText(`${i + 1}/10`);
    const prompt = (await page.getByTestId('duel-prompt').textContent())!.trim();
    const q: any = await withDb(async (db) => (await db.collection('duels').findOne({ code }))!.questions[i]);
    expect(q.prompt).toBe(prompt);
    const options = page.getByTestId('duel-option');
    await expect(options).toHaveCount(4);
    const pick = right(i) ? q.answer : (q.answer + 1) % 4;
    await options.nth(pick).click();
  }
  await expect(page.getByTestId('duel-result')).toBeVisible({ timeout: 10_000 });
}

test('link duel: A creates and plays, B joins from the link, the winner is decided on the server', async ({ page, browser }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/games');
  await page.getByTestId('hub-duel').click();
  await expect(page).toHaveURL(/\/app\/duel$/);
  await expect(page.getByTestId('duel-rating')).toHaveText('1000');

  await page.getByRole('button', { name: /Havola orqali/ }).click();
  await expect(page).toHaveURL(/\/app\/duel\/[a-z0-9]{8}$/);
  const code = page.url().split('/').pop()!;
  await expect(page.getByTestId('duel-ready')).toBeVisible();

  // The browser never sees the answer key.
  const next = await page.request.post(`/api/duels/${code}/next`, { data: {} });
  const body = await next.json();
  expect(JSON.stringify(body)).not.toContain('"answer"');
  expect(body.question.index).toBe(0);
  expect((await page.request.post(`/api/duels/${code}/answer`, { data: { index: 1, choice: 0 } })).status()).toBe(409);

  await page.getByRole('button', { name: 'Boshlash' }).click();
  await playAll(page, code, () => true);
  await expect(page.getByTestId('duel-waiting')).toContainText("Hali hech kim qo'shilmadi");
  await expect(page.getByRole('link', { name: /Telegram/ })).toHaveAttribute('href', new RegExp(`t\\.me/share/url\\?url=.*duel%2F${code}`));

  // B opens the shared link.
  const ctx = await browser.newContext();
  const b = await ctx.newPage();
  await loginAs(b, E2E_FREE_PHONE);
  await b.goto(`/app/duel/${code}`);
  await expect(b.getByTestId('duel-join')).toBeVisible();
  await b.getByRole('button', { name: 'Qabul qilish' }).click();
  await playAll(b, code, (i) => i < 3);
  await expect(b.getByTestId('duel-verdict')).toHaveText('Bu safar raqib kuchliroq');
  await expect(b.getByTestId('duel-delta')).toHaveText('Reyting -16');
  await b.getByRole('button', { name: /Xato so'zlarni lug'atga qo'shish \(7\)/ }).click();
  await expect(b.getByTestId('duel-saved')).toBeVisible();
  const deck = await withDb(async (db) => {
    const u: any = await db.collection('users').findOne({ phone: E2E_FREE_PHONE });
    return u.categories.find((c: any) => c.name === "So'z dueli: xatolar");
  });
  expect(deck.words).toHaveLength(7);
  // A third person can't join a finished duel; B can't play again.
  expect((await b.request.post(`/api/duels/${code}/next`, { data: {} })).ok()).toBeTruthy();
  expect((await b.request.post(`/api/duels/${code}/answer`, { data: { index: 0, choice: 0 } })).status()).toBe(409);
  await ctx.close();

  await page.reload();
  await expect(page.getByTestId('duel-verdict')).toHaveText('Siz yutdingiz!');
  await expect(page.getByTestId('duel-delta')).toHaveText('Reyting +16');
  await page.goto('/app/duel');
  await expect(page.getByTestId('duel-rating')).toHaveText('1016');
  await expect(page.getByTestId('duel-list')).toContainText('G‘alaba');
  const n: any = await withDb(async (db) => db.collection('notifications').findOne({ type: 'duel', link: `/app/duel/${code}` }));
  expect(n.title).toContain('Siz yutdingiz');
});

test('friend duel by username: the friend sees the invite and can decline it', async ({ page, browser }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/duel');
  await page.getByLabel("Do'stni chaqirish").fill('no_such_user_e2e');
  await page.getByRole('button', { name: 'Chaqirish' }).click();
  await expect(page.getByTestId('duel-error')).toHaveText('Bunday foydalanuvchi topilmadi');

  await page.getByLabel("Do'stni chaqirish").fill(E2E_FRIEND_USERNAME);
  await page.getByRole('button', { name: 'Chaqirish' }).click();
  await expect(page).toHaveURL(/\/app\/duel\/[a-z0-9]{8}$/);
  const code = page.url().split('/').pop()!;

  const ctx = await browser.newContext();
  const f = await ctx.newPage();
  await loginAs(f, E2E_FREE_PHONE);
  await f.goto('/app/duel');
  await expect(f.getByTestId('duel-list')).toContainText('Sizni chaqirdi');
  await f.goto(`/app/duel/${code}`);
  await expect(f.getByTestId('duel-join')).toBeVisible();
  await f.getByRole('button', { name: 'Rad etish' }).click();
  await ctx.close();

  // The duel is closed for A too.
  await page.reload();
  await expect(page.getByTestId('duel-result')).toContainText('Do‘stingiz duelni rad etdi');
  await expect(page.getByTestId('duel-myscore')).toHaveCount(0);
});

test('random matchmaking pairs two players into one duel', async ({ page, browser }) => {
  await loginAs(page, E2E_PHONE);
  const first = await (await page.request.post('/api/duels', { data: { mode: 'random' } })).json();
  expect(first.matched).toBe(false);
  const ctx = await browser.newContext();
  const b = await ctx.newPage();
  await loginAs(b, E2E_FREE_PHONE);
  const second = await (await b.request.post('/api/duels', { data: { mode: 'random' } })).json();
  expect(second).toMatchObject({ matched: true, duel: { code: first.duel.code, side: 'b', canPlay: true } });
  await ctx.close();
});

test('anonymous requests are refused; a logged-out duel link returns to the duel after login', async ({ page, request }) => {
  expect((await request.get('/api/duels')).status()).toBe(401);
  expect((await request.post('/api/duels', { data: { mode: 'random' } })).status()).toBe(401);
  await page.goto('/app/duel/abcdefgh');
  await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fduel%2Fabcdefgh/);
});
