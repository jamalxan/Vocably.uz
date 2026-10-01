import { describe, expect, it } from 'vitest';
import { MAX_WORDS_PER_USER, WORD_CAP_MESSAGE, wordRoom } from './wordCap';

describe('wordRoom', () => {
  it('sig‘sa fits=true, qolgan joyni qaytaradi', () => {
    expect(wordRoom(100, 50, 200)).toEqual({ room: 100, fits: true });
    expect(wordRoom(150, 50, 200)).toEqual({ room: 50, fits: true }); // aynan chegarada
  });
  it('bir dona ortiq bo‘lsa fits=false (qisman qo‘shilmaydi)', () => {
    expect(wordRoom(150, 51, 200)).toEqual({ room: 50, fits: false });
  });
  it('tavandan oshgan yoki manfiy sonlarda room 0 dan kam emas', () => {
    expect(wordRoom(250, 1, 200).room).toBe(0);
    expect(wordRoom(-5, 3, 200).room).toBe(200);
  });
  it('standart tavan MongoDB 16 MB chegarasidan (~19k boyitilgan so‘z) kamida ~2x past', () => {
    expect(MAX_WORDS_PER_USER).toBeLessThanOrEqual(9000);
    expect(WORD_CAP_MESSAGE()).toContain('8,000');
  });
});
