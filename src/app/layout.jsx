import '@/app/globals.css';
import { Plus_Jakarta_Sans, Inter, Playfair_Display, IBM_Plex_Mono } from 'next/font/google';

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

export const metadata = {
  title: "Vocably — Ingliz tili yordamchisi",
  description: "Ingliz tilini o'rganish uchun AI yordamchili shaxsiy lug'at platformasi",
};

// A1 (docs/AUDIT_FINDINGS.md): maximumScale bloklangan bo'lsa pinch-zoom butunlay ishlamay
// qoladi — WCAG 1.4.4 buzilishi. Mobil inputlarda avtomatik zoom oldini olish
// globals.css'dagi 16px font-size qoidasi bilan hal qilinadi, zoomni bloklash bilan emas.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable} ${luxury.variable} ${mono.variable}`}>
      <body className="bg-bg text-primary min-h-screen antialiased font-body">
        {children}
      </body>
    </html>
  );
}
