// TURN/STUN sozlamalari (coturn `use-auth-secret`, "TURN REST API" sxemasi).
// Sof modul (DB/so'rovsiz) — /api/chat/ice-servers va qo'ng'iroq grant'i
// (/api/chat/conversations/[id]/calls) shu yerdan foydalanadi, unit test: turn.test.js.
//
// Env: TURN_SECRET (coturn'dagi static-auth-secret bilan bir xil, SHART — bo'lmasa faqat
// STUN), TURN_HOST (standart turn.vocably.uz), TURN_TTL_SEC (standart 600),
// ixtiyoriy TURN_URLS / STUN_URLS (vergul bilan ajratilgan ro'yxat — host'dan
// yasalgan standart URL'larni to'liq almashtiradi).
import { createHmac } from 'node:crypto';

export const DEFAULT_TURN_HOST = 'turn.vocably.uz';
export const DEFAULT_TURN_TTL_SEC = 600;

// username = "<amal qilish muddati, unix soniya>:<userId>", credential =
// base64(HMAC-SHA1(secret, username)). coturn muddat o'tgan username'ni o'zi rad etadi.
export function buildTurnCredentials(secret, userId, ttlSec, nowSec) {
  const username = `${nowSec + ttlSec}:${userId}`;
  return { username, credential: createHmac('sha1', secret).update(username).digest('base64') };
}

const splitList = (v) => {
  const list = typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];
  return list.length ? list : null;
};

let warned = false;
function warnOnce(msg) {
  if (warned) return;
  warned = true;
  console.warn(msg);
}

export function resolveTurnTtl(env = process.env) {
  const n = Math.floor(Number(env.TURN_TTL_SEC));
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TURN_TTL_SEC;
}

// RTCPeerConnection uchun `iceServers` + credential'ning umri (client keshlash uchun)
// va TURN bormi (`turn: false` — faqat STUN, NAT ortidagi ba'zi tarmoqlarda ulanmasligi mumkin).
export function buildIceServers(userId, env = process.env, nowSec = Math.floor(Date.now() / 1000)) {
  const ttlSec = resolveTurnTtl(env);
  if (!env.TURN_SECRET) {
    warnOnce("[turn] TURN_SECRET sozlanmagan — faqat STUN");
    return { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }], ttlSec, turn: false };
  }
  const host = (typeof env.TURN_HOST === 'string' && env.TURN_HOST.trim()) || DEFAULT_TURN_HOST;
  const stun = splitList(env.STUN_URLS) || [`stun:${host}:3478`];
  const turnUrls = splitList(env.TURN_URLS) || [`turn:${host}:3478?transport=udp`, `turn:${host}:3478?transport=tcp`];
  return {
    iceServers: [{ urls: stun }, { urls: turnUrls, ...buildTurnCredentials(env.TURN_SECRET, String(userId), ttlSec, nowSec) }],
    ttlSec,
    turn: true,
  };
}
