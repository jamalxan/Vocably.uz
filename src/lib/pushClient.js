// Brauzer push bildirishnomalariga obuna bo'lish — faqat foydalanuvchi aniq
// so'raganda chaqiriladi (masalan NotificationBell'dagi "Yoqish" tugmasi), sahifa
// yuklanishida avtomatik emas — ruxsat so'rovi shunday kelganda kamroq rad etiladi.

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getPushPermissionState() {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// Joriy brauzerda faol obuna bor-yo'qligini tekshiradi (masalan bildirishnoma
// belgisidagi tugma holatini to'g'ri ko'rsatish uchun).
export async function isPushSubscribed() {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

// AUTH_MIGRATION_MAP.md — token endi parametr sifatida qabul qilinmaydi va
// header'ga qo'lda biriktirilmaydi; server httpOnly cookie orqali autentifikatsiya
// qiladi (src/lib/auth.js), brauzer buni same-origin so'rovga o'zi qo'shadi.
export async function subscribeToPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!pushSupported() || !publicKey) return { error: "Brauzeringiz qo'llab-quvvatlamaydi" };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { error: 'Ruxsat berilmadi' };

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  if (!res.ok) return { error: 'Obuna saqlanmadi' };

  return { success: true };
}

export async function unsubscribeFromPush() {
  if (!pushSupported()) return { success: true };
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return { success: true };

  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {});

  return { success: true };
}
