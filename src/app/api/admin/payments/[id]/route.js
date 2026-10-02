import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { approvePayment, rejectPayment } from '@/lib/payments/approve';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Admin decision on a manual payment: approve (opens the plan) or reject.
export async function PATCH(req, props) {
  const params = await props.params;
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { action, reason } = await req.json().catch(() => ({}));
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
