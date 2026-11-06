// Do'stlar chatidan tashqi bildirishnomalar (Telegram bot, web push) — messages POST
// va qo'ng'iroq yozuvi (POST /api/internal/call-event) bitta qoidalar to'plamidan
// foydalanadi: shaxsiy tanlov (tgMessageNotifyOn/Off) yoki admin bergan umumiy sozlama,
// mute, admin chat. Xabar/qo'ng'iroq mazmuni hech qachon ko'rsatilmaydi — faqat kim.
import { Conversation, User } from '@/lib/models';
import { sendMessage as sendTelegramMessage } from '@/lib/telegram';
import { sendPushToUser } from '@/lib/webPush';
import { isConversationMuted, isTgMessageNotifyOn, TG_MESSAGE_NOTIFY_THROTTLE_MS } from '@/lib/chatConstants';

// Qo'ng'iroq bildirishnomalari uchun alohida throttle (xabarlarnikidan mustaqil kalit).
export const TG_CALL_NOTIFY_THROTTLE_MS = 60 * 1000;

export function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const userLabel = (u) => (u?.username ? `@${u.username}` : u?.name || 'Foydalanuvchi');

// Atomik throttle "slot"i: parallel so'rovlarda ham faqat bittasi yutadi. Hech narsa
// yetib bormasa slot qaytariladi (keyingi bildirishnoma yutilib ketmasin).
async function sendThrottled({ convo, key, throttleMs, targets, extra, logLabel }) {
  const now = new Date();
  const claimed = await Conversation.updateOne(
    {
      _id: convo._id,
      $or: [{ [key]: { $exists: false } }, { [key]: { $lt: new Date(now.getTime() - throttleMs) } }],
    },
    { $set: { [key]: now } }
  );
  if (!claimed.modifiedCount) return;

  const results = await Promise.allSettled([...targets].map(([chatId, text]) => sendTelegramMessage(chatId, text, extra)));
  const failed = results.filter((r) => r.status === 'rejected' || r.value?.ok === false);
  failed.forEach((r) => console.error(`[telegram] ${logLabel} yuborilmadi`, r.reason || r.value));
  if (failed.length === results.length) {
    await Conversation.updateOne({ _id: convo._id, [key]: now }, { $unset: { [key]: '' } });
  }
}

// Qabul qiluvchiga Telegram bot orqali "yangi xabar" signali. Ikki manba:
//
// 1. Qabul qiluvchi o'zi uchun (yoki admin unga) yoqib qo'ygan bo'lsa — uning o'z
//    telegramChatId'siga. Shu suhbatdagi shaxsiy tanlovi (tgMessageNotifyOn/Off)
//    ustun, tanlov bo'lmasa admin bergan umumiy sozlama (User.tgMessageNotify) —
//    src/lib/chatConstants.js#isTgMessageNotifyOn. Umumiy (admin) sozlama bo'yicha
//    yuborilganda suhbat "ovozsiz" (mute) bo'lsa yuborilmaydi; user AYNAN shu suhbat
//    uchun aniq yoqib qo'ygan bo'lsa — mute'dan qat'iy nazar yuboriladi. Xabar
//    mazmuni hech qachon ko'rsatilmaydi — faqat kim yozgani.
// 2. Eski xatti-harakat saqlangan: xabar aynan adminga (role 'admin') yozilsa —
//    TELEGRAM_ADMIN_CHAT_ID'ga umumiy "Sizga xabar keldi" (kim yozgani ko'rsatilmaydi).
//    Shu chat 1-banddagi bilan bir xil bo'lsa ikki marta yuborilmaydi.
//
// Ketma-ket yozilgan xabarlar spam bo'lmasligi uchun bir suhbatdan bir userga
// TG_MESSAGE_NOTIFY_THROTTLE_MS'da ko'pi bilan bitta bildirishnoma (atomik
// updateOne — parallel so'rovlarda ham faqat bittasi "yutadi").
export async function notifyRecipientViaTelegram({ convo, otherId, senderLabel, recipientMuted, senderUsername }) {
  const recipient = await User.findById(otherId).select('role telegramChatId tgMessageNotify').lean();
  if (!recipient) return;

  const targets = new Map(); // chatId -> matn
  const explicitOn = (convo.tgMessageNotifyOn || []).some((id) => String(id) === String(otherId));
  const wantsNotify = isTgMessageNotifyOn(convo, otherId, recipient.tgMessageNotify);
  if (recipient.telegramChatId && wantsNotify && (explicitOn || !recipientMuted)) {
    targets.set(String(recipient.telegramChatId), `💬 ${escapeHtml(senderLabel)} sizga yangi xabar yozdi.`);
  }
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId && recipient.role === 'admin' && !targets.has(String(adminChatId))) {
    targets.set(String(adminChatId), '💬 Sizga xabar keldi.');
  }
  if (!targets.size) return;

  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  const extra =
    appUrl && senderUsername
      ? { reply_markup: { inline_keyboard: [[{ text: 'Suhbatni ochish', url: `${appUrl}/app/friends/${senderUsername}` }]] } }
      : {};

  await sendThrottled({
    convo,
    key: `tgMessageNotifiedAt.${String(otherId)}`,
    throttleMs: TG_MESSAGE_NOTIFY_THROTTLE_MS,
    targets,
    extra,
    logLabel: 'chat xabari bildirishnomasi',
  });
}

