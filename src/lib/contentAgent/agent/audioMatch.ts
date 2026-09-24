// Admin chatga tashlangan AUDIO qaysi Listening part'iga tegishli ekanini
// aniqlash va TEKSHIRISH qatlami (foydalanuvchi talabi: "listening audiosi
// yuborilsa, admindan qaysi listening uchun ekanligi so'ralsin va mos
// keladimi-yo'qmi tekshirilsin — to'g'ri kelsa yuklansin, kelmasa
// to'g'ri kelmaganligi aytilsin").
//
// Ikki qatlamli, ataylab:
//   1. DETERMINISTIK dalil (`scoreTranscriptAgainstPart`) — IELTS Listening
//      javoblari audioda deyarli har doim SO'ZMA-SO'Z aytiladi, shuning
//      uchun "javob kalitidagi qancha javob transkriptda uchraydi" juda
//      kuchli va tekshirib bo'ladigan signal. Bu sof funksiya, AI'siz
//      ishlaydi va birlik testi bilan qoplangan.
//   2. AI xulosasi — mazmunan mos kelishini (mavzu, kontekst, savollar
//      ketma-ketligi) baholaydi va odam o'qiydigan sabab yozadi.
//
// Yakuniy qaror IKKALASIGA tayanadi: dalil ham, AI ham qarshi bo'lsa —
// biriktirmaymiz. Bu "AI aytdi-ku" degan ishonchdan ko'ra xavfsizroq.

export interface PartCandidate {
  testId: string;
  testTitle: string;
  partOrder: number;
  hasAudio: boolean;
  contextText?: string;
  transcript?: string;
  /** Javob kaliti — `accepted` qiymatlari (savol raqami bo'yicha). */
  answers: { number: number; accepted: string[] }[];
  /** Savol matnlari (prompt/stem) — mavzuviy o'xshashlik uchun. */
  questionText: string;
}

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Javob kalitidagi javoblarning qanchasi transkriptda uchraydi (0-1).
 * Raqamli javoblar (masalan "25") va bir necha so'zli javoblar ("blue
 * folder") ham qamrab olinadi — har javob uchun normalizatsiya qilingan
 * matn ichidan to'liq ibora qidiriladi. */
export function answerHitRate(
  transcript: string,
  answers: { number?: number; accepted: string[] }[]
): { hits: number; total: number; rate: number } {
  const haystack = normalize(transcript);
  const checkable = answers.filter((a) => (a.accepted || []).some((v) => normalize(v).length >= 2));
  if (haystack.length === 0 || checkable.length === 0) return { hits: 0, total: checkable.length, rate: 0 };

  let hits = 0;
  for (const answer of checkable) {
    const found = (answer.accepted || []).some((raw) => {
      const needle = normalize(raw);
      if (needle.length < 2) return false;
      // TRUE/FALSE/A/B/C kabi "javob harflari" audioda uchramaydi — ularni
      // hisobga olish moslik foizini asossiz pasaytirardi, shuning uchun
      // ular `checkable`ga kirmaydi (uzunligi < 2) yoki bu yerda o'tkazib
      // yuboriladi.
      if (/^(true|false|not given|yes|no)$/.test(needle)) return false;
      return haystack.includes(needle);
    });
    if (found) hits += 1;
  }

  return { hits, total: checkable.length, rate: checkable.length ? hits / checkable.length : 0 };
}

/** Ikki matn orasidagi kamyob-so'z ustma-ustligi (0-1) — audioscript mavjud
 * bo'lganda (kitobdan kelgan transkript) eng aniq signal. */
export function rareWordOverlap(a: string, b: string): number {
  const stop = new Set(
    'the a an and or but if then of to in on at for with from by is are was were be been being this that these those you i he she it we they as not what which who will would can could shall should may might do does did have has had so there here about into over under more most some any all one two'.split(' ')
  );
  const tokens = (text: string) => new Set(normalize(text).split(' ').filter((w) => w.length > 3 && !stop.has(w)));
  const setA = tokens(a);
  const setB = tokens(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const w of setA) if (setB.has(w)) shared += 1;
  return shared / Math.min(setA.size, setB.size);
}

export interface PartScore {
  testId: string;
  partOrder: number;
  testTitle: string;
  /** 0-1 — deterministik dalilga asoslangan umumiy ishonch. */
  score: number;
  answerHits: number;
  answerTotal: number;
  transcriptOverlap: number;
}

/** Bitta nomzodga qarshi dalil to'playdi. Audioscript bo'lsa u ustunlik
 * qiladi (eng ishonchli), bo'lmasa javob kaliti ustma-ustligi ishlatiladi. */
