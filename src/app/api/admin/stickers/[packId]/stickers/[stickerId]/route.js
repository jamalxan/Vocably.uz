import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { MAX_STICKER_LABEL, findLivePack, serializeAdminPack } from '@/lib/adminStickers';
import { NextResponse } from 'next/server';

function findLiveSticker(pack, stickerId) {
  return pack.stickers.find((s) => String(s._id) === String(stickerId) && !s.deletedAt) || null;
}

// Stiker nomi (tanlash oynasida hover/qidiruv yorlig'i).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const pack = await findLivePack(params.packId);
    const sticker = pack && findLiveSticker(pack, params.stickerId);
    if (!sticker) return NextResponse.json({ error: 'Stiker topilmadi' }, { status: 404 });

    const { label } = await req.json().catch(() => ({}));
    const clean = String(label || '').trim().slice(0, MAX_STICKER_LABEL);
    const from = sticker.label;
    sticker.label = clean;
    await pack.save();

    await writeAuditLog(req, admin._id, 'sticker.update', 'StickerPack', pack._id, {
      stickerId: params.stickerId,
      label: { from, to: clean },
    });
    return NextResponse.json({ pack: serializeAdminPack(pack.toObject()) });
  } catch (err) {
    return serverError(err, 'admin/stickers/[packId]/stickers/[stickerId] PATCH');
  }
}

// Yumshoq o'chirish — ilgari yuborilgan xabarlarda stiker ko'rinishda qoladi.
// Oxirgi stiker o'chirilsa, to'plam avtomatik yashiriladi (bo'sh to'plam ko'rinmasin).
export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const pack = await findLivePack(params.packId);
    const sticker = pack && findLiveSticker(pack, params.stickerId);
    if (!sticker) return NextResponse.json({ error: 'Stiker topilmadi' }, { status: 404 });

    sticker.deletedAt = new Date();
    if (!pack.stickers.some((s) => !s.deletedAt)) pack.active = false;
    await pack.save();

    await writeAuditLog(req, admin._id, 'sticker.delete', 'StickerPack', pack._id, {
      stickerId: params.stickerId,
      label: sticker.label,
    });
    return NextResponse.json({ pack: serializeAdminPack(pack.toObject()) });
  } catch (err) {
    return serverError(err, 'admin/stickers/[packId]/stickers/[stickerId] DELETE');
  }
}
