// Katta fayllarni bo'laklab yuklash (Vercel so'rov chegarasi ~4.5 MB): klient faylni PART_BYTES li qismlarga bo'lib yuboradi,
// server ularni vaqtincha saqlaydi va oxirida yig'adi. Sof tekshiruv — I/O `server/factoryService.js` da.
export const PART_BYTES = 3 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_PARTS = Math.ceil(MAX_UPLOAD_BYTES / PART_BYTES);

const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

export interface PartMeta {
  uploadId: string;
  index: number;
  total: number;
  size: number;
}

export type PartCheck = { ok: true; meta: PartMeta } | { ok: false; error: string; code: string };

/** Yuklanayotgan bitta qismning meta-ma'lumotini tekshiradi. */
export function validatePart(input: { uploadId?: unknown; index?: unknown; total?: unknown; size?: unknown }): PartCheck {
  const uploadId = String(input.uploadId ?? '');
  if (!ID_RE.test(uploadId)) return { ok: false, error: "uploadId noto'g'ri", code: 'bad_upload_id' };
  const index = Number(input.index);
  const total = Number(input.total);
  const size = Number(input.size);
  if (!Number.isInteger(total) || total < 1 || total > MAX_PARTS) return { ok: false, error: `Qismlar soni 1–${MAX_PARTS} bo'lishi kerak`, code: 'bad_total' };
  if (!Number.isInteger(index) || index < 0 || index >= total) return { ok: false, error: "Qism tartib raqami noto'g'ri", code: 'bad_index' };
  if (!Number.isFinite(size) || size <= 0 || size > PART_BYTES) return { ok: false, error: `Qism hajmi 1 bayt – ${PART_BYTES / 1024 / 1024} MB bo'lishi kerak`, code: 'bad_size' };
  return { ok: true, meta: { uploadId, index, total, size } };
}

/** Barcha qismlar kelganmi va umumiy hajm chegaradan oshmaganmi (yig'ishdan oldin). */
export function checkComplete(parts: Array<{ index: number; size: number }>, total: number): { ok: true; bytes: number } | { ok: false; error: string; code: string } {
  const have = new Set(parts.map((p) => p.index));
  for (let i = 0; i < total; i++) if (!have.has(i)) return { ok: false, error: `${i + 1}-qism yetishmayapti — yuklashni qayta boshlang`, code: 'missing_part' };
  if (parts.length !== total) return { ok: false, error: 'Qismlar soni mos kelmadi', code: 'part_count' };
  const bytes = parts.reduce((s, p) => s + p.size, 0);
  if (bytes > MAX_UPLOAD_BYTES) return { ok: false, error: `Fayl juda katta (maks ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)`, code: 'too_large' };
  return { ok: true, bytes };
}

/** Klient tomon: fayl hajmidan qismlar chegaralarini hisoblaydi. */
export function splitRanges(fileSize: number, partBytes = PART_BYTES): Array<{ start: number; end: number }> {
  const out: Array<{ start: number; end: number }> = [];
  for (let start = 0; start < fileSize; start += partBytes) out.push({ start, end: Math.min(fileSize, start + partBytes) });
  return out;
}
