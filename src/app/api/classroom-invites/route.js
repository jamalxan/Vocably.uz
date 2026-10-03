import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { Classroom, User } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// O'quvchi o'ziga yuborilgan sinf takliflarini ko'radi (qabul/rad — [id] route).
export async function GET(req) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Kirish talab qilinadi' }, { status: 401 });
    await connectToDatabase();

    const classrooms = await Classroom.find({ invitedIds: userId }).select('name teacherId').lean();
    const teachers = classrooms.length
      ? await User.find({ _id: { $in: classrooms.map((c) => c.teacherId) } }).select('username name').lean()
      : [];
    const byId = new Map(teachers.map((t) => [String(t._id), t]));

    return NextResponse.json({
      invites: classrooms.map((c) => {
        const t = byId.get(String(c.teacherId));
        return { id: String(c._id), name: c.name, teacher: t ? t.name || t.username : '' };
      }),
    });
  } catch (err) {
    return serverError(err, 'classroom-invites GET');
  }
}
