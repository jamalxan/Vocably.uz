// Vocably push-bildirishnoma Service Worker'i. Faqat ikkita ishi bor: kelgan push
// hodisasini haqiqiy OS bildirishnomasiga aylantirish, va bosilganda ilovani ochish/
// fokuslash. Offline-cache/PWA funksiyasi yo'q — ataylab minimal.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Vocably', body: '', url: '/dashboard' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // JSON bo'lmasa ham standart matn bilan davom etamiz
  }

  // Loyihada hali alohida bildirishnoma ikonkasi (masalan public/icon.png) yo'q —
  // shuning uchun icon/badge berilmaydi, brauzer o'zining standart belgisini ko'rsatadi.
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url || '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(url);
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
