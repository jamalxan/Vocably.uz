import { connectToDatabase } from '@/lib/db';
import { OtpSession, User, Conversation, Message } from '@/lib/models';
import { phonesMatch } from '@/lib/phone';
import { generateCode } from '@/lib/otp';
import { sendMessage, requestContactKeyboard, removeKeyboard } from '@/lib/telegram';
import { NextResponse } from 'next/server';

// Bitta Telegram chat ID'ni "admin" deb belgilaymiz — kodga yozib qo'yish o'rniga env
// o'zgaruvchisidan o'qiladi, shunda shaxsiy ID repozitoriyga tushmaydi. /users buyrug'i
// shu chatdan kelsa, foydalanuvchilar soni va ro'yxatini (email yo'q — ilovada login
// telefon orqali, User modelida email maydoni umuman yo'q) qisqacha qaytaradi.
async function handleAdminCommand(chatId, text) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId || String(chatId) !== String(adminChatId)) return false;
  if (!['/users', '/stats', '/admin'].includes(text)) return false;

  if (text === '/admin') {
    await sendAdminOverview(chatId);
    return true;
  }

  const users = await User.find({}).select('name phone createdAt').sort({ createdAt: -1 }).lean();
  const total = users.length;

  if (text === '/stats') {
    await sendMessage(chatId, `📊 Jami foydalanuvchilar: <b>${total}</b>`);
    return true;
  }

  // Ilovada email maydoni yo'q (login faqat telefon orqali) — shuning uchun ism + telefon
  // ko'rsatiladi. Telegram xabari 4096 belgi bilan cheklangan, shuning uchun 40 tadan bo'lib
  // yuboriladi.
  const header = `📊 Jami foydalanuvchilar: <b>${total}</b>\n<i>(Eslatma: ilovada email maydoni yo'q, faqat telefon orqali ro'yxatdan o'tiladi)</i>\n`;
  await sendMessage(chatId, header);

  const PAGE_SIZE = 40;
  for (let i = 0; i < users.length; i += PAGE_SIZE) {
    const page = users.slice(i, i + PAGE_SIZE);
    const lines = page.map((u, idx) => {
      const num = i + idx + 1;
      const date = u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : '—';
      return `${num}. ${u.name || '(ismsiz)'} — ${u.phone} — ${date}`;
    });
    await sendMessage(chatId, lines.join('\n'));
  }
  return true;
}

// /admin — to'liq holat: umumiy foydalanuvchi sonidan tashqari Do'stlar (chat) bo'limi
// bo'yicha to'liq statistika + ruxsat berilgan userlar ro'yxati ismlari bilan. Telegram
// xabari 4096 belgi bilan cheklangan, shuning uchun ro'yxat sahifalab yuboriladi (mavjud
// /users patterniga mos).
async function sendAdminOverview(chatId) {
  const [totalUsers, chatUsers, adminCount, bannedCount, totalConversations, totalMessages] = await Promise.all([
    User.countDocuments({}),
    User.find({ chatAccess: true }).select('name phone username chatBanned createdAt').sort({ createdAt: -1 }).lean(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ chatAccess: true, chatBanned: true }),
    Conversation.countDocuments({}),
    Message.countDocuments({}),
  ]);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const newToday = await User.countDocuments({ createdAt: { $gte: dayAgo } });

  const header =
    `🛠 <b>Vocably — umumiy holat</b>\n\n` +
    `👥 Jami foydalanuvchilar: <b>${totalUsers}</b> (so'nggi 24 soatda: +${newToday})\n` +
    `💬 Do'stlar bo'limiga ruxsati bor: <b>${chatUsers.length}</b>\n` +
    `🚫 Chatdan bloklangan: <b>${bannedCount}</b>\n` +
    `👑 Adminlar: <b>${adminCount}</b>\n` +
    `📨 Jami suhbatlar: <b>${totalConversations}</b>\n` +
    `✉️ Jami xabarlar: <b>${totalMessages}</b>`;
  await sendMessage(chatId, header);

  if (chatUsers.length === 0) return;

  const PAGE_SIZE = 40;
  await sendMessage(chatId, "👤 <b>Do'stlar bo'limi userlari:</b>");
  for (let i = 0; i < chatUsers.length; i += PAGE_SIZE) {
    const page = chatUsers.slice(i, i + PAGE_SIZE);
    const lines = page.map((u, idx) => {
      const num = i + idx + 1;
      const ban = u.chatBanned ? ' 🚫' : '';
      return `${num}. ${u.name || '(ismsiz)'} — @${u.username || '—'} — ${u.phone}${ban}`;
    });
    await sendMessage(chatId, lines.join('\n'));
  }
}

