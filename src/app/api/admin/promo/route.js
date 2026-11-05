import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { PromoCode, Referral, User } from '@/lib/models';
import { cleanPromoInput } from '@/lib/promo';
import { listPromoCodes } from '@/lib/promoServer';

const INPUT_ERRORS = {
  bad_code: 'Kod: 3–20 ta lotin harf yoki raqam',
  bad_percent: 'Chegirma 1–100% oralig‘ida bo‘lsin',
  bad_share: 'Creator ulushi 0–100% oralig‘ida bo‘lsin',
  bad_max: "Foydalanish limiti 1 dan katta butun son bo'lsin",
  bad_expiry: 'Muddat kelajakdagi sana bo‘lsin',
};

/** Referral numbers for the admin: totals and the top inviters of the last 30 days. */
async function referralSummary() {
  const since = new Date(Date.now() - 30 * 86400000);
  const [total, last30, top] = await Promise.all([
    Referral.countDocuments({}),
    Referral.countDocuments({ createdAt: { $gte: since } }),
    Referral.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: '$ownerId', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 10 }]),
  ]);
  const users = await User.find({ _id: { $in: top.map((t) => t._id) } }).select('name username referral.code').lean();
  return {
    total,
    last30,
    top: top.map((t) => {
      const u = users.find((x) => String(x._id) === String(t._id));
      return { name: u?.name || '', username: u?.username || '', code: u?.referral?.code || '', invited: t.n };
    }),
  };
}

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    const [codes, referrals] = await Promise.all([listPromoCodes(), referralSummary()]);
    return NextResponse.json({ codes, referrals }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'admin/promo GET');
  }
}

// { code, kind: 'promo'|'creator', percentOff, creatorUsername?, creatorShare?, maxUses?, expiresAt?, note? }
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const clean = cleanPromoInput(body);
    if (clean.error) return NextResponse.json({ error: INPUT_ERRORS[clean.error] }, { status: 400 });
    let ownerId = null;
    if (clean.kind === 'creator') {
      const name = String(body?.creatorUsername || '').trim().replace(/^@/, '').toLowerCase();
      const owner = name ? await User.findOne({ username: name }).select('_id').lean() : null;
      if (!owner) return NextResponse.json({ error: 'Creator foydalanuvchisi topilmadi (username kerak)' }, { status: 400 });
      ownerId = owner._id;
    }
    try {
      const created = await PromoCode.create({ ...clean, ownerId, createdBy: admin._id });
      await writeAuditLog(req, admin._id, 'promo.create', 'PromoCode', String(created._id), { code: clean.code, kind: clean.kind, percentOff: clean.percentOff, creatorShare: clean.creatorShare, maxUses: clean.maxUses });
    } catch (e) {
      if (e?.code === 11000) return NextResponse.json({ error: 'Bu kod allaqachon mavjud' }, { status: 409 });
      throw e;
    }
    return NextResponse.json({ codes: await listPromoCodes() });
  } catch (err) {
    return serverError(err, 'admin/promo POST');
  }
}
