import { describe, expect, it } from 'vitest';
import { formatListTime } from './formatListTime';
import { formatListTime as fromPresence } from '../presence';

// Mahalliy vaqt konstruktori — test har qanday TZ'da bir xil.
const now = new Date(2026, 10, 6, 0, 5); // 2026-11-06 (juma) 00:05

describe('formatListTime (WP8.10)', () => {
  it('today shows HH:mm', () => {
    expect(formatListTime(new Date(2026, 10, 6, 0, 1), now)).toBe('00:01');
    expect(formatListTime(new Date(2026, 10, 6, 9, 7), new Date(2026, 10, 6, 23, 59))).toBe('09:07');
  });

  it('a message 10 minutes before midnight is "yesterday", not today', () => {
    expect(formatListTime(new Date(2026, 10, 5, 23, 55), now, 'uz')).toBe('Kecha');
    expect(formatListTime(new Date(2026, 10, 5, 23, 55), now, 'en')).toBe('Yesterday');
    expect(formatListTime(new Date(2026, 10, 5, 23, 55), now, 'ru')).toBe('Вчера');
    expect(formatListTime(new Date(2026, 10, 5, 1, 0), now, 'en', { yesterday: 'Yday' })).toBe('Yday');
  });

  it('within a week shows the weekday for the locale', () => {
    // 2026-11-02 — dushanba
    expect(formatListTime(new Date(2026, 10, 2, 12, 0), now, 'uz')).toBe('Dush');
    expect(formatListTime(new Date(2026, 10, 2, 12, 0), now, 'en')).toBe('Mon');
  });

  it('older than a week shows dd.MM.yy', () => {
    expect(formatListTime(new Date(2026, 9, 30, 12, 0), now)).toBe('30.10.26');
    expect(formatListTime(new Date(2025, 0, 3, 8, 0), now, 'en')).toBe('03.01.25');
  });

  it('empty and invalid input give an empty string; presence.js re-exports it', () => {
    expect(formatListTime(null, now)).toBe('');
    expect(formatListTime('nope', now)).toBe('');
    expect(fromPresence).toBe(formatListTime);
  });
});
