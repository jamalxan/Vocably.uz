import { connectToDatabase } from '@/lib/db';
import { PushSubscription } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Brauzer PushManager.subscribe() natijasini saqlaydi. `endpoint` unique — bitta qurilma/
// brauzer boshqa userga qayta obuna bo'lsa (masalan hisobni almashtirsa), eski egasi
// o'chirilib, yangisiga qayta yoziladi (upsert).
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const { subscription } = await req.json();
    const endpoint = subscription?.endpoint;
    const keys = subscription?.keys;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Noto'g'ri obuna ma'lumoti" }, { status: 400 });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId, endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'push/subscribe');
  }
}
