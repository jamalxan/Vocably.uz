import '@/app/globals.css';
import { Plus_Jakarta_Sans, Inter, Playfair_Display, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google';
import { ThemeProvider, themeInitScript } from '@/context/ThemeContext';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Premium/hashamatli sarlavhalar uchun (Bosh sahifa salomlashuvi, Admin panel) —
// butun ilova bo'ylab bir xil brend ovozi bo'lishi uchun shu yerda, global yuklanadi.
const luxury = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-luxury',
  display: 'swap',
});

// Statistika raqamlari, IPA, ID kabi "tabular" matnlar uchun — Tailwind'ning
// standart font-mono (generik tizim shrifti, system-ui bilan bir xil darajada
// "arzon" ko'rinadi) o'rniga brendning o'z premium mono shrifti (tailwind.config.js
// bu klaviaturani 'mono' kaliti ostida almashtiradi — mavjud font-mono ishlatgan
// barcha joylar avtomatik yangilanadi, komponentlarni o'zgartirish shart emas).
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

// FAQAT o'rganilayotgan so'zning o'zi uchun (flashcard old tarafi, test/tez
// so'rov/yozish savoli) — lug'at kitobidagi bosh so'z kabi ajralib turadigan
// serif, qolgan hamma joyda font-display (geometrik sans) qoladi. Aynan shu
// maqsad uchun docs/VOCABLY_REDESIGN_SPEC.md'da rejalashtirilgan edi, lekin
// hech qachon ulanmagan qolib ketgan edi.
const word = Source_Serif_4({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-word',
  display: 'swap',
});

export const metadata = {
  title: "Vocably — Ingliz tili yordamchisi",
  description: "Ingliz tilini o'rganish uchun AI yordamchili shaxsiy lug'at platformasi",
  manifest: '/manifest.webmanifest',
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
    { media: '(prefers-color-scheme: dark)', color: '#17090E' },
  ],
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: <body> boshidagi bloklovchi skript hydration'dan oldin
    // data-theme atributini o'rnatishi mumkin — bu server/klient farqi kutilgan va
    // zararsiz, React shu haqidagi ogohlantirishni shu yerda bosib qo'ymasa bo'ladi.
    <html lang="uz" className={`${display.variable} ${body.variable} ${luxury.variable} ${mono.variable} ${word.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-primary min-h-screen antialiased font-body" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
