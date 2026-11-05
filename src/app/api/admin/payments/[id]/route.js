import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { approvePayment, rejectPayment } from '@/lib/payments/approve';
import { decideRefund } from '@/lib/payments/refund';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Admin decision on a manual payment: approve (opens the plan) or reject.
// Refunds (TZ 2.0 §10): refund_approve — after the money was sent back; refund_decline.
export async function PATCH(req, props) {
  const params = await props.params;
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { action, reason } = await req.json().catch(() => ({}));
    if (action === 'refund_approve' || action === 'refund_decline') {
      const r = await decideRefund(params.id, { approve: action === 'refund_approve', by: admin._id, note: typeof reason === 'string' ? reason : '' });
      if (!r.ok) return NextResponse.json({ error: "Qaytarish so'rovi topilmadi yoki allaqachon hal qilingan" }, { status: 409 });
      await writeAuditLog(req, admin._id, `payment.${action}`, 'payment', params.id, {
        amount: r.request.amount,
        user: String(r.request.userId),
        subscription: r.subscription,
        ...(reason ? { reason } : {}),
      });
      return NextResponse.json({ ok: true, subscription: r.subscription });
    }
    let result;
    if (action === 'approve') result = await approvePayment(params.id, { by: admin._id });
    else if (action === 'reject') result = await rejectPayment(params.id, { by: admin._id, reason });
    else return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });

    if (!result.ok) return NextResponse.json({ error: "Bu so'rov allaqachon ko'rib chiqilgan" }, { status: 409 });
    await writeAuditLog(req, admin._id, `payment.${action}`, 'payment', params.id, {
      tier: result.request.tier,
      months: result.request.months,
      amount: result.request.amount,
      user: String(result.request.userId),
      ...(reason ? { reason } : {}),
    });
    return NextResponse.json({ ok: true, expiresAt: result.expiresAt || null });
  } catch (err) {
    return serverError(err, 'admin/payments:patch');
  }
}
