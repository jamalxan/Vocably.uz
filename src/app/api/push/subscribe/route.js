import { connectToDatabase } from '@/lib/db';
import { PushSubscription } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { isAllowedPushEndpoint, isValidPushKey, MAX_PUSH_SUBSCRIPTIONS_PER_USER } from '@/lib/pushEndpoint';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Brauzer PushManager.subscribe() natijasini saqlaydi. `endpoint` unique — bitta qurilma/
// brauzer boshqa userga qayta obuna bo'lsa (masalan hisobni almashtirsa), eski egasi
// o'chirilib, yangisiga qayta yoziladi (upsert).
export async function POST(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const { subscription } = await req.json().catch(() => ({}));
    const endpoint = subscription?.endpoint;
    const keys = subscription?.keys;
    // Server shu URLga so'rov yuboradi — faqat haqiqiy brauzer push xizmatlari (SSRF himoyasi, src/lib/pushEndpoint.js).
    if (!isAllowedPushEndpoint(endpoint) || !isValidPushKey(keys?.p256dh) || !isValidPushKey(keys?.auth)) {
      return NextResponse.json({ error: "Noto'g'ri obuna ma'lumoti" }, { status: 400 });
    }
    if (!(await checkRateLimit(userId, 'push-subscribe', 20))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }
    // Bitta akkaunt cheksiz obuna yozib bazani to'ldirmasin: eng eskilarini siqib chiqaramiz.
    const existing = await PushSubscription.find({ userId, endpoint: { $ne: endpoint } }).sort({ _id: -1 }).skip(MAX_PUSH_SUBSCRIPTIONS_PER_USER - 1).select('_id').lean();
    if (existing.length) await PushSubscription.deleteMany({ _id: { $in: existing.map((e) => e._id) } });

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
