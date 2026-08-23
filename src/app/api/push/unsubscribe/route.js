import { connectToDatabase } from '@/lib/db';
import { PushSubscription } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: 'endpoint kerak' }, { status: 400 });

    await PushSubscription.deleteOne({ endpoint, userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'push/unsubscribe');
  }
}
