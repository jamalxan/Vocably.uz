import { describe, expect, it } from 'vitest';
import { computeSignupFunnel } from './funnel';

const DAY = 24 * 3600 * 1000;
const now = new Date('2026-10-20T12:00:00Z');
const at = (daysAgo: number, plusH = 0) => new Date(now.getTime() - daysAgo * DAY + plusH * 3600 * 1000);

describe('computeSignupFunnel', () => {
  it('birinchi o‘yin 24 soat ichida, D1 va D7 qaytish', () => {
    const users = [
      { id: 'a', createdAt: at(10) }, // o'yin 2 soatda, D1 va D7 qaytdi
      { id: 'b', createdAt: at(10) }, // o'yin 30 soatdan keyin (voronkaga kirmaydi), D1 yo'q
      { id: 'c', createdAt: at(10) }, // hech narsa
    ];
    const events = [
      { userId: 'a', at: at(10, 2), kind: 'game' as const },
      { userId: 'a', at: at(9, 5), kind: 'review' as const }, // D1
      { userId: 'a', at: at(3, 1), kind: 'review' as const }, // D7
      { userId: 'b', at: at(10, 30), kind: 'game' as const }, // 30 soat — D1 oynasida (24–48 soat)
    ];
    const f = computeSignupFunnel(users, events, now);
    expect(f.signups).toBe(3);
    expect(f.firstGame24h).toBe(1);
    expect(f.firstGame24hRate).toBe(33);
    expect(f.d1).toEqual({ eligible: 3, retained: 2, rate: 67 }); // a va b
    expect(f.d7).toEqual({ eligible: 3, retained: 1, rate: 33 });
  });

  it('oynasi hali tugamagan foydalanuvchilar qaytish maxrajiga kirmaydi', () => {
    const users = [
      { id: 'new', createdAt: at(0.5) }, // 12 soat oldin — D1 hali yo'q
      { id: 'mid', createdAt: at(3) }, // D1 bor, D7 hali yo'q
    ];
    const f = computeSignupFunnel(users, [], now);
    expect(f.d1.eligible).toBe(1);
    expect(f.d7.eligible).toBe(0);
    expect(f.d7.rate).toBeNull();
  });

  it('bo‘sh kogorta', () => {
    const f = computeSignupFunnel([], [], now);
    expect(f).toMatchObject({ signups: 0, firstGame24h: 0, firstGame24hRate: null });
  });
});
