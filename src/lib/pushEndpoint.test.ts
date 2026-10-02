import { describe, expect, it } from 'vitest';
import { isAllowedPushEndpoint, isValidPushKey } from './pushEndpoint';

describe('isAllowedPushEndpoint (SSRF himoyasi)', () => {
  it.each([
    'https://fcm.googleapis.com/fcm/send/abc',
    'https://updates.push.services.mozilla.com/wpush/v2/abc',
    'https://web.push.apple.com/abc',
    'https://wns2-par02p.notify.windows.com/?token=abc',
  ])('haqiqiy push xizmati ruxsat: %s', (u) => expect(isAllowedPushEndpoint(u)).toBe(true));

  it.each([
    'http://fcm.googleapis.com/x',
    'https://127.0.0.1/x',
    'https://localhost/x',
    'https://169.254.169.254/latest/meta-data',
    'https://evil.com/fcm.googleapis.com',
    'https://fcm.googleapis.com.evil.com/x',
    'https://evilfcm.googleapis.com.attacker.io/x',
    'https://user:pw@fcm.googleapis.com/x',
    'https://fcm.googleapis.com:8443/x',
    'file:///etc/passwd',
    'not a url',
    '',
  ])('rad etiladi: %s', (u) => expect(isAllowedPushEndpoint(u)).toBe(false));

  it('matn bo‘lmagan va juda uzun qiymat rad etiladi', () => {
    expect(isAllowedPushEndpoint({ href: 'https://fcm.googleapis.com' })).toBe(false);
    expect(isAllowedPushEndpoint(`https://fcm.googleapis.com/${'a'.repeat(1100)}`)).toBe(false);
  });
});

describe('isValidPushKey', () => {
  it('base64url qabul, qolgani rad', () => {
    expect(isValidPushKey('BNc_-abc123==')).toBe(true);
    expect(isValidPushKey('')).toBe(false);
    expect(isValidPushKey('a b')).toBe(false);
    expect(isValidPushKey('x'.repeat(201))).toBe(false);
    expect(isValidPushKey({ a: 1 })).toBe(false);
  });
});
