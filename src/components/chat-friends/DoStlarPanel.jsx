'use client';
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

function DoStlarShell({ onActiveChange }) {
  const { activeConversation, selectConversation, closeConversation } = useChat();

  // Ota komponentga (dashboard/page.jsx) qaysi suhbat ochiqligini bildiradi — mobil
  // ekranda tashqi sahifa header'ini yashirish uchun ishlatiladi (ConversationView'ning
  // o'z header'i + orqaga strelkasi bilan ikkita sarlavha bir vaqtda ko'rinmasin).
  useEffect(() => {
    onActiveChange?.(!!activeConversation);
  }, [activeConversation, onActiveChange]);
  useEffect(() => () => onActiveChange?.(false), [onActiveChange]);

  // Ramka/karta yo'q — panel to'g'ridan-to'g'ri sahifaning o'zi (header ostida davom
  // etadi), WhatsApp Web/Telegram Web uslubida. Ro'yxat va suhbat orasidagi yagona
  // chegara — ConversationList'ning o'z border-r'i (pastda).
  return (
    <div className="flex h-full">
      <div className={`${activeConversation ? 'hidden lg:flex' : 'flex'} flex-col h-full w-full lg:w-auto`}>
        <ConversationList onSelect={selectConversation} selectedId={activeConversation?.id} />
      </div>
      <div className={`${activeConversation ? 'flex' : 'hidden lg:flex'} flex-1 min-w-0`}>
        <ConversationView onBack={closeConversation} />
      </div>
    </div>
  );
}

// Do'stlar bo'limi — faqat chatAccess=true bo'lganda mount qilinadi (Sidebar shu
// tekshiruvni allaqachon qiladi, bu yerda yana bir marta — himoyaning ikkinchi qatlami).
export default function DoStlarPanel({ onActiveChange }) {
  const { token, chatAccess } = useApp();

  if (!chatAccess) {
    return <p className="text-sm text-muted text-center py-12">Bu bo'lim uchun ruxsatingiz yo'q.</p>;
  }

  return (
    <ChatProvider token={token}>
      <DoStlarShell onActiveChange={onActiveChange} />
    </ChatProvider>
  );
}
