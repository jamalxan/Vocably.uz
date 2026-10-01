import { connectToDatabase } from '@/lib/db';
import { User, OtpSession } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { serverError } from '@/lib/apiError';
import { setAuthCookie } from '@/lib/auth';
import { sendMessage } from '@/lib/telegram';
import { formatPhoneDisplay } from '@/lib/phone';
import { safeEqual } from '@/lib/safeEqual';
import { checkRateLimit } from '@/lib/chatAuth';
import { clientIp } from '@/lib/clientIp';
import { escapeTelegramHtml } from '@/lib/telegramHtml';
import { NextResponse } from 'next/server';

const SESSION_TOKEN_RE = /^[a-f0-9]{32}$/;
const CODE_RE = /^\d{6}$/;
const MAX_OTP_ATTEMPTS = 5;

// Yangi ro'yxatdan o'tgan foydalanuvchi haqida admin'ga Telegram orqali xabar.
// Xato bo'lsa faqat log qilinadi — bildirishnoma muvaffaqiyatsiz bo'lishi
// ro'yxatdan o'tishning o'zini bloklamasligi kerak.
async function notifyAdminNewUser(user) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return;
  try {
    await sendMessage(
      adminChatId,
      `🆕 <b>Yangi foydalanuvchi qo'shildi</b>\n\n👤 Ism: <b>${escapeTelegramHtml(user.name) || '(ismsiz)'}</b>\n📱 Telefon: <b>${formatPhoneDisplay(user.phone)}</b>`
    );
  } catch (err) {
    console.error('[telegram] yangi user bildirishnomasi yuborilmadi', err?.message || err);
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    if (!(await checkRateLimit(clientIp(req), 'verify-code-ip', 30))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    const body = await req.json();
    // Qat'iy format: sessionToken faqat 32 ta hex belgi, kod faqat 6 ta raqam. Matn bo'lmagan qiymat (obyekt/massiv) bu yerda
    // rad etiladi — filtrga hech qachon tushmaydi (NoSQL inyeksiya, `{"$ne":""}`).
    const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : '';
    const code = typeof body?.code === 'string' || typeof body?.code === 'number' ? String(body.code).trim() : '';

    if (!SESSION_TOKEN_RE.test(sessionToken) || !CODE_RE.test(code)) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server sozlanmagan (JWT_SECRET yo'q)" }, { status: 500 });
    }

    const session = await OtpSession.findOne({ sessionToken });
    if (!session) {
      return NextResponse.json({ error: 'Sessiya muddati tugagan, qaytadan urinib ko\'ring' }, { status: 400 });
    }

    if (session.status !== 'code_sent') {
      return NextResponse.json({ error: "Kod hali yuborilmagan. Avval Telegram botda raqamingizni tasdiqlang." }, { status: 400 });
    }

    // Urinishni ATOMIK "sarflaymiz" (tekshirishdan OLDIN): avval `attempts` o'qilib, keyin `+= 1; save()` qilinardi — parallel
    // so'rovlar hammasi `attempts = 0` ni ko'rib, chegarani aylanib o'tardi va 6 xonali kodni batch bilan taxmin qilish mumkin edi.
    const claimed = await OtpSession.findOneAndUpdate(
      { _id: session._id, status: 'code_sent', attempts: { $lt: MAX_OTP_ATTEMPTS } },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!claimed) {
      await OtpSession.deleteOne({ _id: session._id, attempts: { $gte: MAX_OTP_ATTEMPTS } });
      return NextResponse.json({ error: "Urinishlar soni tugadi. Qaytadan boshlang." }, { status: 400 });
    }

    if (!safeEqual(claimed.code, code)) {
      return NextResponse.json({ error: "Kod noto'g'ri" }, { status: 400 });
    }

    if (session.purpose === 'register') {
      // Bir martalik foydalanish: to'g'ri kod bilan parallel yuborilgan ikkinchi so'rov hisob yaratolmaydi.
      const used = await OtpSession.findOneAndDelete({ _id: session._id, status: 'code_sent' });
      if (!used) return NextResponse.json({ error: 'Sessiya muddati tugagan, qaytadan urinib ko\'ring' }, { status: 400 });

      const existing = await User.findOne({ phone: session.phone });
      if (existing) {
        return NextResponse.json({ error: 'Bu telefon raqam bilan hisob allaqachon mavjud' }, { status: 400 });
      }

      const newUser = await User.create({
        phone: session.phone,
        name: session.name || '',
        password: session.passwordHash,
        telegramChatId: session.telegramChatId,
        categories: [
          {
            name: 'Words 1',
            words: [
              { word: 'arise', syns: ["paydo bo'lmoq", "tug'ilmoq"] },
              { word: 'benefactor', syns: ["muruvvat ko'rsatuvchi"] },
              { word: 'blacksmith', syns: ['temirchi'] },
              { word: 'charitable', syns: ['marhamatli'] },
              { word: 'chimney', syns: ["mo'ri"] },
            ],
          },
        ],
        chatHistory: [],
      });

      await notifyAdminNewUser(newUser);

      const token = jwt.sign({ userId: newUser._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return setAuthCookie(NextResponse.json({ done: true, token, name: newUser.name, phone: newUser.phone }), token);
    }

    if (session.purpose === 'reset') {
      const verified = await OtpSession.findOneAndUpdate({ _id: session._id, status: 'code_sent' }, { $set: { status: 'verified' } }, { new: true });
      if (!verified) return NextResponse.json({ error: 'Sessiya muddati tugagan, qaytadan urinib ko\'ring' }, { status: 400 });
      return NextResponse.json({ done: true, sessionToken: session.sessionToken });
    }

    return NextResponse.json({ error: 'Noma\'lum so\'rov turi' }, { status: 400 });
  } catch (err) {
    return serverError(err, 'auth/verify-code');
  }
}
