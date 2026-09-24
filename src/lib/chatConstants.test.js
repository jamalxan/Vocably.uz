import { describe, it, expect } from 'vitest';
import { isConversationMuted, isMutedNow, shouldShowLastSeen } from './chatConstants';

const HOUR = 60 * 60 * 1000;

describe('shouldShowLastSeen', () => {
  it('always shows when visibility is "everyone"', () => {
    expect(shouldShowLastSeen('everyone', true)).toBe(true);
    expect(shouldShowLastSeen('everyone', false)).toBe(true);
  });

  it('never shows when visibility is "nobody"', () => {
    expect(shouldShowLastSeen('nobody', true)).toBe(false);
    expect(shouldShowLastSeen('nobody', false)).toBe(false);
  });

  it('shows for "friends" only when the viewer has a conversation', () => {
    expect(shouldShowLastSeen('friends', true)).toBe(true);
    expect(shouldShowLastSeen('friends', false)).toBe(false);
  });

  it('defaults to showing for unknown/legacy values (back-compat)', () => {
    expect(shouldShowLastSeen(undefined, true)).toBe(true);
    expect(shouldShowLastSeen(null, false)).toBe(true);
  });
});

describe('isConversationMuted', () => {
  it('returns false when neither mutedBy nor mutedUntil are set', () => {
    expect(isConversationMuted({ mutedBy: [], mutedUntil: {} }, 'u1')).toBe(false);
  });

  it('returns true when the user is in the permanent mutedBy list', () => {
    expect(isConversationMuted({ mutedBy: ['u1'], mutedUntil: {} }, 'u1')).toBe(true);
  });

  it('returns true for a still-active timed mute (plain object mutedUntil)', () => {
    const convo = { mutedBy: [], mutedUntil: { u1: new Date(Date.now() + HOUR).toISOString() } };
    expect(isConversationMuted(convo, 'u1')).toBe(true);
  });

  it('returns false once a timed mute has expired', () => {
    const convo = { mutedBy: [], mutedUntil: { u1: new Date(Date.now() - HOUR).toISOString() } };
    expect(isConversationMuted(convo, 'u1')).toBe(false);
  });

  it('supports a Map-shaped mutedUntil (mongoose document, not .lean())', () => {
    const convo = { mutedBy: [], mutedUntil: new Map([['u1', new Date(Date.now() + HOUR)]]) };
    expect(isConversationMuted(convo, 'u1')).toBe(true);
  });

  it('does not leak mute state to a different user', () => {
    const convo = { mutedBy: ['u1'], mutedUntil: {} };
    expect(isConversationMuted(convo, 'u2')).toBe(false);
  });
});

describe('isMutedNow', () => {
  it('returns false for a falsy conversation', () => {
    expect(isMutedNow(null)).toBe(false);
  });

  it('uses the permanent `muted` flag when mutedUntil is absent', () => {
    expect(isMutedNow({ muted: true })).toBe(true);
    expect(isMutedNow({ muted: false })).toBe(false);
  });

  it('treats an active mutedUntil as muted regardless of the `muted` flag', () => {
    const iso = new Date(Date.now() + HOUR).toISOString();
    expect(isMutedNow({ muted: false, mutedUntil: iso })).toBe(true);
  });

  it('treats an expired mutedUntil as not muted', () => {
    const iso = new Date(Date.now() - HOUR).toISOString();
    expect(isMutedNow({ muted: true, mutedUntil: iso })).toBe(false);
  });
});
