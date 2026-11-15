// Chatdagi kun yorlig'i interfeys tilida va qurilmaning vaqt zonasida chiqadi. Avval o'zbekchadan boshqa
// har qanday til inglizcha oy nomini olardi (ruscha interfeysda "September 29"), sana esa Toshkent
// vaqtida hisoblanardi — xabar soati va "Bugun"/"Kecha" esa qurilma vaqtida.
//   npx playwright test e2e/chat-date-locale.spec.ts --project=desktop
import { test, expect, type Browser } from '@playwright/test';
import { E2E_PHONE, E2E_THIRD_PHONE, E2E_THIRD_USERNAME, E2E_USER_THIRD_CONVERSATION_ID } from './global-setup';
import { loginAs } from './auth';
import { oid, userIds, withDb } from './helpers/db';

// 23:30 in Moscow on 29 September, already 01:30 on 30 September in Tashkent. A past year, so the
// label always carries the year.
const SENT_AT = new Date('2025-09-29T20:30:00Z');
const TEXT = 'date-locale probe';

test.beforeEach(async () => {
  const [thirdId] = await userIds(E2E_THIRD_PHONE);
  await withDb(async (db) => {
    const messages = db.collection('messages');
    // Only this conversation's history: the probe has to be on the first loaded page.
    await messages.deleteMany({ conversationId: oid(E2E_USER_THIRD_CONVERSATION_ID) });
    await messages.insertOne({
      conversationId: oid(E2E_USER_THIRD_CONVERSATION_ID),
      senderId: thirdId,
      type: 'text',
      text: TEXT,
      readAt: SENT_AT,
      reactions: [],
      deletedFor: [],
      deletedForEveryone: false,
      createdAt: SENT_AT,
      updatedAt: SENT_AT,
    });
  });
});

test.afterEach(async () => {
  await withDb((db) => db.collection('messages').deleteMany({ conversationId: oid(E2E_USER_THIRD_CONVERSATION_ID), text: TEXT }));
});

const langCookie = (value: string) => ({ name: 'vocably_lang', value, domain: 'localhost', path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' as const });

async function openChat(browser: Browser, lang: string) {
  // loginAs caches every cookie of the context it first logs in from and replays them later, the
  // language cookie included. Log in as "uz" (what every other spec uses), then switch.
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    timezoneId: 'Europe/Moscow',
    storageState: { cookies: [langCookie('uz')], origins: [] },
  });
  const page = await context.newPage();
  await loginAs(page, E2E_PHONE);
  await context.addCookies([langCookie(lang)]);
  await page.goto(`/app/friends/${E2E_THIRD_USERNAME}`);
  await expect(page.locator('[data-msg-id]').filter({ hasText: TEXT })).toBeVisible({ timeout: 60_000 });
  return { context, page };
}

for (const [lang, label] of [
  ['ru', '29 сентября 2025 г.'],
  ['en', 'September 29, 2025'],
] as const) {
  test(`the day label is in the interface language and the device time zone (${lang})`, async ({ browser, isMobile }) => {
    test.skip(isMobile, 'the label is the same component on mobile');
    test.setTimeout(120_000);
    const { context, page } = await openChat(browser, lang);
    try {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    } finally {
      await context.close();
    }
  });
}
