import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { MAX_STICKERS_PER_PACK, MAX_STICKER_LABEL, findLivePack, serializeAdminPack } from '@/lib/adminStickers';
import {
  STICKER_MAX_BYTES,
  STICKER_MIME_EXT,
  buildStickerKey,
  deleteObjects,
  objectSize,
  presignUpload,
  readObjectPrefix,
  stickerMagicMatches,
} from '@/lib/s3';
import { NextResponse } from 'next/server';

// Stiker yuklash ikki bosqichli (profil rasmlari / chat media bilan bir xil naqsh):
//   action: 'presign' — { mimeType, size } -> { stickerId, uploadUrl } (brauzer S3'ga PUT qiladi)
//   action: 'commit'  — { stickerId, mimeType, label } -> fayl S3'da borligi, hajmi va
//                        haqiqiy formati tekshirilib, to'plamga qo'shiladi.
export async function POST(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const pack = await findLivePack(params.packId);
    if (!pack) return NextResponse.json({ error: "To'plam topilmadi" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const mimeType = String(body.mimeType || '');
    if (!STICKER_MIME_EXT[mimeType]) {
      return NextResponse.json({ error: 'Faqat PNG, WEBP yoki GIF fayl yuklash mumkin' }, { status: 400 });
    }

    const liveCount = pack.stickers.filter((s) => !s.deletedAt).length;
    if (liveCount >= MAX_STICKERS_PER_PACK) {
      return NextResponse.json({ error: `Bitta to'plamda ko'pi bilan ${MAX_STICKERS_PER_PACK} ta stiker` }, { status: 400 });
    }

    if (body.action === 'presign') {
      const size = Number(body.size);
      if (!size || size <= 0 || size > STICKER_MAX_BYTES) {
        return NextResponse.json({ error: 'Stiker hajmi 512 KB dan oshmasin' }, { status: 400 });
      }
      const stickerId = String(new mongoose.Types.ObjectId());
      const uploadUrl = await presignUpload(buildStickerKey(pack._id, stickerId, mimeType), mimeType);
      return NextResponse.json({ stickerId, uploadUrl });
    }

    if (body.action === 'commit') {
      const stickerId = String(body.stickerId || '');
      if (!/^[a-f0-9]{24}$/.test(stickerId)) return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
      if (pack.stickers.some((s) => String(s._id) === stickerId)) {
        return NextResponse.json({ pack: serializeAdminPack(pack.toObject()) }); // takroriy commit
      }

      const key = buildStickerKey(pack._id, stickerId, mimeType);
      const size = await objectSize(key);
      const head = size ? await readObjectPrefix(key, 12) : null;
      if (!size || size > STICKER_MAX_BYTES || !stickerMagicMatches(mimeType, head)) {
        await deleteObjects([key]).catch(() => {});
        return NextResponse.json({ error: "Fayl yuklanmadi yoki formati noto'g'ri" }, { status: 400 });
      }

      const label = String(body.label || '').trim().slice(0, MAX_STICKER_LABEL);
      pack.stickers.push({ _id: stickerId, key, mimeType, label });
      await pack.save();

      await writeAuditLog(req, admin._id, 'sticker.add', 'StickerPack', pack._id, { stickerId, label, size });
      return NextResponse.json({ pack: serializeAdminPack(pack.toObject()) });
    }

    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  } catch (err) {
    return serverError(err, 'admin/stickers/[packId]/stickers POST');
  }
}
