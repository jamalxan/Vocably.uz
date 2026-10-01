import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { normalizePhone } from '@/lib/phone';
import { serverError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/chatAuth';
import { setAuthCookie } from '@/lib/auth';
import { clientIp } from '@/lib/clientIp';
import { PASSWORD_MAX } from '@/lib/passwordPolicy';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const rawPhone = body?.phone;
    const password = typeof body?.password === 'string' ? body.password : '';

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Parolni kiriting' }, { status: 400 });
    }
    // Juda uzun parol bcrypt'ni foydasiz ishlatadi (faqat 72 bayt hisobga olinadi) va ish vaqtini oshiradi.
    if (password.length > PASSWORD_MAX) {
      return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 400 });
    }
    // IP bo'yicha umumiy chegara: faqat raqam bo'yicha cheklash bitta IP'dan ko'p raqamni navbat bilan taxmin qilishga
    // (credential stuffing) to'sqinlik qilmaydi.
    if (!(await checkRateLimit(clientIp(req), 'login-ip', 40))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server sozlanmagan (JWT_SECRET yo'q)" }, { status: 500 });
    }

    // Parolni "qo'pol kuch" (brute-force) bilan taxmin qilishga qarshi — shu
    // raqam uchun 60 soniyada 8 tadan ortiq urinishga yo'l qo'yilmaydi
    // (src/lib/chatAuth.js'dagi umumiy tezlik cheklagich, boshqa joyda ham ishlatiladi).
    if (!(await checkRateLimit(phone, 'login', 8))) {
      return NextResponse.json({ error: 'Juda ko\'p urinish. Biroz kuting.' }, { status: 429 });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ error: 'Bu raqam bilan hisob topilmadi' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 400 });
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return setAuthCookie(NextResponse.json({ token, name: user.name, phone: user.phone }), token);
  } catch (err) {
    return serverError(err, 'auth/login');
  }
}
