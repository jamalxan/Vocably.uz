import { connectToDatabase } from '@/lib/db';
import { requireAdminUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { AgentThread, AgentAttachment } from '@/lib/models';
import { NextResponse } from 'next/server';

// Bitta suhbatni to'liq ochish (xabarlar + ularga biriktirilgan fayllar
// metadatasi) va o'chirish.
export async function GET(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const thread = await AgentThread.findOne({ _id: params.id, adminId: admin._id }).lean();
    if (!thread) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    const ids = (thread.messages || []).flatMap((m) => m.attachmentIds || []);
    const attachments = ids.length
      ? await AgentAttachment.find({ _id: { $in: ids } }).select('kind filename bytes pageCount audioFileId imageFileId').lean()
      : [];
    const byId = new Map(attachments.map((a) => [String(a._id), { ...a, id: String(a._id), _id: undefined }]));

    return NextResponse.json({
      thread: {
        id: String(thread._id),
        title: thread.title,
        updatedAt: thread.updatedAt,
        messages: (thread.messages || []).map((m) => ({
          id: String(m._id),
          role: m.role,
          content: m.content,
          data: m.data || null,
          attachments: (m.attachmentIds || []).map((x) => byId.get(String(x))).filter(Boolean),
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (err) {
    return serverError(err, 'admin/agent:thread');
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();
    const deleted = await AgentThread.findOneAndDelete({ _id: params.id, adminId: admin._id });
    if (!deleted) return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });

    // Biriktirilgan fayl METADATASI ham o'chadi. GridFS'dagi audio/rasm
    // ATAYLAB QOLADI: ular allaqachon testlarga biriktirilgan bo'lishi
    // mumkin — suhbatni o'chirish o'quvchiga ko'rinadigan kontentni
    // buzmasligi kerak.
    await AgentAttachment.deleteMany({ threadId: deleted._id, adminId: admin._id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, 'admin/agent:thread-delete');
  }
}
