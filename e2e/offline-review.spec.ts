// Offline takrorlash (B2): navbatni yuklash → internetsiz javob berish → ulanganda yuborish. XP o'zgarmasligi tekshiriladi.
import { expect, test } from '@playwright/test';
import mongoose from 'mongoose';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test.describe.configure({ mode: 'serial' });

async function withDb<T>(fn: (db: mongoose.mongo.Db) => Promise<T>): Promise<T> {
  await mongoose.connect(process.env.E2E_MONGODB_URI!);
  try {
    return await fn(mongoose.connection.db!);
  } finally {
    await mongoose.disconnect();
  }
}

// Seed so'zlari "yangi" — navbatga tushishi uchun dastlabki 3 tasini muddati kelgan holatga o'tkazamiz.
async function makeThreeWordsDue() {
  return withDb(async (db) => {
    const users = db.collection('users');
    const u: any = await users.findOne({ phone: E2E_PHONE });
    // Boshqa speclar so'zlarni "muddati kelgan" qilib qo'ygan bo'lishi mumkin — aynan 3 tasi navbatda, qolgani "yangi" bo'lsin.
    const words = u.categories[0].words.map((w: any, i: number) =>
      i < 3
        ? { ...w, stats: { srsState: 'review', reps: 2, intervalDays: 1, ease: 2.5, correct: 2, wrong: 0, lapses: 0, nextReview: new Date(Date.now() - 3600_000), lastReviewed: new Date(Date.now() - 90_000_000) } }
        : { ...w, stats: { srsState: 'new', reps: 0 } }
    );
    await users.updateOne({ _id: u._id }, { $set: { 'categories.0.words': words } });
    await db.collection('reviewevents').deleteMany({ userId: u._id, mode: 'offline' });
    await db.collection('offlinereviewreceipts').deleteMany({ userId: u._id });
    return { xp: u.xp || 0, ids: words.slice(0, 3).map((w: any) => String(w._id)) };
  });
}

test('offline: yuklash → internetsiz 3 javob → ulanganda yuboriladi, XP o‘zgarmaydi', async ({ page, context }) => {
  const seeded = await makeThreeWordsDue();
  await loginAs(page, E2E_PHONE);
  const card = page.getByRole('region', { name: 'Offline takrorlash' });
  // Isitish: sovuq dev serverda Next "Fast Refresh full reload" qiladi — offline holatda bu sahifani uzib qo'yardi (production'da yo'q).
  await page.goto('/app/mashq');
  await expect(card).toBeVisible({ timeout: 90_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.reload();
  await expect(card).toBeVisible({ timeout: 60_000 });

  await card.getByRole('button', { name: /Navbatni yuklash/ }).click();
  await expect(card.getByText(/3 ta so‘z offline uchun yuklandi/)).toBeVisible({ timeout: 45_000 });
  await expect(card.getByRole('button', { name: 'Boshlash (3)' })).toBeEnabled();

  // Dev serverda resurslar hali yuklanayotgan bo'lsa, offline'ga o'tgach sahifa osilib qoladi — avval tinchlanishini kutamiz.
  await page.waitForLoadState('networkidle');
  await context.setOffline(true);
  await card.getByRole('button', { name: 'Boshlash (3)' }).click();
  for (let i = 0; i < 3; i++) {
    await card.getByRole('button', { name: 'Javobni ko‘rsat' }).click();
    await card.getByRole('button', { name: i === 1 ? 'Bilmadim' : 'Bilaman' }).click();
  }
  await expect(card.getByText(/3 ta javob saqlandi/)).toBeVisible();
  await expect(card.getByText(/Ulanganda avtomatik yuboriladi/)).toBeVisible();

  // Internet qaytadi — `online` hodisasi avtomatik yuboradi
  await context.setOffline(false);
  await card.getByRole('button', { name: 'Yopish' }).click();
  await expect(card.getByRole('button', { name: /Yuborish \(/ })).toHaveCount(0, { timeout: 30_000 });

  await withDb(async (db) => {
    const u: any = await db.collection('users').findOne({ phone: E2E_PHONE });
    const w = u.categories[0].words.slice(0, 3);
    expect(w.map((x: any) => x.stats.reps)).toEqual([3, 3, 3]); // 2 → 3
    expect(w[1].stats.wrong).toBe(1); // "Bilmadim"
    expect(u.xp || 0).toBe(seeded.xp); // offline XP bermaydi
    expect(await db.collection('reviewevents').countDocuments({ userId: u._id, mode: 'offline' })).toBe(3);
  });
});

test('logout offline ma‘lumotni tozalaydi (umumiy qurilma)', async ({ page, isMobile }) => {
  test.skip(isMobile, '"Chiqish" tugmasi desktop sidebar\'ida');
  await makeThreeWordsDue();
  await loginAs(page, E2E_PHONE);
  await page.goto('/app/mashq');
  const card = page.getByRole('region', { name: 'Offline takrorlash' });
  await expect(card).toBeVisible({ timeout: 60_000 });
  await card.getByRole('button', { name: /Navbatni yuklash/ }).click();
  await expect(card.getByRole('button', { name: 'Boshlash (3)' })).toBeEnabled({ timeout: 45_000 });

  // Sidebar'dagi "Chiqish" tugmasi AppContext.logout() ni chaqiradi.
  await page.getByRole('button', { name: 'Chiqish' }).first().click();
  await page.waitForTimeout(1500);
  const left = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const req = indexedDB.open('vocably-offline');
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('due', 'readonly');
          const c = tx.objectStore('due').count();
          c.onsuccess = () => resolve(c.result);
          c.onerror = () => resolve(-1);
        };
        req.onerror = () => resolve(-1);
      })
  );
  expect(left).toBe(0);
});
