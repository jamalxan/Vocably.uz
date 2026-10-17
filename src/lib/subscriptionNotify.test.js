import { describe, it, expect } from 'vitest';
import { buildActivationMessages, formatTerm } from './subscriptionNotify';

const expiresAt = new Date('2027-04-17T10:00:00Z');

describe('formatTerm', () => {
  it('uses months, and years for whole years', () => {
    expect(formatTerm(1)).toBe('1 oy');
    expect(formatTerm(6)).toBe('6 oy');
    expect(formatTerm(12)).toBe('1 yil');
    expect(formatTerm(24)).toBe('2 yil');
  });
});

describe('buildActivationMessages', () => {
  it('gift: names the tier, term and end date', () => {
    const m = buildActivationMessages({ kind: 'gift', tier: 'premium', months: 6, expiresAt, name: 'Ali Valiyev' });
    expect(m.type).toBe('gift');
    expect(m.title).toContain('sovg');
    expect(m.title).toContain('Premium');
    expect(m.telegram).toContain('<b>Premium</b>');
    expect(m.telegram).toContain('<b>6 oy</b>');
    expect(m.telegram).toContain('17-aprel, 2027');
    expect(m.telegram).toContain('<b>Ali</b>');
  });

  it('purchase: payment type, no gift wording', () => {
    const m = buildActivationMessages({ kind: 'purchase', tier: 'standard', months: 1, expiresAt, name: '' });
    expect(m.type).toBe('payment');
    expect(m.telegram).not.toMatch(/sovg/i);
    expect(m.telegram).toContain('<b>Standard</b>');
  });

  it('escapes HTML in the user name for Telegram', () => {
    const m = buildActivationMessages({ kind: 'gift', tier: 'standard', months: 3, expiresAt, name: '<b>x' });
    expect(m.telegram).not.toContain('<b>&lt;b&gt;x</b>'.replace('&lt;b&gt;x', '<b>x'));
    expect(m.telegram).toContain('&lt;b&gt;x');
  });
});
