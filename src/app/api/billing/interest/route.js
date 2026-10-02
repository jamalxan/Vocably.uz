import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { BillingInterest } from '@/lib/models';
import { checkRateLimit } from '@/lib/chatAuth';
import { clientIp } from '@/lib/clientIp';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// BILL-01/02 — /narxlar sahifasidagi STANDARD/PREMIUM "Bog'lanish" CTA'si shu
// yerga yozadi. Bu CHECKOUT EMAS: hech qanday to'lov maydoni yo'q, faqat "kim
// qaysi tarifga qiziqdi" belgisi — admin keyin qo'lda (Telegram/telefon
// orqali) bog'lanadi va src/components/admin/UsersTable.jsx'dan tarifni
// tayinlaydi. Login talab qilinmaydi (anonim tashrif buyuruvchi ham
// qiziqishini bildirishi mumkin) — bo'lsa userId biriktiriladi, bo'lmasa null.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const tier = body?.tier;
    if (!['standard', 'premium'].includes(tier)) {
      return NextResponse.json({ error: "Noto'g'ri tarif" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = await getUserIdFromRequest(req);
    // Login talab qilinmaydi — anonim spam bazani to'ldirmasin: IP (kirgan bo'lsa foydalanuvchi) bo'yicha limit.
    if (!(await checkRateLimit(userId || `ip:${clientIp(req)}`, 'billing-interest', 5))) {
      return NextResponse.json({ error: "Juda ko'p so'rov. Biroz kuting." }, { status: 429 });
    }

    await BillingInterest.create({ userId: userId || null, tier });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'billing/interest');
  }
}
