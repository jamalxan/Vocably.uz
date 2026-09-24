import { connectToDatabase } from '@/lib/db';
import { requireChatUser } from '@/lib/chatAuth';
import { serverError } from '@/lib/apiError';
import { Conversation } from '@/lib/models';
import { presignDownload } from '@/lib/s3';
import { NextResponse } from 'next/server';

// Kalit har doim "conversations/{conversationId}/..." shaklida (src/lib/s3.js
// buildObjectKey) — shu tufayli a'zolikni URL'ning o'zidan tekshirish mumkin,
// alohida Message so'rovi shart emas. Faqat shu suhbat ishtirokchisi signed
// GET URL ola oladi; boshqa hamma uchun 403.
export async function GET(req, { params }) {
  try {
    const { error, status, user } = await requireChatUser(req);
    if (error) return NextResponse.json({ error }, { status });

    await connectToDatabase();

    const key = (params.key || []).join('/');
    const match = key.match(/^conversations\/([a-f0-9]{24})\//);
    if (!match) return NextResponse.json({ error: "Noto'g'ri manzil" }, { status: 400 });

    const convo = await Conversation.findById(match[1]);
    if (!convo || !convo.participantIds.some((id) => String(id) === String(user._id))) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    // VOCABLY-TZ.md (chat audit) — ILGARI bu yerda `NextResponse.redirect(url)`
    // qaytarilardi va klient (useAuthedMediaUrl) `fetch()...blob()` bilan BUTUN
    // faylni xotiraga tortib, keyin `URL.createObjectURL` bilan ko'rsatardi.
    // Bu ikkita muammo keltirib chiqargan edi: (1) video/rasm HECH NARSA
    // ko'rsatmasdan, to'liq fayl yuklab bo'lgunga qadar kutardi (progressiv
    // ko'rsatish yo'q, o'lchamli video/rasmlarda sezilarli sekinlik); (2)
    // `<video>` HTTP Range so'rovlaridan (forward/backward "scrub" qilish
    // uchun zarur) butunlay mahrum bo'lardi, chunki butun fayl allaqachon
    // bitta bloknoyob "blob" sifatida xotirada edi. Endi presigned URL'ning
    // O'ZI JSON sifatida qaytariladi — `<video src>=shu URL` to'g'ridan-to'g'ri
    // MinIO/S3'dan progressiv oqim va Range so'rovlari bilan yuklaydi (auth
    // headersiz, chunki presigned URL o'zida vaqtinchalik imzoni olib yuradi).
    // "conversations/{id}/{type}/{uuid}.{ext}" — faqat 'file' turi majburiy
    // yuklab olinadi (Content-Disposition: attachment); rasm/video/ovoz
    // brauzerda to'g'ridan-to'g'ri ko'rsatiladi/ijro etiladi.
    const mediaType = key.split('/')[2];
    const url = await presignDownload(key, mediaType === 'file');
    // C-14 — bu JSON javobning o'zi uchun (S3/MinIO'dan to'g'ridan-to'g'ri
    // ko'rsatiladigan media baytlariga EMAS — brauzer bu URL'dan mustaqil,
    // to'g'ridan-to'g'ri o'qiydi, ustidan Next.js o'tmaydi, shuning uchun bu header
    // o'sha javobga ta'sir qilolmaydi; AWS S3 presigned GET faqat Content-Type/
    // Content-Disposition kabi bir nechta "response-*" override'ini qo'llab-quvvatlaydi,
    // ixtiyoriy header'larni emas — haqiqiy nosniff himoyasi uchun bucket/CDN darajasida
    // sozlash kerak). Shunga qaramay, o'zimiz nazorat qiladigan javoblarda "himoya
    // qatlami" sifatida qoldiriladi.
    return NextResponse.json({ url }, { headers: { 'X-Content-Type-Options': 'nosniff' } });
  } catch (err) {
    return serverError(err, 'chat/media');
  }
}
