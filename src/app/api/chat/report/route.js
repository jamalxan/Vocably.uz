import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Report, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

const MAX_REASON_LEN = 500;

export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    if (!(await checkRateLimit(user._id, 'chat-report', 10))) {
      return NextResponse.json({ error: "Juda ko'p shikoyat. Biroz kuting." }, { status: 429 });
    }

    const { targetType, targetId, reason } = await req.json();
    if (!['user', 'message'].includes(targetType) || !targetId || !reason?.trim()) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

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
      reason: reason.trim().slice(0, MAX_REASON_LEN),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'chat/report');
  }
}
