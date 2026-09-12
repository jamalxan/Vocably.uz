'use client';
import { useState } from 'react';
import { PanelLeft } from 'lucide-react';
import AiChat from '@/components/AiChat';
import AiChatSessionsPanel from '@/components/chat/AiChatSessionsPanel';
import IconButton from '@/components/ui/IconButton';

// U3 (VOCABLY-TZ.md 1.2/12.1) tuzatildi: ilgari AI Chat'ga o'tilganda BUTUN asosiy
// navigatsiya suhbatlar ro'yxatiga almashardi. Endi AppShell har doim barqaror —
// bu sahifa faqat o'z ichida (kontent maydonida) ikkinchi ustun sifatida suhbatlar
// ro'yxatini ko'rsatadi, mobilda esa tepadagi tugma bilan ochiladigan drawer.
export default function AiPage() {
  const [sessionsOpen, setSessionsOpen] = useState(false);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="lg:hidden px-4 py-2.5 border-b border-border flex items-center gap-2 flex-shrink-0">
        <IconButton icon={PanelLeft} label="Suhbatlar ro'yxati" onClick={() => setSessionsOpen(true)} />
        <span className="text-sm font-medium text-ink">AI Chat</span>
      </div>
      <div className="flex-1 min-h-0 flex">
        <AiChatSessionsPanel sidebarOpen={sessionsOpen} setSidebarOpen={setSessionsOpen} />
        <div className="flex-1 min-h-0">
          <AiChat />
        </div>
      </div>
    </div>
  );
}
