import { connectToDatabase } from '@/lib/db';
import { requireTeacherUser } from '@/lib/chatAuth';
import { getOwnedClassroom, TeacherClassroomError } from '@/lib/teacher/classroomServer';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Studentni sinfdan olib tashlash — User hujjatining o'ziga TEGMAYDI, faqat
// shu classroom'ning `studentIds`idan chiqaradi.
export async function DELETE(req, { params }) {
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

    classroom.studentIds = (classroom.studentIds || []).filter((sid) => String(sid) !== String(params.studentId));
    await classroom.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, 'teacher/classrooms/[id]/students/[studentId] DELETE');
  }
}
