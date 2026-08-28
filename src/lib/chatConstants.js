// Do'stlar bo'limi uchun umumiy konstantalar — ham server (src/lib/chatAuth.js
// requireChatUser'dagi "oxirgi faol" throttle), ham client (src/lib/presence.js
// onlayn/oflayn hisoblash) tomonidan ishlatiladi. Shuning uchun bu faylda
// mongoose/DB kabi server-only import BO'LMASLIGI SHART — client bundle'ga
// to'g'ridan-to'g'ri import qilinadi (masalan ConversationList.jsx).
export const LAST_ACTIVE_THROTTLE_MS = 2 * 60 * 1000;

// Message.type -> qisqa yorliq — media xabarlarda matn yo'q, shuning uchun
// javob (reply) iqtibosida va tahrirlash-taqiqlangan holatlarda shu ko'rsatiladi
// (MessageBubble.jsx'dagi ReplyQuote va Composer.jsx'dagi javob paneli ishlatadi).
export const REPLY_TYPE_LABEL = {
  image: '📷 Rasm',
  video: '🎬 Video',
  voice: '🎤 Ovozli xabar',
  file: '📎 Fayl',
  sticker: '😊 Stiker',
};
