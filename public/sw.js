// Vocably Service Worker.
//
// 1) Push-bildirishnoma (ilgaridan bor edi, o'zgarishsiz mantiq).
// 2) App-shell keshlash (YANGI, VOCABLY-TZ.md 15.4/T1) — stale-while-revalidate:
//    sahifa/statik resurslar birinchi ochilishda keshlanadi, keyingi tashriflarda
//    (internet yo'q bo'lsa ham) darhol keshdan ko'rsatiladi, fonda tarmoqdan
//    yangilanadi. Bu FAQAT qobiq (HTML/JS/CSS/shrift) uchun — login talab
//    qiladigan /api/* so'rovlar ATAYLAB keshlanmaydi (eskirgan/noto'g'ri
//    foydalanuvchi ma'lumoti ko'rsatilib qolmasligi uchun).
//
// TZ 15.4'dagi jadvalning qolgan qatorlari (bugungi navbatni IndexedDB'ga
// oldindan yuklash, Background Sync bilan offline javob yuborish) FAZA 1'dagi
// FSRS/queue API'siga bog'liq — u hali yo'q, shuning uchun bu yerda emas.

const SHELL_CACHE = 'vocably-shell-v1';
const SHELL_URLS = ['/app', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== SHELL_CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // API, autentifikatsiya va Next.js ichki (_next/data, HMR) so'rovlari — har doim
  // tarmoqdan, hech qachon keshdan (eskirgan token/ma'lumot xavfi).
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);

      if (cached) {
        // Stale-while-revalidate: eskisini darhol qaytaramiz, fonda yangilaymiz.
        event.waitUntil(networkFetch);
        return cached;
      }
      const fresh = await networkFetch;
      if (fresh) return fresh;
      // Ikkalasi ham yo'q (birinchi tashrif, offline) — navigatsiya so'rovlari
      // uchun kamida qobiqni ko'rsatamiz.
      if (request.mode === 'navigate') return (await cache.match('/app')) || Response.error();
      return Response.error();
    })()
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Vocably', body: '', url: '/app' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // JSON bo'lmasa ham standart matn bilan davom etamiz
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/app' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/app';

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
