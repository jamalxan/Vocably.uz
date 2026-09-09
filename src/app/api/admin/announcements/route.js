import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { User, Announcement, Notification } from '@/lib/models';
import { sendPushToUser } from '@/lib/webPush';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const before = req.nextUrl.searchParams.get('before');
    const query = before ? { createdAt: { $lt: new Date(before) } } : {};
    const announcements = await Announcement.find(query).sort({ createdAt: -1 }).limit(51).lean();
    const hasMore = announcements.length > 50;
    const page = hasMore ? announcements.slice(0, 50) : announcements;

    return NextResponse.json({
      announcements: page,
      nextCursor: hasMore ? page[page.length - 1].createdAt : null,
    });
  } catch (err) {
    return serverError(err, 'admin/announcements GET');
  }
}

// Yangi e'lon yaratadi va DARHOL har bir foydalanuvchiga bitta Notification hujjati
// "fan-out" qiladi + push (mavjud bo'lsa). Joriy foydalanuvchi hajmida (o'nlab/yuzlab)
// bu oddiy sinxron sikl yetarli — minglab foydalanuvchida navbat (queue) kerak bo'lardi.
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const { title, body } = await req.json();
    const cleanTitle = (title || '').trim();
    const cleanBody = (body || '').trim();
    if (!cleanTitle) return NextResponse.json({ error: "Sarlavha bo'sh bo'lmasin" }, { status: 400 });

    const userIds = await User.find({}).select('_id').lean();

    const announcement = await Announcement.create({
      title: cleanTitle,
      body: cleanBody,
      authorId: admin._id,
      recipientCount: userIds.length,
    });

    if (userIds.length > 0) {
      await Notification.insertMany(
        userIds.map((u) => ({
          userId: u._id,
          type: 'announcement',
          title: cleanTitle,
          body: cleanBody,
          link: `/announcements/${announcement._id}`,
        }))
      );
    }

    // Push — parallel, lekin bittasi muvaffaqiyatsiz bo'lsa boshqalarini bloklamaydi
    // (sendPushToUser o'zi ichida xatolarni yutadi).
    await Promise.all(userIds.map((u) => sendPushToUser(u._id, { title: cleanTitle, body: cleanBody, url: '/app' })));

    await writeAuditLog(req, admin._id, 'announcement.create', 'Announcement', announcement._id, {
      title: cleanTitle,
      recipientCount: userIds.length,
    });

    return NextResponse.json({ success: true, announcement });
  } catch (err) {
    return serverError(err, 'admin/announcements POST');
  }
}
