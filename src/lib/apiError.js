import { NextResponse } from 'next/server';
import './safeRequest'; // Request.json() tozalagichi (NoSQL operator inyeksiyasi)

// Kutilmagan xatoliklarni mijozga UMUMIY matn bilan qaytaradi.
// Ilgari `err.message` to'g'ridan-to'g'ri qaytarilardi va bu ichki tafsilotlarni
// (MongoDB host nomi, topologiya, stack ma'lumotlari) tashqariga chiqarardi.
// Haqiqiy xato faqat server loglariga yoziladi.
export function serverError(err, context = '') {
  // Next'ning ichki signali (qurish vaqtida "bu yo'l dinamik — request.headers ishlatadi"): yutib yuborilmasin, aks holda
  // `next build` har bir GET yo'li uchun soxta "[API xatoligi]" yozadi. Qayta otilsa Next yo'lni dinamik deb to'g'ri belgilaydi.
  if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
  // Yaroqsiz identifikator (masalan /api/.../abc — ObjectId emas) Mongoose'da CastError beradi: bu mijoz xatosi (400), server
  // xatosi emas — 500 qaytarib, log/monitoringni ortiqcha "xato" bilan to'ldirmaymiz.
  if (err?.name === 'CastError') {
    return NextResponse.json({ error: "Noto'g'ri identifikator" }, { status: 400 });
  }
  // Yaroqsiz JSON tana (`await req.json()` SyntaxError) — mijoz xatosi.
  if (err instanceof SyntaxError && /JSON/i.test(String(err.message))) {
    return NextResponse.json({ error: "So'rov tanasi noto'g'ri (JSON)" }, { status: 400 });
  }
  console.error(`[API xatoligi]${context ? ` ${context}` : ''}`, err);
  return NextResponse.json({ error: 'Server xatoligi. Keyinroq qayta urinib ko\'ring.' }, { status: 500 });
}
