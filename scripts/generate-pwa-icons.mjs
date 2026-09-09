// PWA ikonkalarini generatsiya qiladi — public/icons/*.png. Hech qanday tashqi
// paket (sharp/canvas/ImageMagick) YO'Q — Node'ning o'rnatilgan zlib.deflateSync
// va zlib.crc32 (Node 20.12+/21+) yordamida PNG baytlarini qo'lda yig'amiz.
//
// Chizilgan belgi: AppShell/Sidebar'dagi mavjud "V" logotipi bilan bir xil g'oya —
// primary (#4A1226) fon ustida accent (#B8394A) yumaloq burchakli kvadrat, ustida
// on-accent (#FBF7F4) rangli sodda "V" belgisi. BU DIZAYNERSIZ, GEOMETRIK O'RINBOSAR —
// haqiqiy logotip fayli tayyor bo'lganda shu skript o'rniga to'g'ridan-to'g'ri
// public/icons/*.png almashtirilsin (yoki shu skriptdagi draw() funksiyasi
// yangi logotipga moslab qayta yozilsin).
//
// Ishlatish: node scripts/generate-pwa-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'icons');

const PRIMARY = [0x4a, 0x12, 0x26]; // #4A1226
const ACCENT = [0xb8, 0x39, 0x4a]; // #B8394A
const ON_ACCENT = [0xfb, 0xf7, 0xf4]; // #FBF7F4

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// (u,v) — [0,1]x[0,1] mahalliy koordinata ichida accent kvadratning burchaklari
// yumaloqlanadi (radius r).
function insideRoundedSquare(u, v, r) {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  const cx = u < r ? r : u > 1 - r ? 1 - r : u;
  const cy = v < r ? r : v > 1 - r ? 1 - r : v;
  const dx = u - cx;
  const dy = v - cy;
  return dx * dx + dy * dy <= r * r || (u >= r && u <= 1 - r) || (v >= r && v <= 1 - r);
}

// Ikkita diagonal "zarb" — chap tepadan pastki markazga, o'ng tepadan pastki
// markazga — klassik blokli "V".
function insideV(u, v, thickness) {
  if (v < 0.16 || v > 0.86) return false;
  const t = (v - 0.16) / (0.86 - 0.16);
  const leftX = lerp(0.24, 0.5, t);
  const rightX = lerp(0.76, 0.5, t);
  return Math.abs(u - leftX) < thickness || Math.abs(u - rightX) < thickness;
}

// maskable ikonalarda tashqi ~20% "xavfsiz zona" — OS o'zi doira/kvadrat shaklida
// kesib olishi mumkin, shuning uchun markaziy belgi shu zonadan tashqariga chiqmasin.
function draw(size, { maskable = false, opaque = true } = {}) {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const squareInset = maskable ? 0.30 : 0.16; // maskable'da belgi kichikroq (xavfsiz zona)
  const squareSize = 1 - squareInset * 2;
  const vThickness = 0.085;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      let rgb = PRIMARY;

      const su = (nx - squareInset) / squareSize;
      const sv = (ny - squareInset) / squareSize;
      if (insideRoundedSquare(su, sv, 0.22)) {
        rgb = ACCENT;
        if (insideV(su, sv, vThickness)) rgb = ON_ACCENT;
      }

      pixels[i] = rgb[0];
      pixels[i + 1] = rgb[1];
      pixels[i + 2] = rgb[2];
      pixels[i + 3] = opaque ? 255 : rgb === PRIMARY ? 0 : 255;
    }
  }
  return pixels;
}

function crc(buf) {
  return crc32(buf) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function encodePNG(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  // Har qator boshida filter-byte 0 (None) — RGBA xom baytlar.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    const srcStart = y * size * 4;
    Buffer.from(pixels.buffer, pixels.byteOffset + srcStart, size * 4).copy(raw, rowStart + 1);
  }
  const idat = chunk('IDAT', deflateSync(raw, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192, opts: {} },
  { name: 'icon-512.png', size: 512, opts: {} },
  { name: 'icon-512-maskable.png', size: 512, opts: { maskable: true } },
  { name: 'apple-touch-icon.png', size: 180, opts: {} },
];

for (const t of targets) {
  const pixels = draw(t.size, t.opts);
  const png = encodePNG(t.size, pixels);
  writeFileSync(join(OUT_DIR, t.name), png);
  console.log(`${t.name} (${png.length} bayt)`);
}
