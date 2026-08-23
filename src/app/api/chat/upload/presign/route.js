import { connectToDatabase } from '@/lib/db';
import { requireChatUser, checkRateLimit } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { validateUpload, buildObjectKey, presignUpload } from '@/lib/s3';
import { NextResponse } from 'next/server';

// Klient to'g'ridan-to'g'ri MinIO/S3'ga yuklaydi (Vercel serverless funksiyaning
// so'rov hajmi chegarasidan qochish uchun) — bu route faqat a'zolikni tekshirib,
// qisqa muddatli (5 daq) presigned PUT URL beradi.
export async function POST(req) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    if (!(await checkRateLimit(user._id, 'chat-upload', 20))) {
      return NextResponse.json({ error: "Juda ko'p yuklash urinishi. Biroz kuting." }, { status: 429 });
    }

    const { conversationId, type, mimeType, size } = await req.json();
    if (!conversationId || !type || !mimeType || !size) {
      return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participantIds.some((id) => String(id) === String(user._id))) {
      return NextResponse.json({ error: 'Suhbat topilmadi' }, { status: 404 });
    }

    const validationError = validateUpload(type, mimeType, size);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const key = buildObjectKey(convo._id, type, mimeType);
    const uploadUrl = await presignUpload(key, mimeType);

    return NextResponse.json({ key, uploadUrl });
  } catch (err) {
    return serverError(err, 'chat/upload/presign');
  }
}
