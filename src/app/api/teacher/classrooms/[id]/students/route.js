import { connectToDatabase } from '@/lib/db';
import { requireTeacherUser } from '@/lib/chatAuth';
import { getOwnedClassroom, TeacherClassroomError } from '@/lib/teacher/classroomServer';
import { User } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// TCH-01/02 — student username orqali TAKLIF qilinadi (o'zi Vocably'da allaqachon
// ro'yxatdan o'tgan bo'lishi kerak — teacher yangi hisob YARATMAYDI). O'quvchi
// roziligisiz sinfga qo'shilmaydi: qabul qilish — /api/classroom-invites/[id].
export async function POST(req, props) {
  const params = await props.params;
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

    const body = await req.json().catch(() => ({}));
    const username = (body.username || '').trim().toLowerCase();
    if (!username) return NextResponse.json({ error: 'Username kerak' }, { status: 400 });

    const student = await User.findOne({ username }).select('_id username name').lean();
    if (!student) return NextResponse.json({ error: 'Bunday username topilmadi' }, { status: 404 });

    const has = (list) => (list || []).some((id) => String(id) === String(student._id));
    let result = 'invited';
    if (has(classroom.studentIds)) {
      result = 'member';
    } else if (!has(classroom.invitedIds)) {
      classroom.invitedIds.push(student._id);
      await classroom.save();
    }

    return NextResponse.json({
      status: result,
      student: { id: String(student._id), username: student.username, name: student.name || '' },
    });
  } catch (err) {
    return serverError(err, 'teacher/classrooms/[id]/students POST');
  }
}
