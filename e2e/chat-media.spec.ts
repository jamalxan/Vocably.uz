// Friends chat media, end to end against the local S3 mock (e2e/s3-mock.mjs): photo with
// browser-side compression, album + caption + viewer, file card + download, voice note with
// waveform (fake microphone), forward (server-side copy) + reply thumbnail, drag & drop.
// Needs the server started with S3_ENDPOINT=http://127.0.0.1:9100 S3_BUCKET=e2e (see the mock).
import { test, expect, type Page } from '@playwright/test';
import mongoose from 'mongoose';
import { loginAs } from './auth';
import { E2E_PHONE, E2E_FREE_PHONE, E2E_USERNAME, E2E_FRIEND_USERNAME } from './global-setup';

test.describe.configure({ mode: 'serial' });
test.skip(({ isMobile }) => isMobile, 'checked on desktop');
test.use({
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
  permissions: ['microphone', 'camera'],
});

const S3 = 'http://127.0.0.1:9100/e2e/';

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

/** A JPEG of the given size drawn in the browser (no image fixtures in the repo). */
async function makeJpeg(page: Page, w: number, h: number, label: string): Promise<Buffer> {
  const b64 = await page.evaluate(
    ([w, h, label]) => {
      const c = document.createElement('canvas');
      c.width = w as number;
      c.height = h as number;
      const ctx = c.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, '#b8394a');
      g.addColorStop(1, '#2aabee');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = `hsl(${(i * 37) % 360} 80% 60%)`;
        ctx.fillRect((i * 97) % c.width, (i * 61) % c.height, 40, 40);
      }
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.round((h as number) / 8)}px sans-serif`;
      ctx.fillText(String(label), 40, (h as number) / 2);
      return c.toDataURL('image/jpeg', 0.95).split(',')[1];
    },
    [w, h, label] as const
  );
  return Buffer.from(b64, 'base64');
}

const composer = (page: Page) => page.locator('[data-testid="composer"] textarea');
const lastBubble = (page: Page) => page.locator('[data-msg-id]').last();

async function openChat(page: Page, phone: string, username: string) {
  await loginAs(page, phone);
  await page.goto(`/app/friends/${username}`);
  await expect(composer(page)).toBeVisible({ timeout: 30_000 });
}

test.beforeAll(async () => {
  const r = await fetch(`${S3}health-check`, { method: 'PUT', body: 'ok' }).catch(() => null);
  test.skip(!r?.ok, 'S3 mock (e2e/s3-mock.mjs) is not running on :9100');
});

test('a 3000×2000 photo is compressed in the browser, shows at once, and reaches the other side', async ({ page, browser }) => {
  await openChat(page, E2E_PHONE, E2E_FRIEND_USERNAME);
  const jpeg = await makeJpeg(page, 3000, 2000, 'photo');
  expect(jpeg.length).toBeGreaterThan(300 * 1024);
  await page.getByLabel('Fayl tanlash').setInputFiles({ name: 'photo.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  await expect(page.getByTestId('attachment-tray')).toBeVisible();
  await page.getByTestId('send-button').click();
  await expect(page.getByTestId('attachment-tray')).toHaveCount(0);
  // The bubble is there immediately with the local preview.
  await expect(lastBubble(page).locator('img')).toBeVisible();
  const stored: any = await expect
    .poll(
      () =>
        withDb(async (db) => {
          const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
          return db.collection('messages').findOne({ senderId: me._id, type: 'image', 'media.key': { $regex: /^conversations\/[a-f0-9]{24}\/image\// } }, { sort: { createdAt: -1 } });
        }),
      { timeout: 30_000 }
    )
    .toBeTruthy()
    .then(() =>
      withDb(async (db) => {
        const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
        return db.collection('messages').findOne({ senderId: me._id, type: 'image' }, { sort: { createdAt: -1 } });
      })
    );
  expect(stored.media.width).toBe(2560);
  expect(stored.media.height).toBe(1707);
  expect(stored.media.size).toBeLessThan(jpeg.length);
  expect(stored.media.mimeType).toBe('image/jpeg');
  // The bytes really are in the bucket.
  expect((await page.request.head(`${S3}${stored.media.key}`)).status()).toBe(200);
  await expect(lastBubble(page).getByTestId('upload-overlay')).toHaveCount(0, { timeout: 15_000 });

  const ctx = await browser.newContext();
  const friend = await ctx.newPage();
  await openChat(friend, E2E_FREE_PHONE, E2E_USERNAME);
  // The receiver lands on the first unread message (Telegram behaviour); media loads lazily as it
  // scrolls into view — go to the bottom like a reader would.
  await expect(lastBubble(friend)).toBeAttached({ timeout: 20_000 });
  await friend.locator('[data-testid="conversation-view"] .overflow-y-auto').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  const img = lastBubble(friend).locator('img');
  await expect(img).toBeVisible({ timeout: 20_000 });
  await expect(img).toHaveAttribute('src', /127\.0\.0\.1:9100/);
  await ctx.close();
});

test('three photos + caption become one album; the viewer walks through them', async ({ page }) => {
  await openChat(page, E2E_PHONE, E2E_FRIEND_USERNAME);
  const files = [];
  for (let i = 1; i <= 3; i++) files.push({ name: `p${i}.jpg`, mimeType: 'image/jpeg', buffer: await makeJpeg(page, 800, 600, `#${i}`) });
  await page.getByLabel('Fayl tanlash').setInputFiles(files);
  await expect(page.getByTestId('attachment-tray')).toContainText('3 ta fayl');
  await composer(page).fill('Albom izohi');
  await page.getByTestId('send-button').click();
  const album = page.getByTestId('album').last();
  await expect(album).toBeVisible();
  await expect(album.locator('img')).toHaveCount(3);
  // The grid must keep its own width inside the shrink-to-fit bubble (it once collapsed to the caption's width).
  // Polled: the optimistic album is swapped for the server copy, so the first element may detach mid-check.
  await expect.poll(async () => (await page.getByTestId('album').last().boundingBox())?.width ?? 0, { timeout: 10_000 }).toBeGreaterThanOrEqual(280);
  await expect(page.locator('[data-msg-id]').last()).toContainText('Albom izohi');
  await expect
    .poll(
      () =>
        withDb(async (db) => {
          const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
          const last: any = await db.collection('messages').findOne({ senderId: me._id, type: 'image', albumId: { $ne: null } }, { sort: { createdAt: -1 } });
          if (!last) return 0;
          return db.collection('messages').countDocuments({ albumId: last.albumId, 'media.key': { $regex: /^conversations/ } });
        }),
      { timeout: 30_000 }
    )
    .toBe(3);
  await expect(album.getByTestId('upload-overlay')).toHaveCount(0, { timeout: 15_000 });
  const captioned = await withDb(async (db) => {
    const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
    const last: any = await db.collection('messages').findOne({ senderId: me._id, type: 'image', albumId: { $ne: null } }, { sort: { createdAt: -1 } });
    return db.collection('messages').countDocuments({ albumId: last.albumId, text: 'Albom izohi' });
  });
  expect(captioned).toBe(1);

  // Viewer: open from the first tile, step forward, close with Escape.
  await album.locator('button').first().click();
  const viewer = page.getByTestId('media-viewer');
  await expect(viewer).toBeVisible();
  await expect(viewer).toContainText(/\/ \d+/);
  const before = await viewer.textContent();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => viewer.textContent()).not.toBe(before);
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
});

