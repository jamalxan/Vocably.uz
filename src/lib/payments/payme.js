import { PaymentRequest } from '@/lib/models';
import { safeEqual } from '@/lib/safeEqual';
import { paymeConfig } from './config';
import { approvePayment } from './approve';

// Payme Merchant API (JSON-RPC 2.0), https://developer.help.paycom.uz.
// Payme calls POST /api/payments/payme; the order is our PaymentRequest id
// (`account.order_id`), amounts are in tiyin (so'm × 100). Turned on only
// when PAYME_MERCHANT_ID and PAYME_SECRET_KEY are set.

export const PAYME_TIMEOUT_MS = 12 * 60 * 60 * 1000; // unperformed transactions expire after 12h
const E = {
  auth: { code: -32504, message: 'Insufficient privilege' },
  method: { code: -32601, message: 'Method not found' },
  amount: { code: -31001, message: { uz: "Noto'g'ri summa", ru: 'Неверная сумма', en: 'Wrong amount' } },
  txNotFound: { code: -31003, message: { uz: 'Tranzaksiya topilmadi', ru: 'Транзакция не найдена', en: 'Transaction not found' } },
  cantPerform: { code: -31008, message: { uz: "Amalni bajarib bo'lmaydi", ru: 'Невозможно выполнить операцию', en: 'Unable to perform' } },
  order: { code: -31050, message: { uz: 'Buyurtma topilmadi', ru: 'Заказ не найден', en: 'Order not found' }, data: 'order_id' },
  orderBusy: { code: -31051, message: { uz: "Buyurtma band yoki to'langan", ru: 'Заказ занят или оплачен', en: 'Order busy or paid' }, data: 'order_id' },
};

export function toTiyin(som) {
  return Math.round(som * 100);
}

export function paymeCheckoutUrl(request) {
  const cfg = paymeConfig();
  if (!cfg) return null;
  const back = `${(process.env.APP_URL || 'https://vocably.uz').replace(/\/$/, '')}/app/tolov?paid=${request._id}`;
  const params = `m=${cfg.merchantId};ac.order_id=${request._id};a=${toTiyin(request.amount)};c=${back}`;
  return `${cfg.checkoutUrl}/${Buffer.from(params).toString('base64')}`;
}

/** Basic auth: "Paycom:<key>". */
export function paymeAuthorized(header, key) {
  if (!header?.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString();
  const [login, pass] = [decoded.slice(0, decoded.indexOf(':')), decoded.slice(decoded.indexOf(':') + 1)];
  return safeEqual(login, 'Paycom') && safeEqual(pass, key);
}

function txView(r) {
  const p = r.provider || {};
  return {
    create_time: p.createdAt ? p.createdAt.getTime() : 0,
    perform_time: p.performedAt ? p.performedAt.getTime() : 0,
    cancel_time: p.cancelledAt ? p.cancelledAt.getTime() : 0,
    transaction: String(r._id),
    state: p.state,
    reason: p.reason ?? null,
  };
}

async function findOrder(account) {
  const id = account?.order_id;
  if (!id || !/^[a-f0-9]{24}$/i.test(String(id))) return null;
  return PaymentRequest.findById(id);
}

async function cancelExpired(r) {
  r.provider.state = -1;
  r.provider.reason = 4;
  r.provider.cancelledAt = new Date();
  r.status = 'cancelled';
  await r.save();
}

/** Handles one JSON-RPC call; returns { result } or { error }. */
export async function handlePayme(method, params = {}) {
  switch (method) {
    case 'CheckPerformTransaction': {
      const r = await findOrder(params.account);
      if (!r) return { error: E.order };
      if (r.status !== 'pending') return { error: E.orderBusy };
      if (toTiyin(r.amount) !== params.amount) return { error: E.amount };
      return { result: { allow: true } };
    }
    case 'CreateTransaction': {
      const existing = await PaymentRequest.findOne({ 'provider.txId': params.id, method: 'payme' });
      if (existing) {
        if (existing.provider.state !== 1) return { error: E.cantPerform };
        if (Date.now() - existing.provider.createdAt.getTime() > PAYME_TIMEOUT_MS) {
          await cancelExpired(existing);
          return { error: E.cantPerform };
        }
        return { result: { create_time: existing.provider.createdAt.getTime(), transaction: String(existing._id), state: 1 } };
      }
      const r = await findOrder(params.account);
      if (!r) return { error: E.order };
      if (r.status !== 'pending' || (r.provider?.txId && r.provider.state === 1)) return { error: E.orderBusy };
      if (toTiyin(r.amount) !== params.amount) return { error: E.amount };
      r.method = 'payme';
      r.provider = { txId: params.id, state: 1, createdAt: new Date(params.time || Date.now()) };
      await r.save();
      return { result: { create_time: r.provider.createdAt.getTime(), transaction: String(r._id), state: 1 } };
    }
    case 'PerformTransaction': {
      const r = await PaymentRequest.findOne({ 'provider.txId': params.id, method: 'payme' });
      if (!r) return { error: E.txNotFound };
      if (r.provider.state === 2) return { result: { transaction: String(r._id), perform_time: r.provider.performedAt.getTime(), state: 2 } };
      if (r.provider.state !== 1) return { error: E.cantPerform };
      if (Date.now() - r.provider.createdAt.getTime() > PAYME_TIMEOUT_MS) {
        await cancelExpired(r);
        return { error: E.cantPerform };
      }
      const performedAt = new Date();
      await PaymentRequest.updateOne({ _id: r._id }, { $set: { 'provider.state': 2, 'provider.performedAt': performedAt } });
      await approvePayment(r._id, { method: 'payme' });
      return { result: { transaction: String(r._id), perform_time: performedAt.getTime(), state: 2 } };
    }
    case 'CancelTransaction': {
      const r = await PaymentRequest.findOne({ 'provider.txId': params.id, method: 'payme' });
      if (!r) return { error: E.txNotFound };
      if (r.provider.state === 1 || r.provider.state === 2) {
        // A refund after perform (-2) is recorded; the plan is NOT revoked
        // automatically — the admin sees the cancelled payment and decides.
        r.provider.state = r.provider.state === 1 ? -1 : -2;
        r.provider.reason = params.reason ?? null;
        r.provider.cancelledAt = new Date();
        if (r.status === 'pending') r.status = 'cancelled';
        await r.save();
      }
      return { result: { transaction: String(r._id), cancel_time: r.provider.cancelledAt?.getTime() || 0, state: r.provider.state } };
    }
    case 'CheckTransaction': {
      const r = await PaymentRequest.findOne({ 'provider.txId': params.id, method: 'payme' });
      if (!r) return { error: E.txNotFound };
      return { result: txView(r) };
    }
    case 'GetStatement': {
      const list = await PaymentRequest.find({
        method: 'payme',
        'provider.createdAt': { $gte: new Date(params.from), $lte: new Date(params.to) },
      }).lean();
      return {
        result: {
          transactions: list.map((r) => ({
            id: r.provider.txId,
            time: r.provider.createdAt.getTime(),
            amount: toTiyin(r.amount),
            account: { order_id: String(r._id) },
            ...txView(r),
          })),
        },
      };
    }
    default:
      return { error: E.method };
  }
}

export const PAYME_ERRORS = E;
