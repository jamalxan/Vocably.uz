import { describe, expect, it } from 'vitest';
import { MAX_OFFLINE_BATCH, normalizeOfflineBatch } from './offlineBatch';

const now = new Date('2026-10-20T12:00:00Z');
const oid = (c: string) => c.repeat(24);
const rv = (over: Record<string, unknown> = {}) => ({ clientSeq: 'seq-0001-aaaa', categoryId: oid('a'), wordId: oid('b'), correct: true, clientTs: now.getTime() - 3600_000, ...over });

describe('normalizeOfflineBatch', () => {
  it('to‘g‘ri paket: vaqt bo‘yicha tartiblanadi, qiymatlar tozalanadi', () => {
    const out: any = normalizeOfflineBatch(
      [rv({ clientSeq: 'seq-0002-bbbb', clientTs: now.getTime() - 1000, rating: 9, responseMs: 9e9 }), rv({ clientSeq: 'seq-0003-cccc', clientTs: now.getTime() - 7200_000, rating: 3 })],
      now
    );
    expect(out.rejected).toEqual([]);
    expect(out.items.map((i: any) => i.clientSeq)).toEqual(['seq-0003-cccc', 'seq-0002-bbbb']);
    expect(out.items[1].rating).toBeUndefined(); // 9 — yaroqsiz
    expect(out.items[1].responseMs).toBe(120_000); // yuqoridan kesilgan
    expect(out.items[0].rating).toBe(3);
  });

  it('kelajak, juda eski, noto‘g‘ri id/correct/seq va ichki dublikat rad etiladi', () => {
    const out: any = normalizeOfflineBatch(
      [
        rv({ clientSeq: 'ok-seq-0001' }),
        rv({ clientSeq: 'fut-seq-0001', clientTs: now.getTime() + 3600_000 }),
        rv({ clientSeq: 'old-seq-0001', clientTs: now.getTime() - 49 * 3600_000 }),
        rv({ clientSeq: 'bad-id-0001', wordId: 'xyz' }),
        rv({ clientSeq: 'bad-cor-0001', correct: 'yes' }),
        rv({ clientSeq: 'x' }),
        rv({ clientSeq: 'ok-seq-0001' }),
        null,
        rv({ clientSeq: 'nan-ts-0001', clientTs: 'abc' }),
      ],
      now
    );
    expect(out.items).toHaveLength(1);
    expect(out.rejected.map((r: any) => r.reason)).toEqual(['future', 'too_old', 'ids', 'correct', 'clientSeq', 'duplicate_in_batch', 'format', 'clientTs']);
  });

  it('bir oz kelajakdagi soat farqi (≤5 daq) now ga tenglashtiriladi', () => {
    const out: any = normalizeOfflineBatch([rv({ clientTs: now.getTime() + 60_000 })], now);
    expect(out.items[0].at.getTime()).toBe(now.getTime());
  });

  it('bo‘sh / massiv emas / juda katta paket', () => {
    expect(normalizeOfflineBatch([], now)).toHaveProperty('error');
    expect(normalizeOfflineBatch({ a: 1 } as any, now)).toHaveProperty('error');
    expect(normalizeOfflineBatch(Array.from({ length: MAX_OFFLINE_BATCH + 1 }, () => rv()), now)).toHaveProperty('error');
  });
});
