// API route'lar orasida takrorlanadigan DB-bog'liq mantiq — exam.py'dagi
// `_get_session`/`_finalize` ekvivalenti. Sof hisoblash lib/exam/engine.ts'da,
// bu yerda faqat Mongoose bilan gaplashish bor.
import { ExamSession as ExamSessionModel } from '@/lib/models';
import { applyExpiry, shouldAutosubmit, scoreExam, publicState, ExamDoc } from './engine';

// models.js oddiy JavaScript (mongoose.model() natijasi Mongoose'ning generic
// bo'lmagan Model turi sifatida chiqadi) — .ts fayldan chaqirilganda ba'zi
// static metodlarning overload'lari mos kelmay qoladi (TS2349). Loyihaning
// qolgan qismi ham (masalan chat/route'lardagi User.findById) shu modellarni
// tur tekshiruvsiz ishlatadi — bu yerda ham xuddi shunday, aniq belgilangan.
const ExamSession: any = ExamSessionModel;

export class ExamError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Sessiyani egasi (userId) bo'yicha tekshirib qaytaradi — Everest-Mock'ning o'zida
 * bunday tekshiruv yo'q edi (client user_id'ga ishonardi), bu yerda MAJBURIY. */
export async function getOwnedSession(sessionId: string, userId: string) {
  const doc = await ExamSession.findOne({ _id: sessionId, userId });
  if (!doc) throw new ExamError('Sessiya topilmadi', 404);
  return doc;
}

/** Vaqti o'tgan bo'limlarni qulflaydi (o'zgargan bo'lsa saqlaydi) va kerak bo'lsa
 * avtomatik submit qiladi — /state, /start (davom ettirishda), /section/start
 * har chaqirilganda shu bitta funksiya orqali "tekshirib turadi" (exam.py'dagi
 * naqsh: har endpoint holatni o'qishdan oldin shu ikkalasini bajaradi). */
export async function syncExpiry(doc: any) {
  const asDoc = doc.toObject ? doc.toObject() : doc;
  if (applyExpiry(asDoc as ExamDoc)) {
    doc.sections = asDoc.sections;
    await doc.save();
  }
  if (shouldAutosubmit(asDoc as ExamDoc)) {
    await finalize(String(doc._id), String(doc.userId), 'auto_expired');
    return ExamSession.findById(doc._id);
  }
  return doc;
}

/** Idempotent submit+baholash — exam.py'dagi atomik `find_one_and_update`
 * (status:'in_progress' -> 'submitted') so'zma-so'z takrorlangan: ikki marta
 * chaqirilsa (parallel tab, tarmoq qayta urinishi) ikkinchisi hech narsa
 * qilmaydi, saqlangan natijani qaytaradi. */
export async function finalize(sessionId: string, userId: string, reason: string) {
  const pre = await ExamSession.findOneAndUpdate(
    { _id: sessionId, userId, status: 'in_progress' },
    { $set: { status: 'submitted' } },
    { new: false }
  );

  if (!pre) {
    // Allaqachon boshqa so'rov tomonidan submit qilingan — saqlangan natijani qaytaramiz.
    const existing = await ExamSession.findOne({ _id: sessionId, userId });
    return existing?.result ?? null;
  }

  const docObj = pre.toObject();
  const result = scoreExam(docObj as ExamDoc);
  await ExamSession.updateOne(
    { _id: sessionId },
    { $set: { result, submittedAt: new Date(), submitReason: reason } }
  );
  return result;
}

export { publicState };
