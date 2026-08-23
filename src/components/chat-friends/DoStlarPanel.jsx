'use client';
import { useApp } from '@/context/AppContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

function DoStlarShell() {
  const { activeConversation, selectConversation, closeConversation } = useChat();

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[420px] bg-white rounded-2xl border border-slate-100 overflow-hidden">
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
export default function DoStlarPanel() {
  const { token, chatAccess } = useApp();

  if (!chatAccess) {
    return <p className="text-sm text-slate-400 text-center py-12">Bu bo'lim uchun ruxsatingiz yo'q.</p>;
  }

  return (
    <ChatProvider token={token}>
      <DoStlarShell />
    </ChatProvider>
  );
}
