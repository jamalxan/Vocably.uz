import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Report, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

const MAX_REASON_LEN = 500;
// H-2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H — "Report: sabab kategoriyasi +
// xabar konteksti admin'ga boradi") — src/lib/chatConstants.js#REPORT_REASON_CATEGORIES
// bilan bir xil qiymatlar (Report modelidagi enum bilan ham mos — src/lib/models.js).
const REASON_CATEGORIES = ['spam', 'harassment', 'inappropriate_content', 'other'];

export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    if (!(await checkRateLimit(user._id, 'chat-report', 10))) {
      return NextResponse.json({ error: "Juda ko'p shikoyat. Biroz kuting." }, { status: 429 });
    }

    const { targetType, targetId, reason, category } = await req.json();
    if (!['user', 'message'].includes(targetType) || !targetId) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }
    // Kategoriya endi asosiy signal — erkin matn (`reason`) ixtiyoriy qo'shimcha izoh.
    // Noto'g'ri/bo'sh kelsa jim `'other'`ga tushamiz (eski client'lar hali kategoriya
    // yubormasligi mumkin — buzilib qolmasin).
    const cat = REASON_CATEGORIES.includes(category) ? category : 'other';

    if (targetType === 'message') {
      const msg = await Message.findById(targetId).select('conversationId');
      if (!msg) return NextResponse.json({ error: 'Xabar topilmadi' }, { status: 404 });
      // Flag qo'yish — admin panelda ajratib ko'rsatish uchun (moderatsiya, o'chirish emas).
      await Message.updateOne({ _id: targetId }, { $set: { flagged: true } });
    }

    await Report.create({
      reporterId: user._id,
      targetType,
      targetId,
      category: cat,
      reason: (reason || '').trim().slice(0, MAX_REASON_LEN),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/report');
  }
}
