import '@/app/globals.css';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';

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
    <html lang="uz" className={`${display.variable} ${body.variable}`}>
      <body className="bg-slate-50 text-slate-800 min-h-screen antialiased font-body">
        {children}
      </body>
    </html>
  );
}
