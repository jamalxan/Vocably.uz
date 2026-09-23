import { connectToDatabase } from '@/lib/db';
import { User, OtpSession } from '@/lib/models';
import { normalizePhone } from '@/lib/phone';
import { serverError } from '@/lib/apiError';
import { generateSessionToken } from '@/lib/otp';
import { getTelegramDeepLink, getBotUsername } from '@/lib/telegram';
import { checkRateLimit } from '@/lib/chatAuth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { phone: rawPhone, password, name } = await req.json();

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
    }

    // Audit topilmasi: bu endpoint avval hech qanday tezlik cheklovisiz edi —
    // "hisob allaqachon mavjud" javobi orqali raqamlarni ommaviy tekshirish
    // (enumeration) va bo'sh OtpSession hujjatlari bilan spam qilish mumkin edi.
    // Foydalanuvchi hali yo'q, shuning uchun kalit sifatida raqamning o'zi.
    if (!(await checkRateLimit(phone, 'register-init', 5))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Parol kamida 6 belgidan iborat bo'lsin" }, { status: 400 });
    }
    if (!getBotUsername()) {
      return NextResponse.json({ error: 'Server sozlanmagan (TELEGRAM_BOT_USERNAME yo\'q)' }, { status: 500 });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu telefon raqam bilan hisob allaqachon mavjud' }, { status: 400 });
    }

    // Shu raqam uchun eski, tugallanmagan sessiyalarni tozalaymiz
    await OtpSession.deleteMany({ phone, purpose: 'register' });

    const sessionToken = generateSessionToken();
    const passwordHash = await bcrypt.hash(password, 10);

    await OtpSession.create({
      sessionToken,
      purpose: 'register',
      phone,
      name: (name || '').trim(),
      passwordHash,
      status: 'awaiting_telegram',
    });

    return NextResponse.json({
      sessionToken,
      telegramLink: getTelegramDeepLink(sessionToken),
      botUsername: getBotUsername(),
    });
  } catch (err) {
    return serverError(err, 'auth/register-init');
  }
}
