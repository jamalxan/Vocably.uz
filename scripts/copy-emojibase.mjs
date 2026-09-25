// Emoji picker (frimousse) ma'lumotlarini o'z serverimizdan berish uchun —
// `emojibase-data` paketidan kerakli fayllarni public/emojibase/ ga ko'chiradi.
// Sabab: next.config.mjs'dagi CSP `connect-src` faqat o'z origin'ga ruxsat beradi,
// frimousse esa sukut bo'yicha cdn.jsdelivr.net'dan yuklaydi — CSP qo'shilgach
// picker "Yuklanmoqda..."da qotib qolardi. `predev`/`prebuild` orqali avtomatik ishlaydi.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const LOCALES = ['en']; // src/components/chat-friends/EmojiPicker.jsx#LOCALE
const FILES = ['data.json', 'messages.json'];

const pkgDir = path.dirname(require.resolve('emojibase-data/package.json'));
const outRoot = path.join(process.cwd(), 'public', 'emojibase');

for (const locale of LOCALES) {
  const outDir = path.join(outRoot, locale);
  mkdirSync(outDir, { recursive: true });
  for (const file of FILES) copyFileSync(path.join(pkgDir, locale, file), path.join(outDir, file));
}
console.log(`[emojibase] ${LOCALES.length * FILES.length} ta fayl -> public/emojibase/`);
