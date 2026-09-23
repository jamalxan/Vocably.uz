import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Report, User, Message } from '@/lib/models';
import { NextResponse } from 'next/server';

// Xabar turi bo'yicha galereya preview'iga mos qisqa yorliq (ConversationViewer'dagi
// TYPE_ICON bilan bir xil g'oya, lekin bu yerda matn kerak — icon emas).
const MEDIA_TYPE_LABEL = { image: '📷 Rasm', video: '🎥 Video', voice: '🎤 Ovozli xabar', file: '📎 Fayl', sticker: '🩶 Stiker' };

function buildMessagePreview(message) {
  if (!message) return "Xabar topilmadi (o'chirilgan bo'lishi mumkin)";
  if (message.type !== 'text') return MEDIA_TYPE_LABEL[message.type] || message.type;
  const text = (message.text || '').trim();
  if (!text) return '(bo\'sh xabar)';
  return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

export async function GET(req) {
  try {
    const { error, status } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const statusFilter = req.nextUrl.searchParams.get('status') || 'open';
    const query = statusFilter === 'all' ? {} : { status: statusFilter };
    const before = req.nextUrl.searchParams.get('before');
    if (before) query.createdAt = { $lt: new Date(before) };
    const limitParam = parseInt(req.nextUrl.searchParams.get('limit'), 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = reports.length > limit;
    const page = hasMore ? reports.slice(0, limit) : reports;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    const reporterIds = [...new Set(page.map((r) => String(r.reporterId)))];

    // N-09: kartochkada `message: <ObjectId>` o'rniga o'qiladigan kontekst —
    // xabar matni/media turi preview'i, yuboruvchi va suhbatga havola uchun
    // xabar va yuboruvchi hujjatlari oldindan olinadi.
    const messageTargetIds = page.filter((r) => r.targetType === 'message').map((r) => r.targetId);
    const userTargetIds = page.filter((r) => r.targetType === 'user').map((r) => r.targetId);

    const [reporters, messages, targetUsers] = await Promise.all([
      User.find({ _id: { $in: reporterIds } }).select('username name').lean(),
      messageTargetIds.length
        ? Message.find({ _id: { $in: messageTargetIds } }).select('conversationId senderId type text').lean()
        : [],
      userTargetIds.length ? User.find({ _id: { $in: userTargetIds } }).select('username name').lean() : [],
    ]);

    const reporterById = new Map(reporters.map((u) => [String(u._id), u]));
    const messageById = new Map(messages.map((m) => [String(m._id), m]));
    const userById = new Map(targetUsers.map((u) => [String(u._id), u]));

    const messageSenderIds = [...new Set(messages.map((m) => String(m.senderId)))];
    const messageSenders = messageSenderIds.length
      ? await User.find({ _id: { $in: messageSenderIds } }).select('username name').lean()
      : [];
    const senderById = new Map(messageSenders.map((u) => [String(u._id), u]));

    const now = Date.now();
    const SLA_MS = 48 * 60 * 60 * 1000;

    return NextResponse.json({
      reports: page.map((r) => {
        const base = {
          ...r,
          reporter: reporterById.get(String(r.reporterId)) || null,
          // SLA badge — yangi schema maydoni qo'shmasdan, mavjud `createdAt`dan hisoblanadi.
          slaBreached: r.status === 'open' && now - new Date(r.createdAt).getTime() > SLA_MS,
        };
        if (r.targetType === 'message') {
          const message = messageById.get(String(r.targetId)) || null;
          return {
            ...base,
            preview: buildMessagePreview(message),
            targetSender: message ? senderById.get(String(message.senderId)) || null : null,
            conversationId: message ? String(message.conversationId) : null,
          };
        }
        if (r.targetType === 'user') {
          return { ...base, targetUser: userById.get(String(r.targetId)) || null };
        }
        return base;
      }),
      nextCursor,
    });
  } catch (err) {
    return serverError(err, 'admin/chat/reports GET');
  }
}