// Telegram bizga har bir yangilanishni shu manzilga POST qiladi.
// Oqim:
// 1) /start <sessionToken> -> foydalanuvchidan "Raqamni ulashish" tugmasi orqali kontakt so'raladi
// 2) Kontakt kelganda -> saytda kiritilgan raqam bilan solishtiriladi
// 3) Mos kelsa -> 6 xonali kod generatsiya qilinib, Telegram orqali yuboriladi

export async function POST(req) {
  try {
    // Webhook so'rovi haqiqatan ham Telegram'dan kelayotganini tekshiramiz
    const secret = req.headers.get('x-telegram-bot-api-secret-token');
    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    await connectToDatabase();
    const update = await req.json();
    const message = update.message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = (message.text || '').trim();

    if (await handleAdminCommand(chatId, text)) {
      return NextResponse.json({ ok: true });
    }

    // --- /start <sessionToken> ---
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const sessionToken = parts[1];

      if (!sessionToken) {
        await sendMessage(
          chatId,
          "Assalomu alaykum! 👋\n\nBu bot <b>Vocably</b> platformasida ro'yxatdan o'tish va parolni tiklash uchun telefon raqamingizni tasdiqlaydi.\n\nIltimos, saytdagi tegishli tugma orqali qayta o'ting."
        );
        return NextResponse.json({ ok: true });
      }

      const session = await OtpSession.findOne({ sessionToken });
      if (!session) {
        await sendMessage(chatId, "❌ Bu havola muddati tugagan yoki yaroqsiz. Iltimos, saytga qaytib qaytadan urinib ko'ring.");
        return NextResponse.json({ ok: true });
      }

      session.telegramChatId = chatId;
      await session.save();

      await sendMessage(
        chatId,
        "Raqamingizni tasdiqlash uchun quyidagi tugma orqali telefon raqamingizni yuboring 👇\n\n<i>Telegram bu raqamni avtomatik taklif qiladi, shunchaki tasdiqlang.</i>",
        requestContactKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    // --- Kontakt (telefon raqam) yuborildi ---
    if (message.contact) {
      // Faqat o'zining kontaktini qabul qilamiz (forward qilingan boshqa kontaktlarni emas)
      if (message.contact.user_id && message.contact.user_id !== message.from.id) {
        await sendMessage(chatId, "❌ Iltimos, faqat o'zingizning telefon raqamingizni yuboring.", removeKeyboard());
        return NextResponse.json({ ok: true });
      }

      const session = await OtpSession.findOne({
        telegramChatId: chatId,
        status: 'awaiting_telegram',
      }).sort({ createdAt: -1 });

      if (!session) {
        await sendMessage(chatId, "❌ Faol so'rov topilmadi. Iltimos, saytdan qaytadan boshlang.", removeKeyboard());
        return NextResponse.json({ ok: true });
      }

      if (!phonesMatch(message.contact.phone_number, session.phone)) {
        await sendMessage(
          chatId,
          "❌ Bu Telegram profilingizdagi raqam saytda kiritilgan raqam bilan mos kelmadi.\n\nIltimos, saytda xuddi shu Telegram akkauntingizga tegishli raqamni kiriting.",
          removeKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      const code = generateCode();
      session.code = code;
      session.status = 'code_sent';
      await session.save();

      await sendMessage(
        chatId,
        `✅ Raqamingiz tasdiqlandi!\n\nTasdiqlash kodingiz:\n\n<b>${code}</b>\n\nUshbu kodni saytdagi tegishli maydonga kiriting. Kod 15 daqiqa amal qiladi, hech kimga bermang.`,
        removeKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    // Boshqa har qanday xabar uchun qisqa yordam matni
    await sendMessage(chatId, "Iltimos, saytdagi havola orqali qayta o'ting va ko'rsatmalarga amal qiling.");
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Telegramga har doim 200 qaytarish kerak, aks holda u qayta-qayta urinishda davom etaveradi
    console.error('Telegram webhook xatoligi:', err);
    return NextResponse.json({ ok: true });
  }
}
