// One-off script: send a short Telegram message to every user who has linked their
// Telegram account. Not an app feature/API route — run manually:
//
//   node --env-file=.env.local scripts/broadcast-telegram.mjs --dry-run   # preview only
//   node --env-file=.env.local scripts/broadcast-telegram.mjs             # actually sends
//
// Point --env-file at whichever file has the REAL MONGODB_URI and TELEGRAM_BOT_TOKEN
// (production values live in Vercel's dashboard, not in this repo's committed .env,
// which only has placeholder/dev values). Requires Node 20.6+.
//
// Self-contained on purpose (talks to the `users` collection directly instead of
// importing src/lib/*) — the app's own source files use extensionless relative imports
// that only Next.js's bundler resolves, not plain `node`.

import { MongoClient } from 'mongodb';

const DRY_RUN = process.argv.includes('--dry-run');

const MESSAGE = `🎉 <b>Vocably yangilandi!</b>

Interfeysda bir nechta muhim tuzatish qildik: mobilda kattalashtirish (zoom) endi ishlaydi, kategoriya o'chirish xavfsizroq bo'ldi, va takrorlash progressini ko'rish osonlashdi.

Sinab ko'ring! 🚀`;

async function sendTelegramMessage(botToken, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram API xatoligi');
  return data.result;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!mongoUri) throw new Error('MONGODB_URI sozlanmagan.');
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan.');

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();

  const recipients = await db
    .collection('users')
    .find({ telegramChatId: { $ne: null } })
    .project({ telegramChatId: 1 })
    .toArray();

  console.log(`Topildi: ${recipients.length} ta foydalanuvchi (telegramChatId bor).`);

  if (DRY_RUN) {
    console.log('--dry-run: xabar yuborilmadi.');
    await client.close();
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const user of recipients) {
    try {
      await sendTelegramMessage(botToken, user.telegramChatId, MESSAGE);
      sent++;
    } catch (err) {
      failed++;
      console.error(`Xatolik (user ${user._id}, chatId ${user.telegramChatId}): ${err.message}`);
    }
    // Telegram rate limit: ~30 msg/s across all chats. 50ms delay keeps us well under that.
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`Yuborildi: ${sent}, xato: ${failed}, jami: ${recipients.length}`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
