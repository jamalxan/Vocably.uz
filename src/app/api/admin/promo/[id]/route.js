import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { PromoCode } from '@/lib/models';
import { listPromoCodes } from '@/lib/promoServer';

// PATCH { active: boolean } — switch a code on/off (codes are never deleted: payments reference them).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Kod topilmadi' }, { status: 404 });
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    if (typeof body?.active !== 'boolean') return NextResponse.json({ error: "O'zgartiriladigan maydon yo'q" }, { status: 400 });
    const r = await PromoCode.updateOne({ _id: id }, { $set: { active: body.active } });
    if (!r.matchedCount) return NextResponse.json({ error: 'Kod topilmadi' }, { status: 404 });
    await writeAuditLog(req, admin._id, 'promo.update', 'PromoCode', id, { active: body.active });
    return NextResponse.json({ codes: await listPromoCodes() });
  } catch (err) {
    return serverError(err, 'admin/promo PATCH');
  }
}
