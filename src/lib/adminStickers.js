import { StickerPack } from '@/lib/models';
import { customStickerUrl } from '@/lib/stickerCatalog';

// Admin stiker API'lari uchun umumiy yordamchilar (server-only).

export const MAX_STICKERS_PER_PACK = 120; // Telegram ham bitta to'plamga 120 ta
export const MAX_PACK_NAME = 64;
export const MAX_STICKER_LABEL = 40;

export function serializeAdminPack(pack) {
  return {
    id: String(pack._id),
    name: pack.name,
    active: !!pack.active,
    order: pack.order || 0,
    createdAt: pack.createdAt,
    stickers: (pack.stickers || [])
      .filter((s) => !s.deletedAt)
      .map((s) => ({ id: String(s._id), label: s.label || '', mimeType: s.mimeType, file: customStickerUrl(s._id) })),
  };
}

export async function listAdminPacks() {
  const packs = await StickerPack.find({ deletedAt: null }).sort({ order: 1, createdAt: 1 }).lean();
  return packs.map(serializeAdminPack);
}

export async function findLivePack(packId) {
  if (!/^[a-f0-9]{24}$/.test(String(packId || ''))) return null;
  return StickerPack.findOne({ _id: packId, deletedAt: null });
}
