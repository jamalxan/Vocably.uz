// A sticker whose picture cannot be loaded (its file is gone from storage) shows the neutral "Stiker" line.
// It used to show the browser's broken-image icon with the sticker's label next to it, which for an
// uploaded sticker is a file name such as "IMG 20260327 070418 316".
//   npx playwright test e2e/chat-sticker-missing.spec.ts --project=desktop
import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import { E2E_PHONE, E2E_THIRD_PHONE, E2E_THIRD_USERNAME, E2E_USER_THIRD_CONVERSATION_ID } from './global-setup';
import { loginAs } from './auth';
import { oid, userIds, withDb } from './helpers/db';

const LABEL = 'IMG 20260327 070418 316';
const packId = new mongoose.Types.ObjectId();
const stickerId = new mongoose.Types.ObjectId();

test.beforeEach(async () => {
  const [thirdId] = await userIds(E2E_THIRD_PHONE);
  const now = new Date();
  await withDb(async (db) => {
    // A removed pack: not offered in the picker, still resolved for old messages. No S3 object behind the key.
    await db.collection('stickerpacks').insertOne({
      _id: packId,
      name: 'gone',
      active: false,
      deletedAt: now,
      order: 0,
      stickers: [{ _id: stickerId, key: `stickers/${packId}/${stickerId}.webp`, label: LABEL, mimeType: 'image/webp', deletedAt: null }],
      createdAt: now,
      updatedAt: now,
    });
    await db.collection('messages').insertOne({
      conversationId: oid(E2E_USER_THIRD_CONVERSATION_ID),
      senderId: thirdId,
      type: 'sticker',
      text: '',
      stickerId: String(stickerId),
      readAt: now,
      reactions: [],
      deletedFor: [],
      deletedForEveryone: false,
      createdAt: now,
      updatedAt: now,
    });
  });
});

test.afterEach(async () => {
  await withDb(async (db) => {
    await db.collection('messages').deleteMany({ stickerId: String(stickerId) });
    await db.collection('stickerpacks').deleteOne({ _id: packId });
  });
});

test('a sticker with a missing picture shows the neutral line, not its label', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the bubble is the same component on mobile');
  test.setTimeout(120_000);
  await loginAs(page, E2E_PHONE);
  await page.goto(`/app/friends/${E2E_THIRD_USERNAME}`);
  await expect(page.getByTestId('sticker-missing')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByAltText(LABEL)).toHaveCount(0);
  await expect(page.getByText(LABEL)).toHaveCount(0);
});
