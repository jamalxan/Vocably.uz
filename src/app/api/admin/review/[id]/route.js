import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { ReviewItem } from '@/lib/models';
import { NextResponse } from 'next/server';

// TZ-vocably-v2.md §11.3/§12 — "PATCH /api/admin/review/:id → { action:
// 'accept'|'fix'|'reject', patch?: object }". `patch` — AI taklifi ustiga
// admin tomonidan qo'lda tuzatilgan maydonlar (masalan to'g'ri javob).
// Haqiqiy `ExamTest.sections` ichiga yozish worker/parse bosqichlari
// ULANGANDA `target` (sectionKey/partIndex/groupId/questionNumber) orqali
// aniq joyni topib bajaradi — hozircha bu yerda faqat `ReviewItem`ning
// o'zi yangilanadi (holat + admin qaysi qiymatni tanlaganini saqlaydi).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const item = await ReviewItem.findById(params.id);
    if (!item) return NextResponse.json({ error: "Element topilmadi" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { action, patch } = body;
    if (!['accept', 'fix', 'reject'].includes(action)) {
      return NextResponse.json({ error: "action faqat 'accept', 'fix' yoki 'reject' bo'lishi mumkin" }, { status: 400 });
    }

    item.status = action === 'reject' ? 'rejected' : action === 'fix' ? 'fixed' : 'accepted';
    if (patch !== undefined) item.proposed = { ...item.proposed, ...patch };
    item.fixedBy = admin._id;
    item.fixedAt = new Date();
    await item.save();

    await writeAuditLog(req, admin._id, 'review_item.resolve', 'ReviewItem', item._id, { action });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'admin/review:resolve');
  }
}
