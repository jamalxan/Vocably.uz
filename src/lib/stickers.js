// Boshlang'ich stiker to'plami — statik SVG fayllar (public/stickers/), original dizayn
// (Telegram/Apple stikerlari nusxalanmagan — mualliflik huquqi). DB kolleksiyasi shart
// emas: kelajakda admin qo'shimcha to'plam yuklashi kerak bo'lsa, shu manifestga (yoki
// MinIO-asoslangan yangi to'plamga) o'sha paytda o'tiladi.
export const STICKER_PACKS = [
  {
    id: 'vocably-classic',
    name: 'Vocably',
    stickers: [
      { id: 'thumbs-up', file: '/stickers/vocably-classic/thumbs-up.svg', label: "Zo'r" },
      { id: 'heart', file: '/stickers/vocably-classic/heart.svg', label: 'Sevgi' },
      { id: 'laugh', file: '/stickers/vocably-classic/laugh.svg', label: 'Kulgi' },
      { id: 'wow', file: '/stickers/vocably-classic/wow.svg', label: 'Ajablanish' },
      { id: 'sad', file: '/stickers/vocably-classic/sad.svg', label: "Xafa" },
      { id: 'fire', file: '/stickers/vocably-classic/fire.svg', label: 'Alanga' },
      { id: 'clap', file: '/stickers/vocably-classic/clap.svg', label: 'Qarsak' },
      { id: 'sleep', file: '/stickers/vocably-classic/sleep.svg', label: 'Uyqu' },
      { id: 'star-eyes', file: '/stickers/vocably-classic/star-eyes.svg', label: "Hayratlanish" },
      { id: 'wave', file: '/stickers/vocably-classic/wave.svg', label: 'Salom' },
      { id: 'think', file: '/stickers/vocably-classic/think.svg', label: "O'ylash" },
      { id: 'party', file: '/stickers/vocably-classic/party.svg', label: 'Bayram' },
    ],
  },
];

const STICKER_INDEX = new Map();
for (const pack of STICKER_PACKS) {
  for (const s of pack.stickers) STICKER_INDEX.set(s.id, { ...s, packId: pack.id });
}

export function findSticker(id) {
  return STICKER_INDEX.get(id) || null;
}
