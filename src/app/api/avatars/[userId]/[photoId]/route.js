import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { canViewerSeePhotos } from '@/lib/avatars';
import { presignAvatarDownload } from '@/lib/s3';
import { NextResponse } from 'next/server';

const OBJECT_ID = /^[a-f0-9]{24}$/;

// Profil rasmini <img src> sifatida to'g'ridan-to'g'ri berish mumkin bo'lgan manzil:
// cookie orqali autentifikatsiya, maxfiylik tekshiruvi, so'ng S3'ning vaqtinchalik
// imzolangan URL'iga 302. Chat media'dagi (JSON qaytaradigan) naqshdan farqli —
// avatar har bir ro'yxat qatorida chiqadi, qo'shimcha JSON so'rovisiz ishlashi kerak.
// `photoId` URL'da bo'lgani uchun javob keshlanadi (rasm almashsa URL ham almashadi).
export async function GET(req, { params }) {
  try {
    const viewerId = getUserIdFromRequest(req);
    if (!viewerId) return new NextResponse(null, { status: 401 });

    const { userId, photoId } = params;
    if (!OBJECT_ID.test(userId) || !OBJECT_ID.test(photoId)) return new NextResponse(null, { status: 400 });

    await connectToDatabase();

    const owner = await User.findById(userId).select('photos photoVisibility chatAccess chatBanned').lean();
    const photo = owner?.photos?.find((p) => String(p._id) === photoId);
    if (!photo) return new NextResponse(null, { status: 404 });

    if (String(owner._id) !== String(viewerId)) {
      // Boshqa odamning rasmi faqat Do'stlar bo'limi ichida ma'noli — ikkala tomon
      // ham shu bo'limga kirish huquqiga ega bo'lishi kerak.
      const viewer = await User.findById(viewerId).select('chatAccess chatBanned').lean();
      const bothInChat = viewer?.chatAccess && !viewer.chatBanned && owner.chatAccess && !owner.chatBanned;
      if (!bothInChat || !(await canViewerSeePhotos(owner, viewerId))) {
        return new NextResponse(null, { status: 404 });
      }
    }

    const size = req.nextUrl.searchParams.get('size') === 'full' ? 'full' : 'small';
    const url = await presignAvatarDownload(size === 'full' ? photo.key : photo.smallKey);
    // `private` — javob foydalanuvchiga xos (maxfiylik tekshiruvi bor), umumiy
    // CDN/proxy keshlamasin. 30 daqiqa — imzolangan URL kamida 1 soat amal qiladi.
    return NextResponse.redirect(url, {
      status: 302,
      headers: { 'Cache-Control': 'private, max-age=1800', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    return serverError(err, 'avatars GET');
  }
}
