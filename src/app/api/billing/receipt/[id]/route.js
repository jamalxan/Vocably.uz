import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { PaymentRequest, User } from '@/lib/models';
import { readReceipt } from '@/lib/payments/receiptStorage';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Receipt file — only its owner and admins may see it.
export async function GET(req, props) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    await connectToDatabase();
    const pr = await PaymentRequest.findById(params.id).select('userId receiptFileId').lean();
    if (!pr?.receiptFileId) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    if (String(pr.userId) !== String(userId)) {
      const me = await User.findById(userId).select('role').lean();
      if (me?.role !== 'admin') return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }
    const file = await readReceipt(pr.receiptFileId);
    if (!file) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    return new Response(file.buffer, {
      headers: { 'Content-Type': file.contentType, 'Cache-Control': 'private, max-age=600', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    return serverError(err, 'billing/receipt');
  }
}
