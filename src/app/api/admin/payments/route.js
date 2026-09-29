import { requireAdminUser } from '@/lib/chatAuth';
import { PaymentRequest } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const st = new URL(req.url).searchParams.get('status') || 'pending';
    const filter = st === 'all' ? {} : { status: st };
    const [list, pendingCount] = await Promise.all([
      PaymentRequest.find(filter).sort({ createdAt: -1 }).limit(100).populate('userId', 'name username phone subscriptionTier subscriptionExpiresAt').lean(),
      PaymentRequest.countDocuments({ status: 'pending' }),
    ]);
    return NextResponse.json({
      pendingCount,
      requests: list.map((r) => ({
        id: String(r._id),
        user: r.userId
          ? { id: String(r.userId._id), name: r.userId.name, username: r.userId.username, phone: r.userId.phone, tier: r.userId.subscriptionTier, expiresAt: r.userId.subscriptionExpiresAt }
          : null,
        tier: r.tier,
        months: r.months,
        amount: r.amount,
        method: r.method,
        status: r.status,
        note: r.note,
        rejectReason: r.rejectReason,
        hasReceipt: !!r.receiptFileId,
        receiptMime: r.receiptMime,
        createdAt: r.createdAt,
        reviewedAt: r.reviewedAt,
      })),
    });
  } catch (err) {
    return serverError(err, 'admin/payments:get');
  }
}
