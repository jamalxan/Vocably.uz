import { connectToDatabase } from '@/lib/db';
import { OtpSession } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectToDatabase();
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: "Token yo'q" }, { status: 400 });
    }

    const session = await OtpSession.findOne({ sessionToken: token });
    if (!session) {
      return NextResponse.json({ status: 'expired' });
    }

    return NextResponse.json({ status: session.status });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}
