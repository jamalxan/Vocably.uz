import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { presignDownload } from '@/lib/s3';
import { NextResponse } from 'next/server';

// Oddiy foydalanuvchi endpointidan (src/app/api/chat/media/[...key]) farqli —
// bu yerda ishtirokchilik tekshiruvi YO'Q (admin istalgan suhbatning faylini
// ko'ra olishi kerak, hatto xabar/suhbat foydalanuvchi tomonidan "o'chirilgan"
// bo'lsa ham — haqiqiy S3 obyekt hech qachon o'chirilmaydi, faqat Message
// hujjatidagi bayroqlar). Jiddiy maxfiylik chegarasi bo'lgani uchun har bir
// ko'rish AdminAuditLog'ga yoziladi (ConversationViewer'dagi suhbat ko'rish audit'i bilan bir xil naqsh).
export async function GET(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    const key = (params.key || []).join('/');
    const match = key.match(/^conversations\/([a-f0-9]{24})\//);
    if (!match) return NextResponse.json({ error: "Noto'g'ri manzil" }, { status: 400 });

    await writeAuditLog(req, admin._id, 'chat.media.view', 'Conversation', match[1], { key });

    const url = await presignDownload(key);
    return NextResponse.redirect(url);
  } catch (err) {
    return serverError(err, 'admin/chat/media');
  }
}
