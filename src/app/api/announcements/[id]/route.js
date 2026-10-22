import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { Announcement } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// One announcement for the in-app page (/app/announcements/[id]). Any signed-in
// user may read it — announcements go to everyone anyway.
export async function GET(req, props) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    await connectToDatabase();
    const a = await Announcement.findById(params.id).lean();
    if (!a) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    const hasMedia = !!(a.media?.kind && (a.media.fileId || a.media.telegramFileId));
    return NextResponse.json({
      announcement: {
        id: String(a._id),
        title: a.title,
        body: a.body,
        createdAt: a.createdAt,
        buttons: (a.buttons || []).map((b) => ({ text: b.text, url: b.url })),
        media: hasMedia ? { kind: a.media.kind, mime: a.media.mime, fileName: a.media.fileName, url: `/api/announcements/${a._id}/media` } : null,
      },
    });
  } catch (err) {
    return serverError(err, 'announcements/[id]');
  }
}
