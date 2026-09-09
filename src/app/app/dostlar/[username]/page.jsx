import DoStlarPanel from '@/components/chat-friends/DoStlarPanel';

// Bevosita havola/push-bildirishnoma orqali ochilganda (masalan Telegram bot
// xabaridagi yoki brauzer push'idagi URL) — DoStlarPanel o'zi useParams() bilan
// [username]'ni o'qib, tegishli suhbatni ochadi (src/components/chat-friends/DoStlarPanel.jsx).
export default function DostlarConversationPage() {
  return (
    <div className="h-full">
      <DoStlarPanel />
    </div>
  );
}
