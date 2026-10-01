// Analytics hodisalari (TZ §35): schema versiyalangan, payload kichik va tozalangan.
import { EVENT_NAMES, EVENT_SCHEMA_VERSION, type EventName } from './config';

export interface VocabEventInput {
  name: string;
  payload?: Record<string, unknown>;
}

export interface VocabEventDoc {
  name: EventName;
  schemaVersion: number;
  payload: Record<string, string | number | boolean | null>;
}

const MAX_KEYS = 20;
const MAX_STRING = 120;

export function isEventName(name: string): name is EventName {
  return (EVENT_NAMES as readonly string[]).includes(name);
}

/** Faqat primitiv qiymatlar, cheklangan uzunlik — shaxsiy ma'lumot/katta obyekt tushib qolmasin. */
export function sanitizePayload(payload: Record<string, unknown> | undefined): VocabEventDoc['payload'] {
  const out: VocabEventDoc['payload'] = {};
  if (!payload || typeof payload !== 'object') return out;
  let n = 0;
  for (const [k, v] of Object.entries(payload)) {
    if (n >= MAX_KEYS) break;
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, MAX_STRING);
    else if (typeof v === 'number' && isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean' || v === null) out[k] = v as boolean | null;
    else continue;
    n += 1;
  }
  return out;
}

/** Noto'g'ri nomli hodisa null qaytaradi (yozilmaydi). */
export function buildEvent(input: VocabEventInput): VocabEventDoc | null {
  if (!isEventName(input.name)) return null;
  return { name: input.name, schemaVersion: EVENT_SCHEMA_VERSION, payload: sanitizePayload(input.payload) };
}
