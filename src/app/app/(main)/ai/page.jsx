'use client';
import { useState } from 'react';
import AiChat from '@/components/AiChat';
import AiChatSessionsPanel from '@/components/chat/AiChatSessionsPanel';

// U3 (VOCABLY-TZ.md 1.2/12.1) tuzatildi: ilgari AI Chat'ga o'tilganda BUTUN asosiy
// navigatsiya suhbatlar ro'yxatiga almashardi. Endi AppShell har doim barqaror —
// bu sahifa faqat o'z ichida (kontent maydonida) ikkinchi ustun sifatida suhbatlar
// ro'yxatini ko'rsatadi, mobilda esa AiChat sarlavhasidagi tugma bilan ochiladigan drawer
// (alohida "AI Chat" satri olib tashlandi — ekranda uchta sarlavha ustma-ust turardi).
export default function AiPage() {
  const [sessionsOpen, setSessionsOpen] = useState(false);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 flex">
        <AiChatSessionsPanel sidebarOpen={sessionsOpen} setSidebarOpen={setSessionsOpen} />
        <div className="flex-1 min-h-0 min-w-0">
          <AiChat onOpenSessions={() => setSessionsOpen(true)} />
        </div>
      </div>
    </div>
  );
}
