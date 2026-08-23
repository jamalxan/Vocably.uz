import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { presignDownload } from '@/lib/s3';
import { NextResponse } from 'next/server';

// Kalit har doim "conversations/{conversationId}/..." shaklida (src/lib/s3.js
// buildObjectKey) — shu tufayli a'zolikni URL'ning o'zidan tekshirish mumkin,
// alohida Message so'rovi shart emas. Faqat shu suhbat ishtirokchisi signed
// GET URL ola oladi; boshqa hamma uchun 403.
export async function GET(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const key = (params.key || []).join('/');
    const match = key.match(/^conversations\/([a-f0-9]{24})\//);
    if (!match) return NextResponse.json({ error: "Noto'g'ri manzil" }, { status: 400 });

    const convo = await Conversation.findById(match[1]);
    if (!convo || !convo.participantIds.some((id) => String(id) === String(user._id))) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const url = await presignDownload(key);
    return NextResponse.redirect(url);
  } catch (err) {
    return serverError(err, 'chat/media');
  }
}
