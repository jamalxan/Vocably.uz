import { connectToDatabase } from '@/lib/db';
import { Notification } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    // "O'qilgan" = o'chirilgan — ro'yxat doim faqat yangi bildirishnomalar bilan
    // "toza" qolishi uchun read:true qilib saqlash o'rniga butunlay o'chirib tashlanadi.
    await Notification.deleteMany({ userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'notifications/read-all POST');
  }
}