test('a document shows its name and size and downloads from the bucket', async ({ page }) => {
  await openChat(page, E2E_PHONE, E2E_FRIEND_USERNAME);
  const pdf = Buffer.from(`%PDF-1.4\n% e2e ${Date.now()}\n${'x'.repeat(20_000)}`);
  await page.getByLabel('Fayl tanlash').setInputFiles({ name: 'hujjat-2026.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByTestId('send-button').click();
  const card = page.getByTestId('file-bubble').last();
  await expect(card).toContainText('hujjat-2026.pdf');
  await expect(card).toContainText(/KB/, { timeout: 20_000 });
  const link = page.locator('a[data-testid="file-bubble"]').last();
  await expect(link).toHaveAttribute('href', /127\.0\.0\.1:9100/, { timeout: 20_000 });
  const href = await link.getAttribute('href');
  const dl = await page.request.get(href!);
  expect(dl.status()).toBe(200);
  expect(dl.headers()['content-disposition']).toBe('attachment');
  expect((await dl.body()).length).toBe(pdf.length);
  const stored: any = await withDb(async (db) => {
    const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
    return db.collection('messages').findOne({ senderId: me._id, type: 'file' }, { sort: { createdAt: -1 } });
  });
  expect(stored.media.name).toBe('hujjat-2026.pdf');
});

test('a voice note recorded with the (fake) microphone carries a waveform and plays', async ({ page }) => {
  await openChat(page, E2E_PHONE, E2E_FRIEND_USERNAME);
  await page.getByRole('button', { name: 'Ovozli xabar yozish' }).click();
  // Stop by the recorder's own clock, not a fixed sleep: the first getUserMedia on a page is slow and the
  // fake microphone feeds the analyser silence for up to ~1.2 s, so a 1.8 s sleep sometimes recorded an all-zero waveform.
  await expect(page.getByText(/^00:0[3-9]$/)).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Yozishni tugatib yuborish' }).click();
  const voice = page.getByTestId('voice-bubble').last();
  await expect(voice).toBeVisible();
  const stored: any = await expect
    .poll(
      () =>
        withDb(async (db) => {
          const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
          return db.collection('messages').findOne({ senderId: me._id, type: 'voice', 'media.key': { $regex: /^conversations/ } }, { sort: { createdAt: -1 } });
        }),
      { timeout: 30_000 }
    )
    .toBeTruthy()
    .then(() =>
      withDb(async (db) => {
        const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
        return db.collection('messages').findOne({ senderId: me._id, type: 'voice' }, { sort: { createdAt: -1 } });
      })
    );
  expect(stored.media.durationSec).toBeGreaterThanOrEqual(2);
  expect(Array.isArray(stored.media.waveform)).toBe(true);
  expect(stored.media.waveform.length).toBe(60);
  expect(Math.max(...stored.media.waveform)).toBe(31);
  // Speed button appears once playing.
  await voice.getByRole('button', { name: /Ovozli xabarni ijro etish/ }).click();
  await expect(voice.getByRole('button', { name: 'Tezlik' })).toBeVisible({ timeout: 15_000 });
});

test('forward copies the photo inside the bucket; a reply to it shows a thumbnail', async ({ page }) => {
  await openChat(page, E2E_PHONE, E2E_FRIEND_USERNAME);
  const original: any = await withDb(async (db) => {
    const me: any = await db.collection('users').findOne({ phone: E2E_PHONE });
    return db.collection('messages').findOne({ senderId: me._id, type: 'image', albumId: null, forwardedFrom: null }, { sort: { createdAt: 1 } });
  });
  // Photos only fetch their signed URL once scrolled into view, so find the bubble by id and bring it on screen
  // (in a thread with history it sits well above the fold).
  const bubble = page.locator(`[data-msg-id="${original._id}"]`);
  await bubble.scrollIntoViewIfNeeded();
  await expect(bubble.locator('img')).toBeVisible({ timeout: 15_000 });
  await bubble.getByRole('button', { name: /Xabar amallari/ }).click();
  await page.getByRole('button', { name: /^Yuborish$/ }).first().click();
  // PARITY_PLAN WP5: ko'p tanlovli oyna — chatni belgilash, keyin "Yuborish (1)".
  await page.getByTestId('forward-modal').getByTestId('forward-target').filter({ hasText: E2E_FRIEND_USERNAME }).first().click();
  await page.getByTestId('forward-modal').getByTestId('forward-send').click();
  await expect(page.getByTestId('forwarded-label').last()).toBeVisible({ timeout: 20_000 });
  const copy: any = await expect
    .poll(
      () =>
        withDb(async (db) => db.collection('messages').findOne({ 'forwardedFrom.userId': { $exists: true }, type: 'image' }, { sort: { createdAt: -1 } })),
      { timeout: 20_000 }
    )
    .toBeTruthy()
    .then(() => withDb(async (db) => db.collection('messages').findOne({ 'forwardedFrom.userId': { $exists: true }, type: 'image' }, { sort: { createdAt: -1 } })));
  expect(copy.media.key).not.toBe(original.media.key);
  expect((await page.request.head(`${S3}${copy.media.key}`)).status()).toBe(200);
  expect(copy.media.width).toBe(original.media.width);

  // Reply to the photo → quote with a thumbnail image.
  await bubble.getByRole('button', { name: /Xabar amallari/ }).click();
  await page.getByRole('button', { name: /Javob berish/ }).first().click();
  await expect(page.getByTestId('reply-banner')).toContainText('Rasm');
  await composer(page).fill('rasmga javob');
  await composer(page).press('Enter');
  const reply = page.locator('[data-msg-id]').filter({ hasText: 'rasmga javob' }).last();
  await expect(reply.locator('button img')).toBeVisible({ timeout: 20_000 });
});

test('files dropped on the conversation land in the tray', async ({ page }) => {
  await openChat(page, E2E_PHONE, E2E_FRIEND_USERNAME);
  await page.getByTestId('conversation-view').evaluate((el) => {
    const dt = new DataTransfer();
    dt.items.add(new File(['hello'], 'drop.txt', { type: 'text/plain' }));
    dt.items.add(new File(['world'], 'drop2.txt', { type: 'text/plain' }));
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: dt }));
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
  });
  await expect(page.getByTestId('attachment-tray')).toContainText('2 ta fayl');
  await page.getByRole('button', { name: 'Bekor qilish' }).click();
  await expect(page.getByTestId('attachment-tray')).toHaveCount(0);
});
