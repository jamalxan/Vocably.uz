// public/og-image.png ni generatsiya qiladi — next/og (ImageResponse) Windows'da
// build vaqtida "TypeError: Invalid URL" bilan yiqiladi (Next.js/@vercel/og'ning
// standart shrift yuklash kodi Windows fayl yo'llarini file:// URL'ga noto'g'ri
// aylantiradi — bu loyihaga xos xato emas, Next 14.2.35'ning Windows'dagi tanilgan
// muammosi). Shu sabab dinamik OG-rasm o'rniga oldindan generatsiya qilingan
// STATIK rasm ishlatiladi (src/app/layout.jsx'dagi metadata.openGraph.images) —
// PWA ikonkalari uchun ishlatilgan bir xil qo'lda yozilgan PNG encoder bilan
// (scripts/generate-pwa-icons.mjs'dagi izohga q.), yangi paket qo'shilmadi.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');

const PRIMARY = [0x2a, 0x0f, 0x18]; // #2A0F18 — to'qroq uch
const PRIMARY_2 = [0x4a, 0x12, 0x26]; // #4A1226 — asosiy
const ACCENT = [0xb8, 0x39, 0x4a]; // #B8394A
const ON_ACCENT = [0xff, 0xff, 0xff];

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpColor(c1, c2, t) {
  return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
}

function insideRoundedSquare(u, v, r) {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  const cx = u < r ? r : u > 1 - r ? 1 - r : u;
  const cy = v < r ? r : v > 1 - r ? 1 - r : v;
  const dx = u - cx;
  const dy = v - cy;
  return dx * dx + dy * dy <= r * r || (u >= r && u <= 1 - r) || (v >= r && v <= 1 - r);
}

function insideV(u, v, thickness) {
  if (v < 0.16 || v > 0.86) return false;
  const t = (v - 0.16) / (0.86 - 0.16);
  const leftX = lerp(0.24, 0.5, t);
  const rightX = lerp(0.76, 0.5, t);
  return Math.abs(u - leftX) < thickness || Math.abs(u - rightX) < thickness;
}

const WIDTH = 1200;
const HEIGHT = 630;

function draw() {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);

  // Logotip markazi — kvadrat, ekranning chap-o'rtasida (matn joyi o'ngda
  // bo'sh qoladi deb hisoblansa ham, matnsiz kompozitsiya barqarorroq —
  // OG meta'dagi title/description allaqachon matnni tashiydi).
  const markSize = 220; // piksel
  const markX = WIDTH / 2 - markSize / 2;
  const markY = HEIGHT / 2 - markSize / 2 - 20;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 4;
      // Diagonal gradient fon: yuqori-chapdan pastki-o'ngga PRIMARY_2 -> PRIMARY.
      const t = (x / WIDTH + y / HEIGHT) / 2;
      let rgb = lerpColor(PRIMARY_2, PRIMARY, t);

      const su = (x - markX) / markSize;
      const sv = (y - markY) / markSize;
      if (insideRoundedSquare(su, sv, 0.22)) {
        rgb = ACCENT;
        if (insideV(su, sv, 0.085)) rgb = ON_ACCENT;
      }

      pixels[i] = rgb[0];
      pixels[i + 1] = rgb[1];
      pixels[i + 2] = rgb[2];
      pixels[i + 3] = 255;
    }
  }
  return pixels;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crcBuf]);
}

function encodePNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const ihdr = chunk('IHDR', ihdrData);

  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    const srcStart = y * width * 4;
    Buffer.from(pixels.buffer, pixels.byteOffset + srcStart, width * 4).copy(raw, rowStart + 1);
  }
  const idat = chunk('IDAT', deflateSync(raw, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

mkdirSync(OUT_DIR, { recursive: true });
const pixels = draw();
const png = encodePNG(WIDTH, HEIGHT, pixels);
writeFileSync(join(OUT_DIR, 'og-image.png'), png);
console.log(`og-image.png (${png.length} bayt)`);
