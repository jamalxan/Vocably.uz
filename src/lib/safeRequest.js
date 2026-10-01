// NoSQL operator inyeksiyasidan umumiy himoya. Mongoose filtrida `{ field: { $ne: '' } }` — haqiqiy operator: agar route
// JSON tanadan kelgan qiymatni to'g'ridan-to'g'ri filtrga qo'ysa (`findOne({ sessionToken })`), hujumchi `{"sessionToken":{"$ne":""}}`
// yuborib ixtiyoriy yozuvni tanlay oladi (OTP/parol tiklash sessiyalari, o'z kategoriyalari va h.k.). 186 ta yo'lni birma-bir
// tuzatish o'rniga, `Request.json()` natijasidagi `$` bilan boshlanuvchi kalitli har bir obyekt xavfsiz matn bilan almashtiriladi
// ("[noto'g'ri]") — filtrga tushsa hech narsa topilmaydi, oddiy so'rovlar o'zgarmaydi (mijoz hech qachon Mongo operatori yubormaydi).
// Qo'shimcha: `__proto__`/`constructor`/`prototype` kalitlari ham tashlanadi (prototype pollution).

const REPLACEMENT = "[noto'g'ri]";
const MAX_DEPTH = 12;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** @param {unknown} value @param {number} depth */
export function stripOperators(value, depth = 0) {
  if (value === null || typeof value !== 'object') return value;
  if (depth > MAX_DEPTH) return REPLACEMENT;
  if (Array.isArray(value)) return value.map((v) => stripOperators(v, depth + 1));
  for (const key of Object.keys(value)) {
    if (key.startsWith('$')) return REPLACEMENT;
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(k)) continue;
    out[k] = stripOperators(v, depth + 1);
  }
  return out;
}

const INSTALLED = Symbol.for('vocably.safeRequestJson');

/** `Request.prototype.json` ni bir marta o'raydi (idempotent). */
export function installSafeJson(RequestCtor = globalThis.Request) {
  const proto = RequestCtor?.prototype;
  if (!proto || proto[INSTALLED] || typeof proto.json !== 'function') return false;
  const original = proto.json;
  proto.json = async function safeJson(...args) {
    return stripOperators(await original.apply(this, args));
  };
  Object.defineProperty(proto, INSTALLED, { value: true });
  return true;
}

installSafeJson();
