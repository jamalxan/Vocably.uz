import { describe, it, expect } from 'vitest';
import { computeSalesFunnel, cleanFunnelHit, isBotAgent } from './salesFunnel';

describe('sales funnel', () => {
  it('step and top-of-funnel conversion', () => {
    const f = computeSalesFunnel({ landing: 1000, onboardingStart: 300, onboardingDone: 150, signups: 60, payers: 6 });
    expect(f.map((s) => s.key)).toEqual(['landing', 'onboarding_start', 'onboarding_done', 'signup', 'payment']);
    expect(f[0]).toEqual({ key: 'landing', count: 1000, fromPrev: null, fromTop: null });
    expect(f[1]).toMatchObject({ fromPrev: 30, fromTop: 30 });
    expect(f[3]).toMatchObject({ count: 60, fromPrev: 40, fromTop: 6 });
    expect(f[4]).toMatchObject({ count: 6, fromPrev: 10, fromTop: 0.6 });
  });

  it('empty stages give null rates, never NaN/Infinity', () => {
    const f = computeSalesFunnel({ landing: 0, onboardingStart: 0, onboardingDone: 0, signups: 3, payers: 0 });
    expect(f[3]).toMatchObject({ count: 3, fromPrev: null, fromTop: null });
    expect(f[4].fromPrev).toBe(0);
  });

  it('accepts only known stages and a random id; strips queries from the path', () => {
    const vid = 'a1b2c3d4e5f6a7b8c9d0';
    expect(cleanFunnelHit({ stage: 'landing', vid, path: '/games/run?phone=998901112233#x' })).toEqual({ stage: 'landing', vid, path: '/games/run' });
    expect(cleanFunnelHit({ stage: 'signup', vid })).toBeNull(); // signups are counted from accounts
    expect(cleanFunnelHit({ stage: 'landing', vid: 'short' })).toBeNull();
    expect(cleanFunnelHit({ stage: 'landing', vid: { $ne: '' } })).toBeNull();
    expect(cleanFunnelHit({ stage: 'landing', vid, path: 'https://evil.example/x' }).path).toBe('');
    expect(cleanFunnelHit(null)).toBeNull();
  });

  it('drops crawlers', () => {
    expect(isBotAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotAgent('TelegramBot (like TwitterBot)')).toBe(true);
    expect(isBotAgent('')).toBe(true);
    expect(isBotAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1')).toBe(false);
  });
});