export function scoreTranscriptAgainstPart(transcript: string, candidate: PartCandidate): PartScore {
  const { hits, total, rate } = answerHitRate(transcript, candidate.answers);
  const overlap = candidate.transcript?.trim() ? rareWordOverlap(transcript, candidate.transcript) : 0;
  const questionOverlap = rareWordOverlap(transcript, candidate.questionText || '');

  // Audioscript mavjud bo'lsa unga ko'proq ishonamiz; aks holda javob
  // kaliti + savol matni ustma-ustligi.
  const score = candidate.transcript?.trim()
    ? Math.max(overlap, rate) * 0.7 + Math.min(overlap, rate) * 0.3
    : rate * 0.75 + questionOverlap * 0.25;

  return {
    testId: candidate.testId,
    partOrder: candidate.partOrder,
    testTitle: candidate.testTitle,
    score: Number(score.toFixed(3)),
    answerHits: hits,
    answerTotal: total,
    transcriptOverlap: Number(overlap.toFixed(3)),
  };
}

export function rankCandidates(transcript: string, candidates: PartCandidate[]): PartScore[] {
  return candidates.map((c) => scoreTranscriptAgainstPart(transcript, c)).sort((a, b) => b.score - a.score);
}

// Dalil chegaralari — chatda "o'zi joylashtirsinmi yoki so'rasinmi" qarori
// shularga tayanadi. Ataylab konservativ: noto'g'ri audio to'g'ri testga
// tushib qolsa, buni keyin topish qiyin.
export const MATCH_STRONG = 0.55; // ishonchli mos — AI tasdiqlasa biriktiriladi
export const MATCH_WEAK = 0.2; // bundan past — aniq mos emas

export interface AttachDecision {
  allow: boolean;
  /** Chatda ko'rsatiladigan xulosa (o'zbekcha). */
  note: string;
  /** Tekshiruv umuman mumkin bo'ldimi (transkript + solishtirish manbai). */
  verified: boolean;
}

/**
 * "Biriktirilsinmi?" qarori — ATAYLAB sof funksiya: foydalanuvchi talabining
 * eng nozik joyi shu ("to'g'ri kelsa yuklasin, to'g'ri kelmasa to'g'ri
 * kelmaganligi aytilsin"), shuning uchun qoidalar testda qotirilgan.
 *
 * Mantiq: dalil (javob kaliti ustma-ustligi) va AI xulosasi BIR-BIRINI
 * tekshiradi.
 *  - Tekshirib bo'lmaydigan holat (transkript yo'q, yoki part'da javob
 *    kaliti/audioscript yo'q) — adminning ko'rsatmasi bajariladi, lekin
 *    "tekshirilmadi" deb OCHIQ aytiladi (jim qolish yolg'on bo'lardi).
 *  - Kuchli dalil — AI qarshi bo'lsa ham biriktiriladi (javoblar audioda
 *    so'zma-so'z uchraydi; bu AI taxminidan kuchliroq dalil), lekin
 *    kelishmovchilik aytiladi.
 *  - AI "yo'q" desa va dalil kuchsiz — BIRIKTIRILMAYDI.
 */
export function decideAudioAttachment({
  hasTranscript,
  evidence,
  ai,
  candidateHasReference,
}: {
  hasTranscript: boolean;
  evidence: PartScore | null;
  ai: { matches?: boolean; reason?: string } | null;
  candidateHasReference: boolean;
}): AttachDecision {
  if (!hasTranscript) {
    return { allow: true, verified: false, note: "Audio matnga o'girilmagani uchun avtomatik tekshirib bo'lmadi — ko'rsatmangiz bo'yicha biriktirdim." };
  }
  if (!candidateHasReference) {
    return {
      allow: true,
      verified: false,
      note: "Bu part'da javob kaliti ham, audioscript ham yo'q — solishtirish uchun ma'lumot topilmadi. Ko'rsatmangiz bo'yicha biriktirdim.",
    };
  }

  const score = evidence?.score ?? 0;
  const hits = `${evidence?.answerHits ?? 0}/${evidence?.answerTotal ?? 0}`;

  if (score >= MATCH_STRONG) {
    return {
      allow: true,
      verified: true,
      note:
        ai?.matches === false
          ? `Moslik dalil bilan tasdiqlandi (${hits} javob audioda uchradi), garchi AI shubha bildirgan bo'lsa ham${ai.reason ? `: ${ai.reason}` : ''}.`
          : `Moslik tasdiqlandi: ${hits} javob audioda uchradi.`,
    };
  }

  if (ai?.matches === false) {
    return {
      allow: false,
      verified: true,
      note: `Mos kelmadi: tekshirilgan ${evidence?.answerTotal ?? 0} javobdan atigi ${evidence?.answerHits ?? 0} tasi audioda uchradi.${ai.reason ? ` ${ai.reason}` : ''}`,
    };
  }

  if (score < MATCH_WEAK) {
    return {
      allow: false,
      verified: true,
      note: `Mos kelmadi: tekshirilgan ${evidence?.answerTotal ?? 0} javobdan atigi ${evidence?.answerHits ?? 0} tasi audioda uchradi.`,
    };
  }

  return {
    allow: true,
    verified: true,
    note: `Moslik qisman tasdiqlandi (${hits} javob topildi)${ai?.reason ? ` — ${ai.reason}` : ''}. Ko'rsatmangiz bo'yicha biriktirdim.`,
  };
}

