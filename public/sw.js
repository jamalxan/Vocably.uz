// Vocably Service Worker.
//
// 1) Push-bildirishnoma (ilgaridan bor edi, o'zgarishsiz mantiq).
// 2) App-shell keshlash (VOCABLY-TZ.md 15.4/T1):
//    - HTML navigatsiyalar — NETWORK-FIRST: har doim yangi sahifa (deploydan keyin
//      eski HTML eski chunk'larga ishora qilib qolmasin, logout'dan keyin eski
//      sahifa ko'rinmasin); tarmoq yo'q bo'lsagina keshdagi nusxa yoki /app qobig'i.
//    - /_next/static/* (hash'li, o'zgarmas) — cache-first.
//    - qolgan statik resurslar (ikonkalar, manifest) — stale-while-revalidate.
//    - /api/*, RSC so'rovlari (?_rsc / RSC header), /_next/data, Range so'rovlari va
//      audio/video — ATAYLAB SW'dan o'tmaydi (brauzer o'zi tarmoqdan oladi).
//
// TZ 15.4'dagi jadvalning qolgan qatorlari (bugungi navbatni IndexedDB'ga
// oldindan yuklash, Background Sync bilan offline javob yuborish) FAZA 1'dagi
// FSRS/queue API'siga bog'liq — u hali yo'q, shuning uchun bu yerda emas.

const SHELL_CACHE = 'vocably-shell-v3';
const SHELL_URLS = ['/app', '/manifest.webmanifest'];
const MEDIA_RE = /\.(wav|mp3|m4a|aac|ogg|oga|opus|webm|mp4|mov)$/i;

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

// Faqat to'liq (200), shu origin'dan kelgan, redirect bo'lmagan javob keshlanadi.
function cacheable(res) {
  return res && res.status === 200 && res.type === 'basic' && !res.redirected;
}

async function putSafe(cache, request, res) {
  try {
    await cache.put(request, res);
  } catch {
    // kvota to'lgan va h.k. — jimgina
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // API (autentifikatsiyali ma'lumot), Next.js RSC/data va HMR so'rovlari — har doim
  // tarmoqdan, hech qachon keshdan (eskirgan token/ma'lumot xavfi).
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/data/') || url.pathname.startsWith('/_next/webpack-hmr')) return;
  if (url.searchParams.has('_rsc') || request.headers.get('RSC') === '1') return;
  // Media / Range so'rovlari (audio seek, iOS 206 talabi) — SW aralashmaydi.
  if (request.headers.has('range') || MEDIA_RE.test(url.pathname) || url.pathname.startsWith('/audio/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        try {
          const res = await fetch(request);
          if (cacheable(res)) event.waitUntil(putSafe(cache, request, res.clone()));
          return res;
        } catch {
          // Offline — shu sahifaning oxirgi nusxasi yoki kamida /app qobig'i.
          return (await cache.match(request)) || (await cache.match('/app')) || Response.error();
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);
      const immutable = url.pathname.startsWith('/_next/static/');
      if (cached && immutable) return cached;

      const networkFetch = fetch(request)
        .then((res) => {
          if (cacheable(res)) event.waitUntil(putSafe(cache, request, res.clone()));
          return res;
        })
        .catch(() => null);

      if (cached) {
        // Stale-while-revalidate (faqat statik, hash'siz resurslar uchun).
        event.waitUntil(networkFetch);
        return cached;
      }
      return (await networkFetch) || Response.error();
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
