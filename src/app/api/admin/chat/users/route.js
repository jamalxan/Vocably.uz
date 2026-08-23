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
    const filter = q
      ? {
          $or: [
            { phone: new RegExp(q.replace(/\D/g, ''), 'i') },
            { name: new RegExp(q, 'i') },
            { username: new RegExp(q, 'i') },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select('phone name username role chatAccess chatBanned createdAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      users: users.map((u) => ({ ...u, phoneDisplay: formatPhoneDisplay(u.phone) })),
    });
  } catch (err) {
    return serverError(err, 'admin/chat/users GET');
  }
}
