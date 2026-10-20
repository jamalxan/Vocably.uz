// Audit topilmasi (SECURITY_AUDIT.md, SEC-12): bu faylda hech qanday xavfsizlik
// headeri sozlanmagan edi — CSP, X-Frame-Options, HSTS va h.k. umuman yo'q edi.
// Bu ayniqsa SEC-03 (JWT localStorage'da) ta'sirini kuchaytiradi: agar qachondir
// XSS zaifligi topilsa (hozircha bunday zaiflik topilmagan — chat SEC-08'da
// tasdiqlangan), CSP'siz holatda tajovuzkor skripti to'sqinliksiz ishlaydi va
// o'g'irlangan tokenni istalgan tashqi domenga yubora oladi. Quyidagi `connect-src`
// buni "faqat o'z origin + real-time server" bilan cheklaydi.
//
// script-src/style-src'da 'unsafe-inline' qoldirilgan — Next.js App Router o'zi
// hydration ma'lumotini va bu loyihaning `themeInitScript`ini inline <script>
// sifatida yozadi (src/app/layout.jsx:107); buni nonce-based CSP'ga o'tkazish
// middleware qo'shishni talab qiladigan alohida, kattaroq ish (bu yerda ataylab
// qilinmadi — mavjud sahifalarni sinovsiz buzish xavfi bor edi). Shunga qaramay
// pastdagi `connect-src`/`frame-ancestors`/`object-src` cheklovlari haqiqiy
// himoya qatlamini beradi (token exfiltration va clickjacking'ga qarshi).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function buildConnectSrc() {
  const extra = [];
  for (const raw of [process.env.NEXT_PUBLIC_REALTIME_URL, process.env.S3_ENDPOINT]) {
    if (!raw) continue;
    try {
      const origin = new URL(raw).origin;
      extra.push(origin);
      // Real-time server WebSocket ulanishi https/http bilan bir xil hostda,
      // lekin ws(s): sxemasi bilan ham so'raladi (socket.io-client transport).
      if (origin.startsWith('https:')) extra.push(origin.replace('https:', 'wss:'));
      if (origin.startsWith('http:')) extra.push(origin.replace('http:', 'ws:'));
    } catch {
      // .env'da placeholder/noto'g'ri qiymat bo'lsa CSP qurilishini buzmaslik
      // uchun jim o'tkazib yuboriladi — build muvaffaqiyatsiz bo'lmasligi kerak.
    }
  }
  return ["'self'", ...new Set(extra)].join(' ');
}

