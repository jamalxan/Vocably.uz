import DoStlarPanel from '@/components/chat-friends/DoStlarPanel';

// DoStlarPanel (va uning ichidagi ChatProvider) layout'da — /app/dostlar va
// /app/dostlar/[username] orasida o'tilganda qayta mount bo'lmaydi (socket, kesh,
// ochiq suhbat saqlanadi). Sahifalar o'zi hech narsa chizmaydi.
// BUG-023: h-full o'rniga flex-1 min-h-0 flex flex-col (AppShell <main> flex konteyner).
export default function DostlarLayout({ children }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <DoStlarPanel />
      {children}
    </div>
  );
}
