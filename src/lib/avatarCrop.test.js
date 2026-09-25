import { describe, it, expect } from 'vitest';
import { rotatedSize, coverScale, clampOffset, clampZoom, zoomAround } from './avatarCrop';
import { avatarInitials, avatarGradient, AVATAR_GRADIENTS, canViewPhoto, avatarUrl } from './avatarShared';

describe('avatarCrop', () => {
  it('rotatedSize 90/270 da tomonlarni almashtiradi', () => {
    expect(rotatedSize(400, 300, 0)).toEqual({ w: 400, h: 300 });
    expect(rotatedSize(400, 300, 90)).toEqual({ w: 300, h: 400 });
    expect(rotatedSize(400, 300, -90)).toEqual({ w: 300, h: 400 });
    expect(rotatedSize(400, 300, 180)).toEqual({ w: 400, h: 300 });
  });

  it('coverScale qisqa tomonni oynaga tenglashtiradi', () => {
    expect(coverScale(400, 300, 0, 300)).toBe(1);
    expect(coverScale(1000, 500, 0, 250)).toBe(0.5);
  });

  it('clampOffset rasm chetini oyna ichiga kiritmaydi', () => {
    const opts = { width: 400, height: 300, rotation: 0, zoom: 1, viewport: 300 };
    // gorizontal: (400-300)/2 = 50 gacha; vertikal: 0
    expect(clampOffset({ x: 999, y: 999 }, opts)).toEqual({ x: 50, y: 0 });
    expect(clampOffset({ x: -999, y: -5 }, opts)).toEqual({ x: -50, y: 0 });
    // zoom 2: (800-300)/2=250, (600-300)/2=150
    expect(clampOffset({ x: 999, y: -999 }, { ...opts, zoom: 2 })).toEqual({ x: 250, y: -150 });
  });

  it('clampZoom chegaralaydi', () => {
    expect(clampZoom(0.2)).toBe(1);
    expect(clampZoom(10)).toBe(4);
    expect(clampZoom(NaN)).toBe(1);
  });

  it('zoomAround langar nuqtani joyida qoldiradi', () => {
    const next = zoomAround({ x: 0, y: 0 }, { x: 100, y: 0 }, 1, 2);
    expect(next).toEqual({ x: -100, y: 0 });
  });
});

describe('avatarShared', () => {
  it('bosh harflar Telegram kabi', () => {
    expect(avatarInitials('Ali Valiyev', 'ali')).toBe('AV');
    expect(avatarInitials('ali  karim  valiyev', '')).toBe('AV');
    expect(avatarInitials('Diyora', 'd')).toBe('D');
    expect(avatarInitials('', '@jamol')).toBe('J');
    expect(avatarInitials('', '')).toBe('?');
    expect(avatarInitials('😀 Bek', '')).toBe('😀B');
  });

  it('gradient bir xil seed uchun barqaror', () => {
    expect(avatarGradient('abc')).toEqual(avatarGradient('abc'));
    expect(AVATAR_GRADIENTS).toContainEqual(avatarGradient('64f000000000000000000001'));
  });

  it('canViewPhoto maxfiylik qoidalari', () => {
    expect(canViewPhoto('nobody', { isOwner: true })).toBe(true);
    expect(canViewPhoto('everyone', { blocked: true })).toBe(false);
    expect(canViewPhoto('nobody', {})).toBe(false);
    expect(canViewPhoto('friends', { hasConversation: false })).toBe(false);
    expect(canViewPhoto('friends', { hasConversation: true })).toBe(true);
    expect(canViewPhoto('everyone', {})).toBe(true);
  });

  it('avatarUrl', () => {
    expect(avatarUrl('u', null)).toBeNull();
    expect(avatarUrl('u', 'p')).toBe('/api/avatars/u/p?size=small');
    expect(avatarUrl('u', 'p', 'full')).toBe('/api/avatars/u/p?size=full');
  });
});
