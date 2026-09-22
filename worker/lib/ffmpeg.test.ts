import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { probeAudio, detectSilences, cutAudio, transcodeToOpus } from './ffmpeg';

const execFileAsync = promisify(execFile);

// Bu test HAQIQIY `ffmpeg`/`ffprobe` binary'sini chaqiradi (mock emas) — bu
// dev mashinada ular PATH'da borligi qo'lda tasdiqlangan (2026-09-22, winget
// orqali o'rnatilgan). CI/production konteynerida ffmpeg yo'q bo'lsa bu test
// tabiiy ravishda muvaffaqiyatsiz bo'ladi — bu HOLDA amaliy ma'noda to'g'ri
// (worker konteynerida ffmpeg SHART, TZ §3.2).
describe('ffmpeg wrapper (real binary)', () => {
  let dir: string;
  let sampleWav: string;

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'vocably-ffmpeg-test-'));
    sampleWav = path.join(dir, 'sample.wav');
    // `-f lavfi -i "sine=..."` — sintetik audio generatsiya qiladi, haqiqiy
    // fayl talab qilmaydi. 3s ton + oxirida ~1.5s jimlik (silencedetect uchun).
    await execFileAsync('ffmpeg', [
      '-y',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=440:duration=3',
      '-f',
      'lavfi',
      '-i',
      'anullsrc=r=44100:cl=mono:d=1.5',
      '-filter_complex',
      '[0][1]concat=n=2:v=0:a=1',
      '-ar',
      '44100',
      '-ac',
      '1',
      sampleWav,
    ]);
  }, 20000);

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('probeAudio reports duration close to the generated 4.5s clip', async () => {
    const info = await probeAudio(sampleWav);
    expect(info.durationMs).toBeGreaterThan(4000);
    expect(info.durationMs).toBeLessThan(5200);
    expect(info.sampleRate).toBe(44100);
    expect(info.channels).toBe(1);
  }, 15000);

  it('detectSilences finds the trailing silent segment', async () => {
    const silences = await detectSilences(sampleWav, { noiseDb: -30, minDurationSec: 0.5 });
    expect(silences.length).toBeGreaterThanOrEqual(1);
    // Should start somewhere around the 3s mark where the tone ends.
    expect(silences[0].startSec).toBeGreaterThan(2.5);
    expect(silences[0].startSec).toBeLessThan(3.5);
  }, 15000);

  it('cutAudio produces a shorter file spanning only the requested range', async () => {
    const outPath = path.join(dir, 'cut.wav');
    await cutAudio(sampleWav, outPath, 0, 1);
    const info = await probeAudio(outPath);
    expect(info.durationMs).toBeGreaterThan(800);
    expect(info.durationMs).toBeLessThan(1300);
  }, 15000);

  it('transcodeToOpus produces a valid, playable Opus/WebM file', async () => {
    const outPath = path.join(dir, 'out.webm');
    await transcodeToOpus(sampleWav, outPath, 48);
    const info = await probeAudio(outPath);
    expect(info.durationMs).toBeGreaterThan(4000);
  }, 15000);
});
