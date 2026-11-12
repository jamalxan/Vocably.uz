// "Oxirgi marta ko'rilgan" — suhbatdosh ilovadan chiqib ketgan lahza, uning oxirgi CHAT SO'ROVI vaqti emas.
// Ulangan socket hech qanday /api/chat/* so'rovi yubormaydi, shuning uchun ilovada soatlab o'tirgan
// odamning `lastActiveAt`i shuncha eskiradi; chiqib ketishi bilan sarlavhada "3 soat oldin" chiqardi.
// Ikki alohida kontekst, realtime server e2e/realtime-local.mjs (oflayn oynasi standart 20 s).
//   npx playwright test e2e/chat-last-seen.spec.ts --project=desktop
import { test, expect } from '@playwright/test';
import { E2E_CONVERSATION_ID, E2E_FREE_PHONE, E2E_FRIEND_USERNAME, E2E_PHONE } from './global-setup';
import { resetChatState, userIds, withDb } from './helpers/db';
import { REALTIME_URL, closeAll, openUser, realtimeUp, uzRe, waitSocket, type UserSession } from './helpers/twoUsers';

const HOUR_MS = 60 * 60 * 1000;
const JUST_LEFT = uzRe("oxirgi marta ko'rilgan 1 daqiqa oldin");

let sessions: UserSession[] = [];

test.beforeEach(async () => {
  sessions = [];
  await resetChatState([E2E_PHONE, E2E_FREE_PHONE], [E2E_CONVERSATION_ID]);
});

test.afterEach(async () => {
  await closeAll(...sessions);
  sessions = [];
});

test('a friend who has just left is "last seen 1 minute ago", however old their last chat request is', async ({ browser, isMobile }) => {
  test.skip(isMobile, 'two-context flows are checked on desktop');
  test.skip(!(await realtimeUp()), `realtime server is not running on ${REALTIME_URL}`);
  test.setTimeout(240_000);

  const friend = await openUser(browser, E2E_FREE_PHONE, '/app');
  sessions.push(friend);
  await waitSocket(friend.page);

  // The friend has been in the app, socket connected, for three hours without a chat request.
  const [friendId] = await userIds(E2E_FREE_PHONE);
  const lastActiveAgoMs = async () => {
    const doc = await withDb((db) => db.collection('users').findOne({ _id: friendId }));
    return Date.now() - new Date(doc!.lastActiveAt).getTime();
  };
  // The page's own start-up requests (/api/chat/me, unread, socket ticket) each refresh lastActiveAt
  // and may still be in flight — age it again until it stays aged.
  await expect(async () => {
    await withDb((db) => db.collection('users').updateOne({ _id: friendId }, { $set: { lastActiveAt: new Date(Date.now() - 3 * HOUR_MS) } }));
    await friend.page.waitForTimeout(3000);
    expect(await lastActiveAgoMs()).toBeGreaterThan(2 * HOUR_MS);
  }).toPass({ timeout: 45_000 });

  const user = await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`);
  sessions.push(user);
  const status = user.page.getByTestId('chat-status');
  await expect(status).toHaveText('Onlayn', { timeout: 60_000 });
  expect(await lastActiveAgoMs(), 'precondition: the stored activity is still hours old').toBeGreaterThan(2 * HOUR_MS);

  await friend.context.close();

  // Live: the header switches straight to the moment the friend left.
  await expect(status).toHaveText(JUST_LEFT, { timeout: 60_000 });

  // Stored: someone opening the chat later sees the same time.
  await expect.poll(lastActiveAgoMs, { timeout: 15_000 }).toBeLessThan(2 * 60 * 1000);
  await user.page.reload();
  await expect(status).toHaveText(JUST_LEFT, { timeout: 90_000 });
});
