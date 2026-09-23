import { Classroom as ClassroomModel } from '@/lib/models';

// models.js oddiy JavaScript — .ts fayldan chaqirilganda Mongoose static
// metodlarining generic bo'lmagan turi bilan to'qnashadi (TS2349). Xuddi
// src/lib/exam/attemptServer.ts'dagi bilan bir xil workaround.
const Classroom: any = ClassroomModel;

// TCH-01/02 — src/lib/exam/attemptServer.ts#getOwnedAttempt bilan bir xil
// naqsh: "topilmadi" va "boshqa teacherniki" ikkalasi ham BIR XIL 404 xatosi
// qaytaradi (403 emas) — shu bilan bitta teacher boshqa teacher'ning
// classroom ID'lari mavjudligini/mavjud emasligini bilib olmaydi (resource
// enumeration'ning oldi olinadi).
export class TeacherClassroomError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** `classroomId` HAQIQATAN shu `teacherId`ga tegishli bo'lsagina hujjatni
 * qaytaradi (Mongoose document — chaqiruvchi `.save()` qila oladi), aks
 * holda 404 otadi. Har bir /api/teacher/classrooms/[id]/* route shu bilan
 * boshlanadi. */
export async function getOwnedClassroom(classroomId: string, teacherId: string) {
  const classroom = await Classroom.findOne({ _id: classroomId, teacherId });
  if (!classroom) throw new TeacherClassroomError('Sinf topilmadi', 404);
  return classroom;
}
