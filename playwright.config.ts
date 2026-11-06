// E2E (TZ §58): vocab o'yin oqimi haqiqiy brauzerda. Alohida (bo'sh) MongoDB bazasi kerak:
//   E2E_MONGODB_URI=mongodb://127.0.0.1:27017/vocably_e2e npm run test:e2e
// Test foydalanuvchi va so'zlar global-setup'da shu bazaga yoziladi — ishlab chiqarish bazasiga ISHLATMANG.
//
// Realtime (PARITY_PLAN WP9, CALLS_SPEC §15.3): `realtime-server/node_modules` o'rnatilgan bo'lsa
// (`npm ci --prefix realtime-server`) yoki E2E_REALTIME=1 bo'lsa, Playwright Next bilan birga
// e2e/realtime-local.mjs'ni ham (127.0.0.1:4001) ko'taradi va Next'ga mos env'ni beradi.
// E2E_REALTIME=0 — realtime'siz (eski polling rejimi). Qo'ng'iroq/parity testlari: `npm run e2e:chat`.
//
// Prod-build retsepti (NEXT_PUBLIC_* va CSP build vaqtida qotadi — env build'da HAM, start'da HAM bo'lsin):
//   export E2E_MONGODB_URI=mongodb://127.0.0.1:27019/vocably_e2e MONGODB_URI=mongodb://127.0.0.1:27019/vocably_e2e JWT_SECRET=e2e-secret
//   export $(node e2e/realtime-local.mjs --print-env | xargs)
//   npx next build && npx next start -p 3100
//   E2E_REUSE_SERVER=1 npx playwright test e2e/chat-call.spec.ts --project=desktop
// (realtime server ishlamayotgan bo'lsa Playwright uni o'zi ko'taradi; ishlayotgan bo'lsa qayta ishlatadi.)
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
const uri = process.env.E2E_MONGODB_URI || '';
const reuse = !!process.env.E2E_REUSE_SERVER;

// Realtime server: e2e/realtime-local.mjs bilan bir xil standartlar (`--print-env` shu qiymatlarni chiqaradi).
const realtimeDepsInstalled = fs.existsSync(path.join(__dirname, 'realtime-server', 'node_modules', 'socket.io', 'package.json'));
const REALTIME_ON = process.env.E2E_REALTIME === '0' ? false : process.env.E2E_REALTIME === '1' || realtimeDepsInstalled;
const RT_PORT = Number(process.env.E2E_REALTIME_PORT) || 4001;
const RT_URL = `http://127.0.0.1:${RT_PORT}`;
const RT_SECRET = process.env.REALTIME_SHARED_SECRET || 'e2e-realtime-secret';

const nextRealtimeEnv: Record<string, string> = REALTIME_ON
  ? {
      NEXT_PUBLIC_REALTIME_URL: RT_URL,
      REALTIME_INTERNAL_URL: RT_URL,
      REALTIME_SHARED_SECRET: RT_SECRET,
      NEXT_PUBLIC_E2E_HOOKS: '1',
      // TURN_SECRET'siz faqat STUN, u ham loopback'ga — tashqi turn.vocably.uz'ga so'rov ketmaydi.
      TURN_HOST: process.env.TURN_HOST || '127.0.0.1',
      // Javobsiz qo'ng'iroq Telegram bildirishnomasi (token berilgan bo'lsa ham) tashqariga chiqmasin.
      TELEGRAM_API_BASE: process.env.TELEGRAM_API_BASE || 'http://127.0.0.1:9',
    }
  : {};

const webServers = [
  {
    name: 'next',
    command: `npx next dev -p ${PORT}`,
    url: `${BASE_URL}/`,
    // E2E_REUSE_SERVER=1 — oldindan ishga tushirilgan `next dev -p 3100` (yoki prod-build `next start`) ishlatiladi
    // (birinchi kompilyatsiya 180 s limitdan oshib ketmasin). U holda yuqoridagi realtime env'ni o'sha serverga o'zingiz bering.
    reuseExistingServer: reuse,
    timeout: 180_000,
    env: { MONGODB_URI: uri, JWT_SECRET: process.env.JWT_SECRET || 'e2e-secret', ...nextRealtimeEnv },
  },
  ...(REALTIME_ON
    ? [
        {
          name: 'realtime',
          command: 'node e2e/realtime-local.mjs',
          url: `${RT_URL}/health`,
          reuseExistingServer: reuse,
          timeout: 30_000,
          env: { E2E_REALTIME_PORT: String(RT_PORT), REALTIME_SHARED_SECRET: RT_SECRET, E2E_BASE_URL: BASE_URL },
        },
      ]
    : []),
];

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  retries: 0,
  // Testlar bitta test foydalanuvchi (faol sessiya, kunlik limit) holatini bo'lishadi — ketma-ket yuradi.
  workers: 1,
  reporter: [['list']],
  // Standart til — inglizcha; mavjud spec'lar o'zbekcha matnga tayanadi, shuning uchun har kontekst `vocably_lang=uz` bilan boshlanadi (i18n.spec.ts buni o'zi almashtiradi).
  // Soxta kamera/mikrofon flag'lari (--use-fake-device-for-media-stream va h.k.) faqat kerakli spec'larda:
  // `test.use(FAKE_MEDIA)` (e2e/helpers/twoUsers.ts) — chat-call.spec.ts, chat-parity.spec.ts.
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    storageState: { cookies: [{ name: 'vocably_lang', value: 'uz', domain: 'localhost', path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' }], origins: [] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: webServers,
});
