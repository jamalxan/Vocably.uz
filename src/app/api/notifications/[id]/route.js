import { connectToDatabase } from '@/lib/db';
import { Notification } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Bitta bildirishnomani o'qilgan deb belgilaydi (bosilganda chaqiriladi).
export async function PATCH(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const result = await Notification.updateOne({ _id: params.id, userId }, { $set: { read: true } });
    if (result.matchedCount === 0) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'notifications/[id] PATCH');
  }
}
