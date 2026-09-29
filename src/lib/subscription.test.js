import { describe, it, expect } from 'vitest';
import { addMonths, subscriptionState, effectiveTier, activationUpdate, dueNotice, GRACE_DAYS } from './subscription';

const DAY = 24 * 60 * 60 * 1000;
const at = (iso) => new Date(iso);

describe('addMonths', () => {
  it('adds one calendar month', () => {
    expect(addMonths(at('2026-09-29T10:00:00Z'), 1).toISOString()).toBe('2026-10-29T10:00:00.000Z');
  });
  it('clamps to the end of a shorter month', () => {
    expect(addMonths(at('2026-01-31T00:00:00Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(addMonths(at('2028-01-31T00:00:00Z'), 1).toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });
  it('crosses the year boundary', () => {
    expect(addMonths(at('2026-12-15T00:00:00Z'), 1).toISOString()).toBe('2027-01-15T00:00:00.000Z');
  });
});

describe('subscriptionState — one month, then 3-day grace, then locked', () => {
  const expiresAt = at('2026-10-29T10:00:00Z');
  const user = { subscriptionTier: 'standard', subscriptionExpiresAt: expiresAt };

  it('free users are simply free', () => {
    expect(subscriptionState({ subscriptionTier: 'free' })).toMatchObject({ status: 'free', effectiveTier: 'free' });
    expect(subscriptionState(null)).toMatchObject({ status: 'free', effectiveTier: 'free' });
  });

  it('is active (paid features open) before expiry', () => {
    const s = subscriptionState(user, new Date(expiresAt - 5 * DAY));
    expect(s).toMatchObject({ status: 'active', effectiveTier: 'standard', daysLeft: 5 });
  });

  it('keeps paid access during the grace days and counts them', () => {
    const day1 = subscriptionState(user, new Date(expiresAt.getTime() + 1000));
    expect(day1).toMatchObject({ status: 'grace', effectiveTier: 'standard', graceDay: 1, graceDaysLeft: 3 });
    const day3 = subscriptionState(user, new Date(expiresAt.getTime() + 2 * DAY + 1000));
    expect(day3).toMatchObject({ status: 'grace', effectiveTier: 'standard', graceDay: 3, graceDaysLeft: 1 });
  });

  it('locks back to free exactly GRACE_DAYS after expiry', () => {
    const justBefore = subscriptionState(user, new Date(expiresAt.getTime() + GRACE_DAYS * DAY - 1));
    expect(justBefore.effectiveTier).toBe('standard');
    const locked = subscriptionState(user, new Date(expiresAt.getTime() + GRACE_DAYS * DAY));
    expect(locked).toMatchObject({ status: 'expired', effectiveTier: 'free', tier: 'standard' });
    expect(effectiveTier(user, new Date(expiresAt.getTime() + 10 * DAY))).toBe('free');
  });

  it('legacy paid users without an expiry date stay active', () => {
    expect(subscriptionState({ subscriptionTier: 'premium' })).toMatchObject({ status: 'active', effectiveTier: 'premium', expiresAt: null });
  });
});

describe('activationUpdate', () => {
  const now = at('2026-09-29T10:00:00Z');

  it('new activation runs one month from now', () => {
    const upd = activationUpdate({ subscriptionTier: 'free' }, 'standard', { now });
    expect(upd.subscriptionTier).toBe('standard');
    expect(upd.subscriptionExpiresAt.toISOString()).toBe('2026-10-29T10:00:00.000Z');
    expect(upd.subscriptionStartedAt).toEqual(now);
  });

  it('early renewal keeps the remaining paid days', () => {
    const user = { subscriptionTier: 'standard', subscriptionExpiresAt: at('2026-10-10T10:00:00Z'), subscriptionStartedAt: at('2026-09-10T10:00:00Z') };
    const upd = activationUpdate(user, 'standard', { now });
    expect(upd.subscriptionExpiresAt.toISOString()).toBe('2026-11-10T10:00:00.000Z');
    expect(upd.subscriptionStartedAt.toISOString()).toBe('2026-09-10T10:00:00.000Z');
  });

  it('renewal during grace continues from the original expiry (grace days are not free)', () => {
    const user = { subscriptionTier: 'standard', subscriptionExpiresAt: at('2026-09-28T10:00:00Z') };
    const upd = activationUpdate(user, 'standard', { now });
    expect(upd.subscriptionExpiresAt.toISOString()).toBe('2026-10-28T10:00:00.000Z');
  });

  it('re-activation after lock starts fresh from now', () => {
    const user = { subscriptionTier: 'standard', subscriptionExpiresAt: at('2026-09-01T10:00:00Z') };
    const upd = activationUpdate(user, 'standard', { now });
    expect(upd.subscriptionExpiresAt.toISOString()).toBe('2026-10-29T10:00:00.000Z');
  });

  it('switching tier starts a fresh term', () => {
    const user = { subscriptionTier: 'standard', subscriptionExpiresAt: at('2026-10-10T10:00:00Z') };
    const upd = activationUpdate(user, 'premium', { now, months: 12 });
    expect(upd.subscriptionExpiresAt.toISOString()).toBe('2027-09-29T10:00:00.000Z');
  });

  it('setting free clears the term', () => {
    const upd = activationUpdate({ subscriptionTier: 'premium' }, 'free', { now });
    expect(upd).toMatchObject({ subscriptionTier: 'free', subscriptionExpiresAt: null });
  });
});

describe('dueNotice — exactly one notice per step, never repeated', () => {
  const expiresAt = at('2026-10-29T10:00:00Z');
  const base = { subscriptionTier: 'standard', subscriptionExpiresAt: expiresAt, subscriptionNotices: [] };
  const period = expiresAt.toISOString();

  it('nothing while more than a day is left', () => {
    expect(dueNotice(base, new Date(expiresAt - 3 * DAY))).toBeNull();
  });

  it('a reminder the day before expiry', () => {
    expect(dueNotice(base, new Date(expiresAt - 2 * 60 * 60 * 1000))?.key).toBe(`${period}:pre-1`);
  });

  it('an expiry notice, then one warning per grace day, then the lock notice', () => {
    const keys = [0, 1, 2].map((d) => dueNotice(base, new Date(expiresAt.getTime() + d * DAY + 1000))?.key);
    expect(keys).toEqual([`${period}:grace-1`, `${period}:grace-2`, `${period}:grace-3`]);
    expect(dueNotice(base, new Date(expiresAt.getTime() + 3 * DAY + 1000))?.key).toBe(`${period}:locked`);
  });

  it('does not resend a notice that was already delivered', () => {
    const user = { ...base, subscriptionNotices: [`${period}:grace-1`] };
    expect(dueNotice(user, new Date(expiresAt.getTime() + 1000))).toBeNull();
  });

  it('a renewal starts a fresh set of notices (keys are per period)', () => {
    const renewed = { ...base, subscriptionExpiresAt: at('2026-11-29T10:00:00Z'), subscriptionNotices: [`${period}:grace-1`] };
    expect(dueNotice(renewed, at('2026-11-29T12:00:00Z'))?.key).toBe('2026-11-29T10:00:00.000Z:grace-1');
  });

  it('no stale lock notice long after locking', () => {
    expect(dueNotice(base, new Date(expiresAt.getTime() + 30 * DAY))).toBeNull();
  });

  it('legacy/free users never get notices', () => {
    expect(dueNotice({ subscriptionTier: 'premium' })).toBeNull();
    expect(dueNotice({ subscriptionTier: 'free' })).toBeNull();
  });
});
