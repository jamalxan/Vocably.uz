import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// EDU-01a (VOCABLY_TZ_FINAL...2026-09-20.md §11 "Onboarding") — profil sahifasidagi
// IELTS tayyorgarlik maydonlari uchun. Ilgari profil sahifasida hech qanday
// tahrirlash routei yo'q edi (faqat mavzu/chiqish) — shu ikkitasi (GET/PATCH)
// shu 5 maydon uchun ATAYLAB yengil, alohida route: mavjud `/api/words`
// (kategoriyalar) yoki `/api/categories` bilan aloqasi yo'q.
const EDITABLE_FIELDS = ['targetBand', 'examType', 'examDate', 'currentLevel', 'dailyStudyMinutes'];

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const user = await User.findById(userId)
      .select(`${EDITABLE_FIELDS.join(' ')} subscriptionTier`)
      .lean();
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    return NextResponse.json({
      targetBand: user.targetBand ?? null,
      examType: user.examType ?? null,
      examDate: user.examDate ? new Date(user.examDate).toISOString() : null,
      currentLevel: user.currentLevel ?? null,
      dailyStudyMinutes: user.dailyStudyMinutes ?? null,
      // BILL-01/02 — o'qish uchun (/narxlar joriy tarifni ko'rsatadi); bu route
      // faqat EDITABLE_FIELDS'ni PATCH qiladi, shuning uchun bu maydon orqali
      // o'zgartirib bo'lmaydi (faqat admin, UsersTable orqali).
      subscriptionTier: user.subscriptionTier || 'free',
    });
  } catch (err) {
    return serverError(err, 'profile');
  }
}

export async function PATCH(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });

    await connectToDatabase();

    const body = await req.json();
    const update = {};

    // Har maydon alohida, aniq validatsiya bilan — noto'g'ri qiymat butun
    // so'rovni rad etmaydi, shunchaki e'tiborsiz qoldiriladi (foydalanuvchi
    // shakli qisman to'ldirilgan bo'lishi mumkin).
    if ('targetBand' in body) {
      if (body.targetBand === null) {
        update.targetBand = null;
      } else {
        const v = Number(body.targetBand);
        // IELTS band 5.0-9.0, 0.5 qadam bilan — v*2 butun son bo'lishi kerak.
        if (Number.isFinite(v) && v >= 5 && v <= 9 && Number.isInteger(v * 2)) {
          update.targetBand = v;
        }
      }
    }
    if ('examType' in body) {
      if (body.examType === null || ['academic', 'general'].includes(body.examType)) {
        update.examType = body.examType;
      }
    }
    if ('examDate' in body) {
      if (body.examDate === null) {
        update.examDate = null;
      } else {
        const d = new Date(body.examDate);
        if (!Number.isNaN(d.getTime())) update.examDate = d;
      }
    }
    if ('currentLevel' in body) {
      if (body.currentLevel === null || ['beginner', 'intermediate', 'advanced'].includes(body.currentLevel)) {
        update.currentLevel = body.currentLevel;
      }
    }
    if ('dailyStudyMinutes' in body) {
      if (body.dailyStudyMinutes === null) {
        update.dailyStudyMinutes = null;
      } else {
        const v = Number(body.dailyStudyMinutes);
        if (Number.isFinite(v) && v >= 0 && v <= 1440) update.dailyStudyMinutes = Math.round(v);
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Yangilanadigan maydon topilmadi" }, { status: 400 });
    }

    await User.updateOne({ _id: userId }, { $set: update });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err, 'profile');
  }
}
