// E2E uchun lokal realtime-server (PARITY_PLAN WP9, CALLS_SPEC §15.3): realtime-server/server.js'dagi
// createRealtimeServer'ni 127.0.0.1:<E2E_REALTIME_PORT|4001> da ishga tushiradi. index.js EMAS — u
// realtime-server/.env'ni (production qiymatlari) o'qiydi; bu yerda env faqat quyidagi aniq
// qiymatlardan yig'iladi, shuning uchun shell'dagi yoki .env'dagi production sirlari aralashmaydi.
//
// Bir martalik tayyorgarlik (yangi paket qo'shilmaydi, faqat e'lon qilinganlari):
//   npm ci --prefix realtime-server
//
// Playwright buni o'zi ishga tushiradi va to'xtatadi (playwright.config.ts `webServer` massivi,
// /health tayyorligini kutadi; E2E_REUSE_SERVER=1 bo'lsa allaqachon ishlayotganini ishlatadi).
// Qo'lda: `node e2e/realtime-local.mjs`; Next uchun kerakli env'ni ko'rish: `node e2e/realtime-local.mjs --print-env`.
//
// Realtime tomoni env (hammasi ixtiyoriy, standartlar qavsda):
//   E2E_REALTIME_PORT (4001), REALTIME_SHARED_SECRET (e2e-realtime-secret — Next serverda AYNAN shu qiymat),
//   E2E_BASE_URL (http://localhost:3100) -> NEXTJS_INTERNAL_URL (qo'ng'iroq tarixi /api/internal/call-event'ga
//   yoziladi) va REALTIME_ALLOWED_ORIGINS, CALL_RING_TIMEOUT_MS (8000), CALL_CONNECT_TIMEOUT_MS (15000),
//   CALL_GRACE_MS (8000) — qisqa taymerlar "javob bermadi"/"ulanish uzildi" testlari tez o'tishi uchun.
//
// Next serverga kerak bo'lgan env (`--print-env` aynan shuni chiqaradi):
//   NEXT_PUBLIC_REALTIME_URL=http://127.0.0.1:4001   (build vaqtida inline qilinadi, CSP ham build'da yasaladi)
//   REALTIME_INTERNAL_URL=http://127.0.0.1:4001
//   REALTIME_SHARED_SECRET=e2e-realtime-secret
//   NEXT_PUBLIC_E2E_HOOKS=1                          (window.__vocablyRealtime / window.__vocablyCall)
//   TURN_HOST=127.0.0.1                              (TURN_SECRET'siz faqat STUN; tashqi turn.vocably.uz'ga murojaat yo'q)
//   TELEGRAM_API_BASE=http://127.0.0.1:9             (javobsiz qo'ng'iroq bildirishnomasi tashqariga chiqmasin)
//   TURN_SECRET — ixtiyoriy; E2E'da kerak emas (ikki kontekst bitta mashinada host candidate'lar bilan ulanadi).
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(here, '..', 'realtime-server');
const requireFromServer = createRequire(path.join(serverDir, 'server.js'));

export const E2E_REALTIME_DEFAULT_PORT = 4001;
export const E2E_REALTIME_DEFAULT_SECRET = 'e2e-realtime-secret';

/** Realtime server uchun env va port (faqat aniq kalitlar — process.env butunlay uzatilmaydi). */
export function realtimeLocalConfig(env = process.env) {
  const port = Number(env.E2E_REALTIME_PORT) || E2E_REALTIME_DEFAULT_PORT;
  const baseUrl = (env.E2E_BASE_URL || 'http://localhost:3100').replace(/\/$/, '');
  const origins = new Set([baseUrl, baseUrl.replace('//localhost', '//127.0.0.1'), baseUrl.replace('//127.0.0.1', '//localhost')]);
  return {
    port,
    url: `http://127.0.0.1:${port}`,
    env: {
      NODE_ENV: 'development',
      REALTIME_SHARED_SECRET: env.REALTIME_SHARED_SECRET || E2E_REALTIME_DEFAULT_SECRET,
      NEXTJS_INTERNAL_URL: env.NEXTJS_INTERNAL_URL || baseUrl,
      REALTIME_ALLOWED_ORIGINS: env.REALTIME_ALLOWED_ORIGINS || [...origins].join(','),
      CALL_RING_TIMEOUT_MS: env.CALL_RING_TIMEOUT_MS || '8000',
      CALL_CONNECT_TIMEOUT_MS: env.CALL_CONNECT_TIMEOUT_MS || '15000',
      CALL_GRACE_MS: env.CALL_GRACE_MS || '8000',
    },
  };
}

