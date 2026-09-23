import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User } from '@/lib/models';
import { SUBSCRIPTION_TIERS } from '@/lib/entitlements';
import { NextResponse } from 'next/server';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

// Admin bitta userga: Do'stlar bo'limiga ruxsat berish/olib tashlash, username
// belgilash, chatBanned (vaqtincha to'xtatish), yoki role (admin) o'zgartirish.
// Har bir o'zgarish AdminAuditLog'ga yoziladi (docs/ chat plani §9.1).
export async function PATCH(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const target = await User.findById(params.id);
    if (!target) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const body = await req.json();
    const diff = {};

    if (typeof body.chatAccess === 'boolean') {
      diff.chatAccess = { from: target.chatAccess, to: body.chatAccess };
      target.chatAccess = body.chatAccess;
    }
    if (typeof body.chatBanned === 'boolean') {
      diff.chatBanned = { from: target.chatBanned, to: body.chatBanned };
      target.chatBanned = body.chatBanned;
    }
    // TCH-01 — 'teacher' shu bir xil oqimga qo'shildi (admin/chat/users PATCH),
    // alohida teacher-tayinlash UI/endpoint yaratilmadi.
    if (typeof body.role === 'string' && ['user', 'admin', 'teacher'].includes(body.role)) {
      diff.role = { from: target.role, to: body.role };
      target.role = body.role;
    }
    if (typeof body.username === 'string') {
      const uname = body.username.trim().toLowerCase();
      if (!USERNAME_RE.test(uname)) {
        return NextResponse.json(
          { error: 'Username 3-20 belgi, faqat kichik lotin harflari/raqam/pastki chiziq' },
          { status: 400 }
        );
      }
      const clash = await User.findOne({ username: uname, _id: { $ne: target._id } }).select('_id');
      if (clash) return NextResponse.json({ error: 'Bu username band' }, { status: 409 });
      diff.username = { from: target.username, to: uname };
      target.username = uname;
    }
    // BILL-01/02 — qo'lda tarif tayinlash (checkout yo'q, admin manual grant).
    // subscriptionSetAt/subscriptionSetBy audit uchun — kim/qachon tayinlagani
    // (diff'da ham `role`/`chatAccess` kabi boshqa maydonlar bilan bir xil
    // tarzda AdminAuditLog'ga tushadi).
    if (typeof body.subscriptionTier === 'string' && SUBSCRIPTION_TIERS.includes(body.subscriptionTier)) {
      diff.subscriptionTier = { from: target.subscriptionTier, to: body.subscriptionTier };
      target.subscriptionTier = body.subscriptionTier;
      target.subscriptionSetAt = new Date();
      target.subscriptionSetBy = admin._id;
    }

    await target.save();
    await writeAuditLog(req, admin._id, 'chat.user.update', 'User', target._id, diff);

    return NextResponse.json({
      user: {
        id: target._id,
        phone: target.phone,
        name: target.name,
        username: target.username,
        role: target.role,
        chatAccess: target.chatAccess,
        chatBanned: target.chatBanned,
        subscriptionTier: target.subscriptionTier,
      },
    });
  } catch (err) {
    return serverError(err, 'admin/chat/users/[id] PATCH');
  }
}
