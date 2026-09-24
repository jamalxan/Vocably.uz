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
  "script-src 'self' 'unsafe-inline'",
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
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // AI-01 — `next lint`ning standart papka ro'yxati (`pages/app/components/
  // lib/src`) `worker/`ni O'Z ICHIGA OLMAYDI (qo'lda tekshirilgan, `npm run
  // lint` uni jimgina o'tkazib yuborardi — xato bo'lsa ham "toza" deb
  // ko'rsatardi). `worker/` — alohida, uzoq umr ko'radigan Node protsessi
  // (Next.js sahifasi emas), lekin baribir shu reponing bir qismi va bir xil
  // sifat nazoratidan o'tishi kerak.
  eslint: { dirs: ['pages', 'app', 'components', 'lib', 'src', 'worker'] },
};

export default nextConfig;
