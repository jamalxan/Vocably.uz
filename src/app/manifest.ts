import type { MetadataRoute } from 'next';

// Next.js'ning o'rnatilgan manifest route konvensiyasi — /manifest.webmanifest'da
// avtomatik xizmat qiladi (layout.jsx'dagi metadata.manifest shu yo'lga ishora
// qiladi). VOCABLY-TZ.md 15.4 (T1: PWA yo'q muammosi).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vocably — Ingliz tili yordamchisi',
    short_name: 'Vocably',
    description: "Ingliz tilini o'rganish uchun AI yordamchili shaxsiy lug'at platformasi",
    start_url: '/app',
    id: '/app',
    display: 'standalone',
    background_color: '#F3EDE6',
    // layout.jsx viewport themeColor (light) bilan bir xil — o'rnatilgan ilova va
    // brauzer tabi bir xil rangda. orientation ATAYLAB yo'q: planshet/landshaft
    // (imtihon SplitPane, chat) keng ekranda ishlashi kerak.
    theme_color: '#F3EDE6',
    lang: 'uz',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Bugungi takrorlash', url: '/app/lugat/takrorlash' },
      { name: "Tezkor o'yin", url: '/app/lugat/tezkor' },
    ],
  };
}
