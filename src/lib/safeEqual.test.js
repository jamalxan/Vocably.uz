import { describe, expect, it } from 'vitest';
import { bearerMatches, safeEqual } from './safeEqual';

describe('safeEqual', () => {
  it('teng qiymatlar true, farqli (jumladan uzunligi boshqa) false', () => {
    expect(safeEqual('abc123', 'abc123')).toBe(true);
    expect(safeEqual('abc123', 'abc124')).toBe(false);
    expect(safeEqual('abc', 'abc123')).toBe(false);
    expect(safeEqual('', 'x')).toBe(false);
  });
  it('null/undefined/raqam xato bermaydi', () => {
    expect(safeEqual(undefined, undefined)).toBe(true); // ikkalasi bo'sh — chaqiruvchi sir sozlanganini alohida tekshiradi
    expect(safeEqual(null, 'x')).toBe(false);
    expect(safeEqual(123456, '123456')).toBe(true);
  });
  it('unicode va uzun qiymatlar', () => {
    expect(safeEqual("o'zbek-ʻ", "o'zbek-ʻ")).toBe(true);
    expect(safeEqual('x'.repeat(10_000), 'x'.repeat(10_000))).toBe(true);
    expect(safeEqual('x'.repeat(10_000), 'x'.repeat(10_001))).toBe(false);
  });
});

describe('bearerMatches', () => {
  it('to‘g‘ri sir true; noto‘g‘ri/yo‘q header false', () => {
    expect(bearerMatches('Bearer s3cret', 's3cret')).toBe(true);
    expect(bearerMatches('Bearer wrong', 's3cret')).toBe(false);
    expect(bearerMatches(null, 's3cret')).toBe(false);
    expect(bearerMatches('s3cret', 's3cret')).toBe(false); // "Bearer " prefiksi shart
  });
  it('sir sozlanmagan bo‘lsa HECH QACHON ruxsat bermaydi (fail closed)', () => {
    expect(bearerMatches('Bearer ', '')).toBe(false);
    expect(bearerMatches('Bearer undefined', undefined)).toBe(false);
  });
});
