import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { normalizePhone } from '@/lib/phone';
import { serverError } from '@/lib/apiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { phone: rawPhone, password } = await req.json();

    const phone = normalizePhone(rawPhone);
    if (!phone || !password) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server sozlanmagan (JWT_SECRET yo'q)" }, { status: 500 });
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

    return NextResponse.json({ token, name: user.name, phone: user.phone });
  } catch (err) {
    return serverError(err, 'auth/login');
  }
}