function buildMediaImgSrc() {
  const extra = [];
  if (process.env.S3_ENDPOINT) {
    try {
      extra.push(new URL(process.env.S3_ENDPOINT).origin);
    } catch {
      // yuqoridagi kabi — jim o'tkazib yuboriladi.
    }
  }
  return ["'self'", 'data:', 'blob:', ...new Set(extra)].join(' ');
}

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // `next dev` (react-refresh/HMR) eval ishlatadi — faqat dev'da ruxsat; production CSP o'zgarmaydi.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${buildMediaImgSrc()}`,
  `media-src ${buildMediaImgSrc()}`,
  "font-src 'self' data:",
  `connect-src ${buildConnectSrc()}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Speaking bo'limi (src/features/exam/speaking) mikrofonni, chatdagi video
  // xabar (src/components/chat-friends/VideoRecorder.jsx) esa kamerani O'Z
  // origin'idan ishlatadi — ikkalasi ham 'self'ga cheklangan. `camera=()` bo'lganda
  // brauzer ruxsat so'ramasdan NotAllowedError berardi (sayt ruxsati "Ruxsat
  // berish" bo'lsa ham) — foydalanuvchi uchun tuzatib bo'lmaydigan xato.
  { key: 'Permissions-Policy', value: 'microphone=(self), camera=(self), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Boshqa originning oynasi `window.opener` orqali bu sahifaga tegolmasin (popup-ga ruxsat saqlanadi: to'lov/tashqi havolalar).
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];


// 2026-10-16 — URL'lar inglizchaga o'tkazildi (/app/oyinlar → /app/games va h.k.). Eski manzillar
// (bookmark, Telegram xabarlari, Google indeksi, bildirishnoma havolalari) 301 bilan yangisiga yo'naltiriladi.
const LEGACY_REDIRECTS = [
  ['/app/lugat/jadval', '/app/vocabulary/words'],
  ['/app/lugat/takrorlash', '/app/vocabulary/review'],
  ['/app/lugat/kartochka', '/app/vocabulary/flashcards'],
  ['/app/lugat/test', '/app/vocabulary/quiz'],
  ['/app/lugat/yozish', '/app/vocabulary/spelling'],
  ['/app/lugat/juftlik', '/app/vocabulary/match'],
  ['/app/lugat/tezkor', '/app/vocabulary/speed'],
  ['/app/lugat/tinglab-yozish', '/app/vocabulary/dictation'],
  ['/app/lugat/cloze', '/app/vocabulary/context'],
  ['/app/lugat/kollokatsiya', '/app/vocabulary/collocations'],
  ['/app/lugat/soz-oilasi', '/app/vocabulary/word-family'],
  ['/app/lugat/jumla-qurish', '/app/vocabulary/sentence-builder'],
  ['/app/lugat/mnemonika', '/app/vocabulary/mnemonics'],
  ['/app/lugat/antonim', '/app/vocabulary/antonyms'],
  ['/app/lugat/zaif-sozlar', '/app/vocabulary/weak-words'],
  ['/app/lugat/kutubxona', '/app/vocabulary/library'],
  ['/app/lugat/soz/:wordId', '/app/vocabulary/word/:wordId'],
  ['/app/lugat', '/app/vocabulary'],
  ['/app/oyinlar/:path*', '/app/games/:path*'],
  ['/app/oyinlar', '/app/games'],
  ['/app/mashq', '/app/practice'],
  ['/app/dostlar/:path*', '/app/friends/:path*'],
  ['/app/dostlar', '/app/friends'],
  ['/app/profil', '/app/profile'],
  ['/app/reyting', '/app/leaderboard'],
  ['/app/tolov', '/app/billing'],
  ['/app/xatolar', '/app/mistakes'],
  ['/app/oqish/mashq/:path*', '/app/reading/practice/:path*'],
  ['/app/oqish/mashq', '/app/reading/practice'],
  ['/app/oqish/:path*', '/app/reading/:path*'],
  ['/app/oqish', '/app/reading'],
  ['/app/tinglash/mashq/:path*', '/app/listening/practice/:path*'],
  ['/app/tinglash/mashq', '/app/listening/practice'],
  ['/app/tinglash/:path*', '/app/listening/:path*'],
  ['/app/tinglash', '/app/listening'],
  ['/app/gapirish/:path*', '/app/speaking/:path*'],
  ['/app/gapirish', '/app/speaking'],
  ['/app/yozish/mashq/:path*', '/app/writing/practice/:path*'],
  ['/app/yozish/mashq', '/app/writing/practice'],
  ['/app/yozish/:path*', '/app/writing/:path*'],
  ['/app/yozish', '/app/writing'],
  ['/kirish', '/login'],
  ['/royxat', '/register'],
  ['/narxlar', '/pricing'],
  ['/lugat/:word', '/dictionary/:word'],
  ['/lugat', '/dictionary'],
  ['/ielts/band-kalkulyator', '/ielts/band-calculator'],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Uy papkasidagi begona package-lock.json workspace ildizi deb adashtirmasin (Next 15 ogohlantirishi).
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  // "X-Powered-By: Next.js" sarlavhasi texnologiya/versiyani oshkor qiladi — hujumchiga foyda, foydalanuvchiga foyda yo'q.
  poweredByHeader: false,
  // Next 15 dev-indikatori (pastki-chap "N" belgisi) mobil pastki tab-bar'ning birinchi tugmasini yopib qo'yadi (E2E va qo'lda sinov); production'ga ta'siri yo'q.
  devIndicators: false,
  async redirects() {
    return LEGACY_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
