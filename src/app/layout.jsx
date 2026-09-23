import '@/app/globals.css';
import { Poppins, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider, themeInitScript } from '@/context/ThemeContext';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

// Butun ilova uchun yagona shrift — Poppins. Sarlavha/matn/logotip/so'z
// o'zgaruvchilari (--font-display, --font-luxury, --font-word) globals.css'da
// shu --font-body'ga ulangan, shuning uchun komponentlardagi klasslar o'zgarmaydi.
const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

// Faqat kod bloklari, ID va JSON maydonlari uchun (font-mono).
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

// VOCABLY-TZ.md §17.3 (SEO). `metadataBase` — nisbiy OG-rasm/canonical
// yo'llarni (masalan opengraph-image.tsx, har sahifadagi alternates.canonical)
// mutlaq URL'ga aylantirish uchun shart — bo'lmasa Next ular uchun ogohlantirish
// chiqaradi va ijtimoiy tarmoqlarda rasm ko'rinmasligi mumkin.
export const metadata = {
  metadataBase: new URL('https://vocably.uz'),
  title: {
    default: "Vocably — Ingliz tili yordamchisi",
    template: '%s',
  },
  description: "Ingliz tilini o'rganish uchun AI yordamchili shaxsiy lug'at platformasi",
  keywords: ["ingliz tili so'zlarini yodlash", 'IELTS mock test online', 'ingliz tili darslari onlayn', "ingliz tili so'z boyligi"],
  manifest: '/manifest.webmanifest',
  // Statik OG-rasm (scripts/generate-og-image.mjs) — dinamik next/og ImageResponse
  // shu loyihada Windows'da build vaqtida "Invalid URL" bilan yiqilgani uchun
  // (Next 14.2.35'ning tanilgan Windows-xatosi) qasddan statik variant tanlandi.
  openGraph: {
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Vocably' }],
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

// A1 (docs/AUDIT_FINDINGS.md): maximumScale bloklangan bo'lsa pinch-zoom butunlay ishlamay
// qoladi — WCAG 1.4.4 buzilishi. Mobil inputlarda avtomatik zoom oldini olish
// globals.css'dagi 16px font-size qoidasi bilan hal qilinadi, zoomni bloklash bilan emas.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3EDE6' },
    { media: '(prefers-color-scheme: dark)', color: '#14090D' }, // = --color-bg (dark)
  ],
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: <body> boshidagi bloklovchi skript hydration'dan oldin
    // data-theme atributini o'rnatishi mumkin — bu server/klient farqi kutilgan va
    // zararsiz, React shu haqidagi ogohlantirishni shu yerda bosib qo'ymasa bo'ladi.
    <html lang="uz" className={`${poppins.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-ink min-h-dvh antialiased font-body" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
