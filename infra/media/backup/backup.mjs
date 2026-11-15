// Media backup service: copies every object of the media bucket into a private Telegram channel as sealed
// parts and keeps a pinned manifest there, so the bucket can be rebuilt with restore.mjs after the server is lost.
// Runs next to Garage (see ../docker-compose.yml). `--once` does a single pass and exits.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseKey } from './lib/crypto.mjs';
import { loadState, runBackup } from './lib/engine.mjs';
import { stats } from './lib/manifest.mjs';
import { createS3 } from './lib/s3.mjs';
import { createTelegram } from './lib/telegram.mjs';

const env = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') throw new Error(`${name} is not set`);
  return v;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (event, data = {}) => console.log(JSON.stringify({ t: new Date().toISOString(), event, ...data }));
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

const once = process.argv.includes('--once');
const chatId = env('BACKUP_CHAT_ID');
const alertChatId = process.env.ALERT_CHAT_ID || '';
const key = parseKey(env('BACKUP_KEY'));
const stateDir = process.env.STATE_DIR || '/state';
const stateFile = join(stateDir, 'state.json');
const scanMs = Number(process.env.SCAN_INTERVAL_SEC || 60) * 1000;
// A channel takes about 20 messages a minute from one bot; 3.1 s between sends stays under it.
const pauseMs = Number(process.env.SEND_PAUSE_MS || 3100);
const retentionDays = Number(process.env.RETENTION_DAYS || 30);
const reportHourUtc = Number(process.env.REPORT_HOUR_UTC || 4); // 09:00 in Tashkent

const s3 = createS3({ endpoint: env('S3_ENDPOINT'), region: process.env.S3_REGION || 'us-east-1', accessKey: env('S3_ACCESS_KEY'), secretKey: env('S3_SECRET_KEY'), bucket: env('S3_BUCKET') });
const tg = createTelegram({ token: env('TELEGRAM_BOT_TOKEN'), apiBase: process.env.TELEGRAM_API_BASE || undefined });

async function readState() {
  try {
    return JSON.parse(await readFile(stateFile, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err; // a damaged state file must not be mistaken for "no backup yet"
  }
}
async function save(state) {
  const { source: _source, ...persisted } = state;
  await writeFile(`${stateFile}.tmp`, JSON.stringify(persisted), { mode: 0o600 });
  await rename(`${stateFile}.tmp`, stateFile);
}

let lastAlertAt = 0;
async function alert(text) {
  log('alert', { text });
  if (!alertChatId || Date.now() - lastAlertAt < 6 * 3600 * 1000) return;
  lastAlertAt = Date.now();
  await tg.sendMessage(alertChatId, text).catch((err) => log('alert_failed', { error: err.message }));
}

await mkdir(stateDir, { recursive: true });
const state = await loadState({ tg, chatId, key, bucket: s3.bucket, readState });
log('start', { source: state.source, ...stats(state.manifest) });

let failures = 0;
for (;;) {
  try {
    const report = await runBackup({ s3, tg, chatId, key, state, save, retentionDays, pause: () => sleep(pauseMs) });
    failures = report.failed.length ? failures + 1 : 0;
    if (report.uploaded || report.trashed || report.purged || report.failed.length || report.massDeletion) log('pass', { ...report, failed: report.failed.length, ...stats(state.manifest) });
    state.uploadedToday = (state.uploadedToday || 0) + report.uploaded;
    if (report.massDeletion) {
      await alert(`⚠️ Media backup: ${report.gone} ta fayl serverdan birdan yo'qoldi. Backup o'zgartirilmadi (kanaldagi nusxalar joyida). Serverni tekshiring; fayllarni qaytarish: restore.mjs.`);
    }
    if (failures >= 3) await alert(`⚠️ Media backup: ${report.failed.length} ta faylni kanalga yuborib bo'lmadi (ketma-ket ${failures} urinish). Birinchi xato: ${report.failed[0]?.error || '-'}`);

    // One short line a day, so a silent backup is noticed.
    const today = new Date().toISOString().slice(0, 10);
    if (alertChatId && state.lastReportDay !== today && new Date().getUTCHours() >= reportHourUtc && !report.pending) {
      const st = stats(state.manifest);
      const first = !state.lastReportDay;
      await tg
        .sendMessage(alertChatId, `💾 Media backup: ${st.objects} ta fayl (${mb(st.bytes)}) kanalda saqlangan.${first ? '' : ` So'nggi kunda +${state.uploadedToday || 0}.`}`)
        .then(async () => {
          state.lastReportDay = today;
          state.uploadedToday = 0;
          await save(state);
        })
        .catch((err) => log('report_failed', { error: err.message }));
    }
    if (once && !report.pending) break;
    if (report.pending) continue; // backlog: keep going without waiting
  } catch (err) {
    failures += 1;
    log('error', { error: err.message });
    if (failures >= 3) await alert(`⚠️ Media backup ishlamayapti: ${err.message}`);
    if (once) process.exit(1);
  }
  await sleep(scanMs);
}
log('done', stats(state.manifest));
