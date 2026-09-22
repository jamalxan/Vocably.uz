import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// AUDIT AI-01 — bu test faqat "REDIS_URL sozlanmagan" tezkor yo'lni tekshiradi
// (haqiqiy/yetib bo'lmaydigan Redis'ga ulanishni CI'da qo'lda sinash sekin va
// beqaror bo'lardi — bu sessiyada alohida, bir martalik skript bilan qo'lda
// tasdiqlangan: enqueue ~3s ichida `{queued:false, backend:'redis-error'}`
// bilan yakunlanadi, hech qachon abadiy osilib qolmaydi). Bu yerdagi maqsad —
// eng ko'p uchraydigan holatni (Redis umuman sozlanmagan) qulflab qo'yish:
// contentQueue hech qachon I/O urinishisiz, DARHOL degrade qilishi kerak.
describe('contentQueue — REDIS_URL sozlanmaganda', () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    delete process.env.REDIS_URL;
    delete global.__vocablyContentQueue;
  });

  afterEach(() => {
    if (originalRedisUrl === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = originalRedisUrl;
    delete global.__vocablyContentQueue;
  });

  it('getContentQueue() returns null without attempting any connection', async () => {
    const { getContentQueue } = await import('./contentQueue.js');
    expect(getContentQueue()).toBeNull();
  });

  it('enqueueIngestJob() resolves immediately with a mongo-only degrade result', async () => {
    const { enqueueIngestJob } = await import('./contentQueue.js');
    const started = Date.now();
    const result = await enqueueIngestJob({ ingestJobId: '1', bookId: '2', stage: 'extract', idempotencyKey: 'k1' });
    expect(result).toEqual({ queued: false, backend: 'mongo-only' });
    expect(Date.now() - started).toBeLessThan(200); // no network I/O should ever be attempted
  });

  it('scheduleMaintenanceSweep() resolves immediately with a mongo-only degrade result', async () => {
    const { scheduleMaintenanceSweep } = await import('./contentQueue.js');
    const started = Date.now();
    const result = await scheduleMaintenanceSweep();
    expect(result).toEqual({ scheduled: false, backend: 'mongo-only' });
    expect(Date.now() - started).toBeLessThan(200);
  });
});
