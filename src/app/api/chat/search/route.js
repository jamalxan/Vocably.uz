import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, Block } from '@/lib/models';
import { currentPhotoId } from '@/lib/avatars';
import { NextResponse } from 'next/server';

// Regex maxsus belgilarini "yasab" bo'lmasligi (masalan `.*` bilan butun kolleksiyani
// qimmat skanerlashga majburlash) uchun — src/app/api/admin/chat/users/route.js'dagi
// o'xshash qidiruv buni umuman qilmagan, bu yerda foydalanuvchi kiritgan matn
// (autentifikatsiyadan o'tgan bo'lsa ham) haqiqiy regex operatorlari sifatida
// talqin qilinmasligi uchun ataylab qo'shildi.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// C-08 — ilgari FAQAT to'liq/aniq username bilan ishlagan ("diy" -> topilmadi,
// "diyora" -> topildi). Endi Telegram uslubidagi prefix qidiruv: username YOKI
// ism boshi bilan mos keladigan (min 2 belgi) BARCHA foydalanuvchilarni qaytaradi
// (bittagina emas). Faqat chatAccess=true bo'lgan userlar ko'rinadi — boshqa hamma
// app-foydalanuvchisi bu qidiruvda umuman ko'rinmasligi kerak (bo'lim yashirinligi
// shu bilan ta'minlanadi).
export async function GET(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    if (!(await checkRateLimit(user._id, 'chat-search', 30))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }

    const q = (req.nextUrl.searchParams.get('username') || '').trim();
    if (q.length < 2) return NextResponse.json({ results: [] });

    const prefix = new RegExp(`^${escapeRegex(q)}`, 'i');
    const found = await User.find({
      $or: [{ username: prefix }, { name: prefix }],
      chatAccess: true,
      chatBanned: { $ne: true },
      _id: { $ne: user._id },
    })
      .select('username name photos photoVisibility')
      .limit(8)
      .lean();

    if (!found.length) return NextResponse.json({ results: [] });

    // Ikkala yo'nalishdagi bloklashni bitta so'rovda tekshiramiz (har bir nomzod
    // uchun alohida emas) — natijadagi ro'yxatdan shu userlarni chiqarib tashlaymiz.
    const blocks = await Block.find({
      $or: [
        { blockerId: user._id, blockedId: { $in: found.map((f) => f._id) } },
        { blockedId: user._id, blockerId: { $in: found.map((f) => f._id) } },
      ],
    }).lean();
    const blockedIds = new Set(blocks.map((b) => String(b.blockerId) === String(user._id) ? String(b.blockedId) : String(b.blockerId)));

    const results = found
      .filter((f) => !blockedIds.has(String(f._id)))
      .map((f) => ({
        id: f._id,
        username: f.username,
        name: f.name || '',
        // Qidiruvda suhbat bor-yo'qligi noma'lum — 'friends' maxfiyligida rasm
        // ko'rsatilmaydi (xavfsiz tomonga), 'everyone'da ko'rsatiladi.
        photoId: currentPhotoId(f),
      }));

    return NextResponse.json({ results });
  } catch (err) {
    return serverError(err, 'chat/search');
  }
}
