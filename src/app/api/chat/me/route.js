import { connectToDatabase } from '@/lib/db';
import { serverError } from '@/lib/apiError';
import { getUserIdFromRequest } from '@/lib/auth';
import { User } from '@/lib/models';
import { NextResponse } from 'next/server';

// Do'stlar bo'limi ko'rinsinmi-yo'qmi shuni aniqlash uchun frontend har sahifa
// yuklanishida shu endpoint'ga so'rov yuboradi. chatAccess=false bo'lsa 200 emas —
// aniq {chatAccess:false} qaytaradi (Sidebar shu asosida bo'limni yashiradi/ko'rsatadi).
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(userId).select('username chatAccess chatBanned role name photos');
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    return NextResponse.json({
      // AUTH_MIGRATION_MAP.md — client "o'z ID"sini endi bu yerdan oladi,
      // JWT'ni client-side decode qilish (src/lib/jwtClient.js#getJwtUserId)
      // o'rniga (u endi hech qayerda haqiqiy tokenga ega emas).
      id: String(user._id),
      chatAccess: !!user.chatAccess && !user.chatBanned,
      username: user.username || null,
      role: user.role || 'user',
      name: user.name || '',
      // O'z asosiy profil rasmim (sidebar/profil sahifasi avatari uchun).
      photoId: user.photos?.[0] ? String(user.photos[0]._id) : null,
    });
  } catch (err) {
    return serverError(err, 'chat/me');
  }
}
