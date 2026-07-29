import { NextResponse } from 'next/server';

// Kutilmagan xatoliklarni mijozga UMUMIY matn bilan qaytaradi.
// Ilgari `err.message` to'g'ridan-to'g'ri qaytarilardi va bu ichki tafsilotlarni
// (MongoDB host nomi, topologiya, stack ma'lumotlari) tashqariga chiqarardi.
// Haqiqiy xato faqat server loglariga yoziladi.
export function serverError(err, context = '') {
  console.error(`[API xatoligi]${context ? ` ${context}` : ''}`, err);
  return NextResponse.json({ error: 'Server xatoligi. Keyinroq qayta urinib ko\'ring.' }, { status: 500 });
}
