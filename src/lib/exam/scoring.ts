// IELTS Academic xom ball -> band konversiyasi. github.com/jamalxan/Everest-Mock
// backend/scoring.py'dan SO'ZMA-SO'Z portlangan — jadvallar keng e'lon qilingan
// taxminiy IELTS Academic Listening/Reading konversiyasi (40 savoldan).
//
// Umumiy band = 4 bo'lim bandining o'rtachasi, rasmiy IELTS yarim-band qoidasi
// bilan yaxlitlanadi (.25 -> .5 ga, .75 -> keyingi butun songa).

type BandRow = [number, number, number]; // [min_raw, max_raw, band]

const LISTENING_TABLE: BandRow[] = [
  [39, 40, 9.0],
  [37, 38, 8.5],
  [35, 36, 8.0],
  [32, 34, 7.5],
  [30, 31, 7.0],
  [26, 29, 6.5],
  [23, 25, 6.0],
  [18, 22, 5.5],
  [16, 17, 5.0],
  [13, 15, 4.5],
  [10, 12, 4.0],
  [6, 9, 3.5],
  [4, 5, 3.0],
  [3, 3, 2.5],
  [2, 2, 2.0],
  [1, 1, 1.0],
  [0, 0, 0.0],
];

const READING_TABLE: BandRow[] = [
  [39, 40, 9.0],
  [37, 38, 8.5],
  [35, 36, 8.0],
  [33, 34, 7.5],
  [30, 32, 7.0],
  [27, 29, 6.5],
  [23, 26, 6.0],
  [19, 22, 5.5],
  [15, 18, 5.0],
  [13, 14, 4.5],
  [10, 12, 4.0],
  [8, 9, 3.5],
  [6, 7, 3.0],
  [4, 5, 2.5],
  [3, 3, 2.0],
  [1, 2, 1.0],
  [0, 0, 0.0],
];

function lookup(table: BandRow[], raw: number): number {
  const r = Math.max(0, Math.trunc(raw));
  for (const [lo, hi, band] of table) {
    if (r >= lo && r <= hi) return band;
  }
  return table[0][2]; // jadvaldan yuqori -> eng yuqori band
}

export function listeningBand(rawCorrect: number): number {
  return lookup(LISTENING_TABLE, rawCorrect);
}

export function readingBand(rawCorrect: number): number {
  return lookup(READING_TABLE, rawCorrect);
}

/** Rasmiy IELTS yaxlitlash: .25 -> .5, .75 -> keyingi butun. */
export function roundOverall(avg: number): number {
  const base = Math.floor(avg);
  const frac = avg - base;
  if (frac < 0.25) return base;
  if (frac < 0.75) return base + 0.5;
  return base + 1;
}

export type SectionBands = {
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
};

/** Mavjud (null bo'lmagan) bo'lim bandlarining o'rtachasini oladi va yaxlitlaydi —
 * Writing/Speaking hali baholanmagan bo'lsa ham qisman umumiy ball ko'rsatish uchun. */
export function overallBand(sectionBands: SectionBands): number | null {
  const vals = Object.values(sectionBands).filter((b): b is number => b != null);
  if (vals.length === 0) return null;
  return roundOverall(vals.reduce((a, b) => a + b, 0) / vals.length);
}
