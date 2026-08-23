import { connectToDatabase } from '@/lib/db';
import { OtpSession, User, Conversation, Message, AdminAuditLog } from '@/lib/models';
import { phonesMatch, normalizePhone, formatPhoneDisplay } from '@/lib/phone';
import { generateCode } from '@/lib/otp';
import { sendMessage, requestContactKeyboard, removeKeyboard } from '@/lib/telegram';
import { NextResponse } from 'next/server';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

// Telegramdan boshqarilgan o'zgarishlar ham web admin panel bilan bir xil audit
// jurnaliga yoziladi. Actor sifatida shu chatga bog'langan admin User topiladi
// (telegramChatId — OTP orqali allaqachon bog'langan); topilmasa jimgina o'tkazib
// yuboriladi, chunki AdminAuditLog'ning actorId maydoni majburiy.
async function logTelegramAction(chatId, action, targetType, targetId, diff) {
  try {
    const actor = await User.findOne({ telegramChatId: Number(chatId), role: 'admin' }).select('_id');
    if (!actor) return;
    await AdminAuditLog.create({
      actorId: actor._id,
      action,
      targetType: targetType || null,
      targetId: targetId ? String(targetId) : null,
      diff: diff || null,
      ip: null,
      userAgent: 'telegram-bot',
    });
  } catch (err) {
    console.error('[audit-log] telegram amali yozilmadi', err);
  }
}

const ADMIN_MENU =
  `🛠 <b>Admin buyruqlari</b>\n\n` +
  `/statistika — to'liq statistika va Do'stlar userlari ro'yxati\n` +
  `/users — barcha foydalanuvchilar ro'yxati\n\n` +
  `<b>Boshqaruv (Do'stlar bo'limi):</b>\n` +
  `/admin grant &lt;telefon&gt; &lt;username&gt; — ruxsat berish\n` +
  `/admin revoke &lt;telefon&gt; — ruxsatni olib tashlash\n` +
  `/admin ban &lt;telefon&gt; — chatdan bloklash\n` +
  `/admin unban &lt;telefon&gt; — blokdan chiqarish\n\n` +
  `Masalan: <code>/admin grant +998901234567 nodira</code>`;

// Telefon bo'yicha topib, {chatAccess/chatBanned/username} maydonlaridan birini
// o'zgartiradigan umumiy funksiya — 4 ta boshqaruv buyrug'i shu orqali ishlaydi.
async function handleAdminMutation(chatId, action, phoneRaw, extra) {
  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    await sendMessage(chatId, "❌ Telefon raqam noto'g'ri formatda.");
    return;
  }
  const user = await User.findOne({ phone });
  if (!user) {
    await sendMessage(chatId, `❌ ${formatPhoneDisplay(phone)} raqamli foydalanuvchi topilmadi.`);
    return;
  }

  const diff = {};
  if (action === 'grant') {
    const uname = (extra || '').trim().toLowerCase();
    if (!USERNAME_RE.test(uname)) {
      await sendMessage(chatId, "❌ Username 3-20 belgi, faqat kichik lotin harflari/raqam/pastki chiziq bo'lishi kerak.\nMasalan: <code>/admin grant +998901234567 nodira</code>");
      return;
    }
    const clash = await User.findOne({ username: uname, _id: { $ne: user._id } }).select('_id');
    if (clash) {
      await sendMessage(chatId, `❌ "${uname}" username'i band.`);
      return;
    }
    diff.chatAccess = { from: user.chatAccess, to: true };
    diff.username = { from: user.username, to: uname };
    user.chatAccess = true;
    user.username = uname;
  } else if (action === 'revoke') {
    diff.chatAccess = { from: user.chatAccess, to: false };
    user.chatAccess = false;
  } else if (action === 'ban') {
    diff.chatBanned = { from: user.chatBanned, to: true };
    user.chatBanned = true;
  } else if (action === 'unban') {
    diff.chatBanned = { from: user.chatBanned, to: false };
    user.chatBanned = false;
  }

  await user.save();
  await logTelegramAction(chatId, `chat.user.update`, 'User', user._id, diff);

  const label = `${user.name || '(ismsiz)'} (${formatPhoneDisplay(user.phone)}${user.username ? ` · @${user.username}` : ''})`;
  const RESULT_TEXT = {
    grant: `✅ ${label} — Do'stlar ruxsati berildi.`,
    revoke: `✅ ${label} — Do'stlar ruxsati olib tashlandi.`,
    ban: `✅ ${label} — chatdan bloklandi.`,
    unban: `✅ ${label} — blokdan chiqarildi.`,
  };
  await sendMessage(chatId, RESULT_TEXT[action]);
}

// Bitta Telegram chat ID'ni "admin" deb belgilaymiz — kodga yozib qo'yish o'rniga env
// o'zgaruvchisidan o'qiladi, shunda shaxsiy ID repozitoriyga tushmaydi. /users buyrug'i
// shu chatdan kelsa, foydalanuvchilar soni va ro'yxatini (email yo'q — ilovada login
// telefon orqali, User modelida email maydoni umuman yo'q) qisqacha qaytaradi.
async function handleAdminCommand(chatId, text) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId || String(chatId) !== String(adminChatId)) return false;

  // /admin — faqat boshqaruv (Do'stlar ruxsati/ban) uchun, statistikasiz.
  if (text === '/admin' || text.startsWith('/admin ')) {
    const parts = text.split(/\s+/).slice(1); // ['grant', '+998...', 'username'] va h.k.
    const [action, phone, extra] = parts;

    if (!action) {
      await sendMessage(chatId, ADMIN_MENU);
      return true;
    }
    if (!['grant', 'revoke', 'ban', 'unban'].includes(action)) {
      await sendMessage(chatId, "❌ Noma'lum buyruq.\n\n" + ADMIN_MENU);
      return true;
    }
    if (!phone || (action === 'grant' && !extra)) {
      await sendMessage(chatId, `❌ Format: <code>/admin ${action} &lt;telefon&gt;${action === 'grant' ? ' &lt;username&gt;' : ''}</code>`);
      return true;
    }
    await handleAdminMutation(chatId, action, phone, extra);
    return true;
  }

  if (text === '/statistika') {
    await sendAdminOverview(chatId);
    return true;
  }

  if (!['/users', '/stats'].includes(text)) return false;

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

// /statistika — to'liq holat: umumiy foydalanuvchi sonidan tashqari Do'stlar (chat) bo'limi
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
