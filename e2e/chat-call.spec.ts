// 1:1 qo'ng'iroqlar, ikki (uch) haqiqiy brauzer konteksti bilan (CALLS_SPEC §15.3, PARITY_PLAN WP9).
// Kerak: lokal realtime server (e2e/realtime-local.mjs, playwright.config.ts uni o'zi ko'taradi) qisqa
// taymerlar bilan (ring 8 s, connect 15 s, grace 8 s) va Next server realtime env bilan
// (NEXT_PUBLIC_REALTIME_URL, REALTIME_INTERNAL_URL, REALTIME_SHARED_SECRET, NEXT_PUBLIC_E2E_HOOKS=1).
// Ishga tushirish: `npm run e2e:chat` yoki
//   npx playwright test e2e/chat-call.spec.ts --project=desktop --output=test-results/call
// Hech qanday qat'iy kutish yo'q: DOM (CS §10 testid'lari), window.__vocablyCall hook'i va Mongo'dagi
// `type:'call'` yozuvlari bo'yicha expect.poll. Har test o'z kontekstlarini yopadi va server `calls: 0`
// bo'lishini kutadi, shuning uchun testlar bir-biriga bog'liq emas.
import { test, expect, type Page } from '@playwright/test';
import {
  E2E_CONVERSATION_ID,
  E2E_FREE_PHONE,
  E2E_FRIEND_USERNAME,
  E2E_PHONE,
  E2E_THIRD_FRIEND_CONVERSATION_ID,
  E2E_THIRD_PHONE,
  E2E_USERNAME,
} from './global-setup';
import { conversationDoc, latestCallRow, markAllRead, resetChatState, userIds, type CallRow } from './helpers/db';
import {
  FAKE_MEDIA,
  REALTIME_URL,
  callStatus,
  callStatusEl,
  closeAll,
  expectActive,
  expectNoOverlay,
  inboundPackets,
  openPair,
  openThird,
  openUser,
  pcState,
  realtimeUp,
  recordStates,
  seenStates,
  uzRe,
  waitCallReady,
  waitSocket,
  type UserSession,
} from './helpers/twoUsers';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'calls are desktop-only in E2E (manual device matrix: CS §15.4)');
test.use(FAKE_MEDIA);
test.setTimeout(90_000);

const RT_SECRET = process.env.REALTIME_SHARED_SECRET || 'e2e-realtime-secret';
const PHONES = [E2E_PHONE, E2E_FREE_PHONE, E2E_THIRD_PHONE];
const CONVS = [E2E_CONVERSATION_ID, E2E_THIRD_FRIEND_CONVERSATION_ID];

let sessions: UserSession[] = [];
const track = <T extends UserSession>(s: T): T => {
  sessions.push(s);
  return s;
};

test.beforeAll(async () => {
  test.skip(!(await realtimeUp()), `realtime server is not running on ${REALTIME_URL} (npm ci --prefix realtime-server; see playwright.config.ts)`);
  await resetChatState(PHONES, CONVS, { dropCalls: true });
});

test.beforeEach(async () => {
  sessions = [];
  // call-invite 10/min va socket-ticket limitlari ketma-ket testlarda to'lib qolmasin.
  await resetChatState(PHONES, CONVS);
});

test.afterEach(async () => {
  await closeAll(...sessions);
  sessions = [];
  // Yopilgan kontekstlar socket'lari uziladi: ringing -> darhol, active -> grace (8 s) tugagach yakunlanadi.
  await expect
    .poll(async () => (await fetch(`${REALTIME_URL}/health`).then((r) => r.json()).catch(() => ({ calls: -1 }))).calls, { timeout: 30_000 })
    .toBe(0);
});

/** `since` dan keyin yozilgan qo'ng'iroq yozuvi kerakli natija bilan paydo bo'lguncha kutadi. */
async function waitCallRow(conversationId: string, since: Date, outcome: string): Promise<CallRow> {
  let row: CallRow | null = null;
  await expect
    .poll(async () => (row = await latestCallRow(conversationId, since))?.call.outcome ?? null, { timeout: 25_000, message: `call row ${outcome}` })
    .toBe(outcome);
  return row!;
}

/** Shu qo'ng'iroq yozuvining pufakchasi (CS §10.8, data-msg-id = Mongo _id). */
const callBubble = (page: Page, row: CallRow) =>
  page.locator(`[data-msg-id="${row._id}"][data-testid="call-message"], [data-msg-id="${row._id}"] [data-testid="call-message"]`);

async function internalCallOf(userId: string) {
  const r = await fetch(`${REALTIME_URL}/internal/calls/${userId}`, { headers: { 'X-Internal-Secret': RT_SECRET } });
  return r.json() as Promise<{ inCall: boolean; state?: string }>;
}

