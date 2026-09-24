// Chatga tashlangan fayl NIMA ekanini aniqlash — sof funksiya, birlik testi
// bilan qoplangan. `src/lib/contentAgent/sourceFormat.ts` faqat PDF/DOCX
// (kitob pipeline'i uchun) biladi; chat esa ISTALGAN faylni qabul qiladi va
// o'zi qaror qiladi, shuning uchun bu kengroq ro'yxat.
export type AttachmentKind = 'document' | 'audio' | 'image' | 'text' | 'unsupported';

export interface DetectedAttachment {
  kind: AttachmentKind;
  /** `document` uchun qaysi parser kerakligi. */
  documentFormat?: 'pdf' | 'docx' | 'text';
  /** `unsupported` uchun adminga ko'rsatiladigan sabab. */
  reason?: string;
}

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Hajm chegaralari. Fayl bo'lak-bo'lak (~3MB) yuklanadi, ya'ni Vercel'ning
// so'rov tanasi chegarasi cheklamaydi — lekin yig'ilgan bufer serverless
// xotirasiga sig'ishi kerak, shuning uchun baribir chegara bor.
export const MAX_BYTES: Record<AttachmentKind, number> = {
  document: 60 * 1024 * 1024,
  audio: 60 * 1024 * 1024,
  image: 15 * 1024 * 1024,
  text: 5 * 1024 * 1024,
  unsupported: 0,
};

// Groq Whisper (`transcribeAudio`) so'rov chegarasi ~25MB — bundan katta
// audio yuklanaveradi, lekin transkripsiyasiz (ya'ni "qaysi listening uchun"
// tekshiruvini AVTOMATIK qila olmaymiz, adminning o'zi ko'rsatishi kerak).
export const MAX_TRANSCRIBE_BYTES = 24 * 1024 * 1024;

function extensionOf(filename: string): string {
  const match = /\.([a-z0-9]+)$/i.exec((filename || '').trim());
  return match ? match[1].toLowerCase() : '';
}

export function detectAttachment(filename: string, mimeType: string): DetectedAttachment {
  const mime = (mimeType || '').toLowerCase().split(';')[0].trim();
  const ext = extensionOf(filename);

  if (mime === PDF_MIME || ext === 'pdf') return { kind: 'document', documentFormat: 'pdf' };
  if (mime === DOCX_MIME || ext === 'docx') return { kind: 'document', documentFormat: 'docx' };
  if (mime === 'text/plain' || mime === 'text/markdown' || ['txt', 'md'].includes(ext)) {
    return { kind: 'text', documentFormat: 'text' };
  }
  if (mime.startsWith('audio/') || ['mp3', 'm4a', 'wav', 'ogg', 'opus', 'aac', 'flac', 'webm'].includes(ext)) {
    return { kind: 'audio' };
  }
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
    return { kind: 'image' };
  }
  if (mime.startsWith('video/') || ['mp4', 'mov', 'mkv', 'avi'].includes(ext)) {
    // Video ATAYLAB qo'llab-quvvatlanmaydi: audio yo'lini ajratib olish
    // ffmpeg talab qiladi, u esa Vercel serverless muhitida yo'q (shu sabab
    // butun worker alohida Docker'da rejalashtirilgan). Yarim ishlaydigan
    // yechim o'rniga — aniq va halol rad javob.
    return {
      kind: 'unsupported',
      reason: "Video fayl qo'llab-quvvatlanmaydi. Listening uchun audio faylni (mp3/m4a/wav) alohida tashlang.",
    };
  }
  if (mime === 'application/msword' || ext === 'doc') {
    return { kind: 'unsupported', reason: "Eski .doc formati o'qilmaydi — faylni .docx yoki PDF sifatida saqlab qayta tashlang." };
  }
  return { kind: 'unsupported', reason: `Bu fayl turi (${mime || ext || "noma'lum"}) qo'llab-quvvatlanmaydi. PDF, DOCX, TXT, audio yoki rasm tashlang.` };
}

export function exceedsSizeLimit(kind: AttachmentKind, bytes: number): boolean {
  return bytes > (MAX_BYTES[kind] ?? 0);
}

export function humanSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
