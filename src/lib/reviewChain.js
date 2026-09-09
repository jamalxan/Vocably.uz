import { ReviewEvent } from '@/lib/models';

// Zanjir mexanizmi (VOCABLY-TZ.md §6.3) — "oxirgi 7 kunda o'rganilgan so'zlarni oladi" —
// to'liq versiyasi (kunlik cron + mos kontent avtomatik tanlash/yaratish) FAZA doirasidan
// tashqari qoldi (6.3'dagi "Bugungi zanjir" dashboard bloki qurilmadi); lekin uning
// ASOSIY G'OYASI — yaqinda o'rganilgan so'zlarni Reading/Listening matniga to'qish — shu
// funksiya orqali har generate so'rovida ishlatiladi (targetWords sifatida AI promptiga
// qo'shiladi).
export async function getRecentlyLearnedWords(user, { days = 7, limit = 6 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const events = await ReviewEvent.find({ userId: user._id, reviewedAt: { $gte: since } })
    .sort({ reviewedAt: -1 })
    .limit(50)
    .lean();

  const wordIds = [...new Set(events.map((e) => String(e.wordId)))];
  if (wordIds.length === 0) return [];

  const byId = new Map();
  for (const cat of user.categories) {
    for (const w of cat.words) {
      if (wordIds.includes(String(w._id))) byId.set(String(w._id), w.word);
    }
  }
  return wordIds.map((id) => byId.get(id)).filter(Boolean).slice(0, limit);
}
