import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ReviewItem } from '@/lib/models';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §12 — "POST /api/admin/review/bulk-accept → { ids: [],
// minConfidence: 0.95 }". `minConfidence` xavfsizlik uchun ikkinchi filtr —
// `ids` ro'yxatida past ishonchli elementlar bo'lsa ham, ular sukut bo'yicha
// TASHLAB KETILADI (faqat `ids`ga tayanish, aniq minConfidence berilmasa
// ham, kelajakda chaqiruvchi xato qilib past-ishonchli elementni ham
// yuborib yuborsa — bu himoya shuni oldini oladi).
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    const { ids, minConfidence = 0.95 } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids ro\'yxati bo\'sh bo\'lmasligi kerak' }, { status: 400 });
    }

    const result = await ReviewItem.updateMany(
      { _id: { $in: ids }, status: 'open', severity: 'warning', confidence: { $gte: minConfidence } },
      { $set: { status: 'accepted', fixedBy: admin._id, fixedAt: new Date() } }
    );

    await writeAuditLog(req, admin._id, 'review_item.bulk_accept', 'ReviewItem', null, { requested: ids.length, accepted: result.modifiedCount, minConfidence });

    return NextResponse.json({ accepted: result.modifiedCount, requested: ids.length });
  } catch (err) {
    return serverError(err, 'admin/review:bulk-accept');
  }
}
