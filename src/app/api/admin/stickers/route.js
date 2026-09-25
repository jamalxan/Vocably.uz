import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { StickerPack } from '@/lib/models';
import { MAX_PACK_NAME, listAdminPacks, serializeAdminPack } from '@/lib/adminStickers';
import { STICKER_PACKS } from '@/lib/stickers';
import { NextResponse } from 'next/server';

// Barcha (o'chirilmagan) to'plamlar — yashirilganlari ham (admin tahrirlashi uchun).
// `builtin` — koddagi statik "Standart" to'plam, faqat ko'rish uchun.
export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    return NextResponse.json({ packs: await listAdminPacks(), builtin: STICKER_PACKS });
  } catch (err) {
    return serverError(err, 'admin/stickers GET');
  }
}

// Yangi (bo'sh) to'plam — ro'yxat oxiriga. Sukut bo'yicha YASHIRIN: admin stikerlarni
// yuklab, tayyor bo'lgach yoqadi (yarim tayyor to'plam foydalanuvchilarga chiqmasin).
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { name } = await req.json().catch(() => ({}));
    const clean = String(name || '').trim().slice(0, MAX_PACK_NAME);
    if (!clean) return NextResponse.json({ error: "To'plam nomini kiriting" }, { status: 400 });

    const last = await StickerPack.findOne({ deletedAt: null }).sort({ order: -1 }).select('order').lean();
    const pack = await StickerPack.create({ name: clean, active: false, order: (last?.order || 0) + 1, createdBy: admin._id });

    await writeAuditLog(req, admin._id, 'sticker.pack.create', 'StickerPack', pack._id, { name: clean });
    return NextResponse.json({ pack: serializeAdminPack(pack.toObject()) });
  } catch (err) {
    return serverError(err, 'admin/stickers POST');
  }
}
