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

// "typing" socket hodisasining `kind`i -> ConversationView/ConversationList'da
// ko'rsatiladigan matn (Composer'da yozish, VoiceRecorder/VideoRecorder'da
// yozib turish uchun bir xil "typing" kanali ishlatiladi, faqat matni farq qiladi).
export const TYPING_LABEL = {
  text: 'yozmoqda...',
  voice: 'ovoz yubormoqda...',
  video: 'video yubormoqda...',
};

// Matnsiz (media/stiker) xabarlar uchun suhbatlar ro'yxatidagi qisqa preview —
// src/app/api/chat/conversations/[id]/messages/route.js (yangi xabar yozilganda)
// va .../[messageId]/route.js (C-02 — o'chirilgandan keyin qayta hisoblashda)
// ikkalasi ham shu bitta manbadan foydalanadi (ikkitasi mos kelmay qolmasin).
export const PREVIEW_BY_TYPE = {
  image: '📷 Rasm',
  video: '🎬 Video',
  voice: '🎤 Ovozli xabar',
  file: '📎 Fayl',
  sticker: '😊 Stiker',
};
