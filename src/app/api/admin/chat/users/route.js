import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { formatPhoneDisplay } from '@/lib/phone';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    const before = req.nextUrl.searchParams.get('before');
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    const filter = q
      ? {
          $or: [
            { phone: new RegExp(q.replace(/\D/g, ''), 'i') },
            { name: new RegExp(q, 'i') },
            { username: new RegExp(q, 'i') },
          ],
        }
      : {};
    if (before) filter.createdAt = { $lt: new Date(before) };

    // Cursor-based (createdAt bo'yicha) — skip() o'rniga, chunki ma'lumot ko'paygan sari
    // sekinlashmaydi. +1 chegara: navbatdagi sahifa bor-yo'qligini bitta so'rovda bilish uchun.
    const users = await User.find(filter)
      .select('phone name username role chatAccess chatBanned createdAt subscriptionTier')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = users.length > limit;
    const page = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    return NextResponse.json({
      users: page.map((u) => ({ ...u, phoneDisplay: formatPhoneDisplay(u.phone) })),
      nextCursor,
    });
  } catch (err) {
    return serverError(err, 'admin/chat/users GET');
  }
}
