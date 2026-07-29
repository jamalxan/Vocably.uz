import { connectToDatabase } from '@/lib/db';
import { User, OtpSession } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { sessionToken, code } = await req.json();

    if (!sessionToken || !code) {
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

    if (session.attempts >= 5) {
      await OtpSession.deleteOne({ _id: session._id });
      return NextResponse.json({ error: "Urinishlar soni tugadi. Qaytadan boshlang." }, { status: 400 });
    }

    if (session.code !== String(code).trim()) {
      session.attempts += 1;
      await session.save();
      return NextResponse.json({ error: "Kod noto'g'ri" }, { status: 400 });
    }

    if (session.purpose === 'register') {
      const existing = await User.findOne({ phone: session.phone });
      if (existing) {
        await OtpSession.deleteOne({ _id: session._id });
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

      await OtpSession.deleteOne({ _id: session._id });

      const token = jwt.sign({ userId: newUser._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return NextResponse.json({ done: true, token, name: newUser.name, phone: newUser.phone });
    }

    if (session.purpose === 'reset') {
      session.status = 'verified';
      await session.save();
      return NextResponse.json({ done: true, sessionToken: session.sessionToken });
    }

    return NextResponse.json({ error: 'Noma\'lum so\'rov turi' }, { status: 400 });
  } catch (err) {
    return serverError(err, 'auth/verify-code');
  }
}
