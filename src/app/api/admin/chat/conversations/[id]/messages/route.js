import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

// Foydalanuvchi shikoyat qilganda yoki nazorat uchun admin bitta suhbatning
// to'liq xabar tarixini ko'radi. Bu — jiddiy maxfiylik chegarasi, shuning uchun
// har bir ko'rish AdminAuditLog'ga yoziladi ("kim, qachon, qaysi suhbatni ko'rdi").
export async function GET(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const convo = await Conversation.findById(params.id);
    if (!convo) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    // Ilgari LIMITSIZ edi — uzoq suhbatda butun tarixni bitta so'rovda olardi. Endi
    // oddiy foydalanuvchi endpointi (chat/conversations/[id]/messages) bilan bir xil
    // cursor naqshi: eng yangi 50 tadan boshlab, "before" bilan eskisini yuklaydi.
    const before = req.nextUrl.searchParams.get('before');
    const query = { conversationId: convo._id };
    if (before) query.createdAt = { $lt: new Date(before) };
    // `type` — bitta media turi bo'yicha alohida galereya (Rasmlar/Videolar/Ovozli
    // xabarlar — ConversationViewer.jsx'da 3 ta alohida tab). Matnli xabarlar orasidan
    // qidirmasdan, to'g'ridan-to'g'ri hammasini (o'chirilganlari ham — bu yerda hech
    // narsa sanitizatsiya qilinmaydi, media/matn xom holicha qaytadi) ko'rish uchun.
    const galleryType = req.nextUrl.searchParams.get('type');
    if (['image', 'video', 'voice'].includes(galleryType)) {
      query.type = galleryType;
    } else if (req.nextUrl.searchParams.get('media') === '1') {
      query.type = { $in: ['image', 'video', 'voice'] };
    }
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    // `order=desc` — galereya rejimi: eng yangisi tepada, eskisi pastda (suhbat
    // oqimidagi eskidan-yangiga tartib bilan aralashtirilmaydi). `nextCursor`
    // (eski elementlarni "Yana yuklash" uchun) reverse qilishdan OLDIN olinadi —
    // desc tartibda oxirgi element eng eskisi.
    const desc = req.nextUrl.searchParams.get('order') === 'desc';
    const page = await Message.find(query).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = page.length > limit;
    const trimmed = hasMore ? page.slice(0, limit) : page;
    const oldestInBatch = trimmed[trimmed.length - 1]?.createdAt || null;
    const messages = desc ? trimmed : trimmed.reverse();
    const nextCursor = hasMore ? oldestInBatch : null;

    // Faqat birinchi (kursorsiz) ko'rishda audit-log yoziladi — "load more" bosilganda
    // har safar emas, aks holda bitta suhbatni ko'rish o'nlab audit yozuvi yaratardi.
    if (!before) {
      await writeAuditLog(req, admin._id, 'chat.conversation.view', 'Conversation', convo._id, {
        messageCount: messages.length,
      });
    }

    return NextResponse.json({ messages, nextCursor });
  } catch (err) {
    return serverError(err, 'admin/chat/conversations/[id]/messages');
  }
}
