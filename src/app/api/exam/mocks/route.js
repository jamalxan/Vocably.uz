import { MOCK_LIST } from '@/lib/exam/content';
import { NextResponse } from 'next/server';

// FAQAT {id, title} ro'yxati — /app/mock sahifasi test tanlash uchun shu yerdan
// oladi. MUHIM: client komponent lib/exam/content'ni TO'G'RIDAN-TO'G'RI import
// qilmasligi kerak edi — u holda butun MOCKS obyekti (jumladan to'g'ri javoblar!)
// brauzer JS bundle'iga qo'shilib ketardi (2026-09-10'da topilgan va tuzatilgan xato).
export async function GET() {
  return NextResponse.json({ mocks: MOCK_LIST });
}
