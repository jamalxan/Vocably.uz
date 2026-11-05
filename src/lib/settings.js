import { AppSetting } from '@/lib/models';
import { PAID_TIERS } from '@/lib/payments/config';

// Admin-editable settings, one document per key (AppSetting). Each key's shape
// is owned here: a `normalize*` function turns whatever the admin/bot sent
// into a valid value (or null), so storage never holds a broken setting.

export const WELCOME_TRIAL_KEY = 'welcomeTrial';
export const WELCOME_TRIAL_MONTHS = [1, 3, 6, 12];
/** Short trial terms in days (TZ 2.0 §10: "7 kunlik bepul Premium sinov, kartasiz"). */
export const WELCOME_TRIAL_DAYS = [3, 7, 14];

/** Product rule (2026-11-05, TZ 2.0 §10): every new account gets 7 days of Premium free, no card
 * (was 1 month since 2026-10-22).
 * The admin can switch it off or change tier/term in /admin/settings or via
 * the bot (`/admin trial ...`). */
export const WELCOME_TRIAL_DEFAULT = Object.freeze({ enabled: true, tier: 'premium', months: null, days: 7 });

/** Pure: validates a welcome-trial value; unknown fields are dropped. Returns
 * null when a required field is invalid, so a bad PATCH is rejected whole. */
export function normalizeWelcomeTrial(input, base = WELCOME_TRIAL_DEFAULT) {
  const src = input && typeof input === 'object' ? input : {};
  const enabled = src.enabled === undefined ? base.enabled : src.enabled === true || src.enabled === 'true' || src.enabled === 'on';
  const tier = src.tier === undefined ? base.tier : String(src.tier).toLowerCase();
  if (!PAID_TIERS.includes(tier)) return null;
  // The term is either days or months. A new `days` wins; a new `months` clears days; otherwise keep the base term.
  let days = null;
  let months = null;
  if (src.days !== undefined && src.days !== null && src.days !== '') days = Number(src.days);
  else if (src.months !== undefined) months = Number(src.months);
  else if (base.days) days = base.days;
  else months = base.months;
  if (days !== null) {
    if (!WELCOME_TRIAL_DAYS.includes(days)) return null;
    return { enabled, tier, months: null, days };
  }
  if (!WELCOME_TRIAL_MONTHS.includes(months)) return null;
  return { enabled, tier, months, days: null };
}

export async function getSetting(key, fallback = null) {
  const doc = await AppSetting.findOne({ key }).lean();
  return doc ? doc.value : fallback;
}

export async function setSetting(key, value, by = null) {
  await AppSetting.updateOne({ key }, { $set: { value, updatedAt: new Date(), updatedBy: by } }, { upsert: true });
  return value;
}

export async function getWelcomeTrial() {
  const stored = await getSetting(WELCOME_TRIAL_KEY, null);
  return normalizeWelcomeTrial(stored) || { ...WELCOME_TRIAL_DEFAULT };
}

export function setWelcomeTrial(value, by = null) {
  return setSetting(WELCOME_TRIAL_KEY, value, by);
}
