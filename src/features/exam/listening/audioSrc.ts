// PERF-03 (audio audit, 2026-09-24) — Listening part audio endi ikkita
// manba bo'lishi mumkin: siqilmagan ORIGINAL (`audioUrl`, to'liq playable
// manzil) va ixtiyoriy siqilgan Opus DERIVATIV (`audioDerivativeId`, faqat
// GridFS fileId — to'liq URL emas, chunki `audioUrl` eski kontent uchun
// GridFS bo'lmasligi ham mumkin, masalan static `/audio/exam/...`).
//
// Bu funksiya `ListeningSection.tsx`/`ListeningPracticeSection.tsx` ikkalasida
// ham AudioEngine'ga beriladigan `src`ni bir xil qoidaga ko'ra hisoblaydi:
// derivativ mavjud bo'lsa — shu (10-20x kichikroq yuklama), aks holda
// original (worker pipeline'dan OLDIN nashr qilingan 4 ta testda derivativ
// yo'q — shaffof ravishda originalga qaytadi).
export interface ListeningPartAudioRef {
  audioUrl: string;
  audioDerivativeId?: string;
}

export function resolveListeningAudioSrc(part: ListeningPartAudioRef): string {
  return part.audioDerivativeId ? `/api/exam/audio/${part.audioDerivativeId}` : part.audioUrl;
}