/** user -> friend audio qo'ng'iroq, friend qabul qiladi, ikkalasi `active`. */
async function startActiveAudio(caller: Page, callee: Page) {
  await caller.getByTestId('call-audio-button').click();
  await expect(callee.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await callee.getByTestId('call-accept').click();
  await expectActive(caller, callee);
}

test('1. audio: ring -> accept -> connected -> hangup leaves an "ended" bubble with duration on both sides', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);

  await user.page.getByTestId('call-audio-button').click();
  const incoming = friend.page.getByTestId('incoming-call');
  await expect(incoming).toBeVisible({ timeout: 10_000 });
  await expect(incoming).toContainText(new RegExp(`E2E|${E2E_USERNAME}`));
  await expect(incoming).toContainText(uzRe("Kiruvchi qo'ng'iroq"));
  // Qo'ng'iroq qiluvchi "jiringlamoqda" holatini ko'radi (callee tab'i call:ringing yubordi).
  await expect(callStatusEl(user.page)).toContainText(/Jiringlamoqda|Ringing/, { timeout: 10_000 });

  await friend.page.getByTestId('call-accept').click();
  await expectActive(user.page, friend.page);
  await expect(user.page.getByTestId('remote-audio')).toBeAttached();
  await expect(friend.page.getByTestId('remote-audio')).toBeAttached();
  await expect.poll(() => inboundPackets(user.page, 'audio'), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect.poll(() => inboundPackets(friend.page, 'audio'), { timeout: 15_000 }).toBeGreaterThan(0);
  await expect(callStatusEl(user.page)).toContainText(/0:0[3-9]/, { timeout: 15_000 });

  await user.page.getByTestId('call-end').click();
  await expectNoOverlay(user.page);
  await expectNoOverlay(friend.page);

  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
  expect(row.call.kind).toBe('audio');
  expect(row.call.durationSec).toBeGreaterThanOrEqual(2);
  expect(row.readAt).not.toBeNull();
  const [userId] = await userIds(E2E_PHONE);
  expect(String(row.senderId)).toBe(String(userId));
  const convo = await conversationDoc(E2E_CONVERSATION_ID);
  expect(convo?.lastMessagePreview).toMatch(new RegExp(`^${uzRe("📞 Qo'ng'iroq").source} \\(\\d+:\\d\\d\\)$`));

  const mine = callBubble(user.page, row);
  const theirs = callBubble(friend.page, row);
  await expect(mine).toBeVisible({ timeout: 15_000 });
  await expect(theirs).toBeVisible({ timeout: 15_000 });
  await expect(mine).toHaveAttribute('data-call-outcome', 'ended');
  await expect(mine).toHaveAttribute('data-call-kind', 'audio');
  await expect(mine).toContainText(uzRe("Chiquvchi qo'ng'iroq"));
  await expect(theirs).toContainText(uzRe("Kiruvchi qo'ng'iroq"));
  await expect(mine).toContainText(/\d+:\d\d/);
  await expect(theirs).toContainText(/\d+:\d\d/);
});

test('2. callee declines -> "declined" on the caller, declined bubbles on both sides', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);

  // friend qo'ng'iroq qiladi (invite limiti bitta foydalanuvchida to'planmasin), user rad etadi.
  await recordStates(friend.page);
  await friend.page.getByTestId('call-audio-button').click();
  await expect(user.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await user.page.getByTestId('call-decline').click();
  await expect(user.page.getByTestId('incoming-call')).toHaveCount(0);

  await expect(callStatusEl(friend.page)).toHaveAttribute('data-state', 'ended', { timeout: 10_000 });
  await expect(callStatusEl(friend.page)).toContainText(uzRe('Rad etildi'));
  await expectNoOverlay(friend.page);

  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'declined');
  expect(row.call.durationSec).toBeNull();
  await expect(callBubble(friend.page, row)).toContainText(uzRe("Rad etilgan qo'ng'iroq"), { timeout: 15_000 });
  await expect(callBubble(user.page, row)).toContainText(uzRe("Rad etilgan qo'ng'iroq"), { timeout: 15_000 });
});

test('3. caller cancels while ringing -> callee incoming disappears, cancelled/missed bubbles', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);

  await user.page.getByTestId('call-audio-button').click();
  await expect(friend.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await user.page.getByTestId('call-end').click();
  await expect(friend.page.getByTestId('incoming-call')).toHaveCount(0, { timeout: 10_000 });
  await expectNoOverlay(user.page);

  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'cancelled');
  await expect(callBubble(user.page, row)).toContainText(uzRe("Bekor qilingan qo'ng'iroq"), { timeout: 15_000 });
  await expect(callBubble(friend.page, row)).toContainText(uzRe("Javobsiz qo'ng'iroq"), { timeout: 15_000 });
});

