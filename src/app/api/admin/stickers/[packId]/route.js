import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { StickerPack } from '@/lib/models';
import { MAX_PACK_NAME, findLivePack, listAdminPacks, serializeAdminPack } from '@/lib/adminStickers';
import { NextResponse } from 'next/server';

// To'plamni tahrirlash: `name`, `active` (foydalanuvchilarga ko'rinishi), `move`
// ('up' | 'down' — ro'yxatdagi tartib, qo'shni to'plam bilan o'rin almashadi).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const pack = await findLivePack(params.packId);
    if (!pack) return NextResponse.json({ error: "To'plam topilmadi" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const diff = {};

    if ('name' in body) {
      const clean = String(body.name || '').trim().slice(0, MAX_PACK_NAME);
      if (!clean) return NextResponse.json({ error: "Nom bo'sh bo'lmasin" }, { status: 400 });
      diff.name = { from: pack.name, to: clean };
      pack.name = clean;
    }
    if ('active' in body) {
      const next = !!body.active;
      if (next && !pack.stickers.some((s) => !s.deletedAt)) {
        return NextResponse.json({ error: "Bo'sh to'plamni yoqib bo'lmaydi — avval stiker yuklang" }, { status: 400 });
      }
      diff.active = { from: pack.active, to: next };
      pack.active = next;
    }
    await pack.save();

    if (body.move === 'up' || body.move === 'down') {
      const all = await StickerPack.find({ deletedAt: null }).sort({ order: 1, createdAt: 1 });
      const idx = all.findIndex((p) => String(p._id) === String(pack._id));
      const swapIdx = body.move === 'up' ? idx - 1 : idx + 1;
      if (idx !== -1 && all[swapIdx]) {
        // Tartibni 1..n qilib qayta raqamlab, keyin almashtiramiz (takroriy/bo'sh
        // `order` qiymatlari bo'lsa ham to'g'ri ishlashi uchun).
        [all[idx], all[swapIdx]] = [all[swapIdx], all[idx]];
        await Promise.all(all.map((p, i) => StickerPack.updateOne({ _id: p._id }, { $set: { order: i + 1 } })));
        diff.move = body.move;
      }
    }

    if (Object.keys(diff).length) {
      await writeAuditLog(req, admin._id, 'sticker.pack.update', 'StickerPack', pack._id, diff);
    }
    return NextResponse.json({ packs: await listAdminPacks(), pack: serializeAdminPack(pack.toObject()) });
  } catch (err) {
    return serverError(err, 'admin/stickers/[packId] PATCH');
  }
}

// Yumshoq o'chirish — to'plam tanlash oynasidan yo'qoladi, lekin allaqachon yuborilgan
// stiker xabarlar ko'rinishda qoladi (S3 fayllari o'chirilmaydi).
export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const pack = await findLivePack(params.packId);
    if (!pack) return NextResponse.json({ error: "To'plam topilmadi" }, { status: 404 });

    pack.deletedAt = new Date();
    pack.active = false;
    await pack.save();

    await writeAuditLog(req, admin._id, 'sticker.pack.delete', 'StickerPack', pack._id, { name: pack.name });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'admin/stickers/[packId] DELETE');
  }
}
