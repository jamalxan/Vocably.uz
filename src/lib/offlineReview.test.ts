import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { BATCH_SIZE, clearOfflineData, downloadDueQueue, listPending, loadDueQueue, recordAnswer, saveDueQueue, syncPending } from './offlineReview';

const words = (n: number) => Array.from({ length: n }, (_, i) => ({ wordId: `w${i}`, categoryId: 'c1', word: `word${i}`, translations: [`t${i}`] }));
const res = (status: number, json: unknown = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => json }) as any;

describe('offlineReview (IndexedDB)', () => {
  beforeEach(async () => {
    await clearOfflineData();
  });

  it('navbat foydalanuvchiga bog‘langan; javob berilgan so‘z navbatdan chiqadi va javob kutishga tushadi', async () => {
    await saveDueQueue('u1', words(3));
    await saveDueQueue('u2', words(1));
    expect((await loadDueQueue('u1')).words).toHaveLength(3);
    const item = await recordAnswer('u1', { wordId: 'w1', categoryId: 'c1', correct: true, responseMs: 1234.6 });
    expect(item.clientSeq).toMatch(/^[A-Za-z0-9_-]{8,64}$/); // server regex'iga mos
    expect((await loadDueQueue('u1')).words.map((w) => w.wordId)).toEqual(['w0', 'w2']);
    expect((await listPending('u1')).map((p) => p.wordId)).toEqual(['w1']);
    expect(await listPending('u2')).toEqual([]); // boshqa akkaunt ko'rmaydi
  });

  it('syncPending: muvaffaqiyatda navbat bo‘shaydi, serverga userId yuborilmaydi', async () => {
    await saveDueQueue('u1', words(2));
    await recordAnswer('u1', { wordId: 'w0', categoryId: 'c1', correct: true });
    await recordAnswer('u1', { wordId: 'w1', categoryId: 'c1', correct: false });
    let sent: any[] = [];
    const out = await syncPending('u1', async (batch) => {
      sent = batch;
      return res(200, { applied: 2 });
    });
    expect(out).toEqual({ sent: 2, applied: 2, remaining: 0, error: null });
    expect(sent.every((r) => !('userId' in r) && r.clientSeq && r.clientTs)).toBe(true);
  });

  it('tarmoq/5xx/429/401 xatosida javoblar saqlanib qoladi; 4xx da olib tashlanadi', async () => {
    await recordAnswer('u1', { wordId: 'w0', categoryId: 'c1', correct: true });
    for (const [post, err] of [
      [async () => { throw new Error('offline'); }, 'network'],
      [async () => res(503), 'server'],
      [async () => res(429), 'server'],
      [async () => res(401), 'unauthorized'],
    ] as const) {
      const out = await syncPending('u1', post as any);
      expect(out).toMatchObject({ sent: 0, remaining: 1, error: err });
    }
    const out = await syncPending('u1', async () => res(400, { error: 'bad' }));
    expect(out).toMatchObject({ sent: 1, remaining: 0, error: null });
  });

  it('katta navbat 100 talik paketlarga bo‘linadi; ikkinchi paket xatosi birinchisini bekor qilmaydi', async () => {
    for (let i = 0; i < BATCH_SIZE + 5; i++) await recordAnswer('u1', { wordId: `w${i}`, categoryId: 'c1', correct: true });
    let calls = 0;
    const out = await syncPending('u1', async (batch) => {
      calls++;
      if (calls === 2) return res(503);
      expect(batch.length).toBeLessThanOrEqual(BATCH_SIZE);
      return res(200, { applied: batch.length });
    });
    expect(out).toMatchObject({ sent: BATCH_SIZE, applied: BATCH_SIZE, remaining: 5, error: 'server' });
  });

  it('downloadDueQueue serverdan olib saqlaydi; xatoda tashlaydi', async () => {
    const ok = await downloadDueQueue('u1', 10, async () => res(200, { total: 7, words: words(3) }));
    expect(ok).toEqual({ saved: 3, total: 7 });
    expect((await loadDueQueue('u1')).words).toHaveLength(3);
    await expect(downloadDueQueue('u1', 10, async () => res(401))).rejects.toThrow('unauthorized');
  });

  it('clearOfflineData hammasini o‘chiradi (logout)', async () => {
    await saveDueQueue('u1', words(2));
    await recordAnswer('u1', { wordId: 'w0', categoryId: 'c1', correct: true });
    await clearOfflineData();
    expect((await loadDueQueue('u1')).words).toEqual([]);
    expect(await listPending('u1')).toEqual([]);
  });
});
