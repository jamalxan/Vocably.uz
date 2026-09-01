'use client';
import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

function DoStlarShell({ onActiveChange }) {
  const { activeConversation, selectConversation, closeConversation, openConversationByUsername } = useChat();
  const params = useParams();
  const router = useRouter();

  // /dashboard/friends/[username] — chatAccess'i bor HAR QANDAY (mavjud username'li)
  // foydalanuvchi uchun to'g'ridan-to'g'ri havola: /api/chat/conversations POST
  // username bo'yicha suhbatni topadi yoki yaratadi, shuning uchun bu username
  // qidiruv orqali "Yozish"ni bosishning aynan o'zi — faqat URL orqali ham
  // ishga tushiriladi.
  const segments = Array.isArray(params?.segments) ? params.segments : [];
  const onFriendsRoute = segments[0] === 'friends';
  const routeUsername = onFriendsRoute ? segments[1] || null : null;
  const prevActiveUsernameRef = useRef(null);

  // URL -> holat: to'g'ridan-to'g'ri havola, sahifa yangilash yoki brauzer
  // orqaga/oldinga tugmasi bilan kelgan username bo'yicha suhbatni ochamiz.
  useEffect(() => {
    if (!routeUsername) return;
    if (activeConversation?.otherUser?.username === routeUsername) return;
    let cancelled = false;
    openConversationByUsername(routeUsername).then((res) => {
      if (!cancelled && res?.error) {
        alert(res.error);
        router.replace('/dashboard/friends');
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUsername]);

  // Holat -> URL: ro'yxatdan bosish yoki username qidiruvi orqali suhbat
  // ochilganda/yopilganda URL'ni shunga moslaymiz. Faqat Do'stlar bo'limida
  // ekanimizda (panel boshqa bo'limga o'tilganda ham mount holida qolaveradi,
  // shunda socket qayta ulanmaydi — o'sha holatda URL'ga tegmaymiz).
  useEffect(() => {
    if (!onFriendsRoute) {
      prevActiveUsernameRef.current = activeConversation?.otherUser?.username || null;
      return;
    }
    const uname = activeConversation?.otherUser?.username || null;
    if (uname) {
      if (uname !== routeUsername) router.replace(`/dashboard/friends/${uname}`);
    } else if (prevActiveUsernameRef.current && routeUsername) {
      router.replace('/dashboard/friends');
    }
    prevActiveUsernameRef.current = uname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation, onFriendsRoute]);

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
