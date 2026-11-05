// Promo / creator codes (TZ 2.0 §6.11 5, §10 4): a percentage off any paid plan at checkout; a creator
// code also earns its owner a share of each approved payment. Pure rules; Mongo side in ./promoServer.js.
// Tested in promo.test.js.

export const PROMO = {
  codeMin: 3,
  codeMax: 20,
  /** Prices are rounded to this (so'm) after a discount — no 68 999 so'm invoices. */
  roundTo: 100,
};
const CODE_RE = /^[A-Z0-9]{3,20}$/;

/** Uppercases and validates a code typed by the user or the admin; null when it can't be one. */
export function normalizePromoCode(raw) {
  const s = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
  return CODE_RE.test(s) ? s : null;
}

/**
 * Why a code can't be used right now, or null when it can. `uses` = approved + pending requests that
 * carry it (pending ones reserve a slot so an almost-exhausted code can't be oversold).
 */
export function promoRejection(promo, { now = new Date(), uses = promo?.usedCount || 0, userId = null } = {}) {
  if (!promo) return 'not_found';
  if (!promo.active) return 'inactive';
  if (promo.expiresAt && new Date(promo.expiresAt) <= now) return 'expired';
  if (promo.maxUses != null && uses >= promo.maxUses) return 'exhausted';
  if (promo.ownerId && userId && String(promo.ownerId) === String(userId)) return 'own_code';
  return null;
}

/** Discounted price: integer so'm, rounded to PROMO.roundTo, never below 0. */
export function priceWithPromo(listPrice, percentOff) {
  const pct = Math.min(100, Math.max(0, Number(percentOff) || 0));
  const raw = listPrice * (1 - pct / 100);
  const amount = Math.max(0, Math.round(raw / PROMO.roundTo) * PROMO.roundTo);
  return { listPrice, percentOff: pct, amount, discount: listPrice - amount };
}

/** Creator's share of an approved payment (integer so'm). */
export function commissionFor(amount, creatorShare) {
  const share = Math.min(100, Math.max(0, Number(creatorShare) || 0));
  return Math.round((amount * share) / 100);
}

/** Validates an admin's create form → clean doc fields, or { error }. */
export function cleanPromoInput(input, { now = new Date() } = {}) {
  const code = normalizePromoCode(input?.code);
  if (!code) return { error: 'bad_code' };
  const kind = input?.kind === 'creator' ? 'creator' : 'promo';
  const percentOff = Number(input?.percentOff);
  if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) return { error: 'bad_percent' };
  const creatorShare = kind === 'creator' ? Number(input?.creatorShare ?? 0) : 0;
  if (!Number.isInteger(creatorShare) || creatorShare < 0 || creatorShare > 100) return { error: 'bad_share' };
  let maxUses = null;
  if (input?.maxUses !== undefined && input?.maxUses !== null && input?.maxUses !== '') {
    maxUses = Number(input.maxUses);
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1_000_000) return { error: 'bad_max' };
  }
  let expiresAt = null;
  if (input?.expiresAt) {
    expiresAt = new Date(input.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) return { error: 'bad_expiry' };
  }
  const note = String(input?.note ?? '').trim().slice(0, 200);
  return { code, kind, percentOff, creatorShare, maxUses, expiresAt, note };
}
