import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { serializePhotos } from '@/lib/avatarShared';
import { deleteObjects } from '@/lib/s3';
import { NextResponse } from 'next/server';

const OBJECT_ID = /^[a-f0-9]{24}$/;

// Telegram'dagi "Asosiy rasm qilish" — tanlangan rasm 0-o'ringa ko'chiriladi.
export async function PATCH(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    if (!OBJECT_ID.test(params.photoId)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });

    await connectToDatabase();

    const user = await User.findById(userId).select('photos');
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    const idx = user.photos.findIndex((p) => String(p._id) === params.photoId);
    if (idx === -1) return NextResponse.json({ error: 'Rasm topilmadi' }, { status: 404 });

    if (idx > 0) {
      const [photo] = user.photos.splice(idx, 1);
      user.photos.unshift(photo);
      await user.save();
    }

    return NextResponse.json({ success: true, photos: serializePhotos(user.photos) });
  } catch (err) {
    return serverError(err, 'profile/photos/[photoId] PATCH');
  }
}

// Rasmni o'chirish — asosiy rasm o'chirilsa, keyingisi avtomatik asosiy bo'ladi
// (Telegram'dagidek). S3 fayllari ham o'chiriladi.
export async function DELETE(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    if (!OBJECT_ID.test(params.photoId)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });

    await connectToDatabase();

    const before = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { photos: { _id: params.photoId } } },
      { new: false, projection: { photos: 1 } }
    ).lean();
    if (!before) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const removed = (before.photos || []).find((p) => String(p._id) === params.photoId);
    if (!removed) return NextResponse.json({ error: 'Rasm topilmadi' }, { status: 404 });

    deleteObjects([removed.key, removed.smallKey]).catch((e) => console.error('[avatars] S3 o\'chirish', e));

    const photos = (before.photos || []).filter((p) => String(p._id) !== params.photoId);
    return NextResponse.json({ success: true, photos: serializePhotos(photos) });
  } catch (err) {
    return serverError(err, 'profile/photos/[photoId] DELETE');
  }
}
