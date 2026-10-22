import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { Announcement } from '@/lib/models';
import { readAnnouncementMedia } from '@/lib/announcementMedia';
import { getFileUrl } from '@/lib/telegram';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// The announcement's media file: from GridFS (admin-panel upload) or proxied
// from Telegram (bot upload — Telegram file URLs embed the bot token, so they
// are never handed to the browser). Signed-in users only.
export async function GET(req, props) {
  const params = await props.params;
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    await connectToDatabase();
    const a = await Announcement.findById(params.id).select('media').lean();
    const media = a?.media;
    if (!media?.kind) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });

    const headers = { 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff' };
    if (media.fileId) {
      const file = await readAnnouncementMedia(media.fileId);
      if (!file) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
      return new Response(file.buffer, { headers: { ...headers, 'Content-Type': file.contentType } });
    }
    if (media.telegramFileId) {
      const url = await getFileUrl(media.telegramFileId);
      const upstream = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!upstream.ok) return NextResponse.json({ error: 'Media yuklanmadi' }, { status: 502 });
      const type = media.mime || upstream.headers.get('content-type') || 'application/octet-stream';
      return new Response(upstream.body, { headers: { ...headers, 'Content-Type': type } });
    }
    return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  } catch (err) {
    return serverError(err, 'announcements/[id]/media');
  }
}
