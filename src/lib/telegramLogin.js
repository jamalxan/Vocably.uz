// Telegram Login Widget (TZ 2.0 §6.10.1): verifies the signed user data the widget hands to the page.
// https://core.telegram.org/widgets/login#checking-authorization
//   data_check_string = every received field except `hash`, sorted by key, "key=value" joined by "\n"
//   secret_key        = SHA256(bot_token)
//   valid             = hex(HMAC_SHA256(data_check_string, secret_key)) === hash
// Pure apart from node:crypto — tested in telegramLogin.test.js.
import crypto from 'node:crypto';

/** Widget data older than this is refused (limits replay of a leaked payload). */
export const TG_LOGIN_MAX_AGE_S = 3600;
/** Small allowance for a server clock that runs behind Telegram's. */
const FUTURE_SKEW_S = 120;
const KEY_RE = /^[a-z_]{1,32}$/;
const HASH_RE = /^[a-f0-9]{64}$/;

export function telegramCheckString(data) {
  return Object.keys(data)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
}

export function signTelegramLogin(data, botToken) {
  const secret = crypto.createHash('sha256').update(botToken).digest();
  return crypto.createHmac('sha256', secret).update(telegramCheckString(data)).digest('hex');
}

/**
 * @returns {{ ok: true, user: { id: number, firstName: string, lastName: string, username: string } } | { ok: false, reason: string }}
 */
export function verifyTelegramLogin(data, botToken, nowMs = Date.now()) {
  if (!botToken) return { ok: false, reason: 'not_configured' };
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, reason: 'bad_payload' };
  const keys = Object.keys(data);
  if (keys.length > 12) return { ok: false, reason: 'bad_payload' };
  const clean = {};
  for (const k of keys) {
    const v = data[k];
    // Only scalar fields — an object/array here would stringify differently on both sides.
    if (!KEY_RE.test(k) || (typeof v !== 'string' && typeof v !== 'number') || String(v).length > 512) return { ok: false, reason: 'bad_payload' };
    clean[k] = String(v);
  }
  if (!HASH_RE.test(clean.hash || '')) return { ok: false, reason: 'bad_payload' };
  const id = Number(clean.id);
  const authDate = Number(clean.auth_date);
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(authDate)) return { ok: false, reason: 'bad_payload' };

  const expected = Buffer.from(signTelegramLogin(clean, botToken), 'hex');
  const got = Buffer.from(clean.hash, 'hex');
  if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return { ok: false, reason: 'bad_hash' };

  const nowS = Math.floor(nowMs / 1000);
  if (authDate > nowS + FUTURE_SKEW_S || nowS - authDate > TG_LOGIN_MAX_AGE_S) return { ok: false, reason: 'expired' };

  return {
    ok: true,
    user: {
      id,
      firstName: (clean.first_name || '').trim().slice(0, 64),
      lastName: (clean.last_name || '').trim().slice(0, 64),
      username: (clean.username || '').trim().slice(0, 64),
    },
  };
}

/** Placeholder `phone` for accounts created through Telegram (the widget gives no phone number). */
export const telegramPhone = (id) => `tg:${id}`;
export const isTelegramPhone = (phone) => typeof phone === 'string' && phone.startsWith('tg:');
