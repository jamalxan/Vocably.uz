// AES-256-GCM for backup parts. Everything that leaves the media server for the Telegram channel is sealed:
// the channel holds private chat media, and anyone who can open the channel must see only opaque blobs.
// A sealed part is `nonce(12) | ciphertext | tag(16)`. `aad` binds a part to its object and position, so a part
// cannot be swapped for another one without the decryption failing.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const NONCE = 12;
const TAG = 16;
export const SEAL_OVERHEAD = NONCE + TAG;

/** 32-byte key from 64 hex characters or base64. */
export function parseKey(raw) {
  const s = String(raw || '').trim();
  const key = /^[0-9a-f]{64}$/i.test(s) ? Buffer.from(s, 'hex') : Buffer.from(s, 'base64');
  if (key.length !== 32) throw new Error('BACKUP_KEY must be 32 bytes (64 hex characters or base64)');
  return key;
}

export const newKeyHex = () => randomBytes(32).toString('hex');
export const sha256hex = (data) => createHash('sha256').update(data).digest('hex');

export function seal(key, plain, aad = '') {
  const nonce = randomBytes(NONCE);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(Buffer.from(aad));
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([nonce, body, cipher.getAuthTag()]);
}

export function open(key, sealed, aad = '') {
  if (!Buffer.isBuffer(sealed) || sealed.length < SEAL_OVERHEAD) throw new Error('sealed part is too short');
  const decipher = createDecipheriv('aes-256-gcm', key, sealed.subarray(0, NONCE));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(sealed.subarray(sealed.length - TAG));
  return Buffer.concat([decipher.update(sealed.subarray(NONCE, sealed.length - TAG)), decipher.final()]);
}

/** Splits a buffer into chunks of at most `max` bytes (an empty buffer is one empty chunk). */
export function split(buf, max) {
  if (!(max > 0)) throw new Error('part size must be positive');
  const out = [];
  for (let at = 0; at < buf.length; at += max) out.push(buf.subarray(at, at + max));
  return out.length ? out : [Buffer.alloc(0)];
}

export const partAad = (objectKey, index, count) => `${objectKey}\n${index}/${count}`;
