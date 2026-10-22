import { connectToDatabase } from '@/lib/db';
import { requireAdminUser, writeAuditLog } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Announcement } from '@/lib/models';
import { broadcastAnnouncement, normalizeButtons } from '@/lib/broadcast';
import { saveAnnouncementMedia, mediaKindFor, MEDIA_MAX_BYTES } from '@/lib/announcementMedia';
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

// Yangi e'lon/reklama: BARCHA foydalanuvchiga ilova ichida (Notification) +
// push, Telegram'ga ulanganlarga esa botdan ham (ixtiyoriy). Media (rasm,
// video, audio, fayl — 4 MB gacha) multipart orqali keladi; kattaroq fayl va
// ovozli/video xabarlar bot orqali yuboriladi (webhook'da). Yuborish mantiqi
// src/lib/broadcast.js'da — bot bilan bir xil.
export async function POST(req) {
  try {
    const { error, status, user: admin } = await requireAdminUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const isMultipart = (req.headers.get('content-type') || '').includes('multipart/form-data');
    const form = isMultipart ? await req.formData() : null;
    const json = isMultipart ? null : await req.json().catch(() => ({}));
    const get = (k) => (form ? form.get(k) : json?.[k]);

    const title = String(get('title') || '').trim();
    const body = String(get('body') || '').trim();
    if (!title) return NextResponse.json({ error: "Sarlavha bo'sh bo'lmasin" }, { status: 400 });

    let buttons = get('buttons');
    if (typeof buttons === 'string') {
      try {
        buttons = JSON.parse(buttons);
      } catch {
        buttons = [];
      }
    }
    buttons = normalizeButtons(buttons);
    const telegram = String(get('telegram') ?? 'true') !== 'false';

    let media = null;
    const file = form?.get('media');
    if (file && typeof file !== 'string') {
      if (file.size > MEDIA_MAX_BYTES) return NextResponse.json({ error: "Fayl 4 MB dan katta — kattaroq media uchun bot orqali yuboring" }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const kind = mediaKindFor(file.type);
      const fileId = await saveAnnouncementMedia(buffer, file.name || `media-${Date.now()}`, file.type || 'application/octet-stream');
      media = { kind, fileId, mime: file.type || null, fileName: file.name || null, upload: { buffer, filename: file.name || 'file', contentType: file.type } };
    }

    const result = await broadcastAnnouncement({ adminId: admin._id, title, body, media, buttons, source: 'web', telegram });

    await writeAuditLog(req, admin._id, 'announcement.create', 'Announcement', result.announcement._id, {
      title,
      recipientCount: result.recipientCount,
      telegramCount: result.telegramCount,
      media: media?.kind || null,
      buttons: buttons.length,
    });

    return NextResponse.json({ success: true, announcement: result.announcement, telegramCount: result.telegramCount, telegramLinked: result.telegramLinked });
  } catch (err) {
    return serverError(err, 'admin/announcements POST');
  }
}
