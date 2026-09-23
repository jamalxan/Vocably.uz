import { connectToDatabase } from '@/lib/db';
import { requireTeacherUser } from '@/lib/chatAuth';
import { getOwnedClassroom, TeacherClassroomError } from '@/lib/teacher/classroomServer';
import { Assignment, ExamTest, ExamAttempt, User } from '@/lib/models';
import { deriveAssignmentStatus } from '@/lib/teacher/assignmentStatus';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

const SECTION_KEYS = ['listening', 'reading', 'writing', 'speaking', 'mock'];

// Assignment MAVJUD, NASHR QILINGAN ExamTest'ga ishora qiladi — yangi
// kontent-yaratish bu bosqichda ataylab yo'q (TZ scope: "assignments reuse
// EXISTING published tests").
export async function POST(req, { params }) {
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
    const { testId, sectionKey, dueAt } = body;

    if (!SECTION_KEYS.includes(sectionKey)) {
      return NextResponse.json({ error: "sectionKey noto'g'ri" }, { status: 400 });
    }

    const test = await ExamTest.findOne({ _id: testId, isPublished: true }).select('_id').lean();
    if (!test) return NextResponse.json({ error: 'Nashr qilingan test topilmadi' }, { status: 404 });

    const assignment = await Assignment.create({
      classroomId: classroom._id,
      testId: test._id,
      sectionKey,
      dueAt: dueAt ? new Date(dueAt) : null,
      createdBy: teacher._id,
    });

    return NextResponse.json({
      assignment: {
        id: String(assignment._id),
        testId: String(assignment.testId),
        sectionKey: assignment.sectionKey,
        dueAt: assignment.dueAt,
        createdAt: assignment.createdAt,
      },
    });
  } catch (err) {
    return serverError(err, 'teacher/classrooms/[id]/assignments POST');
  }
}

// TZ §53 "student natijasini ko'rish" — har assignment uchun har student
// bo'yicha oddiy holat (not_started/in_progress/graded[+band]). Chuqur
// analitika ATAYLAB YO'Q (buyurtma scope'i) — faqat shu bitta jadval
// yetarli. Assignment/student ko'paytmasi bitta classroom uchun odatda
// kichik bo'lgani uchun, har assignment uchun alohida ExamAttempt so'rovi
// (N so'rov) soddalik uchun ATAYLAB tanlangan — premature optimizatsiya yo'q.
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

    const assignments = await Assignment.find({ classroomId: classroom._id }).sort({ createdAt: -1 }).lean();

    const testIds = [...new Set(assignments.map((a) => String(a.testId)))];
    const [tests, students] = await Promise.all([
      testIds.length ? ExamTest.find({ _id: { $in: testIds } }).select('title slug').lean() : [],
      classroom.studentIds?.length
        ? User.find({ _id: { $in: classroom.studentIds } }).select('username name').lean()
        : [],
    ]);
    const testsById = new Map(tests.map((t) => [String(t._id), t]));

    const result = [];
    for (const a of assignments) {
      // 'mock' — butun (barcha bo'limli) urinish; boshqa qiymatlar — bitta
      // bo'limgina o'z ichiga olgan urinish (practice/section rejimi).
      const sectionFilter = a.sectionKey === 'mock' ? { mode: 'mock' } : { sections: a.sectionKey };

      const attemptsByStudent = new Map();
      if (students.length) {
        const attempts = await ExamAttempt.find({
          userId: { $in: students.map((s) => s._id) },
          testId: a.testId,
          ...sectionFilter,
        })
          .select('userId status result createdAt')
          .sort({ createdAt: -1 })
          .lean();
        for (const at of attempts) {
          const key = String(at.userId);
          if (!attemptsByStudent.has(key)) attemptsByStudent.set(key, []);
          attemptsByStudent.get(key).push(at);
        }
      }

      result.push({
        id: String(a._id),
        testId: String(a.testId),
        testTitle: testsById.get(String(a.testId))?.title || '',
        sectionKey: a.sectionKey,
        dueAt: a.dueAt,
        createdAt: a.createdAt,
        students: students.map((s) => ({
          id: String(s._id),
          username: s.username,
          name: s.name || '',
          ...deriveAssignmentStatus(attemptsByStudent.get(String(s._id))),
        })),
      });
    }

    return NextResponse.json({ assignments: result });
  } catch (err) {
    return serverError(err, 'teacher/classrooms/[id]/assignments GET');
  }
}
