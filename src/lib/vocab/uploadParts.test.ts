import { describe, expect, it } from 'vitest';
import { MAX_PARTS, MAX_UPLOAD_BYTES, PART_BYTES, checkComplete, splitRanges, validatePart } from './uploadParts';

describe('validatePart', () => {
  const ok = { uploadId: 'abcd1234-efgh', index: 0, total: 3, size: 1000 };
  it('to‘g‘ri qismni qabul qiladi', () => {
    expect(validatePart(ok)).toMatchObject({ ok: true, meta: { index: 0, total: 3 } });
    expect(validatePart({ ...ok, index: '2', total: '3', size: String(PART_BYTES) })).toMatchObject({ ok: true });
  });
  it('xavfli/noto‘g‘ri uploadId ni rad etadi (yo‘l/operator belgilari)', () => {
    for (const id of ['short', '../../etc/passwd-xx', 'a b c d e f g h', '$ne', 'x'.repeat(65), undefined]) {
      expect(validatePart({ ...ok, uploadId: id })).toMatchObject({ ok: false, code: 'bad_upload_id' });
    }
  });
  it('chegaralar: total, index, size', () => {
    expect(validatePart({ ...ok, total: 0 })).toMatchObject({ code: 'bad_total' });
    expect(validatePart({ ...ok, total: MAX_PARTS + 1 })).toMatchObject({ code: 'bad_total' });
    expect(validatePart({ ...ok, index: 3 })).toMatchObject({ code: 'bad_index' });
    expect(validatePart({ ...ok, index: -1 })).toMatchObject({ code: 'bad_index' });
    expect(validatePart({ ...ok, index: 1.5 })).toMatchObject({ code: 'bad_index' });
    expect(validatePart({ ...ok, size: 0 })).toMatchObject({ code: 'bad_size' });
    expect(validatePart({ ...ok, size: PART_BYTES + 1 })).toMatchObject({ code: 'bad_size' });
  });
});

describe('checkComplete', () => {
  it('hamma qism bor — yig‘ish mumkin', () => {
    expect(checkComplete([{ index: 1, size: 5 }, { index: 0, size: 7 }], 2)).toEqual({ ok: true, bytes: 12 });
  });
  it('yetishmayotgan qismni aytadi', () => {
    expect(checkComplete([{ index: 0, size: 5 }, { index: 2, size: 5 }], 3)).toMatchObject({ ok: false, code: 'missing_part' });
  });
  it('umumiy hajm chegaradan oshsa rad etadi', () => {
    const parts = Array.from({ length: 9 }, (_, i) => ({ index: i, size: PART_BYTES }));
    expect(parts.length * PART_BYTES).toBeGreaterThan(MAX_UPLOAD_BYTES - 1); // 27 MB > 25 MB
    expect(checkComplete(parts, 9)).toMatchObject({ ok: false, code: 'too_large' });
  });
});

describe('splitRanges', () => {
  it('fayl qismlarga to‘liq va ustma-ustsiz bo‘linadi', () => {
    const size = PART_BYTES * 2 + 123;
    const r = splitRanges(size);
    expect(r).toHaveLength(3);
    expect(r[0].start).toBe(0);
    expect(r[2].end).toBe(size);
    for (let i = 1; i < r.length; i++) expect(r[i].start).toBe(r[i - 1].end);
    expect(splitRanges(0)).toEqual([]);
  });
});
