// Friends chat, Telegram parity: drafts survive leaving the chat, multi-select + archive + bulk
// delete on the list, reply quote jumps to the original, forward of a text message. Media uploads
// need S3 and are covered by unit tests (src/lib/chat) — the E2E server has no bucket.
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import { loginAs } from './auth';
import { E2E_PHONE, E2E_FREE_PHONE, E2E_USERNAME, E2E_FRIEND_USERNAME } from './global-setup';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'checked on desktop');

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

test.beforeAll(async () => {
  await withDb(async (db) => {
    const [a, b]: any[] = await Promise.all([db.collection('users').findOne({ phone: E2E_PHONE }), db.collection('users').findOne({ phone: E2E_FREE_PHONE })]);
    // Fresh pair conversation: no archive/pin/hidden flags from earlier runs.
    await db.collection('conversations').updateMany({ participantIds: { $all: [a._id, b._id] } }, { $set: { archivedBy: [], pinnedBy: [], hiddenFor: [] } });
  });
});

test('typing a draft, leaving and coming back keeps it; the list shows "Draft:"', async ({ page }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto(`/app/friends/${E2E_FRIEND_USERNAME}`);
  const box = page.getByLabel(/Xabar matni|Message text/);
  await expect(box).toBeVisible({ timeout: 30_000 });
  await box.fill('qoralama matni 123');
  await page.waitForTimeout(600); // draft debounce
  await page.goto('/app/friends');
  await expect(page.getByTestId('row-draft').first()).toContainText('qoralama matni 123', { timeout: 30_000 });
  await page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME }).first().click();
  await expect(page.getByLabel(/Xabar matni|Message text/)).toHaveValue('qoralama matni 123');
  // Reload keeps it too (localStorage). The URL follows the open chat after a short debounce.
  await expect(page).toHaveURL(new RegExp(`/app/friends/${E2E_FRIEND_USERNAME}$`));
  await page.reload();
  await expect(page.getByLabel(/Xabar matni|Message text/)).toHaveValue('qoralama matni 123', { timeout: 30_000 });
  await page.getByLabel(/Xabar matni|Message text/).fill('');
  await page.waitForTimeout(600);
});

test('send, reply with a quote that jumps to the original, forward to the same chat', async ({ page }) => {
  await loginAs(page, E2E_PHONE);
  await page.goto(`/app/friends/${E2E_FRIEND_USERNAME}`);
  const box = page.getByLabel(/Xabar matni|Message text/);
  await expect(box).toBeVisible({ timeout: 30_000 });
  const marker = `asl xabar ${Date.now()}`;
  await box.fill(marker);
  await box.press('Enter');
  const original = page.locator('[data-msg-id]').filter({ hasText: marker }).first();
  await expect(original).toBeVisible();
  await expect.poll(async () => original.getAttribute('data-msg-id'), { timeout: 15_000 }).toMatch(/^[a-f0-9]{24}$/);

  // Reply through the context menu.
  await original.getByRole('button', { name: /Xabar amallari|Message actions/ }).click();
  await page.getByRole('button', { name: /Javob berish|Reply/ }).first().click();
  await expect(page.getByTestId('reply-banner')).toContainText(marker);
  await box.fill('javob');
  await box.press('Enter');
  const reply = page.locator('[data-msg-id]').filter({ hasText: 'javob' }).last();
  await expect(reply).toBeVisible();
  await expect.poll(async () => reply.getAttribute('data-msg-id'), { timeout: 15_000 }).toMatch(/^[a-f0-9]{24}$/);
  // The quote is clickable and highlights the original.
  await reply.getByRole('button').filter({ hasText: marker }).first().click();
  await expect(original).toHaveClass(/chat-highlight/);

  // Forward (server-side copy) → "Forwarded from" label.
  await original.getByRole('button', { name: /Xabar amallari|Message actions/ }).click();
  await page.getByRole('button', { name: /^Yuborish$|^Forward$/ }).first().click();
  // PARITY_PLAN WP5: ko'p tanlovli oyna — chatni belgilash, keyin "Yuborish (1)".
  const forwardModal = page.getByTestId('forward-modal');
  await forwardModal.getByTestId('forward-target').filter({ hasText: E2E_FRIEND_USERNAME }).first().click();
  await forwardModal.getByTestId('forward-send').click();
  await expect(forwardModal).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByTestId('forwarded-label').last()).toBeVisible({ timeout: 15_000 });
});

