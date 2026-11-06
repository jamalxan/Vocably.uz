// Chat parity (PARITY_PLAN WP9): WP1 nav badge / sarlavha hisoblagichi / global toast, WP5 ko'p chatga
// forward, WP6 server orqali sinxronlanadigan qoralamalar, WP7 reaksiyalar, WP8 mobil sarlavha.
// Ikki/uch alohida kontekst (bir xil yoki boshqa foydalanuvchi), realtime server e2e/realtime-local.mjs.
// Testid'lar rejadagi nomlar; reja testid bermagan joylar `test.fixme`.
//   npx playwright test e2e/chat-parity.spec.ts --project=desktop --output=test-results/parity
import { test, expect, type Page } from '@playwright/test';
import {
  E2E_CONVERSATION_ID,
  E2E_FREE_PHONE,
  E2E_FRIEND_USERNAME,
  E2E_PHONE,
  E2E_THIRD_FRIEND_CONVERSATION_ID,
  E2E_THIRD_PHONE,
  E2E_THIRD_USERNAME,
  E2E_USERNAME,
  E2E_USER_THIRD_CONVERSATION_ID,
} from './global-setup';
import { loginAs } from './auth';
import { markAllRead, oid, resetChatState, userIds, withDb } from './helpers/db';
import { REALTIME_URL, closeAll, composer, openUser, realtimeUp, waitSocket, type UserSession } from './helpers/twoUsers';

test.describe.configure({ mode: 'serial' });

const PHONES = [E2E_PHONE, E2E_FREE_PHONE, E2E_THIRD_PHONE];
const CONVS = [E2E_CONVERSATION_ID, E2E_THIRD_FRIEND_CONVERSATION_ID, E2E_USER_THIRD_CONVERSATION_ID];

let sessions: UserSession[] = [];
const track = <T extends UserSession>(s: T): T => {
  sessions.push(s);
  return s;
};

test.beforeEach(async () => {
  sessions = [];
  await resetChatState(PHONES, CONVS);
});

test.afterEach(async () => {
  await closeAll(...sessions);
  sessions = [];
});

const bubbleById = (page: Page, id: string) => page.locator(`[data-msg-id="${id}"]`);

