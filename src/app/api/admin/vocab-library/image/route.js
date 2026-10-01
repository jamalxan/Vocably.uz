import { NextResponse } from 'next/server';
import { requireAdminUser, checkRateLimit, writeAuditLog } from '@/lib/chatAuth';
import { handleRouteError } from '@/lib/vocab/server/route';
import { uploadImageBuffer, buildImageUrl } from '@/lib/exam/imageStorage';
import { MAX_IMAGE_BYTES, detectImageType, safeImageFilename } from '@/lib/vocab/imageUpload';

// POST multipart { file } — lug'at yozuvi rasmi (Rasm↔So'z o'yinlari). GridFS'ga yoziladi (imtihon rasmlari bilan bir xil
// ombor), javob: { imageUrl } — shu URL yozuvning `imageUrl` maydoniga qo'yiladi (library.ts safeUrl "/" ni qabul qiladi).
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });
    if (!(await checkRateLimit(admin._id, 'admin-vocab-image', 60))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }
    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'Fayl yuborilmadi' }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: `Rasm juda katta (maks ${MAX_IMAGE_BYTES / 1024 / 1024} MB)` }, { status: 413 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = detectImageType(buffer);
    if (!type) return NextResponse.json({ error: "Faqat PNG, JPEG, WEBP yoki GIF rasm qabul qilinadi" }, { status: 415 });

    const fileId = await uploadImageBuffer(buffer, safeImageFilename(file.name, type), type);
    await writeAuditLog(req, admin._id, 'vocab.image.upload', 'VocabImage', fileId, { bytes: buffer.length, type });
    return NextResponse.json({ imageUrl: buildImageUrl(fileId) }, { status: 201 });
  } catch (err) {
    return handleRouteError(err, 'admin/vocab-library/image POST');
  }
}
