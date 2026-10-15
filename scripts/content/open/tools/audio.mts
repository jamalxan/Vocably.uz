// Open-test listening audiosi uchun umumiy bosqichlar (load-open-tests.mts va
// voa-prepare.mts ikkalasi ishlatadi):
//   prepareAudio — VOA mp3 yuklab olinadi, 40 kbps mono'ga siqiladi, ffmpeg bilan
//                  to'liq dekodlanadi (xatosiz), davomiyligi asl fayl bilan solishtiriladi
//   groqAsr      — Whisper (Groq) transkripsiya, bepul tarif limiti kutiladi
//   asrCheck     — har bir savol javobi/dalili audioda HAQIQATAN aytilganini tekshiradi
// Kesh: .local-scratch/open-audio/<key>.{orig.mp3,mp3,asr.json,clip-*.txt}
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

export const CACHE = path.join(process.cwd(), '.local-scratch', 'open-audio');
fs.mkdirSync(CACHE, { recursive: true });

const probe = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

export async function prepareAudio(key: string, url: string) {
  const orig = path.join(CACHE, `${key}.orig.mp3`);
  const out = path.join(CACHE, `${key}.mp3`);
  if (!fs.existsSync(orig) || fs.statSync(orig).size < 50_000) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${key}: audio yuklab olinmadi (${res.status})`);
    fs.writeFileSync(orig, Buffer.from(await res.arrayBuffer()));
  }
  if (!fs.existsSync(out)) {
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', orig, '-ac', '1', '-ar', '22050', '-b:a', '40k', '-map_metadata', '-1', out]);
  }
  // To'liq dekodlash — buzilgan freym bo'lsa ffmpeg stderr'ga yozadi.
  const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', out, '-f', 'null', '-'], { encoding: 'utf8' });
  if (dec.status !== 0 || dec.stderr.trim()) throw new Error(`${key}: dekodlashda xato: ${dec.stderr.trim().slice(0, 300)}`);
  const dOrig = probe(orig), dOut = probe(out);
  if (!(dOut > 60) || Math.abs(dOrig - dOut) > 1.5) throw new Error(`${key}: davomiylik shubhali (asl ${dOrig}s, siqilgan ${dOut}s)`);
  return { file: out, durationSec: Math.round(dOut), buf: fs.readFileSync(out) };
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];
ORDINALS[30] = 'thirtieth';
function numWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numWords(n % 100)}` : ''}`;
  if (n < 1_000_000) return `${numWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numWords(n % 1000)}` : ''}`;
  return `${numWords(Math.floor(n / 1_000_000))} million${n % 1_000_000 ? ` ${numWords(n % 1_000_000)}` : ''}`;
}
export function spokenForms(a: string): string[] {
  const forms = [a];
  const n = Number(a.replace(/,/g, ''));
  if (/^[\d,]+$/.test(a) && Number.isFinite(n)) {
    forms.push(String(n), n.toLocaleString('en-US'), numWords(n), numWords(n).replace(/-/g, ' '));
    // Tartib sonlar: "July 4" audioda "July fourth"/"4th" bo'lib aytiladi.
    const sfx = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th';
    forms.push(`${n}${sfx}`, `${n}s`); // tartib son va o'n yillik ("1990s")
    if (n >= 1 && n <= 31) forms.push(ORDINALS[n] || `${TENS[Math.floor(n / 10)]} ${ORDINALS[n % 10]}`);
    if (n >= 1100 && n < 2100) forms.push(`${numWords(Math.floor(n / 100))} ${n % 100 < 10 ? `oh ${numWords(n % 100)}` : numWords(n % 100)}`.replace(/-/g, ' '));
    if (n >= 1000 && n % 1000 === 0 && n < 1_000_000) forms.push(`${n / 1000} thousand`);
    if (n >= 1_000_000 && n % 1_000_000 === 0) forms.push(`${n / 1_000_000} million`);
  } else if (ONES.includes(a.toLowerCase())) forms.push(String(ONES.indexOf(a.toLowerCase())));
  return forms.filter((f) => f.trim());
}

// Groq bepul tarifi HAR MODEL uchun alohida (soatiga 7200 s, kuniga 28800 s audio) —
// limitga urilganda keyingi modelga o'tiladi, uchalasi ham band bo'lsa javobdagi
// "try again in 12m3.5s" kutiladi. Uchala model ham verbose_json/segmentlarni beradi.
// (distil-whisper-large-v3-en 2026-10 da o'chirilgan — ishlatilmaydi)
const ASR_MODELS = ['whisper-large-v3', 'whisper-large-v3-turbo'];
let asrModel = 0;
export async function groqAsr(file: string, format: 'json' | 'verbose_json') {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY yo'q — audio ASR tekshiruvi ishlamaydi");
  let limited = 0;
  for (let attempt = 1; ; attempt++) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(file)], { type: 'audio/mpeg' }), path.basename(file));
    form.append('model', ASR_MODELS[asrModel]);
    form.append('language', 'en');
    form.append('response_format', format);
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: form });
    if (res.ok) return res.json();
    const body = await res.text();
    if (res.status === 400 && /decommissioned|not supported|does not exist/i.test(body) && attempt < ASR_MODELS.length) {
      asrModel = (asrModel + 1) % ASR_MODELS.length; // model o'chirilgan — keyingisiga o'tiladi
      continue;
    }
    if (attempt >= 12 || ![429, 500, 502, 503].includes(res.status)) throw new Error(`ASR xatosi ${res.status}: ${body.slice(0, 200)}`);
    if (res.status === 429) {
      limited++;
      asrModel = (asrModel + 1) % ASR_MODELS.length;
      if (limited < ASR_MODELS.length) { console.log(`   … ASR limit, ${ASR_MODELS[asrModel]} modeliga o'tildi`); continue; }
    }
    const m = /try again in (?:(\d+)h)?(?:(\d+)m)?([\d.]+)s/.exec(body);
    const waitMs = m ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3])) * 1000 + 5_000 : 20_000 * attempt;
    console.log(`   … ASR limit (${ASR_MODELS[asrModel]}), ${Math.round(waitMs / 1000)} s kutilmoqda`);
    await new Promise((r) => setTimeout(r, waitMs));
    limited = 0;
  }
}