/** API orqali matnli xabar (UI'siz, tez); serverdagi id'ni qaytaradi. */
async function sendText(page: Page, conversationId: string, text: string): Promise<string> {
  const res = await page.request.post(`/api/chat/conversations/${conversationId}/messages`, {
    data: { type: 'text', text, clientMessageId: `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}` },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  const { message } = await res.json();
  return String(message.id || message._id);
}

/** Composer orqali yuborish va server id'si kelishini kutish. */
async function sendViaComposer(page: Page, text: string): Promise<string> {
  const box = composer(page);
  await expect(box).toBeVisible({ timeout: 30_000 });
  await box.fill(text);
  await box.press('Enter');
  const bubble = page.locator('[data-msg-id]').filter({ hasText: text }).last();
  await expect(bubble).toBeVisible();
  await expect.poll(() => bubble.getAttribute('data-msg-id'), { timeout: 15_000 }).toMatch(/^[a-f0-9]{24}$/);
  return (await bubble.getAttribute('data-msg-id'))!;
}

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'two-context flows are checked on desktop');

  test.describe('WP1 unread badge, title counter, toast', () => {
    test.beforeEach(async () => {
      test.skip(!(await realtimeUp()), `realtime server is not running on ${REALTIME_URL}`);
      await markAllRead([E2E_CONVERSATION_ID]);
    });

    test('a message arriving while on /app bumps the nav badge and the tab title; reading the chat clears both', async ({ browser }) => {
      const user = track(await openUser(browser, E2E_PHONE, '/app'));
      const friend = track(await openUser(browser, E2E_FREE_PHONE, '/app'));
      await waitSocket(user.page);
      const badge = user.page.getByTestId('nav-unread-badge').filter({ visible: true }).first();
      await expect(badge).toHaveCount(0);
      await expect(user.page).not.toHaveTitle(/^\(\d+\+?\) /);

      await sendText(friend.page, E2E_CONVERSATION_ID, `badge ${Date.now()}`);
      await expect(badge).toBeVisible({ timeout: 15_000 });
      await expect(badge).toHaveAttribute('data-count', '1');
      await expect(user.page).toHaveTitle(/^\(1\) /, { timeout: 10_000 });

      // Client-side navigatsiyadan keyin ham prefiks saqlanadi (MutationObserver <title> ni qayta yozadi).
      await user.page.locator(`a[href="/app/friends"]`).filter({ visible: true }).first().click();
      await expect(user.page).toHaveURL(/\/app\/friends$/);
      await expect(user.page).toHaveTitle(/^\(1\) /, { timeout: 10_000 });

      await user.page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME }).first().click();
      await expect(composer(user.page)).toBeVisible({ timeout: 30_000 });
      await expect(user.page.getByTestId('nav-unread-badge').filter({ visible: true })).toHaveCount(0, { timeout: 15_000 });
      await expect(user.page).not.toHaveTitle(/^\(\d+\+?\) /, { timeout: 10_000 });
    });

    test('a message arriving while on /app shows the toast; clicking it opens the chat', async ({ browser }) => {
      const user = track(await openUser(browser, E2E_PHONE, '/app'));
      const friend = track(await openUser(browser, E2E_FREE_PHONE, '/app'));
      await waitSocket(user.page);
      const text = `toast ${Date.now()}`;
      await sendText(friend.page, E2E_CONVERSATION_ID, text);
      // `message-toast` — WP1 implementatsiyasidagi testid (NewMessageToast.jsx); rejada nomi berilmagan.
      const toast = user.page.getByTestId('message-toast');
      await expect(toast).toBeVisible({ timeout: 15_000 });
      await expect(toast).toContainText(text);
      await toast.getByText(text).click();
      await expect(user.page).toHaveURL(new RegExp(`/app/friends/${E2E_FRIEND_USERNAME}$`), { timeout: 15_000 });
      await expect(user.page.locator('[data-msg-id]').filter({ hasText: text })).toBeVisible({ timeout: 15_000 });
    });

    test('no toast for my own message or for the chat that is open and visible', async ({ browser }) => {
      const user = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`));
      const friend = track(await openUser(browser, E2E_FREE_PHONE, '/app'));
      await waitSocket(user.page);
      const text = `open chat ${Date.now()}`;
      await sendText(friend.page, E2E_CONVERSATION_ID, text);
      await expect(user.page.locator('[data-msg-id]').filter({ hasText: text })).toBeVisible({ timeout: 15_000 });
      await expect(user.page.getByTestId('message-toast')).toHaveCount(0);
      await expect(user.page.getByTestId('nav-unread-badge').filter({ visible: true })).toHaveCount(0);
    });
  });

  test.describe('WP5 multi-forward', () => {
    test('one message forwarded to two chats through the multi-select modal lands in both', async ({ browser }) => {
      const user = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`));
      const marker = `multi-forward ${Date.now()}`;
      const srcId = await sendViaComposer(user.page, marker);

      await bubbleById(user.page, srcId).getByRole('button', { name: /Xabar amallari|Message actions/ }).click();
      await user.page.getByRole('button', { name: /^Yuborish$|^Forward$/ }).first().click();
      const modal = user.page.getByTestId('forward-modal');
      await expect(modal).toBeVisible();
      const friendTarget = modal.getByTestId('forward-target').filter({ hasText: E2E_FRIEND_USERNAME }).first();
      const thirdTarget = modal.getByTestId('forward-target').filter({ hasText: E2E_THIRD_USERNAME }).first();
      await friendTarget.click();
      await thirdTarget.click();
      await expect(friendTarget).toHaveAttribute('aria-checked', 'true');
      await expect(thirdTarget).toHaveAttribute('aria-checked', 'true');
      const send = modal.getByTestId('forward-send');
      await expect(send).toContainText('2');
      await send.click();
      await expect(modal).toHaveCount(0, { timeout: 15_000 });

      // Bir nechta nishon — joriy chatda qolamiz; nusxa shu chatga ham tushadi (u ham nishon).
      await expect(user.page).toHaveURL(new RegExp(`/app/friends/${E2E_FRIEND_USERNAME}$`));
      await expect(user.page.locator('[data-msg-id]').filter({ hasText: marker })).toHaveCount(2, { timeout: 15_000 });

      const counts = await withDb(async (db) => {
        const by = async (id: string) =>
          db.collection('messages').countDocuments({ conversationId: oid(id), text: marker, forwardedFrom: { $ne: null } });
        return { friend: await by(E2E_CONVERSATION_ID), third: await by(E2E_USER_THIRD_CONVERSATION_ID) };
      });
      expect(counts).toEqual({ friend: 1, third: 1 });

      // Uchinchi foydalanuvchi o'z tomonida "Forwarded from" belgili nusxani ko'radi.
      const third = track(await openUser(browser, E2E_THIRD_PHONE, `/app/friends/${E2E_USERNAME}`));
      const copy = third.page.locator('[data-msg-id]').filter({ hasText: marker }).first();
      await expect(copy).toBeVisible({ timeout: 30_000 });
      await expect(copy.getByTestId('forwarded-label')).toBeVisible();
    });
  });

  test.describe('WP6 server drafts', () => {
    test('a draft typed in context A shows up in context B of the same user (list row and composer)', async ({ browser }) => {
      const [userId] = await userIds(E2E_PHONE);
      const text = `server draft ${Date.now()}`;
      const a = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`));
      await expect(composer(a.page)).toBeVisible({ timeout: 30_000 });
      await composer(a.page).fill(text);
      // Composer 400 ms + draftSync 600 ms debounce -> PUT /draft; server vaqti bilan saqlanadi.
      const serverDraft = () =>
        withDb(async (db) => {
          const c: any = await db.collection('conversations').findOne({ _id: oid(E2E_CONVERSATION_ID) });
          return c?.drafts?.[String(userId)]?.text ?? null;
        });
      await expect.poll(serverDraft, { timeout: 15_000 }).toBe(text);

      // B — toza kontekst (localStorage bo'sh): qoralama faqat serverdan kelishi mumkin.
      const b = track(await openUser(browser, E2E_PHONE, '/app/friends'));
      const row = b.page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME }).first();
      await expect(row.getByTestId('row-draft')).toContainText(text, { timeout: 30_000 });
      await row.click();
      await expect(composer(b.page)).toHaveValue(text, { timeout: 15_000 });

      // B'da tozalash -> tombstone (bo'sh matn), A'dagi eski matn qayta tirilmaydi.
      await composer(b.page).fill('');
      await expect.poll(serverDraft, { timeout: 15_000 }).toBe('');
    });
  });

  test.describe('WP7 reactions', () => {
    test.beforeEach(async () => {
      test.skip(!(await realtimeUp()), `realtime server is not running on ${REALTIME_URL}`);
    });

    test('a reaction from A appears live in B, both reacting makes 2, tapping my chip removes mine', async ({ browser }) => {
      const a = track(await openUser(browser, E2E_PHONE, `/app/friends/${E2E_FRIEND_USERNAME}`));
      const b = track(await openUser(browser, E2E_FREE_PHONE, `/app/friends/${E2E_USERNAME}`));
      await waitSocket(a.page);
      await waitSocket(b.page);
      const text = `react to me ${Date.now()}`;
      const id = await sendViaComposer(b.page, text);
      await expect(bubbleById(a.page, id)).toBeVisible({ timeout: 15_000 });

      const chip = (p: Page) => bubbleById(p, id).locator('[data-testid="reaction-chip"][data-emoji="❤️"]');
      const reactHeart = async (p: Page) => {
        await bubbleById(p, id).getByRole('button', { name: /Xabar amallari|Message actions/ }).click();
        const bar = p.getByTestId('reaction-bar');
        await expect(bar).toBeVisible();
        await bar.locator('[data-testid="reaction-option"][data-emoji="❤️"]').click();
      };

      await reactHeart(a.page);
      await expect(chip(a.page)).toHaveText(/❤️\s*1/, { timeout: 10_000 });
      await expect(chip(a.page)).toHaveAttribute('data-mine', 'true');
      await expect(chip(a.page)).toHaveAttribute('aria-pressed', 'true');
      await expect(chip(b.page)).toHaveText(/❤️\s*1/, { timeout: 10_000 });
      await expect(chip(b.page)).toHaveAttribute('data-mine', 'false');

      await reactHeart(b.page);
      await expect(chip(a.page)).toHaveText(/❤️\s*2/, { timeout: 10_000 });
      await expect(chip(b.page)).toHaveText(/❤️\s*2/, { timeout: 10_000 });

      await chip(a.page).click();
      await expect(chip(a.page)).toHaveText(/❤️\s*1/, { timeout: 10_000 });
      await expect(chip(a.page)).toHaveAttribute('data-mine', 'false');
      await expect(chip(b.page)).toHaveText(/❤️\s*1/, { timeout: 10_000 });
      await expect(chip(b.page)).toHaveAttribute('data-mine', 'true');

      await chip(b.page).click();
      await expect(chip(a.page)).toHaveCount(0, { timeout: 10_000 });
      await expect(chip(b.page)).toHaveCount(0, { timeout: 10_000 });
      const reactions = await withDb(async (db) => ((await db.collection('messages').findOne({ _id: oid(id) })) as any)?.reactions ?? null);
      expect(reactions).toEqual([]);

      // Saqlangan: qayta yuklashda ham bir xil (bu yerda — reaksiyasiz).
      await a.page.reload();
      await expect(bubbleById(a.page, id)).toBeVisible({ timeout: 30_000 });
      await expect(chip(a.page)).toHaveCount(0);
    });
  });
});

test.describe('mobile (WP4 header, WP8)', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only checks');

  test('the chat header ⋮ opens the more-menu with the moved toggles', async ({ page }) => {
    await loginAs(page, E2E_PHONE);
    await page.goto(`/app/friends/${E2E_FRIEND_USERNAME}`);
    await expect(composer(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('call-audio-button')).toBeVisible();
    await expect(page.getByTestId('call-video-button')).toBeVisible();
    await page.getByTestId('chat-more-button').click();
    const menu = page.getByTestId('chat-more-menu');
    await expect(menu).toBeVisible();
    // notify-online, Telegram, mute — aria-pressed toggle'lar (CS §10.9); block + Profile ham shu menyuda.
    expect(await menu.locator('[aria-pressed]').count()).toBeGreaterThanOrEqual(3);
  });

  // Reja (WP8.3) pastki tab bar uchun testid bermagan.
  test.fixme('the bottom tab bar is hidden while a chat is open (WP8.3: no testid for the bottom bar in the plan)', async () => {});
  // Reja (WP8.7) uzoq bosish sheet'i uchun testid bermagan.
  test.fixme('long-press opens the message sheet and there is no per-bubble "…" button (WP8.7: no testid in the plan)', async () => {});
});
