import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { paymeAuthorized, toTiyin } from './payme';
import { clickSign } from './click';

describe('payme', () => {
  it('checks Basic auth as Paycom:<key>', () => {
    const h = 'Basic ' + Buffer.from('Paycom:secret:with:colons').toString('base64');
    expect(paymeAuthorized(h, 'secret:with:colons')).toBe(true);
    expect(paymeAuthorized(h, 'other')).toBe(false);
    expect(paymeAuthorized('Basic ' + Buffer.from('User:secret').toString('base64'), 'secret')).toBe(false);
    expect(paymeAuthorized(undefined, 'x')).toBe(false);
  });
  it('converts so‘m to tiyin', () => {
    expect(toTiyin(69000)).toBe(6900000);
  });
});

describe('click', () => {
  const p = { click_trans_id: '1', service_id: '2', merchant_trans_id: 'o', merchant_prepare_id: '9', amount: '69000', action: '1', sign_time: '2026-09-29 10:00:00' };
  it('prepare and complete signatures follow the Click formula', () => {
    const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
    expect(clickSign({ ...p, action: '0' }, 'K', false)).toBe(md5('12Ko690000' + '2026-09-29 10:00:00'));
    expect(clickSign(p, 'K', true)).toBe(md5('12Ko9690001' + '2026-09-29 10:00:00'));
  });
});
