import { connectToDatabase } from '@/lib/db';
import { requireTeacherUser } from '@/lib/chatAuth';
import { Classroom } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TCH-01/02 — teacher o'z classroom'ini yaratadi. `teacherId` HAR DOIM
// sessiyadan olinadi (client body'sidan EMAS) — aks holda teacher boshqa
// birov nomidan classroom yaratib qo'yishi mumkin bo'lardi.
export async function POST(req) {
  try {
    const { error, status, user: teacher } = await requireTeacherUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    const name = (body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Sinf nomi kerak' }, { status: 400 });

    const classroom = await Classroom.create({ teacherId: teacher._id, name, studentIds: [] });

    return NextResponse.json({
      classroom: {
        id: String(classroom._id),
        name: classroom.name,
        studentCount: 0,
        createdAt: classroom.createdAt,
      },
    });
  } catch (err) {
    return serverError(err, 'teacher/classrooms POST');
  }
}

// Faqat chaqiruvchi teacherning O'Z classroom'lari — boshqa teacherlarniki
// HECH QACHON emas (filtr `teacherId` bo'yicha, sessiyadan).
export async function GET(req) {
  try {
    const { error, status, user: teacher } = await requireTeacherUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const classrooms = await Classroom.find({ teacherId: teacher._id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      classrooms: classrooms.map((c) => ({
        id: String(c._id),
        name: c.name,
        studentCount: (c.studentIds || []).length,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    return serverError(err, 'teacher/classrooms GET');
  }
}