/** To'liq faylning ASR'i (keshlanadi: <key>.asr.json). */
export async function fullAsr(key: string, file: string) {
  const cache = path.join(CACHE, `${key}.asr.json`);
  if (!fs.existsSync(cache)) fs.writeFileSync(cache, JSON.stringify(await groqAsr(file, 'verbose_json')));
  return JSON.parse(fs.readFileSync(cache, 'utf8')) as { text: string; segments?: { start: number; end: number; text: string }[] };
}

/** Transkript so'zlarining necha foizi audioda eshitilgan (0..1). */
export function transcriptCoverage(transcript: string, asrText: string, norm: (s: string) => string) {
  const asrSet = new Set(norm(asrText).trim().split(' '));
  const tw = norm(transcript).trim().split(' ');
  return tw.filter((w) => asrSet.has(w)).length / tw.length;
}

// To'liq faylning ASR'i ba'zan raqam yoki so'zni tushirib qoldiradi (masalan "2,400" -> "2").
// Shuning uchun tekshiruv muvaffaqiyatsiz bo'lsa, ibora joylashgan segment topiladi, o'sha
// bo'lak (+-2 s) alohida kesilib QAYTA tanilanadi va qaror shu aniqroq natija bo'yicha qabul qilinadi.
export async function asrCheck(key: string, file: string, part: any, norm: (s: string) => string): Promise<string[]> {
  const full = await fullAsr(key, file);
  const segs = full.segments || [];
  const asr = norm(full.text);
  const asrSet = new Set(asr.trim().split(' '));
  const errs: string[] = [];

  const clipText = async (probeText: string): Promise<string> => {
    // Faqat mazmunli so'zlar (yordamchi so'zlarsiz) bo'yicha baholanadi; raqamlar ikki
    // baravar og'irlikka ega — qisqa iqtibosda "the" kabi so'zlar noto'g'ri segmentni tanlatmasin.
    const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'is', 'was', 'it', 'that', 'this', 'with', 'as', 'by', 'be', 'are', 'from', 'he', 'she', 'they', 'his', 'her', 'their', 'you', 'we', 'i']);
    const pw = new Set(norm(probeText).trim().split(' ').filter((w) => w && !STOP.has(w)));
    let best = -1, bi = 0;
    for (let i = 0; i < segs.length; i++) {
      const win = new Set(norm(segs.slice(Math.max(0, i - 1), i + 2).map((s) => s.text).join(' ')).trim().split(' '));
      let score = 0;
      for (const w of pw) if (win.has(w)) score += /\d/.test(w) ? 2 : 1;
      if (score > best) { best = score; bi = i; }
    }
    if (!segs.length) return '';
    const from = Math.max(0, segs[Math.max(0, bi - 1)].start - 2), to = segs[Math.min(segs.length - 1, bi + 1)].end + 2;
    const cf = path.join(CACHE, `${key}.clip-${Math.round(from)}.txt`);
    if (!fs.existsSync(cf)) {
      const clip = path.join(CACHE, `${key}.clip.mp3`);
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(from), '-to', String(to), '-i', file, clip]);
      fs.writeFileSync(cf, (await groqAsr(clip, 'json')).text || '');
    }
    return norm(fs.readFileSync(cf, 'utf8'));
  };
  // test(text) — matnda kerakli narsa eshitildimi; avval to'liq ASR, keyin aniq bo'lak.
  const heard = async (probeText: string, test: (t: string, set: Set<string>) => boolean) => {
    if (test(asr, asrSet)) return true;
    const c = await clipText(probeText);
    return test(c, new Set(c.trim().split(' ')));
  };

  const coverage = transcriptCoverage(part.transcript, full.text, norm);
  if (coverage < 0.85) errs.push(`part ${part.order}: audio transkriptga mos emas (so'z qamrovi ${(coverage * 100).toFixed(0)}%)`);

  // Har savol izohidagi dalil iqtibosi audioda ham bo'lishi kerak: so'zlarining kamida
  // 80%i eshitilgan va undagi har bir RAQAM audioda (raqam yoki so'z shaklida) aytilgan.
  for (const g of part.questionGroups) for (const q of g.questions) {
    for (const m of String(q.explanationHtml).matchAll(/"([^"]{4,})"/g)) {
      const fw = norm(m[1]).trim().split(' ').filter(Boolean);
      if (!(await heard(m[1], (_t, set) => fw.filter((w) => set.has(w)).length / fw.length >= 0.8))) errs.push(`part ${part.order} Q${q.number}: dalil audioda eshitilmadi: "${m[1]}"`);
      for (const num of m[1].match(/\d[\d,]*/g) || []) {
        if (!(await heard(m[1], (t) => spokenForms(num).some((f) => t.includes(norm(f)))))) errs.push(`part ${part.order} Q${q.number}: dalildagi raqam ${num} audioda eshitilmadi`);
      }
    }
    if (g.wordLimit) {
      const probe = String(q.explanationHtml);
      const ok = await heard(probe, (t) => q.answer.accepted.some((a: string) => spokenForms(a).some((f) => t.includes(norm(f)))));
      if (!ok) errs.push(`part ${part.order} Q${q.number}: javob (${q.answer.accepted.join(' | ')}) audioda eshitilmadi`);
    }
  }
  return errs;
}
