import crypto from 'node:crypto';
import { safeEqual } from '@/lib/safeEqual';
import { PaymentRequest } from '@/lib/models';
import { clickConfig } from './config';
import { approvePayment } from './approve';

// Click SHOP API (Prepare/Complete), https://docs.click.uz. Click posts
// form data to /api/payments/click/prepare and /complete; the order is our
// PaymentRequest id (`merchant_trans_id`). On only when CLICK_* are set.

export function clickCheckoutUrl(request) {
  const cfg = clickConfig();
  if (!cfg) return null;
  const back = `${(process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '')}/app/tolov?paid=${request._id}`;
  const q = new URLSearchParams({
    service_id: cfg.serviceId,
    merchant_id: cfg.merchantId,
    amount: String(request.amount),
    transaction_param: String(request._id),
    return_url: back,
  });
  return `https://my.click.uz/services/pay?${q}`;
}

export function clickSign(p, secretKey, withPrepareId) {
  const parts = [p.click_trans_id, p.service_id, secretKey, p.merchant_trans_id];
  if (withPrepareId) parts.push(p.merchant_prepare_id);
  parts.push(p.amount, p.action, p.sign_time);
  return crypto.createHash('md5').update(parts.join('')).digest('hex');
}

const prepareIdOf = (r) => parseInt(String(r._id).slice(-8), 16);

function reply(p, extra) {
  return { click_trans_id: p.click_trans_id, merchant_trans_id: p.merchant_trans_id, ...extra };
}

export async function handleClick(stage, p) {
  const cfg = clickConfig();
  if (!cfg) return reply(p, { error: -8, error_note: 'Click not configured' });
  const complete = stage === 'complete';
  if (String(p.action) !== (complete ? '1' : '0')) return reply(p, { error: -3, error_note: 'Action not found' });
  if (!safeEqual(clickSign(p, cfg.secretKey, complete), String(p.sign_string))) return reply(p, { error: -1, error_note: 'SIGN CHECK FAILED!' });

  const id = String(p.merchant_trans_id || '');
  const r = /^[a-f0-9]{24}$/i.test(id) ? await PaymentRequest.findById(id) : null;
  if (!r) return reply(p, { error: -5, error_note: 'Order not found' });
  if (Math.abs(Number(p.amount) - r.amount) > 0.01) return reply(p, { error: -2, error_note: 'Incorrect amount' });
  if (r.status === 'approved') return reply(p, { error: -4, error_note: 'Already paid' });
  if (r.status !== 'pending') return reply(p, { error: -9, error_note: 'Transaction cancelled' });

  if (!complete) {
    r.method = 'click';
    r.provider = { txId: String(p.click_trans_id), state: 1, createdAt: new Date() };
    await r.save();
    return reply(p, { merchant_prepare_id: prepareIdOf(r), error: 0, error_note: 'Success' });
  }

  if (String(p.merchant_prepare_id) !== String(prepareIdOf(r)) || r.provider?.txId !== String(p.click_trans_id)) {
    return reply(p, { error: -6, error_note: 'Transaction not found' });
  }
  if (Number(p.error) < 0) {
    r.status = 'cancelled';
    r.provider.state = -1;
    r.provider.cancelledAt = new Date();
    await r.save();
    return reply(p, { merchant_confirm_id: prepareIdOf(r), error: -9, error_note: 'Transaction cancelled' });
  }
  await PaymentRequest.updateOne({ _id: r._id }, { $set: { 'provider.state': 2, 'provider.performedAt': new Date() } });
  await approvePayment(r._id, { method: 'click' });
  return reply(p, { merchant_confirm_id: prepareIdOf(r), error: 0, error_note: 'Success' });
}
