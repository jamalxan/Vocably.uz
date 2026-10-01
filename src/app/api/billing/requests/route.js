import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { PaymentRequest, User } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { priceFor, paymeConfig, clickConfig } from '@/lib/payments/config';
import { saveReceipt, receiptMagicMatches, RECEIPT_MAX_BYTES, RECEIPT_TYPES } from '@/lib/payments/receiptStorage';
import { paymeCheckoutUrl } from '@/lib/payments/payme';
import { clickCheckoutUrl } from '@/lib/payments/click';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { escapeTelegramHtml } from '@/lib/telegramHtml';
import { TIER_CONFIG } from '@/lib/entitlements';
import { NextResponse } from 'next/server';

function requestOut(r) {
  return {
    id: String(r._id),
    tier: r.tier,
    months: r.months,
    amount: r.amount,
    method: r.method,
    status: r.status,
    rejectReason: r.rejectReason || '',
    hasReceipt: !!r.receiptFileId,
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt,
  };
}

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const list = await PaymentRequest.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
    return NextResponse.json({ requests: list.map(requestOut) });
  } catch (err) {
    return serverError(err, 'billing/requests:get');
  }
}

// Manual: multipart with the receipt file. Payme/Click: JSON { tier, months,
// method } → returns the provider checkout URL for the created request.
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();

    const isMultipart = (req.headers.get('content-type') || '').includes('multipart/form-data');
    const form = isMultipart ? await req.formData() : null;
    const body = isMultipart ? null : await req.json().catch(() => ({}));
    const get = (k) => (form ? form.get(k) : body?.[k]);

    const tier = String(get('tier') || '');
    const months = Number(get('months'));
    const method = String(get('method') || 'manual');
    const amount = priceFor(tier, months);
    if (!amount) return NextResponse.json({ error: "Noto'g'ri tarif yoki muddat" }, { status: 400 });
    if (!['manual', 'payme', 'click'].includes(method)) return NextResponse.json({ error: "Noto'g'ri to'lov usuli" }, { status: 400 });
    if (method === 'payme' && !paymeConfig()) return NextResponse.json({ error: 'Payme hali ulanmagan' }, { status: 400 });
    if (method === 'click' && !clickConfig()) return NextResponse.json({ error: 'Click hali ulanmagan' }, { status: 400 });

    // Limit abuse: at most 3 requests waiting at once.
    const pending = await PaymentRequest.countDocuments({ userId, status: 'pending' });
    if (pending >= 3) {
      return NextResponse.json({ error: "Sizda tekshirilayotgan so'rovlar bor. Admin javobini kuting." }, { status: 429 });
    }

    const doc = { userId, tier, months, amount, method, note: String(get('note') || '').slice(0, 500) };

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
          `💳 Yangi to'lov cheki: ${who}\n${TIER_CONFIG[tier].label} · ${months === 12 ? '1 yil' : '1 oy'} · ${amount.toLocaleString('ru-RU')} so'm`,
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
