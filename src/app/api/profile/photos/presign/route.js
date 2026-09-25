import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { buildAvatarKey, presignUpload } from '@/lib/s3';
import { NextResponse } from 'next/server';

// 1-qadam: klient kesilgan rasmni (640 va 160 JPEG) to'g'ridan-to'g'ri S3'ga
// yuklashi uchun ikkita qisqa muddatli presigned PUT URL. Kalitlarni server o'zi
// yasaydi (yangi photoId bilan) — klient boshqa yo'lga yoza olmaydi. Rasm
// profilga faqat 2-qadamda (POST /api/profile/photos) tekshiruvdan keyin qo'shiladi.
export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    if (!(await checkRateLimit(userId, 'avatar-upload', 10))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }

    const photoId = String(new mongoose.Types.ObjectId());
    const fullKey = buildAvatarKey(userId, photoId, 'full');
    const smallKey = buildAvatarKey(userId, photoId, 'small');
    const [fullUrl, smallUrl] = await Promise.all([
      presignUpload(fullKey, 'image/jpeg'),
      presignUpload(smallKey, 'image/jpeg'),
    ]);

    return NextResponse.json({ photoId, full: { uploadUrl: fullUrl }, small: { uploadUrl: smallUrl } });
  } catch (err) {
    return serverError(err, 'profile/photos/presign');
  }
}