export const AUDIO_VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    matches: { type: 'boolean' },
    confidence: { type: 'number' },
    reason: { type: 'string' },
    suggestedPartOrder: { type: 'integer' },
  },
  required: ['matches', 'confidence', 'reason'],
};

/** Admin AYNAN qaysi part'ni ko'rsatganida ishlatiladigan tekshiruv. */
export function buildAudioVerifyPrompt(transcript: string, candidate: PartCandidate): string {
  return `Quyida (1) admin yuklagan audio faylning avtomatik transkripti va (2) shu audio TEGISHLI deb ko'rsatilgan IELTS Listening part'ining kontenti berilgan.

Vazifang: bu audio HAQIQATAN SHU part'ga tegishlimi — shuni aniqlash.

AUDIO TRANSKRIPTI (avtomatik, xatolari bo'lishi mumkin):
"""
${(transcript || '').slice(0, 12000)}
"""

PART: ${candidate.testTitle} — Part ${candidate.partOrder}
${candidate.contextText ? `Kontekst: ${candidate.contextText}\n` : ''}${candidate.transcript ? `Kitobdagi audioscript:\n"""\n${candidate.transcript.slice(0, 8000)}\n"""\n` : ''}Savollar:
"""
${(candidate.questionText || '').slice(0, 6000)}
"""
JAVOB KALITI: ${candidate.answers.map((a) => `${a.number}) ${a.accepted.join(' / ')}`).join('; ').slice(0, 2000)}

Qoidalar:
- "matches" faqat audio mazmuni shu part'ning savollari/javoblariga MOS kelganda true bo'lsin. Javoblar audioda aytilmagan bo'lsa yoki mavzu butunlay boshqa bo'lsa — false.
- Transkript avtomatik yaratilgani uchun imlo xatolari bo'lishi normal — mazmunga qara, harfma-harf mosligiga emas.
- "reason" — o'zbek tilida, 1-2 jumla, ANIQ dalil bilan (masalan "7 ta javobdan 6 tasi audioda aytilgan" yoki "audio universitet kutubxonasi haqida, part esa mehmonxona bandlovi haqida").
- Agar audio shu TESTGA tegishli, lekin BOSHQA part bo'lsa — "suggestedPartOrder"ga o'sha part raqamini yoz.`;
}

export const AUDIO_PICK_SCHEMA = {
  type: 'object',
  properties: {
    bestTestId: { type: 'string' },
    bestPartOrder: { type: 'integer' },
    confidence: { type: 'number' },
    reason: { type: 'string' },
  },
  required: ['confidence', 'reason'],
};

/** Admin hech narsa ko'rsatmaganda: eng yaqin nomzodni taklif qilish uchun. */
export function buildAudioPickPrompt(transcript: string, candidates: PartCandidate[]): string {
  const list = candidates
    .slice(0, 12)
    .map(
      (c, i) =>
        `${i + 1}. testId=${c.testId} | ${c.testTitle} — Part ${c.partOrder}\n   Kontekst: ${(c.contextText || '—').slice(0, 200)}\n   Savollar: ${(c.questionText || '').slice(0, 400)}\n   Javoblar: ${c.answers.map((a) => a.accepted.join('/')).join(', ').slice(0, 300)}`
    )
    .join('\n');

  return `Quyida admin yuklagan audio faylning transkripti va audio KUTILAYOTGAN (audiosi hali yo'q) Listening part'lari ro'yxati berilgan.

AUDIO TRANSKRIPTI:
"""
${(transcript || '').slice(0, 10000)}
"""

NOMZODLAR:
${list || '(nomzod yo‘q)'}

Vazifang: audio qaysi nomzodga tegishli ekanini aniqla. Ishonching bo'lmasa — "confidence"ni past (0.3 dan kichik) qo'y va bestTestId'ni bo'sh qoldir. TAXMIN BILAN TO'LDIRMA: noto'g'ri audio noto'g'ri testga tushsa, buni keyin topish qiyin. "reason" — o'zbek tilida qisqa izoh.`;
}
