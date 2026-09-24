import { describe, it, expect } from 'vitest';
import { formatAuditDiff } from './auditDiffFormat';

describe('formatAuditDiff', () => {
  it('formats a from/to diff (chat.user.update) as readable "field: from → to" lines', () => {
    expect(formatAuditDiff({ role: { from: 'user', to: 'teacher' } })).toEqual(['rol: user → teacher']);
  });

  it('formats multiple from/to fields in one diff', () => {
    expect(
      formatAuditDiff({
        chatAccess: { from: false, to: true },
        subscriptionTier: { from: 'free', to: 'pro' },
      })
    ).toEqual(["do'stlar ruxsati: yo'q → ha", 'tarif: free → pro']);
  });

  it('formats a flat detail object (e.g. {"messageCount":50}) as a readable line', () => {
    expect(formatAuditDiff({ messageCount: 50 })).toEqual(['xabarlar soni: 50']);
  });

  it('formats a flat detail object with multiple known fields', () => {
    expect(formatAuditDiff({ isPublished: true })).toEqual(["e'lon qilingan: ha"]);
    expect(formatAuditDiff({ requested: 10, accepted: 8, minConfidence: 0.7 })).toEqual([
      "so'ralgan: 10",
      'qabul qilingan: 8',
      'min ishonch: 0.7',
    ]);
  });

  it('falls back to the raw key name for unknown flat fields', () => {
    expect(formatAuditDiff({ unknownField: 'x' })).toEqual(['unknownField: x']);
  });

  it('renders null/empty-string/undefined values as "yo\'q"', () => {
    expect(formatAuditDiff({ reason: null })).toEqual(["sabab: yo'q"]);
    expect(formatAuditDiff({ reason: '' })).toEqual(["sabab: yo'q"]);
  });

  it('joins array values with commas', () => {
    expect(formatAuditDiff({ stages: ['ocr', 'audio'] })).toEqual(['bosqichlar: ocr, audio']);
    expect(formatAuditDiff({ stages: [] })).toEqual(["bosqichlar: bo'sh"]);
  });

  it('returns an empty array for an empty diff object', () => {
    expect(formatAuditDiff({})).toEqual([]);
  });

  it('returns null for nested/unknown shapes so the caller falls back to pretty JSON', () => {
    expect(formatAuditDiff({ scope: 'book', bookId: '507f1f77bcf86cd799439011', extra: { nested: true } })).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(formatAuditDiff(null)).toBeNull();
    expect(formatAuditDiff(undefined)).toBeNull();
    expect(formatAuditDiff('x')).toBeNull();
    expect(formatAuditDiff([1, 2])).toBeNull();
  });
});