test('multi-select: archive folder, pin, bulk mark-read and delete', async ({ page, browser }) => {
  // The friend sends a message so there is something unread.
  const ctx = await browser.newContext();
  const friend = await ctx.newPage();
  await loginAs(friend, E2E_FREE_PHONE);
  await friend.goto(`/app/friends/${E2E_USERNAME}`);
  const fbox = friend.getByLabel(/Xabar matni|Message text/);
  await expect(fbox).toBeVisible({ timeout: 30_000 });
  await fbox.fill('salom, o‘qilmagan');
  await fbox.press('Enter');
  await friend.waitForTimeout(1000);
  await ctx.close();

  await loginAs(page, E2E_PHONE);
  await page.goto('/app/friends');
  const row = page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME }).first();
  await expect(row).toBeVisible({ timeout: 30_000 });

  // Context menu → archive → folder appears; open folder → unarchive.
  await row.getByRole('button', { name: /Chat amallari|Chat actions/ }).click();
  await page.getByTestId('chat-menu').getByRole('button', { name: /Arxivlash|^Archive$/ }).click();
  await expect(page.getByTestId('archive-folder')).toBeVisible();
  await page.getByTestId('archive-folder').click();
  await expect(page.getByTestId('archive-back')).toBeVisible();
  const archivedRow = page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME }).first();
  await archivedRow.getByRole('button', { name: /Chat amallari|Chat actions/ }).click();
  await page.getByTestId('chat-menu').getByRole('button', { name: /Arxivdan chiqarish|Unarchive/ }).click();
  await page.getByTestId('archive-back').click();
  await expect(page.getByTestId('archive-folder')).toHaveCount(0);

  // Pin via menu, then selection mode: select all → mark read → unread badge gone.
  await row.getByRole('button', { name: /Chat amallari|Chat actions/ }).click();
  await page.getByTestId('chat-menu').getByRole('button', { name: /Yuqoriga qadash|Pin to top/ }).click();
  await expect(row.getByLabel(/Qadalgan|Pinned/)).toBeVisible();
  await row.getByRole('button', { name: /Chat amallari|Chat actions/ }).click();
  await page.getByTestId('chat-menu').getByRole('button', { name: /^Tanlash$|^Select$/ }).click();
  await expect(page.getByTestId('chat-selection-bar')).toContainText('1');
  await page.getByTestId('chat-selection-bar').getByRole('button', { name: /O'qilgan deb belgilash|Mark as read/ }).click();
  await expect(page.getByTestId('chat-selection-bar')).toHaveCount(0);
  const unread = await withDb(async (db) => {
    const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
    return db.collection('messages').countDocuments({ senderId: { $ne: me._id }, readAt: null, text: 'salom, o‘qilmagan' });
  });
  expect(unread).toBe(0);

  // Bulk delete (for me) from selection mode.
  await row.getByRole('button', { name: /Chat amallari|Chat actions/ }).click();
  await page.getByTestId('chat-menu').getByRole('button', { name: /^Tanlash$|^Select$/ }).click();
  await page.getByTestId('chat-selection-bar').getByRole('button', { name: /^O'chirish$|^Delete$/ }).click();
  await page.getByTestId('delete-conversation-modal').getByRole('button', { name: /^O'chirish$|^Delete$/ }).click();
  await expect(page.getByTestId('chat-row').filter({ hasText: E2E_FRIEND_USERNAME })).toHaveCount(0);
});

test('bulk endpoint checks membership and input', async ({ page }) => {
  await loginAs(page, E2E_PHONE);
  expect((await page.request.post('/api/chat/conversations/bulk', { data: { ids: ['000000000000000000000000'], action: 'archive' } })).ok()).toBeTruthy();
  const r = await page.request.post('/api/chat/conversations/bulk', { data: { ids: ['000000000000000000000000'], action: 'archive' } });
  expect(await r.json()).toMatchObject({ done: [], skipped: ['000000000000000000000000'] });
  expect((await page.request.post('/api/chat/conversations/bulk', { data: { ids: [], action: 'archive' } })).status()).toBe(400);
  expect((await page.request.post('/api/chat/conversations/bulk', { data: { ids: ['000000000000000000000000'], action: 'nuke' } })).status()).toBe(400);
});
