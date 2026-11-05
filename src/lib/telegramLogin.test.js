import { describe, it, expect } from 'vitest';
import { verifyTelegramLogin, signTelegramLogin, telegramCheckString, TG_LOGIN_MAX_AGE_S, telegramPhone, isTelegramPhone } from './telegramLogin';

const TOKEN = '123456:TEST-token';
const NOW = 1_780_000_000_000;
const nowS = NOW / 1000;

function signed(fields, token = TOKEN) {
  return { ...fields, hash: signTelegramLogin(fields, token) };
}
const base = { id: 777001, first_name: 'Ali', username: 'ali_uz', auth_date: nowS - 30 };

describe('Telegram Login Widget verification', () => {
  it('builds the data-check-string sorted by key, without hash', () => {
    expect(telegramCheckString({ username: 'u', id: 1, hash: 'x', auth_date: 5 })).toBe('auth_date=5\nid=1\nusername=u');
  });

  it('accepts correctly signed, fresh data', () => {
    const r = verifyTelegramLogin(signed(base), TOKEN, NOW);
    expect(r).toEqual({ ok: true, user: { id: 777001, firstName: 'Ali', lastName: '', username: 'ali_uz' } });
  });

  it('accepts string values the same as numbers (query-string style)', () => {
    const d = signed(base);
    expect(verifyTelegramLogin({ ...d, id: String(d.id), auth_date: String(d.auth_date) }, TOKEN, NOW).ok).toBe(true);
  });

  it('rejects a tampered field, a wrong bot token and a missing hash', () => {
    expect(verifyTelegramLogin({ ...signed(base), id: 1 }, TOKEN, NOW)).toEqual({ ok: false, reason: 'bad_hash' });
    expect(verifyTelegramLogin(signed(base, '999:other'), TOKEN, NOW).reason).toBe('bad_hash');
    expect(verifyTelegramLogin({ ...base }, TOKEN, NOW).reason).toBe('bad_payload');
  });

  it('rejects stale and far-future data', () => {
    expect(verifyTelegramLogin(signed({ ...base, auth_date: nowS - TG_LOGIN_MAX_AGE_S - 1 }), TOKEN, NOW).reason).toBe('expired');
    expect(verifyTelegramLogin(signed({ ...base, auth_date: nowS + 600 }), TOKEN, NOW).reason).toBe('expired');
    expect(verifyTelegramLogin(signed({ ...base, auth_date: nowS - TG_LOGIN_MAX_AGE_S + 5 }), TOKEN, NOW).ok).toBe(true);
  });

  it('rejects odd payloads before touching crypto', () => {
    expect(verifyTelegramLogin(null, TOKEN, NOW).reason).toBe('bad_payload');
    expect(verifyTelegramLogin([1], TOKEN, NOW).reason).toBe('bad_payload');
    expect(verifyTelegramLogin({ ...signed(base), extra: { $ne: 1 } }, TOKEN, NOW).reason).toBe('bad_payload');
    expect(verifyTelegramLogin({ ...signed(base), 'Bad-Key': 'x' }, TOKEN, NOW).reason).toBe('bad_payload');
    expect(verifyTelegramLogin(signed({ ...base, id: -5 }), TOKEN, NOW).reason).toBe('bad_payload');
    expect(verifyTelegramLogin(signed(base), '', NOW).reason).toBe('not_configured');
  });

  it('marks Telegram-only accounts by a phone placeholder', () => {
    expect(telegramPhone(42)).toBe('tg:42');
    expect(isTelegramPhone('tg:42')).toBe(true);
    expect(isTelegramPhone('998901234567')).toBe(false);
  });
});
