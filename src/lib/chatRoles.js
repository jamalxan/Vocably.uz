// Gemini 3.x API faqat 'user' va 'model' rollarini qabul qiladi. Eski `@google/generative-ai`
// SDK konvensiyasi (va ba'zi eski yozuvlar) 'function' / 'tool' / 'assistant' rollarini ishlatgan —
// ular modelga uzatilsa "[400] Role 'function' is not supported" xatoligi qaytadi.

const ROLE_ALIASES = {
  user: 'user',
  human: 'user',
  function: 'user', // funksiya natijasi Gemini 3.x da user turi sifatida yuboriladi
  tool: 'user',
  model: 'model',
  assistant: 'model',
  ai: 'model',
  bot: 'model',
};

const VALID_ROLES = ['user', 'model'];

// Ixtiyoriy rolni Gemini qabul qiladigan 'user' | 'model' ga keltiradi.
// Tanib bo'lmagan rol uchun null qaytaradi — chaqiruvchi bunday xabarni tashlab ketishi kerak.
export function normalizeRole(role) {
  if (!role) return null;
  return ROLE_ALIASES[String(role).toLowerCase()] || null;
}

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

// Saqlangan sessiya xabarlaridan modelga uzatiladigan `contents` massivini quradi.
// - roli tanib bo'lmagan (eski/buzuq) yozuvlar tashlab ketiladi, chat butunlay ishlamay qolmasin;
// - bo'sh matnli xabarlar ham tashlanadi (Gemini bo'sh part'ni rad etadi);
// - tarix 'model' bilan boshlanishi mumkin emas, shuning uchun boshidagi model xabarlari kesiladi.
export function buildGeminiHistory(messages = []) {
  const history = [];

  for (const m of messages) {
    const role = normalizeRole(m?.role);
    if (!role) continue;

    // Tarixni qayta tuzishda rasmlarni qayta yubormaymiz (og'irligi katta) — matnli belgi qoldiramiz.
    const rawText = (m.parts || []).map((p) => p?.text || '').join('').trim();
    const imageCount = (m.imageUrls?.length || 0) + (m.imageUrl ? 1 : 0);
    const text = imageCount > 0 ? `${rawText} [${imageCount} ta rasm yuborilgan edi]`.trim() : rawText;
    if (!text) continue;

    history.push({ role, parts: [{ text }] });
  }

  while (history.length > 0 && history[0].role !== 'user') history.shift();
  return history;
}

// Xuddi shu tarixni Groq/OpenRouter (OpenAI bilan mos /chat/completions) formatiga quradi:
// rol nomlari boshqacha ('model' -> 'assistant') va content matn (obyekt emas).
export function buildOpenAiHistory(messages = []) {
  const history = [];

  for (const m of messages) {
    const role = normalizeRole(m?.role);
    if (!role) continue;

    const rawText = (m.parts || []).map((p) => p?.text || '').join('').trim();
    const imageCount = (m.imageUrls?.length || 0) + (m.imageUrl ? 1 : 0);
    const text = imageCount > 0 ? `${rawText} [${imageCount} ta rasm yuborilgan edi]`.trim() : rawText;
    if (!text) continue;

    history.push({ role: role === 'model' ? 'assistant' : 'user', content: text });
  }

  while (history.length > 0 && history[0].role !== 'user') history.shift();
  return history;
}
