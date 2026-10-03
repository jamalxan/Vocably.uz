import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { Classroom } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Taklifni qabul qilish ({accept:true}) yoki rad etish ({accept:false}).
// Faqat taklif qilingan foydalanuvchining o'zi harakat qila oladi.
export async function POST(req, props) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Taklif topilmadi' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    if (typeof body.accept !== 'boolean') return NextResponse.json({ error: 'accept (true/false) kerak' }, { status: 400 });
    await connectToDatabase();

    // Atomik: taklif mavjud bo'lsagina o'tkaziladi (parallel/takroriy so'rov xavfsiz).
    const update = body.accept
      ? { $pull: { invitedIds: userId }, $addToSet: { studentIds: userId } }
      : { $pull: { invitedIds: userId } };
    const res = await Classroom.updateOne({ _id: params.id, invitedIds: userId }, update);
    if (!res.matchedCount) return NextResponse.json({ error: 'Taklif topilmadi' }, { status: 404 });

    return NextResponse.json({ ok: true, accepted: body.accept });
  } catch (err) {
    return serverError(err, 'classroom-invites/[id] POST');
  }
}
