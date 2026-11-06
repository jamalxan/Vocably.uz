import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { countUnread } from '@/lib/chat/unread';
import { NextResponse } from 'next/server';

// PARITY_PLAN WP1 — nav belgisi va tab sarlavhasi uchun umumiy o'qilmaganlar soni (har qanday /app
// sahifada, ChatProvider mount bo'lmagan joyda ham). Rate limit yo'q: RealtimeProvider so'rovni
// 500 ms debounce qiladi va faqat connect / tab ko'rinishi / o'qildi hodisasida chaqiradi.
export async function GET(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });
    await connectToDatabase();
    const counts = await countUnread(user._id);
    return NextResponse.json(counts, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return serverError(err, 'chat/unread GET');
  }
}
