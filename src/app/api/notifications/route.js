import { connectToDatabase } from '@/lib/db';
import { Notification } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Barcha foydalanuvchilar uchun (Do'stlar ruxsati shart emas) — yangi chat xabari
// va admin e'lonlari haqidagi bildirishnomalar shu yerdan o'qiladi.
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const before = req.nextUrl.searchParams.get('before');
    const query = { userId };
    if (before) query.createdAt = { $lt: new Date(before) };
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 30;

    const [items, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit + 1).lean(),
      // Faqat birinchi (kursorsiz) sahifada hisoblanadi — "yana yuklash"da qayta-qayta
      // hisoblash shart emas, badge soni allaqachon frontendda bor.
      before ? Promise.resolve(null) : Notification.countDocuments({ userId, read: false }),
    ]);

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    return NextResponse.json({ notifications: page, nextCursor, ...(unreadCount !== null ? { unreadCount } : {}) });
  } catch (err) {
    return serverError(err, 'notifications GET');
  }
}
