// Barcha original "Vocably Practice Test" kontent modullarini (practice-test-N.mjs)
// raqam tartibida topib yuklaydi — TTS pipeline (scripts/tts/*), seed skripti va
// regression testi bir xil ro'yxatdan foydalanadi, shuning uchun yangi test qo'shish
// uchun faqat yangi practice-test-N.mjs fayl yaratish kifoya.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const CONTENT_DIR = path.dirname(fileURLToPath(import.meta.url));

export function listTestFiles() {
  return readdirSync(CONTENT_DIR)
    .map((f) => /^practice-test-(\d+)\.mjs$/.exec(f))
    .filter(Boolean)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((m) => ({ n: Number(m[1]), file: path.join(CONTENT_DIR, m[0]) }));
}

export async function loadAllTests() {
  const out = [];
  for (const { n, file } of listTestFiles()) {
    const mod = await import(pathToFileURL(file).href);
    out.push({ n, content: mod.default });
  }
  return out;
}
