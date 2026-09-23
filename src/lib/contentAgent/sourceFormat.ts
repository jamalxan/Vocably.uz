// §50.2 (VOCABLY_TZ_V2_LIVE_AUDIT_2026-09-22.md) — "Faqat application/pdf
// (bitta fayl) + audio/*; DOCX/ZIP/EPUB/image yo'q." Bu sessiyada faqat
// DOCX qo'shildi (EPUB/ZIP/image — yangi, sinalmagan parser kutubxonalari
// talab qiladi, namuna fayl yo'q — alohida ish). `mammoth` — .docx uchun
// yetuk, npm'dan o'rnatiladigan kutubxona, yangi API kalit shart emas.
//
// Sof, deterministik funksiya: fayl nomi/MIME turi -> qaysi parser
// ishlatilishi kerak. `src/lib/`da (worker/lib/da EMAS) ISHLATILADI —
// worker HAM, Next.js admin API HAM `@/lib/...` orqali murojaat qiladi
// (worker/stages/*.ts ALLAQACHON shu naqshni ishlatadi — masalan
// `@/lib/models`, `@/lib/storage/r2`; teskarisi — src/app'ning worker/'dan
// import qilishi — bu kodda hech qayerda YO'Q, shuning uchun bu funksiya
// ATAYLAB shu yerda, worker/lib/da emas). Ikkala joyda ham ishlatiladi:
//  - `src/app/api/admin/books/route.js` — yuklashda validatsiya/`kind`.
//  - `worker/stages/extract.ts`/`extractImages.ts` — qaysi matn
//    ajratuvchini (`pdf.ts` yoki `docx.ts`) chaqirish kerakligini aniqlash
//    uchun (ContentAsset'ning saqlangan `storage.contentType`/
//    `storage.key`idan).
export type SourceFormat = 'pdf' | 'docx';

export const SOURCE_FORMAT_MIME: Record<SourceFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** `filename`dagi kengaytma (masalan "source.docx" -> "docx"), kichik
 * harfda, nuqtasiz. Kengaytma yo'q/aniqlab bo'lmasa `null`. */
function extOf(filename?: string | null): string | null {
  if (!filename) return null;
  const match = /\.([a-z0-9]+)$/i.exec(filename.trim());
  return match ? match[1].toLowerCase() : null;
}

/** `mimeType`ni solishtirish uchun tozalaydi — parametrlarni (";
 * charset=..." kabi) va bo'sh joy/registrni olib tashlaydi. */
function normalizeMime(mimeType?: string | null): string {
  return (mimeType || '').split(';')[0].trim().toLowerCase();
}

/** Fayl nomi va/yoki MIME turi asosida qaysi manba formatini (demak, qaysi
 * matn-ajratuvchi parserni) ishlatish kerakligini aniqlaydi. MIME turi
 * ANIQ mos kelsa shunga ishoniladi (eng ishonchli signal); aks holda fayl
 * kengaytmasiga qaytiladi (masalan brauzer/klient noto'g'ri/umumiy MIME
 * yuborgan holatlar uchun, masalan "application/octet-stream"). Ikkalasi
 * ham mos kelmasa/yo'q bo'lsa — `null` (noma'lum format, rad etilishi
 * kerak). */
export function detectSourceFormat(input: { filename?: string | null; mimeType?: string | null }): SourceFormat | null {
  const mimeType = normalizeMime(input.mimeType);
  if (mimeType === SOURCE_FORMAT_MIME.pdf) return 'pdf';
  if (mimeType === SOURCE_FORMAT_MIME.docx) return 'docx';

  const ext = extOf(input.filename);
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';

  return null;
}
