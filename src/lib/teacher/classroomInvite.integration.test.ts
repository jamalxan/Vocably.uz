// Sinfga taklif/qabul oqimi: o'qituvchi roziligisiz o'quvchi qo'sha olmaydi (haqiqiy MongoDB xotirada).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';

const describeDb = process.env.SKIP_DB_INTEGRATION === '1' ? describe.skip : describe;
let mongod: MongoMemoryServer;
let M: any;
let teacher: any;
let student: any;
let other: any;
let classroomId: string;

const req = (user: any, body?: unknown) => {
  const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET as string, { algorithm: 'HS256', expiresIn: '1d' });
  return {
    headers: new Headers(),
    cookies: { get: (n: string) => (n === 'vocably_session' ? { value: token } : undefined) },
    json: async () => body ?? {},
  } as any;
};
const ctx = (params: Record<string, string>) => ({ params: Promise.resolve(params) });

describeDb('sinfga taklif → qabul (integration)', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-secret';
    M = await import('@/lib/models');
    await mongoose.connect(mongod.getUri());
    teacher = await M.User.create({ phone: '+998900100001', password: 'x', name: 'Ustoz', username: 'ustoz', role: 'teacher' });
    student = await M.User.create({ phone: '+998900100002', password: 'x', name: 'Talaba', username: 'talaba' });
    other = await M.User.create({ phone: '+998900100003', password: 'x', name: 'Boshqa', username: 'boshqa' });
    classroomId = String((await M.Classroom.create({ teacherId: teacher._id, name: 'IELTS 7' }))._id);
  }, 120_000);
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });

  it('o‘qituvchi qo‘shganda o‘quvchi darrov a’zo bo‘lmaydi — faqat taklif', async () => {
    const { POST } = await import('@/app/api/teacher/classrooms/[id]/students/route');
    const res = await POST(req(teacher, { username: 'talaba' }), ctx({ id: classroomId }));
    expect((await res.json()).status).toBe('invited');
    const c = await M.Classroom.findById(classroomId).lean();
    expect(c.studentIds).toHaveLength(0);
    expect(c.invitedIds.map(String)).toEqual([String(student._id)]);

    // takroriy taklif ikkilanmaydi
    await POST(req(teacher, { username: 'talaba' }), ctx({ id: classroomId }));
    expect((await M.Classroom.findById(classroomId).lean()).invitedIds).toHaveLength(1);
  });

  it('o‘quvchi o‘z takliflarini ko‘radi, boshqasi ko‘rmaydi', async () => {
    const { GET } = await import('@/app/api/classroom-invites/route');
    const mine = await (await GET(req(student))).json();
    expect(mine.invites).toEqual([{ id: classroomId, name: 'IELTS 7', teacher: 'Ustoz' }]);
    expect((await (await GET(req(other))).json()).invites).toEqual([]);
  });

  it('taklif qilinmagan foydalanuvchi qabul qila olmaydi (404), a’zo bo‘lmaydi', async () => {
    const { POST } = await import('@/app/api/classroom-invites/[id]/route');
    const res = await POST(req(other, { accept: true }), ctx({ id: classroomId }));
    expect(res.status).toBe(404);
    expect((await M.Classroom.findById(classroomId).lean()).studentIds).toHaveLength(0);
  });

  it('noto‘g‘ri id/qiymat 404/400; qabul qilinsa a’zo bo‘ladi va taklif yo‘qoladi; qayta qabul 404', async () => {
    const { POST } = await import('@/app/api/classroom-invites/[id]/route');
    expect((await POST(req(student, { accept: true }), ctx({ id: 'bad' }))).status).toBe(404);
    expect((await POST(req(student, { accept: 'yes' }), ctx({ id: classroomId }))).status).toBe(400);

    expect((await POST(req(student, { accept: true }), ctx({ id: classroomId }))).status).toBe(200);
    const c = await M.Classroom.findById(classroomId).lean();
    expect(c.studentIds.map(String)).toEqual([String(student._id)]);
    expect(c.invitedIds).toHaveLength(0);
    expect((await POST(req(student, { accept: true }), ctx({ id: classroomId }))).status).toBe(404);
    expect((await M.Classroom.findById(classroomId).lean()).studentIds).toHaveLength(1);
  });

  it('rad etilsa a’zo bo‘lmaydi; o‘qituvchi kutilayotgan taklifni bekor qila oladi', async () => {
    const add = (await import('@/app/api/teacher/classrooms/[id]/students/route')).POST;
    const answer = (await import('@/app/api/classroom-invites/[id]/route')).POST;
    await add(req(teacher, { username: 'boshqa' }), ctx({ id: classroomId }));
    expect((await answer(req(other, { accept: false }), ctx({ id: classroomId }))).status).toBe(200);
    let c = await M.Classroom.findById(classroomId).lean();
    expect(c.studentIds.map(String)).toEqual([String(student._id)]);
    expect(c.invitedIds).toHaveLength(0);

    await add(req(teacher, { username: 'boshqa' }), ctx({ id: classroomId }));
    const del = (await import('@/app/api/teacher/classrooms/[id]/students/[studentId]/route')).DELETE;
    await del(req(teacher), ctx({ id: classroomId, studentId: String(other._id) }));
    c = await M.Classroom.findById(classroomId).lean();
    expect(c.invitedIds).toHaveLength(0);
  });

  it('mavjud a’zoni qayta taklif qilsa status "member" (taklif yaratilmaydi)', async () => {
    const { POST } = await import('@/app/api/teacher/classrooms/[id]/students/route');
    const res = await POST(req(teacher, { username: 'talaba' }), ctx({ id: classroomId }));
    expect((await res.json()).status).toBe('member');
    expect((await M.Classroom.findById(classroomId).lean()).invitedIds).toHaveLength(0);
  });
});
