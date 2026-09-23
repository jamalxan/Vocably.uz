import { connectToDatabase } from '@/lib/db';
import { requireTeacherUser } from '@/lib/chatAuth';
import { getOwnedClassroom, TeacherClassroomError } from '@/lib/teacher/classroomServer';
import { User } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Sinfning o'zi (nomi + to'liq student ro'yxati, username bilan) — bu
// endpoint TZ'da alohida talab qilinmagan, lekin classroom detail sahifasi
// (/teacher/classrooms/[id]) uchun ZARUR: hali BIRORTA assignment
// yaratilmagan bo'lsa ham, o'quvchilar ro'yxati/boshqaruvi ko'rinishi kerak
// (GET .../assignments faqat assignment mavjud bo'lganda student ro'yxatini
// qaytaradi).
export async function GET(req, { params }) {
  try {
    const { error, status, user: teacher } = await requireTeacherUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    let classroom;
    try {
      classroom = await getOwnedClassroom(params.id, teacher._id);
    } catch (err) {
      if (err instanceof TeacherClassroomError) return NextResponse.json({ error: err.message }, { status: err.status });
      throw err;
    }

    const students = classroom.studentIds?.length
      ? await User.find({ _id: { $in: classroom.studentIds } }).select('username name').lean()
      : [];

    return NextResponse.json({
      classroom: {
        id: String(classroom._id),
        name: classroom.name,
        students: students.map((s) => ({ id: String(s._id), username: s.username, name: s.name || '' })),
      },
    });
  } catch (err) {
    return serverError(err, 'teacher/classrooms/[id] GET');
  }
}
