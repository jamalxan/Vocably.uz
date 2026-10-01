import { connectToDatabase } from '@/lib/db';
import { User, OtpSession } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { serverError } from '@/lib/apiError';
import { passwordError } from '@/lib/passwordPolicy';
import { NextResponse } from 'next/server';

const SESSION_TOKEN_RE = /^[a-f0-9]{32}$/;

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    // Matn bo'lmagan qiymat (obyekt/massiv) filtrga hech qachon tushmaydi — NoSQL inyeksiya (`{"$ne":""}` bilan ixtiyoriy
    // "tasdiqlangan" sessiyani tanlab, begona foydalanuvchi parolini o'zgartirish) shu yerda to'sildi.
    const sessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!SESSION_TOKEN_RE.test(sessionToken) || !newPassword) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }
    const pwErr = passwordError(newPassword);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    // Bir martalik: sessiya atomik "iste'mol" qilinadi — parallel ikki so'rov parolni ikki marta o'zgartira olmaydi.
    const session = await OtpSession.findOneAndDelete({ sessionToken, purpose: 'reset', status: 'verified' });
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Sessiya yaroqsiz, qaytadan urinib ko\'ring' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(session.userId, { password: hashedPassword });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'auth/reset-password');
  }
}
