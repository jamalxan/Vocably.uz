import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { NextResponse } from 'next/server';

// H-1 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md §9.3 H — "Oxirgi marta ko'rilgan" va
// "onlayn" holatini kim ko'radi) — Do'stlar bo'limiga xos, alohida sozlama sahifasi
// hali yo'q (Profil sahifasidagi umumiy `/api/profile` boshqa, chat'ga aloqasi bo'lmagan
// EDU maydonlari uchun), shuning uchun boshqa /api/chat/* route'lar kabi ATAYLAB alohida,
// requireChatUser bilan himoyalangan (faqat chatAccess bo'lgan foydalanuvchida ma'noli).
const VISIBILITY_VALUES = ['everyone', 'friends', 'nobody'];

export async function GET(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const full = await User.findById(user._id).select('lastSeenVisibility photoVisibility').lean();
    return NextResponse.json({
      lastSeenVisibility: full?.lastSeenVisibility || 'everyone',
      photoVisibility: full?.photoVisibility || 'everyone',
    });
  } catch (err) {
    return serverError(err, 'chat/settings GET');
  }
}

export async function PATCH(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    // Har ikkala maxfiylik sozlamasi (oxirgi ko'rilgan / profil rasmi) shu bitta
    // endpoint orqali — so'rovda qaysi biri kelsa, faqat o'shasi yangilanadi.
    const body = await req.json().catch(() => ({}));
    const update = {};
    for (const field of ['lastSeenVisibility', 'photoVisibility']) {
      if (!(field in body)) continue;
      if (!VISIBILITY_VALUES.includes(body[field])) {
        return NextResponse.json({ error: "Noto'g'ri qiymat" }, { status: 400 });
      }
      update[field] = body[field];
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "Noto'g'ri qiymat" }, { status: 400 });

    await User.updateOne({ _id: user._id }, { $set: update });

    return NextResponse.json({ success: true, ...update });
  } catch (err) {
    return serverError(err, 'chat/settings PATCH');
  }
}
