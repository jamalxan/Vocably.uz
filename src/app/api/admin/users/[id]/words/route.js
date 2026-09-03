import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { formatPhoneDisplay } from '@/lib/phone';
import { NextResponse } from 'next/server';

// Admin uchun: berilgan foydalanuvchi so'z-sinonim ro'yxatiga (categories) faqat
// o'qish uchun ruxsat — do'stlar/xabarlar nazoratidagi kabi, lekin lug'at tarafi
// (docs/ so'rovi: "userlar kimni nima deb saqlab qo'yganini admin panelda ko'rish").
export async function GET(req, { params }) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const target = await User.findById(params.id)
      .select('phone name categories')
      .lean();
    if (!target) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    return NextResponse.json({
      user: {
        id: target._id,
        name: target.name,
        phoneDisplay: formatPhoneDisplay(target.phone),
      },
      categories: target.categories || [],
    });
  } catch (err) {
    return serverError(err, 'admin/users/[id]/words GET');
  }
}
