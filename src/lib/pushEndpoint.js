// Web Push obunasi `endpoint`i — server `web-push` orqali AYNAN shu URLga POST yuboradi. Tekshirilmasa tajovuzkor
// ichki manzilni (127.0.0.1, 169.254.169.254, intranet) ko'rsatib server nomidan so'rov yubortira oladi (SSRF).
// Faqat brauzer ishlab chiqaruvchilarining haqiqiy push xizmatlari ruxsat etiladi.
const ALLOWED_HOST_SUFFIXES = [
  'fcm.googleapis.com', // Chrome / Edge / Android
  'push.services.mozilla.com', // Firefox (updates.push.services.mozilla.com)
  'notify.windows.com', // Edge (WNS)
  'push.apple.com', // Safari (web.push.apple.com)
];

export const MAX_PUSH_ENDPOINT_LEN = 1000;
export const MAX_PUSH_KEY_LEN = 200;
export const MAX_PUSH_SUBSCRIPTIONS_PER_USER = 10;

export function isAllowedPushEndpoint(endpoint) {
  if (typeof endpoint !== 'string' || endpoint.length > MAX_PUSH_ENDPOINT_LEN) return false;
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return false;
  const host = url.hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
}

/** `keys.p256dh` / `keys.auth` — base64url matn, qisqa. */
export function isValidPushKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= MAX_PUSH_KEY_LEN && /^[A-Za-z0-9_\-+/=]+$/.test(key);
}
