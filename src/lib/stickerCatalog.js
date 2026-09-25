import { StickerPack } from '@/lib/models';
import { STICKER_PACKS, findSticker } from '@/lib/stickers';

// Server-only: statik "Standart" to'plam (src/lib/stickers.js) + admin yaratgan
// to'plamlar (StickerPack) — bitta katalog. Klient faqat shu shaklni ko'radi:
//   packs — tanlash oynasi uchun (faqat faol va o'chirilmagan)
//   extra — o'chirilgan/yashirilgan stikerlar: tanlab bo'lmaydi, lekin eski xabarlarda
//           ko'rinishi uchun kerak (Telegram'da ham o'chirilgan to'plam stikeri qoladi).

export const OBJECT_ID = /^[a-f0-9]{24}$/;

export function customStickerUrl(stickerId) {
  return `/api/stickers/${stickerId}`;
}

function toClientSticker(s) {
  return { id: String(s._id), file: customStickerUrl(s._id), label: s.label || '' };
}

export async function loadStickerCatalog() {
  const docs = await StickerPack.find({}).sort({ order: 1, createdAt: 1 }).lean();
  const packs = STICKER_PACKS.map((p) => ({ id: p.id, name: p.name, builtin: true, stickers: p.stickers }));
  const extra = [];
  for (const pack of docs) {
    const packVisible = pack.active && !pack.deletedAt;
    const visible = [];
    for (const s of pack.stickers || []) {
      if (packVisible && !s.deletedAt) visible.push(toClientSticker(s));
      else extra.push(toClientSticker(s));
    }
    if (packVisible && visible.length) packs.push({ id: String(pack._id), name: pack.name, stickers: visible });
  }
  return { packs, extra };
}

// Xabar yuborishda: stiker mavjud va HOZIR tanlab bo'ladigan bo'lishi shart.
export async function resolveSendableSticker(stickerId) {
  const builtin = findSticker(stickerId);
  if (builtin) return { id: builtin.id };
  if (!OBJECT_ID.test(String(stickerId || ''))) return null;
  const pack = await StickerPack.findOne(
    { 'stickers._id': stickerId, active: true, deletedAt: null },
    { 'stickers.$': 1 }
  ).lean();
  const s = pack?.stickers?.[0];
  if (!s || s.deletedAt) return null;
  return { id: String(s._id) };
}