test('4. no answer: the ring timeout ends the call as missed; unread badge for the callee', async ({ browser }) => {
  await markAllRead([E2E_CONVERSATION_ID]);
  const since = new Date();
  // Callee chat ro'yxatida (chat ochiq bo'lsa javobsiz qo'ng'iroq darhol o'qilgan bo'lib qolardi).
  const user = track(await openUser(browser, E2E_PHONE, '/app/friends'));
  const friend = track(await openUser(browser, E2E_FREE_PHONE, `/app/friends/${E2E_USERNAME}`));
  await waitSocket(user.page);
  await waitCallReady(friend.page);

  await friend.page.getByTestId('call-audio-button').click();
  await expect(user.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  // CALL_RING_TIMEOUT_MS=8000 (e2e/realtime-local.mjs); standart 45 s bilan ham 90 s ichida tugaydi.
  await expect(callStatusEl(friend.page)).toContainText(uzRe('Javob bermadi'), { timeout: 55_000 });
  await expect(user.page.getByTestId('incoming-call')).toHaveCount(0, { timeout: 10_000 });

  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'missed');
  expect(row.readAt).toBeNull();
  await expect(user.page.getByTestId('nav-unread-badge').filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
  await expect(callBubble(friend.page, row)).toContainText(uzRe('Javob berilmadi'), { timeout: 15_000 });

  await user.page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME }).first().click();
  await expect(callBubble(user.page, row)).toContainText(uzRe("Javobsiz qo'ng'iroq"), { timeout: 15_000 });
});

