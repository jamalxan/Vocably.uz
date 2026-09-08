import { connectToDatabase } from '@/lib/db';
import { serverError } from '@/lib/apiError';
import { Conversation, User } from '@/lib/models';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { NextResponse } from 'next/server';

// realtime-server bir foydalanuvchi OFLAYNDAN ONLAYNGA o'tganda (bir nechta
// tab/qurilmadan biri emas — aynan birinchi ulanish) shu yerga chaqiradi
// (realtime-server/index.js `notifyPresenceOnline`). Har bir "Do'stlar" suhbati
// uchun ikkinchi tomon shu foydalanuvchi onlayn bo'lganda xabar berishni
// so'ragan bo'lsa (`onlineNotifyBy`, src/app/api/chat/conversations/[id]/notify-online),
// unga Telegram bot orqali "@username onlayn bo'ldi" xabari yuboriladi.
// Realtime-server bilan bir xil ichki maxfiy kalit orqali himoyalangan — chat
// xabari yuborishdagi src/lib/realtime.js'ning teskari yo'nalishi.
export async function POST(req) {
  try {
    const secret = req.headers.get('x-internal-secret');
    if (!process.env.REALTIME_SHARED_SECRET || secret !== process.env.REALTIME_SHARED_SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json().catch(() => ({}));
    if (!userId) return NextResponse.json({ error: 'userId kerak' }, { status: 400 });

    await connectToDatabase();

    // Shu foydalanuvchi ishtirok etgan, va ikkinchi tomoni undan "onlayn bo'lsa
    // xabar ber" deb so'ragan suhbatlar — bo'sh `onlineNotifyBy`li suhbatlarni
    // so'rov darajasida chetlab o'tamiz (aksariyati shunday bo'ladi).
    const convos = await Conversation.find({
      participantIds: userId,
      onlineNotifyBy: { $ne: [] },
    })
      .select('participantIds onlineNotifyBy')
      .lean();
    if (!convos.length) return NextResponse.json({ success: true, notified: 0 });

    const recipientIds = [];
    convos.forEach((c) => {
      const otherId = c.participantIds.find((id) => String(id) !== String(userId));
      if (otherId && (c.onlineNotifyBy || []).some((id) => String(id) === String(otherId))) {
        recipientIds.push(String(otherId));
      }
    });
    if (!recipientIds.length) return NextResponse.json({ success: true, notified: 0 });

    const [onlineUser, recipients] = await Promise.all([
      User.findById(userId).select('username name').lean(),
      User.find({ _id: { $in: recipientIds } }).select('telegramChatId').lean(),
    ]);
    const label = onlineUser?.username ? `@${onlineUser.username}` : onlineUser?.name || 'Foydalanuvchi';

    const results = await Promise.allSettled(
      recipients
        .filter((r) => r.telegramChatId)
        .map((r) => sendTelegramMessage(r.telegramChatId, `🟢 ${label} onlayn bo'ldi.`))
    );
    const notified = results.filter((r) => r.status === 'fulfilled').length;
    results
      .filter((r) => r.status === 'rejected')
      .forEach((r) => console.error('[telegram] onlayn xabari yuborilmadi', r.reason));

    return NextResponse.json({ success: true, notified });
  } catch (err) {
    return serverError(err, 'internal/presence-online POST');
  }
}