/** Next server shu realtime server bilan ishlashi uchun env (dev va prod-build retseptida bir xil). */
export function nextRealtimeEnv(env = process.env) {
  const { url, env: rt } = realtimeLocalConfig(env);
  return {
    NEXT_PUBLIC_REALTIME_URL: url,
    REALTIME_INTERNAL_URL: url,
    REALTIME_SHARED_SECRET: rt.REALTIME_SHARED_SECRET,
    NEXT_PUBLIC_E2E_HOOKS: '1',
    TURN_HOST: env.TURN_HOST || '127.0.0.1',
    TELEGRAM_API_BASE: env.TELEGRAM_API_BASE || 'http://127.0.0.1:9',
  };
}

function assertPortFree(port) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', (err) =>
      reject(err.code === 'EADDRINUSE' ? new Error(`127.0.0.1:${port} band — boshqa realtime server ishlayaptimi? (E2E_REALTIME_PORT bilan o'zgartiring)`) : err)
    );
    probe.once('listening', () => probe.close(() => resolve()));
    probe.listen(port, '127.0.0.1');
  });
}

/** Dasturiy ishga tushirish (globalSetup yoki boshqa skriptlar uchun). `stop()` qo'ng'iroqlarni yakunlab yopadi. */
export async function startRealtimeLocal(env = process.env, { log = console } = {}) {
  let createRealtimeServer;
  try {
    ({ createRealtimeServer } = requireFromServer('./server.js'));
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      throw new Error(`realtime-server bog'liqliklari o'rnatilmagan: \`npm ci --prefix realtime-server\` (${err.message.split('\n')[0]})`);
    }
    throw err;
  }
  const cfg = realtimeLocalConfig(env);
  await assertPortFree(cfg.port);
  const rt = createRealtimeServer({ env: cfg.env, log });
  await rt.listen(cfg.port, '127.0.0.1');
  let stopping = null;
  // rt.shutdown: faol qo'ng'iroqlarni yakunlaydi, keyin io.close() http serverni ham yopadi.
  const stop = () => (stopping ||= rt.shutdown('server_shutdown'));
  return { ...cfg, rt, stop };
}

function main() {
  if (process.argv.includes('--print-env')) {
    const lines = Object.entries(nextRealtimeEnv()).map(([k, v]) => `${k}=${v}`);
    console.log(lines.join('\n'));
    return;
  }
  startRealtimeLocal().then(
    (h) => {
      console.log(`[e2e-realtime] ${h.url} tayyor (ring ${h.env.CALL_RING_TIMEOUT_MS} ms, connect ${h.env.CALL_CONNECT_TIMEOUT_MS} ms, grace ${h.env.CALL_GRACE_MS} ms, call-event -> ${h.env.NEXTJS_INTERNAL_URL})`);
      // Windows'da Playwright jarayonni majburan o'chiradi (signal kelmaydi); posix'da toza yopamiz.
      for (const sig of ['SIGINT', 'SIGTERM']) {
        process.once(sig, () => {
          h.stop().finally(() => process.exit(0));
          setTimeout(() => process.exit(0), 6000).unref();
        });
      }
    },
    (err) => {
      console.error(`[e2e-realtime] ${err.message}`);
      process.exit(1);
    }
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
