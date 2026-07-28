import crypto from 'crypto';

// 6 xonali tasdiqlash kodi (masalan: 483920)
export function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// Sessiya uchun noyob token (Telegram deep-link'da /start parametri sifatida ishlatiladi)
export function generateSessionToken() {
  return crypto.randomBytes(16).toString('hex');
}
