// A message forwarded with "hide sender name": an ordinary reader sees no forwarded line at all, an admin
// still sees whose message it was, marked as hidden.
//   npx playwright test e2e/chat-forward-admin.spec.ts --project=desktop
import { test, expect } from '@playwright/test';
import { E2E_FREE_PHONE, E2E_PHONE, E2E_THIRD_PHONE, E2E_THIRD_USERNAME, E2E_USER_THIRD_CONVERSATION_ID } from './global-setup';
import { loginAs } from './auth';
import { oid, userIds, withDb } from './helpers/db';

const TEXT = 'hidden-author probe';
let previousRole: string | undefined;

const setRole = (phone: string, role: string) => withDb((db) => db.collection('users').updateOne({ phone }, { $set: { role } }));

test.beforeEach(async () => {
  const [thirdId, authorId] = await userIds(E2E_THIRD_PHONE, E2E_FREE_PHONE);
  const now = new Date();
  await withDb(async (db) => {
    previousRole = (await db.collection('users').findOne({ phone: E2E_PHONE }))?.role;
    await db.collection('messages').insertOne({
      conversationId: oid(E2E_USER_THIRD_CONVERSATION_ID),
      senderId: thirdId,
      type: 'text',
      text: TEXT,
      forwardedFrom: { userId: authorId, name: 'Asl Muallif', hidden: true },
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
  await setRole(E2E_PHONE, previousRole || 'user');
  await withDb((db) => db.collection('messages').deleteMany({ conversationId: oid(E2E_USER_THIRD_CONVERSATION_ID), text: TEXT }));
});

test('hidden forward author: invisible to an ordinary reader, visible to an admin', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the bubble is the same component on mobile');
  test.setTimeout(150_000);
  await setRole(E2E_PHONE, 'user');
  await loginAs(page, E2E_PHONE);
  await page.goto(`/app/friends/${E2E_THIRD_USERNAME}`);
  const bubble = page.locator('[data-msg-id]').filter({ hasText: TEXT }).first();
  await expect(bubble).toBeVisible({ timeout: 60_000 });
  await expect(bubble.getByTestId('forwarded-label')).toHaveCount(0);
  await expect(page.getByText('Asl Muallif')).toHaveCount(0);

  await setRole(E2E_PHONE, 'admin');
  await page.reload();
  await expect(bubble).toBeVisible({ timeout: 60_000 });
  await expect(bubble.getByTestId('forwarded-label')).toContainText('Asl Muallif');
  await expect(bubble.getByTestId('forwarded-label')).toContainText(/nomi yashirilgan|name hidden|имя скрыто/);
});
