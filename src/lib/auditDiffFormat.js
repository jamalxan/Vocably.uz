// U-04 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md P2) — "Admin audit log'da xom JSON
// (masalan {"messageCount":50})". AuditLogTable.jsx shu yerdagi `formatAuditDiff`
// orqali `writeAuditLog(...)` chaqiruvlarida haqiqatda ishlatiladigan ikkita diff
// shaklini odam o'qiydigan jumlaga aylantiradi (call site'lar `writeAuditLog(` bo'yicha
// grep qilib tekshirildi):
//   1) "from/to" shakli — { field: { from, to } }. Faqat
//      src/app/api/admin/chat/users/[id]/route.js (chat.user.update) shu shaklda
//      yozadi: role/chatAccess/chatBanned/username/subscriptionTier o'zgarishi.
//   2) Tekis detail obyekti — { field: primitiveValue, ... }. Qolgan deyarli barcha
//      chaqiruvlar shu shaklda (masalan { isPublished }, { messageCount: 50 },
//      { reason }, { slug, title }, { requested, accepted, minConfidence }).
// Noma'lum/ichma-ich shakl (masalan content_book.update'dagi ixtiyoriy PATCH `body`,
// yoki kelgusida qo'shiladigan boshqa chaqiruvlar) uchun `null` qaytariladi — chaqiruvchi
// (AuditLogTable.jsx) bunda chiroyli formatlangan (indent bilan) JSON'ga tushadi, xom
// bitta qatorli JSON emas.

const FIELD_LABEL = {
  role: 'rol',
  chatAccess: "do'stlar ruxsati",
  chatBanned: 'chat bloklangan',
  username: 'username',
  subscriptionTier: 'tarif',
  isPublished: "e'lon qilingan",
  reason: 'sabab',
  messageCount: 'xabarlar soni',
  requested: "so'ralgan",
  accepted: 'qabul qilingan',
  minConfidence: 'min ishonch',
  slug: 'slug',
  title: 'sarlavha',
  stages: 'bosqichlar',
  key: 'kalit',
  status: 'holat',
  scope: 'qamrov',
  bookId: 'kitob ID',
  sourceId: 'manba ID',
  licence: 'litsenziya',
  publishScope: "e'lon qamrovi",
  primary: 'asosiy',
  fallback: 'zaxira',
  recipientCount: 'qabul qiluvchilar soni',
  action: 'amal',
};

function humanizeField(key) {
  return FIELD_LABEL[key] || key;
}

function humanizeValue(value) {
  if (value === null || value === undefined || value === '') return "yo'q";
  if (typeof value === 'boolean') return value ? 'ha' : "yo'q";
  if (Array.isArray(value)) return value.length === 0 ? "bo'sh" : value.join(', ');
  return String(value);
}

function isFromToShape(diff, keys) {
  return keys.every((k) => {
    const v = diff[k];
    return v && typeof v === 'object' && !Array.isArray(v) && 'from' in v && 'to' in v;
  });
}

function isFlatDetailShape(diff, keys) {
  return keys.every((k) => {
    const v = diff[k];
    return v === null || Array.isArray(v) || typeof v !== 'object';
  });
}

/**
 * `writeAuditLog`'ning `diff` obyektini odam o'qiydigan qator(lar)ga aylantiradi.
 * @param {unknown} diff
 * @returns {string[] | null} Har biri bitta jumla bo'lgan qatorlar ro'yxati (bo'sh
 *   diff uchun `[]`), yoki shakl tanilmasa `null` (fallback: pretty-print JSON).
 */
export function formatAuditDiff(diff) {
  if (!diff || typeof diff !== 'object' || Array.isArray(diff)) return null;
  const keys = Object.keys(diff);
  if (keys.length === 0) return [];

  if (isFromToShape(diff, keys)) {
    return keys.map((k) => `${humanizeField(k)}: ${humanizeValue(diff[k].from)} → ${humanizeValue(diff[k].to)}`);
  }
  if (isFlatDetailShape(diff, keys)) {
    return keys.map((k) => `${humanizeField(k)}: ${humanizeValue(diff[k])}`);
  }
  return null;
}
