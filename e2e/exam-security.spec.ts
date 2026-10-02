// Imtihon oqimi (dinamik sahifalar) va audit tuzatishlarining jonli tekshiruvi: javob kalitlari sizmaydi, qoralama test ochilmaydi,
// javob/insho chegaralari, "audio" sifatida yuklangan HTML rad etiladi, XP suiiste'moli cheklangan, yaroqsiz kirish 400.
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { E2E_PHONE } from './global-setup';
import { loginAs } from './auth';

test.describe.configure({ mode: 'serial' });

async function publishedTestId(req: APIRequestContext): Promise<string> {
  const { tests } = await (await req.get('/api/exam/tests')).json();
  const t = tests.find((x: any) => x.title === 'E2E Published Test');
  expect(t, 'chop etilgan E2E test ro‘yxatda bo‘lishi kerak').toBeTruthy();
  return t.id;
}

async function startAttempt(req: APIRequestContext, section: 'reading' | 'writing', testId: string): Promise<string> {
  const res = await req.post('/api/exam/attempts', { data: { mode: 'section', section, testId, abandonExisting: true } });
  expect(res.ok(), await res.text()).toBeTruthy();
  return (await res.json()).attemptId;
}

const collectErrors = (page: Page) => {
  const errs: string[] = [];
  page.on('pageerror', (e) => errs.push(e.message));
  return errs;
};