// Qo'ng'iroq haqida Telegram xabari (javobsiz — qo'ng'iroq qilinganga, rad etilgan —
// qo'ng'iroq qilganga). Opt-in qoidalari xabarlar bilan bir xil; throttle esa alohida
// (`tgCallNotifiedAt`, 60 s) — matndan keyin darhol kelgan javobsiz qo'ng'iroq yutilmasin.
// Telegram ichki brauzerida getUserMedia yo'q — shuning uchun "brauzerda oching" eslatmasi.
export async function notifyCallViaTelegram({ convo, recipientId, text, adminText, buttonText, url }) {
  const recipient = await User.findById(recipientId).select('role telegramChatId tgMessageNotify').lean();
  if (!recipient) return;

  const targets = new Map();
  const explicitOn = (convo.tgMessageNotifyOn || []).some((id) => String(id) === String(recipientId));
  const wantsNotify = isTgMessageNotifyOn(convo, recipientId, recipient.tgMessageNotify);
  const muted = isConversationMuted(convo, recipientId);
  if (recipient.telegramChatId && wantsNotify && (explicitOn || !muted)) {
    targets.set(String(recipient.telegramChatId), `${text}\n(Qo'ng'iroq uchun brauzerda oching.)`);
  }
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminText && adminChatId && recipient.role === 'admin' && !targets.has(String(adminChatId))) {
    targets.set(String(adminChatId), adminText);
  }
  if (!targets.size) return;

  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  const extra = appUrl && url ? { reply_markup: { inline_keyboard: [[{ text: buttonText, url: `${appUrl}${url}` }]] } } : {};

  await sendThrottled({
    convo,
    key: `tgCallNotifiedAt.${String(recipientId)}`,
    throttleMs: TG_CALL_NOTIFY_THROTTLE_MS,
    targets,
    extra,
    logLabel: "qo'ng'iroq bildirishnomasi",
  });
}

// Yozilgan qo'ng'iroq uchun bildirishnomalar (docs/chat/CALLS_SPEC.md §7.4): qo'ng'iroqqa
// "javob bermagan" tomon xabardor qilinadi. Promise'lar massivi — chaqiruvchi
// Promise.allSettled bilan kutadi (call-event route'ida after() ichida).
//   missed/busy/cancelled (javob berilmagan) -> qo'ng'iroq qilinganga: web push + Telegram
//   declined -> qo'ng'iroq qilganga: faqat Telegram (u buni ekranda ko'rdi)
//   ended/failed yoki javob berilgan -> hech kimga
export function callNotifications({ convo, call, caller, callee }) {
  const tasks = [];
  const { outcome, answered, kind, callId } = call;
  const calleeId = String(callee?._id || call.calleeId);
  const callerId = String(caller?._id || call.callerId);

  if (['missed', 'busy', 'cancelled'].includes(outcome) && !answered) {
    const callerLabel = userLabel(caller);
    const path = caller?.username ? `/app/friends/${caller.username}?call=${kind}` : '/app/friends';
    if (!isConversationMuted(convo, calleeId)) {
      tasks.push(
        sendPushToUser(calleeId, {
          title: callerLabel,
          body: "📞 Javobsiz qo'ng'iroq",
          url: path,
          tag: `call-${callId}`,
          actions: [{ action: 'callback', title: "Qayta qo'ng'iroq qilish" }],
        })
      );
    }
    tasks.push(
      notifyCallViaTelegram({
        convo,
        recipientId: calleeId,
        text: `📞 ${escapeHtml(callerLabel)} sizga qo'ng'iroq qildi (javobsiz).`,
        adminText: "📞 Sizga javobsiz qo'ng'iroq bo'ldi.",
        buttonText: "Qayta qo'ng'iroq qilish",
        url: caller?.username ? path : null,
      })
    );
  } else if (outcome === 'declined') {
    const calleeLabel = userLabel(callee);
    tasks.push(
      notifyCallViaTelegram({
        convo,
        recipientId: callerId,
        text: `📞 ${escapeHtml(calleeLabel)} qo'ng'iroqni rad etdi.`,
        buttonText: 'Suhbatni ochish',
        url: callee?.username ? `/app/friends/${callee.username}` : null,
      })
    );
  }
  return tasks.map((t) =>
    Promise.resolve(t).catch((err) => {
      console.error("[chat] qo'ng'iroq bildirishnomasi yuborilmadi", err);
    })
  );
}
