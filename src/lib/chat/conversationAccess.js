import { Conversation } from '@/lib/models';

// Suhbatni faqat uning ishtirokchisi uchun yuklaydi (aks holda null — route 404 qaytaradi).
// messages va calls route'lari bitta manbadan foydalanadi.
export async function loadConversationForUser(conversationId, userId) {
  if (!/^[a-f0-9]{24}$/i.test(String(conversationId || ''))) return null;
  const convo = await Conversation.findById(conversationId);
  if (!convo) return null;
  if (!convo.participantIds.some((id) => String(id) === String(userId))) return null;
  return convo;
}
