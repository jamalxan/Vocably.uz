// Kichik, bog'liqliksiz WAV yordamchi funksiyalari — Windows SAPI
// (System.Speech.Synthesis) chiqargan fayllarni o'qish va bir nechtasini bitta
// audio faylga birlashtirish uchun. `ffmpeg` yo'q (sandbox'da o'rnatilmagan,
// tarmoq yo'q), shuning uchun PCM'ni qo'lda birlashtiramiz.
//
// SAPI fmt chunk'i ODATDA 16 emas, 18 bayt (kengaytirilgan) — standart 44-baytli
// header FARAZ qilib bo'lmaydi, shuning uchun chunk'lar umumiy holda "yurib chiqiladi".
import { readFileSync, writeFileSync } from 'node:fs';

/** WAV fayldan PCM ma'lumotlarini va formatini o'qiydi (chunk'larni umumiy holda yurib). */
export function readWavPcm(path) {
  const buf = readFileSync(path);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`${path}: WAVE fayl emas`);
  }
  let offset = 12;
  let fmt = null;
  let data = null;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const body = buf.subarray(offset + 8, offset + 8 + size);
    if (id === 'fmt ') {
      fmt = {
        audioFormat: body.readUInt16LE(0),
        numChannels: body.readUInt16LE(2),
        sampleRate: body.readUInt32LE(4),
        bitsPerSample: body.readUInt16LE(14),
      };
    } else if (id === 'data') {
      data = body;
    }
    offset += 8 + size + (size % 2); // chunk'lar juft bayt chegarasiga to'ldiriladi
  }
  if (!fmt || !data) throw new Error(`${path}: fmt/data chunk topilmadi`);
  return { fmt, pcm: data };
}

/** Bir nechta PCM bufferni (bir xil formatda deb faraz qilib) bitta WAV faylga yozadi. */
export function writeWavPcm(path, fmt, pcmBuffers) {
  const dataSize = pcmBuffers.reduce((s, b) => s + b.length, 0);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(fmt.numChannels, 22);
  header.writeUInt32LE(fmt.sampleRate, 24);
  header.writeUInt32LE(fmt.sampleRate * fmt.numChannels * (fmt.bitsPerSample / 8), 28);
  header.writeUInt16LE(fmt.numChannels * (fmt.bitsPerSample / 8), 32);
  header.writeUInt16LE(fmt.bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  writeFileSync(path, Buffer.concat([header, ...pcmBuffers]));
}

/** `seconds` davomiyligida sukut (silence) PCM buferi — spikerlar orasidagi pauza uchun. */
export function silencePcm(fmt, seconds) {
  const bytesPerSample = fmt.bitsPerSample / 8;
  const numSamples = Math.round(seconds * fmt.sampleRate) * fmt.numChannels;
  return Buffer.alloc(numSamples * bytesPerSample); // 0 = jimlik (signed PCM)
}

/** Bitta partning satr-fayllarini (gap bilan) bitta WAV'ga birlashtiradi, davomiyligini (sek) qaytaradi. */
export function concatPartWav(lineFiles, outPath, { gapBetweenLinesSec = 0.45 } = {}) {
  if (lineFiles.length === 0) throw new Error('lineFiles bo\'sh');
  const parsed = lineFiles.map((f) => readWavPcm(f));
  const fmt = parsed[0].fmt;
  const buffers = [];
  parsed.forEach((p, i) => {
    buffers.push(p.pcm);
    if (i < parsed.length - 1) buffers.push(silencePcm(fmt, gapBetweenLinesSec));
  });
  writeWavPcm(outPath, fmt, buffers);
  const totalBytes = buffers.reduce((s, b) => s + b.length, 0);
  const bytesPerSecond = fmt.sampleRate * fmt.numChannels * (fmt.bitsPerSample / 8);
  return totalBytes / bytesPerSecond;
}