test('5. callee offline -> "offline" result, missed row', async ({ browser }) => {
  const since = new Date();
  const friend = track(await openUser(browser, E2E_FREE_PHONE, `/app/friends/${E2E_USERNAME}`));
  await waitCallReady(friend.page);
  // e2euser'ning hech qanday ochiq socket'i yo'q (oldingi testlar kontekstlarini yopgan).
  await friend.page.getByTestId('call-audio-button').click();
  await expect(callStatusEl(friend.page)).toContainText(uzRe('Oflayn'), { timeout: 15_000 });
  await expectNoOverlay(friend.page);
  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'missed');
  expect(row.readAt).toBeNull();

  const user = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`));
  await expect(callBubble(user.page, row)).toContainText(uzRe("Javobsiz qo'ng'iroq"), { timeout: 30_000 });
});

test('6. busy: a third user calling the callee during an active call gets "busy"', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  const third = track(await openThird(browser));
  await waitCallReady(user.page);
  await waitCallReady(friend.page);
  await waitCallReady(third.page);

  await startActiveAudio(user.page, friend.page);

  await third.page.getByTestId('call-audio-button').click();
  await expect(callStatusEl(third.page)).toContainText(uzRe('Band'), { timeout: 15_000 });
  await expectNoOverlay(third.page);
  // e2efriend'ning faol qo'ng'iroqi buzilmaydi va unga yangi kiruvchi qo'ng'iroq ko'rsatilmaydi.
  await expect(friend.page.getByTestId('incoming-call')).toHaveCount(0);
  await expect(callStatusEl(friend.page)).toHaveAttribute('data-state', 'active');

  const busy = await waitCallRow(E2E_THIRD_FRIEND_CONVERSATION_ID, since, 'busy');
  await expect(callBubble(third.page, busy)).toBeVisible({ timeout: 15_000 });
  await expect(callBubble(third.page, busy)).toHaveAttribute('data-call-outcome', 'busy');

  await friend.page.getByTestId('call-end').click();
  await expectNoOverlay(user.page);
  await expectNoOverlay(friend.page);
  await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
});

test('7. answered elsewhere: the callee open twice; accepting in one silences the other', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  const friend2 = track(await openUser(browser, E2E_FREE_PHONE, `/app/friends/${E2E_USERNAME}`));
  await waitCallReady(user.page);
  await waitCallReady(friend.page);
  await waitCallReady(friend2.page);

  await user.page.getByTestId('call-audio-button').click();
  await expect(friend.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await expect(friend2.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });

  await friend2.page.getByTestId('call-accept').click();
  await expectActive(user.page, friend2.page);
  // Birinchi nusxa: "tugadi" ekranisiz jim yopiladi va "boshqa qurilmada" banneri.
  await expect(friend.page.getByTestId('incoming-call')).toHaveCount(0, { timeout: 10_000 });
  await expect(friend.page.getByTestId('call-elsewhere')).toBeVisible({ timeout: 10_000 });
  await expect(callStatusEl(friend.page)).toHaveCount(0);
  await expect(friend.page.getByTestId('call-audio-button')).toBeDisabled();

  await user.page.getByTestId('call-end').click();
  await expectNoOverlay(friend2.page);
  await expect(friend.page.getByTestId('call-elsewhere')).toHaveCount(0, { timeout: 10_000 });
  await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
});

test('8. video call: remote video, mute and camera toggles reach the peer, minimise to PiP and back', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);

  await user.page.getByTestId('call-video-button').click();
  const incoming = friend.page.getByTestId('incoming-call');
  await expect(incoming).toBeVisible({ timeout: 10_000 });
  await expect(incoming).toContainText(uzRe("Kiruvchi video qo'ng'iroq"));
  await expect(friend.page.getByTestId('call-accept-audio-only')).toBeVisible();
  await friend.page.getByTestId('call-accept').click();
  await expectActive(user.page, friend.page);

  const videoWidth = (p: Page) => p.getByTestId('remote-video').evaluate((v: HTMLVideoElement) => v.videoWidth).catch(() => 0);
  await expect.poll(() => videoWidth(user.page), { timeout: 20_000 }).toBeGreaterThan(0);
  await expect.poll(() => videoWidth(friend.page), { timeout: 20_000 }).toBeGreaterThan(0);
  await expect(user.page.getByTestId('local-video')).toBeVisible();
  // Bitta soxta kamera — almashtirish tugmasi yo'q.
  await expect(user.page.getByTestId('call-flip')).toHaveCount(0);

  await user.page.getByTestId('call-mute').click();
  await expect(user.page.getByTestId('call-mute')).toHaveAttribute('aria-pressed', 'true');
  await expect(friend.page.getByTestId('call-peer-muted')).toBeVisible({ timeout: 10_000 });
  await user.page.getByTestId('call-mute').click();
  await expect(friend.page.getByTestId('call-peer-muted')).toHaveCount(0, { timeout: 10_000 });

  await user.page.getByTestId('call-camera').click();
  await expect(friend.page.getByTestId('call-peer-camera-off')).toBeVisible({ timeout: 10_000 });
  await expect(user.page.getByTestId('local-video')).toBeHidden();
  await user.page.getByTestId('call-camera').click();
  await expect(friend.page.getByTestId('call-peer-camera-off')).toHaveCount(0, { timeout: 10_000 });

  await user.page.getByTestId('call-minimize').click();
  await expect(user.page.getByTestId('call-pip-card')).toBeVisible();
  // Minimallashgan qo'ng'iroq boshqa (main) sahifaga client-side o'tishda ham davom etadi (goto = to'liq yuklash, qo'ng'iroqni uzadi).
  await user.page.locator('a[href="/app"]').filter({ visible: true }).first().click();
  await expect(user.page).toHaveURL(/\/app$/);
  await expect.poll(() => callStatus(user.page), { timeout: 10_000 }).toBe('active');
  await expect(user.page.getByTestId('call-pip-card')).toBeVisible({ timeout: 10_000 });
  await user.page.getByTestId('call-pip-card').click();
  await expect(callStatusEl(user.page)).toHaveAttribute('data-state', 'active');

  await friend.page.getByTestId('call-end').click();
  await expectNoOverlay(user.page);
  await expectNoOverlay(friend.page);
  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
  expect(row.call.kind).toBe('video');
});

test('9. audio call upgraded to video: turning the camera on renegotiates and the peer gets video', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);
  await startActiveAudio(user.page, friend.page);

  await user.page.getByTestId('call-camera').click();
  await expect
    .poll(() => friend.page.getByTestId('remote-video').evaluate((v: HTMLVideoElement) => v.videoWidth).catch(() => 0), { timeout: 20_000 })
    .toBeGreaterThan(0);
  await expect.poll(() => pcState(user.page), { timeout: 10_000 }).toBe('connected');

  await user.page.getByTestId('call-end').click();
  await expectNoOverlay(friend.page);
  await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
});

test('10. reconnect: the callee socket drops mid-call -> reconnecting -> active again (grace + call:resume)', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);

  // friend qo'ng'iroq qiladi, user (callee) socket'i uziladi.
  await friend.page.getByTestId('call-audio-button').click();
  await expect(user.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await user.page.getByTestId('call-accept').click();
  await expectActive(friend.page, user.page);

  await recordStates(user.page);
  const socketIdBefore = await user.page.evaluate(() => (window as any).__vocablyRealtime.socket.id);
  // Transport'ni yopish = tarmoq uzilishi: socket.io-client yangi tiket bilan qayta ulanadi (CS §3.3),
  // CallProvider `call:resume` yuboradi, server grace taymerini to'xtatadi (CS §4.4).
  await user.page.evaluate(() => (window as any).__vocablyRealtime.socket.io.engine.close());

  await expect.poll(() => seenStates(user.page), { timeout: 15_000 }).toContain('reconnecting');
  await expect(callStatusEl(user.page)).toHaveAttribute('data-state', 'active', { timeout: 20_000 });
  await expect.poll(() => pcState(user.page), { timeout: 15_000 }).toBe('connected');
  await expect(callStatusEl(friend.page)).toHaveAttribute('data-state', 'active');
  expect(await user.page.evaluate(() => (window as any).__vocablyRealtime.socket.id)).not.toBe(socketIdBefore);
  const [userId] = await userIds(E2E_PHONE);
  expect(await internalCallOf(String(userId))).toMatchObject({ inCall: true, state: 'active' });

  await friend.page.getByTestId('call-end').click();
  await expectNoOverlay(user.page);
  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
  expect(row.call.durationSec).not.toBeNull();
});

test('11. reload mid-call: the unloading tab hangs up (pagehide); the peer sees the call end with a duration, the reloaded tab is idle again', async ({ browser }) => {
  const since = new Date();
  const { user, friend } = await openPair(browser);
  track(user);
  track(friend);
  await waitCallReady(user.page);
  await waitCallReady(friend.page);

  await friend.page.getByTestId('call-audio-button').click();
  await expect(user.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await user.page.getByTestId('call-accept').click();
  await expectActive(friend.page, user.page);
  await expect(callStatusEl(friend.page)).toContainText(/0:0[2-9]/, { timeout: 15_000 });

  // CallContext `pagehide`da call:end (hangup) yuboradi — qayta yuklash = go'shakni qo'yish (Telegram Web kabi).
  // Server grace kutmaydi: qo'ng'iroq darhol "ended" + davomiylik bilan yoziladi.
  await user.page.reload();
  await expectNoOverlay(friend.page, 15_000);
  const row = await waitCallRow(E2E_CONVERSATION_ID, since, 'ended');
  expect(row.call.durationSec).toBeGreaterThanOrEqual(1);
  // Qayta yuklangan tab: qo'ng'iroq yo'q (banner ham yo'q), tugmalar yana faol.
  await waitCallReady(user.page);
  await expect(user.page.getByTestId('call-elsewhere')).toHaveCount(0);
  await expect(user.page.getByTestId('call-audio-button')).toBeEnabled();
});

test('12. deep link ?call=audio shows the call-back sheet; it starts the call', async ({ browser }) => {
  const since = new Date();
  const friend = track(await openUser(browser, E2E_FREE_PHONE, `/app/friends/${E2E_USERNAME}`));
  const user = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}?call=audio`));
  await waitCallReady(friend.page);
  await waitCallReady(user.page);

  const sheet = user.page.getByTestId('call-callback-sheet');
  await expect(sheet).toBeVisible({ timeout: 15_000 });
  await expect(user.page).not.toHaveURL(/call=audio/);
  await sheet.getByTestId('call-callback-audio').click();
  await expect(friend.page.getByTestId('incoming-call')).toBeVisible({ timeout: 10_000 });
  await friend.page.getByTestId('call-decline').click();
  await expectNoOverlay(user.page);
  await waitCallRow(E2E_CONVERSATION_ID, since, 'declined');
});

test('13. socket re-auth: after the 60 s ticket expires a dropped transport reconnects without reload', async ({ browser }) => {
  test.setTimeout(150_000);
  const user = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`));
  await waitCallReady(user.page);
  // Birinchi tiketning 60 s umri o'tsin (qayta ulanishda eski tiket rad etilardi — WP1 regressiyasi).
  const deadline = Date.now() + 65_000;
  await expect.poll(() => Date.now(), { timeout: 75_000, intervals: [5_000] }).toBeGreaterThan(deadline);
  const before = await user.page.evaluate(() => (window as any).__vocablyRealtime.socket.id);
  await user.page.evaluate(() => (window as any).__vocablyRealtime.socket.io.engine.close());
  // Yangi socket id bilan qayta ulandi (eski id bilan "ulangan" holat hisobga olinmaydi).
  await expect
    .poll(() => user.page.evaluate((old) => { const s = (window as any).__vocablyRealtime?.socket; return !!s?.connected && s.id !== old; }, before), { timeout: 15_000 })
    .toBe(true);
  await waitCallReady(user.page, 15_000);
});