test.describe('imtihon va xavfsizlik (API + sahifalar)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, E2E_PHONE);
  });

  test('test ro‘yxati: faqat chop etilgan test, javob kalitlari va matn yo‘q', async ({ page }) => {
    const raw = await (await page.request.get('/api/exam/tests')).text();
    expect(raw).toContain('E2E Published Test');
    expect(raw).not.toContain('E2E Draft Test');
    for (const leak of ['accepted', 'explanationHtml', 'paragraphs', 'The History of Public Libraries']) expect(raw).not.toContain(leak);
  });

  test('qoralama (nashr qilinmagan) test bilan urinish boshlab bo‘lmaydi', async ({ page }) => {
    const mongo = await import('mongoose');
    await mongo.default.connect(process.env.E2E_MONGODB_URI!);
    const draft = await mongo.default.connection.collection('examtests').findOne({ title: 'E2E Draft Test' });
    await mongo.default.disconnect();
    const res = await page.request.post('/api/exam/attempts', { data: { mode: 'section', section: 'reading', testId: String(draft!._id) } });
    expect(res.status()).toBe(404);
  });

  test('Reading urinishi: sahifa ochiladi, API javobida javob kaliti yo‘q', async ({ page, isMobile }) => {
    const errs = collectErrors(page);
    const id = await startAttempt(page.request, 'reading', await publishedTestId(page.request));
    const api = await (await page.request.get(`/api/exam/attempts/${id}`)).text();
    for (const leak of ['accepted', 'explanationHtml', 'locatorParagraph']) expect(api, `API'da "${leak}" bo‘lmasligi kerak`).not.toContain(leak);

    await page.goto(`/app/oqish/${id}`);
    await page.waitForLoadState('networkidle', { timeout: 45_000 });
    if (!isMobile) await expect(page.getByText('The History of Public Libraries').first()).toBeVisible({ timeout: 30_000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    expect(errs).toEqual([]);
  });

  test('javoblarni saqlash: yaroqsiz kalit/qiymat/belgilar tashlanadi, hajm cheklanadi', async ({ page }) => {
    const id = await startAttempt(page.request, 'reading', await publishedTestId(page.request));
    const patch = await page.request.patch(`/api/exam/attempts/${id}/answers`, {
      data: {
        answers: { '1': 'ii', '6': 'FALSE', 'a.b': 'x', '../z': 'x', huge: 'x'.repeat(5000), obj: { a: 1 } },
        flagged: [1, 5000, -3, 2.5],
        lastQuestion: 3,
      },
    });
    expect(patch.ok()).toBeTruthy();
    const { attempt } = await (await page.request.get(`/api/exam/attempts/${id}`)).json();
    expect(Object.keys(attempt.answers).sort()).toEqual(['1', '6', 'huge']);
    expect(attempt.answers.huge).toHaveLength(1000);
    expect(attempt.flagged).toEqual([1]);
    expect(attempt.lastQuestion).toBe(3);

    // Operator ($) kalitli ob'ekt butunlay bekor qilinadi — hech narsa yozilmaydi, 500 ham emas.
    const op = await page.request.patch(`/api/exam/attempts/${id}/answers`, { data: { answers: { $set: 'x', '2': 'y' } } });
    expect(op.status()).toBeLessThan(500);
    const after = (await (await page.request.get(`/api/exam/attempts/${id}`)).json()).attempt;
    expect(after.answers['2']).toBeUndefined();
  });

  test('Writing: insho 20 000 belgiga kesiladi', async ({ page }) => {
    const id = await startAttempt(page.request, 'writing', await publishedTestId(page.request));
    const res = await page.request.patch(`/api/exam/attempts/${id}/answers`, { data: { essays: { task1: { text: 'w '.repeat(60_000), wordCount: 9e12 } } } });
    expect(res.ok()).toBeTruthy();
    const { attempt } = await (await page.request.get(`/api/exam/attempts/${id}`)).json();
    expect(attempt.essays.task1.text).toHaveLength(20_000);
    expect(attempt.essays.task1.wordCount).toBeLessThanOrEqual(20_000);
  });

  test('"audio" sifatida yuklangan HTML rad etiladi (saqlangan XSS himoyasi); haqiqiy audio imzosi gate\'dan o‘tadi', async ({ page }) => {
    const id = await startAttempt(page.request, 'reading', await publishedTestId(page.request));
    const html = Buffer.from('<html><script>alert(document.cookie)</script></html>'.padEnd(3000, ' '));
    const bad = await page.request.post(`/api/exam/attempts/${id}/speaking-recording`, {
      multipart: { part: '1', questionIndex: '0', durationSec: '5', audio: { name: 'evil.webm', mimeType: 'text/html', buffer: html } },
    });
    expect(bad.status()).toBe(415);
    // WebM imzosi bor fayl magic-bytes tekshiruvidan o'tadi; keyingi qadam (urinishda Speaking yo'q) 400 qaytaradi
    const webm = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(3000)]);
    const ok = await page.request.post(`/api/exam/attempts/${id}/speaking-recording`, {
      multipart: { part: '1', questionIndex: '0', durationSec: '5', audio: { name: 'a.webm', mimeType: 'audio/webm', buffer: webm } },
    });
    expect(ok.status()).toBe(400);
    expect(await ok.text()).toContain('Speaking');
  });

  test('XP suiiste‘moli: bir so‘zni ketma-ket takrorlash ikkinchi marta XP bermaydi; so‘z qo‘shish XP kunlik chegaralangan', async ({ page }) => {
    const xp = async () => (await (await page.request.get('/api/gamification/me')).json()).xp as number;
    const { categories } = await (await page.request.get('/api/words')).json();
    const cat = categories[0];
    const word = cat.words[cat.words.length - 1];

    const before = await xp();
    const r1 = await page.request.patch('/api/words/review', { data: { categoryId: cat._id, wordId: word._id, correct: true } });
    expect(r1.ok(), await r1.text()).toBeTruthy();
    const mid = await xp();
    const r2 = await page.request.patch('/api/words/review', { data: { categoryId: cat._id, wordId: word._id, correct: true } });
    expect(r2.ok()).toBeTruthy();
    const after = await xp();
    expect(after - mid, 'ikkinchi takroriy review XP bermasligi kerak').toBe(0);
    expect(mid - before).toBeGreaterThanOrEqual(0);

    // So'z qo'shish: 80 ta so'z (400 XP) — kunlik chegara 250
    const xpBefore = await xp();
    const batch = Array.from({ length: 80 }, (_, i) => ({ word: `xpfarm${i}`, syns: ['t'] }));
    const add = await page.request.post('/api/words/add', { data: { categoryId: cat._id, words: batch } });
    expect(add.ok(), await add.text()).toBeTruthy();
    expect((await xp()) - xpBefore).toBeLessThanOrEqual(250);
    // tozalash
    const { categories: after2 } = await (await page.request.get('/api/words')).json();
    const ids = after2.find((c: any) => c._id === cat._id).words.filter((w: any) => w.word.startsWith('xpfarm')).map((w: any) => w._id);
    expect((await page.request.delete('/api/words', { data: { categoryId: cat._id, wordIds: ids } })).ok()).toBeTruthy();
  });

  test('so‘z sahifasi (/app/lugat/soz/[id]) ochiladi va xatosiz', async ({ page }) => {
    const errs = collectErrors(page);
    const { categories } = await (await page.request.get('/api/words')).json();
    const word = categories[0].words[0];
    await page.goto(`/app/lugat/soz/${word._id}`);
    await page.waitForLoadState('networkidle', { timeout: 45_000 });
    await expect(page.getByText(word.word, { exact: false }).first()).toBeVisible({ timeout: 30_000 });
    expect(errs).toEqual([]);
  });

  test('yaroqsiz JSON va NoSQL operatorli kirish 400 (500 emas)', async ({ request }) => {
    const bad = await request.post('/api/auth/login', { headers: { 'content-type': 'application/json' }, data: '{bad json' });
    expect(bad.status()).toBe(400);
    const nosql = await request.post('/api/auth/login', { data: { phone: { $ne: '' }, password: { $ne: '' } } });
    expect(nosql.status()).toBe(400);
    const castErr = await request.get('/api/exam/tests/not-an-object-id');
    expect([400, 401]).toContain(castErr.status()); // login'siz 401, kirgan bo'lsa 400 — hech qachon 500
  });
});
