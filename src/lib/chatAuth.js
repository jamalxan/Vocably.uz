import { User, RateLimitHit, AdminAuditLog } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

// "Oxirgi faol bo'lgan" vaqtni har so'rovda emas, shu oraliqdan kamida bir marta yozadi —
// Do'stlar bo'limi faol foydalanilganda ham har chat-so'rovida yozuv bo'lmasligi uchun.
const LAST_ACTIVE_THROTTLE_MS = 2 * 60 * 1000;

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
export async function writeAuditLog(req, actorId, action, targetType, targetId, diff) {
  try {
    await connectToDatabase();
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
