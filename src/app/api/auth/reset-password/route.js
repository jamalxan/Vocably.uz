import { connectToDatabase } from '@/lib/db';
import { User, OtpSession } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { sessionToken, newPassword } = await req.json();

    if (!sessionToken || !newPassword) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Parol kamida 6 belgidan iborat bo'lsin" }, { status: 400 });
    }

    const session = await OtpSession.findOne({ sessionToken });
    if (!session || session.purpose !== 'reset' || session.status !== 'verified') {
      return NextResponse.json({ error: 'Sessiya yaroqsiz, qaytadan urinib ko\'ring' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(session.userId, { password: hashedPassword });
    await OtpSession.deleteOne({ _id: session._id });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'auth/reset-password');
  }
}
