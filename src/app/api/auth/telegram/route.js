import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models';
import { serverError } from '@/lib/apiError';
import { setAuthCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/chatAuth';
import { clientIp } from '@/lib/clientIp';
import { verifyTelegramLogin, telegramPhone } from '@/lib/telegramLogin';
import { starterCategories, notifyAdminNewUser } from '@/lib/newUser';
import { grantWelcomeTrial } from '@/lib/welcomeTrial';
import { applyReferral } from '@/lib/referralServer';
import { readRefCookie, clearRefCookie } from '@/lib/refCookie';

// Sign up / log in with the Telegram Login Widget (TZ 2.0 §6.10.1).
// The widget calls our page's JS callback with signed user data; the page POSTs it here as JSON.
// POST + JSON only: a cross-site form can't send application/json without a CORS preflight, so another
// site can't log a visitor into the attacker's account (login CSRF).
//
// Account match: the Telegram id is the bot chat id of a private chat, which is what phone sign-up stores
// in `telegramChatId` after the bot verified the phone. So a verified Telegram account owns that account
// already (password reset goes through the same bot). No match → a new account with a `tg:<id>` placeholder
// phone and an unusable random password.
export async function POST(req) {
  try {
    if (!(req.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
      return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 415 });
    }
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server sozlanmagan (JWT_SECRET yo'q)" }, { status: 500 });
    }
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Telegram orqali kirish hozircha sozlanmagan" }, { status: 503 });
    }
    await connectToDatabase();
    if (!(await checkRateLimit(clientIp(req), 'tg-login-ip', 20))) {
      return NextResponse.json({ error: "Juda ko'p urinish. Biroz kuting." }, { status: 429 });
    }
    const body = await req.json().catch(() => null);
    const v = verifyTelegramLogin(body, process.env.TELEGRAM_BOT_TOKEN);
    if (!v.ok) {
      const error = v.reason === 'expired' ? "Telegram tasdig'i eskirgan. Qaytadan bosing." : "Telegram ma'lumotlari tasdiqlanmadi";
      return NextResponse.json({ error }, { status: 401 });
    }
    const tg = v.user;

    // Several phone accounts can share one Telegram — take the most recently used one.
    let user = await User.findOne({ telegramChatId: tg.id }).sort({ lastActiveAt: -1, _id: -1 }).select('_id name phone');
    let isNew = false;
    if (!user) {
      const name = [tg.firstName, tg.lastName].filter(Boolean).join(' ').slice(0, 80);
      try {
        user = await User.create({
          phone: telegramPhone(tg.id),
          name,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
          telegramChatId: tg.id,
          // The widget asks for permission to message the user (request-access=write) — reminders can go to Telegram.
          vocabReminders: { telegram: true },
          categories: starterCategories(),
          chatHistory: [],
        });
        isNew = true;
      } catch (err) {
        // Double click / parallel request: the other one created it.
        if (err?.code !== 11000) throw err;
        user = await User.findOne({ phone: telegramPhone(tg.id) }).select('_id name phone');
        if (!user) throw err;
      }
      if (isNew) {
        await grantWelcomeTrial(user);
        await applyReferral(user, readRefCookie(req));
        await notifyAdminNewUser(user, { via: 'telegram', username: tg.username });
      }
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return clearRefCookie(setAuthCookie(NextResponse.json({ ok: true, isNew, name: user.name }), token));
  } catch (err) {
    return serverError(err, 'auth/telegram');
  }
}
