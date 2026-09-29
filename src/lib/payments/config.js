import { TIER_CONFIG } from '@/lib/entitlements';

// Payment configuration. Manual payment (card transfer + receipt) always
// works; Payme and Click switch on by themselves once their credentials are
// set in the environment — no code change needed.

export const PAID_TIERS = ['standard', 'premium'];

/** Price in so'm for a tier and term (1 = monthly, 12 = yearly). */
export function priceFor(tier, months) {
  const cfg = TIER_CONFIG[tier];
  if (!cfg || !PAID_TIERS.includes(tier)) return null;
  if (months === 1) return cfg.priceMonthly;
  if (months === 12) return cfg.priceYearly;
  return null;
}

/** Card details shown on the checkout page for manual transfers. */
export function manualPaymentDetails() {
  const card = (process.env.PAYMENT_CARD_NUMBER || '').trim();
  if (!card) return null;
  return {
    card,
    holder: (process.env.PAYMENT_CARD_HOLDER || '').trim(),
    bank: (process.env.PAYMENT_CARD_BANK || '').trim(),
  };
}

export function paymeConfig() {
  const merchantId = process.env.PAYME_MERCHANT_ID;
  const key = process.env.PAYME_SECRET_KEY;
  if (!merchantId || !key) return null;
  return {
    merchantId,
    key,
    checkoutUrl: process.env.PAYME_CHECKOUT_URL || 'https://checkout.paycom.uz',
  };
}

export function clickConfig() {
  const serviceId = process.env.CLICK_SERVICE_ID;
  const merchantId = process.env.CLICK_MERCHANT_ID;
  const secretKey = process.env.CLICK_SECRET_KEY;
  if (!serviceId || !merchantId || !secretKey) return null;
  return { serviceId, merchantId, secretKey, merchantUserId: process.env.CLICK_MERCHANT_USER_ID || '' };
}

/** What the client may know: which methods are available (never secrets). */
export function publicPaymentOptions() {
  return {
    manual: manualPaymentDetails(),
    payme: !!paymeConfig(),
    click: !!clickConfig(),
  };
}
