import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { MAX_PROFILE_PHOTOS, serializePhotos } from '@/lib/avatarShared';
import { AVATAR_MAX_BYTES, buildAvatarKey, deleteObjects, objectSize, readObjectPrefix } from '@/lib/s3';
import { NextResponse } from 'next/server';

const OBJECT_ID = /^[a-f0-9]{24}$/;

// O'z rasmlarim ro'yxati (0-element — asosiy) va maxfiylik sozlamasi.
export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(userId).select('photos photoVisibility').lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    return NextResponse.json({
      userId: String(user._id),
      photos: serializePhotos(user.photos),
      photoVisibility: user.photoVisibility || 'everyone',
    });
  } catch (err) {
    return serverError(err, 'profile/photos GET');
  }
}

// 2-qadam: presign orqali yuklangan ikkala fayl haqiqatan S3'da borligini, hajmi
// me'yorda va haqiqiy JPEG ekanini (magic byte — klient MIME'iga ishonilmaydi)
// tekshirib, rasmni ASOSIY sifatida (0-o'ringa) qo'shadi.
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const { photoId } = await req.json().catch(() => ({}));
    if (!OBJECT_ID.test(String(photoId || ''))) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const key = buildAvatarKey(userId, photoId, 'full');
    const smallKey = buildAvatarKey(userId, photoId, 'small');

    const [fullSize, smallSize] = await Promise.all([objectSize(key), objectSize(smallKey)]);
    const invalid = async () => {
      await deleteObjects([key, smallKey]).catch(() => {});
      return NextResponse.json({ error: "Rasm yuklanmadi yoki noto'g'ri formatda. Qayta urinib ko'ring." }, { status: 400 });
    };
    if (!fullSize || !smallSize || fullSize > AVATAR_MAX_BYTES || smallSize > AVATAR_MAX_BYTES) return invalid();

    const [fullHead, smallHead] = await Promise.all([readObjectPrefix(key, 3), readObjectPrefix(smallKey, 3)]);
    const isJpeg = (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    if (!isJpeg(fullHead) || !isJpeg(smallHead)) return invalid();

    // Takroriy POST (tarmoq qayta urinishi) ikkinchi nusxa yaratmasin.
    const existing = await User.findOne({ _id: userId, 'photos._id': photoId }).select('_id').lean();
    if (!existing) {
      await User.updateOne(
        { _id: userId },
        { $push: { photos: { $each: [{ _id: photoId, key, smallKey, createdAt: new Date() }], $position: 0 } } }
      );
    }

    // Cheklovdan oshgan eng eski rasmlarni S3'dan ham tozalaymiz.
    const user = await User.findById(userId).select('photos photoVisibility').lean();
    const overflow = (user.photos || []).slice(MAX_PROFILE_PHOTOS);
    if (overflow.length) {
      await User.updateOne({ _id: userId }, { $pull: { photos: { _id: { $in: overflow.map((p) => p._id) } } } });
      deleteObjects(overflow.flatMap((p) => [p.key, p.smallKey])).catch((e) => console.error('[avatars] tozalash', e));
    }

    return NextResponse.json({
      success: true,
      photos: serializePhotos((user.photos || []).slice(0, MAX_PROFILE_PHOTOS)),
    });
  } catch (err) {
    return serverError(err, 'profile/photos POST');
  }
}
