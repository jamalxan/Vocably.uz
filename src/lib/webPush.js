import webpush from 'web-push';
import { PushSubscription } from './models';

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:support@vocably.uz', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

/**
 * Berilgan foydalanuvchining barcha qurilmalariga (bir nechta brauzer/telefon obunasi
 * bo'lishi mumkin) brauzer push bildirishnomasi yuboradi. VAPID kalitlari sozlanmagan
 * bo'lsa yoki foydalanuvchida hech qanday obuna bo'lmasa — jimgina hech narsa qilmaydi
 * (ilova ichidagi Notification hujjati baribir yaratiladi, faqat real push bo'lmaydi).
 */
//
// Ixtiyoriy `tag`/`renotify`/`requireInteraction`/`actions` — qo'ng'iroq bildirishnomalari
// uchun (bitta qo'ng'iroq — bitta bildirishnoma, "Qayta qo'ng'iroq qilish" tugmasi);
// public/sw.js ularni showNotification'ga uzatadi. Berilmaganlari payload'ga qo'shilmaydi.
export async function sendPushToUser(userId, { title, body, url, tag, renotify, requireInteraction, actions }) {
  if (!ensureConfigured()) return;

  const subs = await PushSubscription.find({ userId }).lean();
  if (subs.length === 0) return;

  const extra = {};
  if (typeof tag === 'string' && tag) extra.tag = tag;
  if (typeof renotify === 'boolean') extra.renotify = renotify;
  if (typeof requireInteraction === 'boolean') extra.requireInteraction = requireInteraction;
  if (Array.isArray(actions) && actions.length) extra.actions = actions.slice(0, 2);
  const payload = JSON.stringify({ title, body, url: url || '/app', ...extra });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
      } catch (err) {
        // 404/410 — obuna eskirgan/bekor qilingan, o'chirib tashlaymiz. Boshqa xatolar
        // (vaqtinchalik tarmoq muammosi va h.k.) faqat log qilinadi, obuna saqlanib qoladi.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
        } else {
          console.error('[web-push] yuborishda xatolik', err?.statusCode, err?.message);
        }
      }
    })
  );
}
