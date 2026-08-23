import { connectToDatabase } from '@/lib/db';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { normalizePhone } from '@/lib/phone';
import { NextResponse } from 'next/server';

// Bir martalik: birinchi adminni tayinlash uchun. Mavjud ADMIN_SETUP_SECRET
// env-var bilan himoyalangan (src/app/api/telegram/setup/route.js'dagi patternning
// o'zi). Ishlatish: POST /api/admin/bootstrap { secret, phone, username }
export async function POST(req) {
  try {
    const { secret, phone, username } = await req.json();
    if (!process.env.ADMIN_SETUP_SECRET || secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    }
    if (!phone || !username) {
      return NextResponse.json({ error: 'phone va username kerak' }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedPhone = normalizePhone(phone);
    const uname = username.trim().toLowerCase();

    const existing = await User.findOne({ username: uname });
    if (existing && existing.phone !== normalizedPhone) {
      return NextResponse.json({ error: 'Bu username band' }, { status: 409 });
    }

    const user = await User.findOneAndUpdate(
      { phone: normalizedPhone },
      { $set: { role: 'admin', username: uname, chatAccess: true, chatBanned: false } },
      { new: true }
    ).select('phone username role chatAccess');

    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return serverError(err, 'admin/bootstrap');
  }
}
