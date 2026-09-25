import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { canViewerSeePhotos } from '@/lib/avatars';
import { serializePhotos } from '@/lib/avatarShared';
import { NextResponse } from 'next/server';

// Boshqa foydalanuvchining barcha profil rasmlari (Telegram'da avatarga bosib
// varaqlash) — maxfiylik sozlamasi va bloklar hisobga olinadi. Ko'rish mumkin
// bo'lmasa xato emas, bo'sh ro'yxat qaytadi (rasm borligi ham oshkor bo'lmasin).
export async function GET(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (!/^[a-f0-9]{24}$/.test(params.id)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });

    await connectToDatabase();

    const owner = await User.findById(params.id).select('photos photoVisibility chatAccess chatBanned').lean();
    if (!owner || !owner.chatAccess || owner.chatBanned) return NextResponse.json({ photos: [] });

    const visible = await canViewerSeePhotos(owner, user._id);
    return NextResponse.json({ photos: visible ? serializePhotos(owner.photos) : [] });
  } catch (err) {
    return serverError(err, 'chat/users/[id]/photos');
  }
}
