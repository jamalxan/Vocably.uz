// Rebuilds the media bucket from the Telegram channel. Needs only the bot token, the channel id and the key:
// the manifest is read from the channel's pinned message.
//
//   node restore.mjs --check 20      prove 20 random objects can be read back intact (writes nothing)
//   node restore.mjs --check         the same for every object
//   node restore.mjs --list          what the backup holds
//   node restore.mjs                 write every object the target bucket is missing
//   node restore.mjs --prefix avatars/ --force     rewrite one folder even where objects exist
//
// Env: TELEGRAM_BOT_TOKEN, BACKUP_CHAT_ID, BACKUP_KEY; for writing also S3_ENDPOINT, S3_ACCESS_KEY,
// S3_SECRET_KEY, S3_BUCKET (S3_REGION, default us-east-1) of the bucket to restore INTO.
import { parseKey } from './lib/crypto.mjs';
import { fetchPinnedManifest, restore } from './lib/engine.mjs';
import { stats } from './lib/manifest.mjs';
import { createS3 } from './lib/s3.mjs';
import { createTelegram } from './lib/telegram.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const env = (name) => {
  if (!process.env[name]) throw new Error(`${name} is not set`);
  return process.env[name];
};

const check = flag('--check');
const sample = check && /^\d+$/.test(value('--check') || '') ? Number(value('--check')) : 0;
const key = parseKey(env('BACKUP_KEY'));
const tg = createTelegram({ token: env('TELEGRAM_BOT_TOKEN'), apiBase: process.env.TELEGRAM_API_BASE || undefined });

const pinned = await fetchPinnedManifest({ tg, chatId: env('BACKUP_CHAT_ID'), key }).catch((err) => {
  // GCM refuses to decrypt with another key: say so instead of a bare crypto error.
  console.error(/authenticate|auth tag/i.test(err.message) ? 'The manifest cannot be opened with this BACKUP_KEY (wrong key).' : `Could not read the manifest: ${err.message}`);
  process.exit(2);
});
if (!pinned) {
  console.error('No manifest is pinned in the channel. Either nothing was backed up, or the pin was replaced by hand.');
  process.exit(2);
}
const { manifest } = pinned;
const st = stats(manifest);
console.log(`Backup of bucket "${manifest.bucket}", updated ${manifest.updatedAt}: ${st.objects} objects, ${(st.bytes / 1048576).toFixed(1)} MB, ${st.parts} parts.`);

if (flag('--list')) {
  for (const [k, e] of Object.entries(manifest.objects).sort()) console.log(`${String(e.size).padStart(10)}  ${e.at}  ${k}`);
  process.exit(0);
}

const s3 = check ? null : createS3({ endpoint: env('S3_ENDPOINT'), region: process.env.S3_REGION || 'us-east-1', accessKey: env('S3_ACCESS_KEY'), secretKey: env('S3_SECRET_KEY'), bucket: env('S3_BUCKET') });
let shown = 0;
const report = await restore({
  s3,
  tg,
  key,
  manifest,
  prefix: value('--prefix') || '',
  force: flag('--force'),
  check,
  sample,
  onProgress: (r) => {
    const done = r.restored + r.verified + r.failed.length;
    if (done - shown >= 10) {
      shown = done;
      console.log(`  ${done + r.skipped}/${r.total}`);
    }
  },
});
console.log(check ? `Verified ${report.verified} of ${report.total} objects.` : `Restored ${report.restored}, already present ${report.skipped}, of ${report.total}.`);
for (const f of report.failed) console.error(`FAILED ${f.key}: ${f.error}`);
process.exit(report.failed.length ? 1 : 0);
