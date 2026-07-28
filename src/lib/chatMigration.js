// Eski uzluksiz "chatHistory"ni yangi ko'p sessiyali "chatSessions" formatiga bir martalik ko'chirish.
// chatSessions allaqachon to'ldirilgan bo'lsa hech narsa qilmaydi (idempotent).
export async function migrateChatHistoryIfNeeded(user) {
  if ((user.chatSessions?.length || 0) > 0) return;
  if (!user.chatHistory || user.chatHistory.length === 0) return;

  user.chatSessions.push({
    title: 'Eski suhbat',
    messages: user.chatHistory.map((m) => ({
      role: m.role,
      parts: m.parts,
      timestamp: m.timestamp,
    })),
  });
  await user.save();
}
