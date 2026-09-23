import { connectToDatabase } from '@/lib/db';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { normalizePhone } from '@/lib/phone';
import { checkRateLimit } from '@/lib/chatAuth';
import { NextResponse } from 'next/server';

// Bir martalik: birinchi adminni tayinlash uchun. Mavjud ADMIN_SETUP_SECRET
// env-var bilan himoyalangan (src/app/api/telegram/setup/route.js'dagi patternning
// o'zi). Ishlatish: POST /api/admin/bootstrap { secret, phone, username }
export async function POST(req) {
  try {
    // Audit topilmasi: bu endpoint doim ochiq bo'lib qoladi (birinchi admin
    // tayinlangandan keyin ham o'chmaydi) va avval ADMIN_SETUP_SECRET'ni
    // cheksiz taxmin qilishga yo'l qo'yardi. IP bo'yicha cheklov — vaqtinchalik
    // yechim; secret sizib chiqsa buning o'zi yetarli emas, lekin brute-force'ni
    // to'sadi.
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!(await checkRateLimit(ip, 'admin-bootstrap', 5))) {
      return NextResponse.json({ error: 'Juda ko\'p urinish. Biroz kuting.' }, { status: 429 });
    }

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
