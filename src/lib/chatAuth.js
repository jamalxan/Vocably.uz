import { User, RateLimitHit, AdminAuditLog } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { LAST_ACTIVE_THROTTLE_MS } from '@/lib/chatConstants';

// "Oxirgi faol bo'lgan" vaqtni har so'rovda emas, shu oraliqdan kamida bir marta yozadi —
// Do'stlar bo'limi faol foydalanilganda ham har chat-so'rovida yozuv bo'lmasligi uchun.
// Qiymat src/lib/chatConstants.js'da — src/lib/presence.js (client) shu bilan mos
// "onlayn" chegarasini hisoblaydi (docs/ shu faylning izohiga qarang).

// Do'stlar bo'limi uchun: token haqiqiy, chatAccess yoqilgan va bloklanmagan
// foydalanuvchinigina o'tkazadi. Har bir /api/chat/* route shu bilan boshlanadi —
// frontendda yashirish himoya emas, bu yerda haqiqiy tekshiruv.
export async function requireChatUser(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return { error: 'Ruxsat berilmagan', status: 401 };

  // Bu yerda o'zi ulanadi — chaqiruvchi route'lar odatda bundan keyin ham
  // connectToDatabase() chaqiradi (bepul, keshlangan), lekin BUNDAN OLDIN chaqirilmasa
  // (bir nechta route'da shunday edi) sovuq konteynerda "buffering timed out" xatosi
  // berardi, chunki mongoose.connect() hali umuman boshlanmagan bo'lardi.
  await connectToDatabase();

  const user = await User.findById(userId)
    .select('username chatAccess chatBanned role name phone lastActiveAt')
    .lean();
  if (!user) return { error: 'Foydalanuvchi topilmadi', status: 404 };
  if (!user.chatAccess || user.chatBanned) {
    return { error: 'Bu bo\'lim uchun ruxsatingiz yo\'q', status: 403 };
  }

  // Javobni bloklamaydi — xato bo'lsa (masalan vaqtinchalik DB muammosi) jim o'tkazib
  // yuboriladi, "oxirgi marta ko'rilgan" bir necha daqiqa eskirib qolishi muhim emas.
  const lastActiveMs = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0;
  if (Date.now() - lastActiveMs > LAST_ACTIVE_THROTTLE_MS) {
    User.updateOne({ _id: userId }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
  }

  return { user };
}

// /api/admin/* route'lar uchun: faqat role === 'admin'.
export async function requireAdminUser(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return { error: 'Ruxsat berilmagan', status: 401 };

  await connectToDatabase();

  const user = await User.findById(userId).select('username role name phone').lean();
  if (!user) return { error: 'Foydalanuvchi topilmadi', status: 404 };
  if (user.role !== 'admin') return { error: 'Ruxsat berilmagan', status: 403 };

  return { user };
}

// TCH-01/02 — /api/teacher/* route'lar uchun: faqat role === 'teacher'.
// `requireAdminUser`ning aynan o'zi bilan bir xil shakl (401/403, `user`
// select'i) — admin/teacher endpoint'lar bir xil chaqiruv naqshini kutadi.
export async function requireTeacherUser(req) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return { error: 'Ruxsat berilmagan', status: 401 };

  await connectToDatabase();

  const user = await User.findById(userId).select('username role name phone').lean();
  if (!user) return { error: 'Foydalanuvchi topilmadi', status: 404 };
  if (user.role !== 'teacher') return { error: 'Ruxsat berilmagan', status: 403 };

  return { user };
}

// Infratuzilmasiz (Redis'siz) oddiy tezlik cheklash: 60 soniyalik oynada
// (userId, action) juftligi uchun `limit` martadan ko'p urinishga yo'l qo'ymaydi.
// RateLimitHit hujjati TTL indeks orqali 60s'dan keyin o'zi o'chadi (src/lib/models.js).
export async function checkRateLimit(userId, action, limit) {
  await connectToDatabase();
  const key = `${userId}:${action}`;
  const doc = await RateLimitHit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { windowStart: new Date() } },
    { upsert: true, new: true }
  );
  return doc.count <= limit;
}

// Har bir admin mutatsiyasi shu orqali yoziladi (docs/ chat plani §9.1 talabi).
// Xato bo'lsa faqat log qilinadi — audit yozuvi asosiy amalni bloklamasligi kerak.
//
// `dedupeMinutes` (ixtiyoriy) — N-08: `chat.conversation.view` / `chat.media.view`
// har 30-60s so'ralganda (frontend polling) bir xil (actor, action, target) uchun
// audit log'ni shishirmasligi kerak. Shu oynada bir xil yozuv allaqachon bo'lsa,
// yangisi yozilmaydi ("sessiya darajasida dedupe" — chaqiruvchi har safar urinadi,
// bu yerda so'nggisi tekshiriladi). Boshqa (mutatsiya) chaqiruvlar bu parametrni
// bermaydi — ular har doim yoziladi, chunki har bir mutatsiya alohida ahamiyatli.
export async function writeAuditLog(req, actorId, action, targetType, targetId, diff, dedupeMinutes) {
  try {
    await connectToDatabase();

    if (dedupeMinutes) {
      const since = new Date(Date.now() - dedupeMinutes * 60 * 1000);
      const recent = await AdminAuditLog.findOne({
        actorId,
        action,
        targetType: targetType || null,
        targetId: targetId ? String(targetId) : null,
        createdAt: { $gte: since },
      })
        .select('_id')
        .lean();
      if (recent) return;
    }

    await AdminAuditLog.create({
      actorId,
      action,
      targetType: targetType || null,
      targetId: targetId ? String(targetId) : null,
      diff: diff || null,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      userAgent: req.headers.get('user-agent') || null,
    });
  } catch (err) {
    console.error('[audit-log] yozishda xatolik', err);
  }
}
