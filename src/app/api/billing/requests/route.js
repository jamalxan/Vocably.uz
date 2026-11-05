import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { PaymentRequest, User } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { priceFor, paymeConfig, clickConfig } from '@/lib/payments/config';
import { saveReceipt, receiptMagicMatches, RECEIPT_MAX_BYTES, RECEIPT_TYPES } from '@/lib/payments/receiptStorage';
import { paymeCheckoutUrl } from '@/lib/payments/payme';
import { clickCheckoutUrl } from '@/lib/payments/click';
import { cancelAbandonedOnlineRequests, countAwaitingReview } from '@/lib/payments/pending';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { escapeTelegramHtml } from '@/lib/telegramHtml';
import { TIER_CONFIG } from '@/lib/entitlements';
import { refundEligibility, termLabel } from '@/lib/billingTerms';
import { hadApprovedRefund } from '@/lib/payments/refund';
import { resolvePromo, promoSnapshot } from '@/lib/promoServer';
import { PROMO_MESSAGES } from '@/lib/promoMessages';
import { NextResponse } from 'next/server';

function requestOut(r, hadRefund = false) {
  const elig = refundEligibility(r, { hadRefund });
  return {
    id: String(r._id),
    tier: r.tier,
    months: r.months,
    amount: r.amount,
    method: r.method,
    status: r.status,
    rejectReason: r.rejectReason || '',
    promo: r.promo?.code ? { code: r.promo.code, percentOff: r.promo.percentOff, discount: r.promo.discount, listPrice: r.promo.listPrice } : null,
    hasReceipt: !!r.receiptFileId,
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt,
    refund: r.refund?.status && r.refund.status !== 'none' ? { status: r.refund.status, note: r.refund.note || '' } : null,
    refundableUntil: elig.ok ? elig.deadline : null,
  };
}

export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const [list, hadRefund] = await Promise.all([PaymentRequest.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(), hadApprovedRefund(userId)]);
    return NextResponse.json({ requests: list.map((r) => requestOut(r, hadRefund)) });
  } catch (err) {
    return serverError(err, 'billing/requests:get');
  }
}

// Manual: multipart with the receipt file. Payme/Click: JSON { tier, months,
// method } → returns the provider checkout URL for the created request.
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();

    const isMultipart = (req.headers.get('content-type') || '').includes('multipart/form-data');
    const form = isMultipart ? await req.formData() : null;
    const body = isMultipart ? null : await req.json().catch(() => ({}));
    const get = (k) => (form ? form.get(k) : body?.[k]);

    const tier = String(get('tier') || '');
    const months = Number(get('months'));
    const method = String(get('method') || 'manual');
    const listPrice = priceFor(tier, months);
    if (!listPrice) return NextResponse.json({ error: "Noto'g'ri tarif yoki muddat" }, { status: 400 });
    // Promo / creator code (TZ 2.0 §10): priced on the server, never trusted from the client.
    let amount = listPrice;
    let promo = null;
    const promoCode = String(get('promoCode') || '').trim();
    if (promoCode) {
      const r = await resolvePromo(promoCode, { userId, listPrice });
      if (r.error) return NextResponse.json({ error: PROMO_MESSAGES[r.error] || PROMO_MESSAGES.not_found, code: r.error }, { status: 400 });
      amount = r.quote.amount;
      promo = promoSnapshot(r.promo, r.quote);
    }
    if (!['manual', 'payme', 'click'].includes(method)) return NextResponse.json({ error: "Noto'g'ri to'lov usuli" }, { status: 400 });
    if (method === 'payme' && !paymeConfig()) return NextResponse.json({ error: 'Payme hali ulanmagan' }, { status: 400 });
    if (method === 'click' && !clickConfig()) return NextResponse.json({ error: 'Click hali ulanmagan' }, { status: 400 });

    // Limit abuse: at most 3 receipts waiting for the admin at once. Online
    // requests don't count — an abandoned Payme/Click click is not a review
    // item, and it is cancelled when the user starts a new online payment.
    if (method === 'manual' && (await countAwaitingReview(userId)) >= 3) {
      return NextResponse.json({ error: "Sizda tekshirilayotgan so'rovlar bor. Admin javobini kuting." }, { status: 429 });
    }
    if (method !== 'manual') await cancelAbandonedOnlineRequests(userId);

    const doc = { userId, tier, months, amount, method, note: String(get('note') || '').slice(0, 500), ...(promo ? { promo } : {}) };

    if (method === 'manual') {
      const file = form?.get('receipt');
      if (!file || typeof file === 'string') return NextResponse.json({ error: 'Chek rasmini yuklang' }, { status: 400 });
      if (!RECEIPT_TYPES[file.type]) return NextResponse.json({ error: 'Faqat JPG, PNG, WEBP yoki PDF' }, { status: 400 });
      if (file.size > RECEIPT_MAX_BYTES) return NextResponse.json({ error: 'Fayl 5 MB dan katta' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!receiptMagicMatches(file.type, [...buffer.subarray(0, 16)])) {
        return NextResponse.json({ error: 'Fayl haqiqiy rasm yoki PDF emas' }, { status: 400 });
      }
      doc.receiptFileId = await saveReceipt(buffer, `receipt-${userId}-${Date.now()}.${RECEIPT_TYPES[file.type]}`, file.type);
      doc.receiptMime = file.type;
    }

    const created = await PaymentRequest.create(doc);

    if (method === 'manual') {
      // Tell the admin right away — approval speed is the whole experience.
      const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (adminChat) {
        const user = await User.findById(userId).select('name username phone').lean();
        const who = escapeTelegramHtml(user?.username ? `@${user.username}` : user?.name || user?.phone || 'Foydalanuvchi');
        const appUrl = process.env.APP_URL?.replace(/\/$/, '');
        await sendTelegramMessage(
          adminChat,
          `💳 Yangi to'lov cheki: ${who}\n${TIER_CONFIG[tier].label} · ${termLabel({ months })} · ${amount.toLocaleString('ru-RU')} so'm${promo ? ` · promo ${promo.code} (−${promo.percentOff}%)` : ''}`,
          appUrl ? { reply_markup: { inline_keyboard: [[{ text: "Ko'rish", url: `${appUrl}/admin/payments` }]] } } : {}
        ).catch((err) => console.error('[billing] admin xabari yuborilmadi', err));
      }
      return NextResponse.json({ request: requestOut(created) });
    }

    const checkoutUrl = method === 'payme' ? paymeCheckoutUrl(created) : clickCheckoutUrl(created);
    return NextResponse.json({ request: requestOut(created), checkoutUrl });
  } catch (err) {
    return serverError(err, 'billing/requests:post');
  }
}
