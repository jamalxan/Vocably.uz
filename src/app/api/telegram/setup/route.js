import { setWebhook } from '@/lib/telegram';
import { safeEqual } from '@/lib/safeEqual';
import { serverError } from '@/lib/apiError';
import { NextResponse } from 'next/server';

// Bir martalik sozlash: Telegram'ga "har bir yangilanishni shu manzilga yubor" deb aytadi.
// Sir URL'da emas (loglarga tushmasligi uchun), `x-setup-secret` sarlavhasida yuboriladi:
//   curl -X POST -H "x-setup-secret: ADMIN_SETUP_SECRET" https://DOMEN/api/telegram/setup
export async function POST(req) {
  try {
    const secret = req.headers.get('x-setup-secret');
    if (!process.env.ADMIN_SETUP_SECRET || !safeEqual(secret, process.env.ADMIN_SETUP_SECRET)) {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    }
    if (!process.env.APP_URL) {
      return NextResponse.json({ error: 'APP_URL environment variable sozlanmagan' }, { status: 500 });
    }

    const webhookUrl = `${process.env.APP_URL.replace(/\/$/, '')}/api/telegram/webhook`;
    const result = await setWebhook(webhookUrl, process.env.TELEGRAM_WEBHOOK_SECRET);

    return NextResponse.json({ success: true, webhookUrl, result });
  } catch (err) {
    return serverError(err, 'telegram/setup');
  }
}
