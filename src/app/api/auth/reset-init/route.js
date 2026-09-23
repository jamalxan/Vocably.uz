import { connectToDatabase } from '@/lib/db';
import { User, OtpSession } from '@/lib/models';
import { normalizePhone } from '@/lib/phone';
import { serverError } from '@/lib/apiError';
import { generateSessionToken } from '@/lib/otp';
import { getTelegramDeepLink, getBotUsername } from '@/lib/telegram';
import { checkRateLimit } from '@/lib/chatAuth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { phone: rawPhone } = await req.json();

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
    }

    // register-init bilan bir xil audit topilmasi: "hisob topilmadi" javobi
    // orqali enumeration + cheksiz OtpSession yaratish xavfi.
    if (!(await checkRateLimit(phone, 'reset-init', 5))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    if (!getBotUsername()) {
      return NextResponse.json({ error: 'Server sozlanmagan (TELEGRAM_BOT_USERNAME yo\'q)' }, { status: 500 });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ error: 'Bu raqam bilan hisob topilmadi' }, { status: 404 });
    }

    await OtpSession.deleteMany({ phone, purpose: 'reset' });

    const sessionToken = generateSessionToken();
    await OtpSession.create({
      sessionToken,
      purpose: 'reset',
      phone,
      userId: user._id,
      status: 'awaiting_telegram',
    });

    return NextResponse.json({
      sessionToken,
      telegramLink: getTelegramDeepLink(sessionToken),
      botUsername: getBotUsername(),
    });
  } catch (err) {
    return serverError(err, 'auth/reset-init');
  }
}
