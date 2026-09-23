import { describe, it, expect } from 'vitest';
import { isValidMockKind, normalizeMockKind, MOCK_KINDS } from './mockKind';

describe('isValidMockKind', () => {
  it('accepts the three defined mock kinds', () => {
    for (const kind of MOCK_KINDS) expect(isValidMockKind(kind)).toBe(true);
  });

  it('rejects unknown strings, numbers, null and undefined', () => {
    expect(isValidMockKind('hard')).toBe(false);
    expect(isValidMockKind('')).toBe(false);
    expect(isValidMockKind(1)).toBe(false);
    expect(isValidMockKind(null)).toBe(false);
    expect(isValidMockKind(undefined)).toBe(false);
  });
});

describe('normalizeMockKind', () => {
  it('defaults to "exam" when nothing was provided (backward compat with old clients)', () => {
    expect(normalizeMockKind(undefined)).toBe('exam');
    expect(normalizeMockKind(null)).toBe('exam');
  });

  it('passes through a valid explicit value', () => {
    expect(normalizeMockKind('practice')).toBe('practice');
    expect(normalizeMockKind('secure')).toBe('secure');
  });

  it('returns null for an invalid explicit value, so the caller can 400', () => {
    expect(normalizeMockKind('turbo')).toBe(null);
    expect(normalizeMockKind(42)).toBe(null);
  });
});
