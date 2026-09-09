import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOwnedSession, syncExpiry, publicState, ExamError } from '@/lib/exam/server';
import { publicMock } from '@/lib/exam/content';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// exam.py'ning /state'i — client har necha soniyada shu yerdan vakolatli qolgan
// vaqtni o'qiydi (o'zi hech qachon hisoblamaydi). QO'SHIMCHA (asl fayldan farqli):
// `content` ham shu javobda — sahifa yangilanganda (aynan shu funksiyani
// ta'minlash uchun butun bu dvigatel qurilgan) client mock kontentini alohida
// keshlab yurishga muhtoj bo'lmasin deb.
export async function GET(req, { params }) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();
    let doc = await getOwnedSession(params.id, userId);
    doc = await syncExpiry(doc);
    return NextResponse.json({ ...publicState(doc.toObject()), content: publicMock(doc.mockId) });
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: err.status });
    return serverError(err, 'exam/state');
  }
}
