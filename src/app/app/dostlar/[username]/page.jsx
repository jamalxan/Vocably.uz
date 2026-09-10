import DoStlarPanel from '@/components/chat-friends/DoStlarPanel';

// Bevosita havola/push-bildirishnoma orqali ochilganda (masalan Telegram bot
// xabaridagi yoki brauzer push'idagi URL) — DoStlarPanel o'zi useParams() bilan
// [username]'ni o'qib, tegishli suhbatni ochadi (src/components/chat-friends/DoStlarPanel.jsx).
export default function DostlarConversationPage() {
  // TZ-vocably-v2.md BUG-023 — src/app/app/dostlar/page.jsx'dagi bilan bir xil
  // tuzatish (izoh o'sha yerda): h-full o'rniga flex-1 min-h-0 flex flex-col.
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <DoStlarPanel />
    </div>
  );
}
