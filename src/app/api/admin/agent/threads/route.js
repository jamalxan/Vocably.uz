import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AgentThread } from '@/lib/models';
import { NextResponse } from 'next/server';

// Suhbatlar ro'yxati — chat sahifadan yangilanganda yo'qolmasligi uchun
// (oddiy AI yordamchisi ham shunday ishlaydi). Faqat o'z suhbatlari.
export async function GET(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const threads = await AgentThread.find({ adminId: admin._id })
      .select('title updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      threads: threads.map((t) => ({
        id: String(t._id),
        title: t.title,
        updatedAt: t.updatedAt,
        messageCount: (t.messages || []).length,
        preview: (t.messages || []).slice(-1)[0]?.content?.slice(0, 90) || '',
      })),
    });
  } catch (err) {
    return serverError(err, 'admin/agent:threads');
  }
}
