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

  // /app/dostlar/[username] — chatAccess'i bor HAR QANDAY (mavjud username'li)
  // foydalanuvchi uchun to'g'ridan-to'g'ri havola: /api/chat/conversations POST
  // username bo'yicha suhbatni topadi yoki yaratadi, shuning uchun bu username
  // qidiruv orqali "Yozish"ni bosishning aynan o'zi — faqat URL orqali ham
  // ishga tushiriladi. Ilgari (yagona catch-all route paytida) bu qiymat
  // params.segments'dan ajratib olinardi; endi haqiqiy dinamik route bor
  // (src/app/app/dostlar/[username]/page.jsx), shuning uchun to'g'ridan-to'g'ri
  // params.username.
  const routeUsername = params?.username || null;
  const prevActiveUsernameRef = useRef(null);
  const prevRouteUsernameRef = useRef(routeUsername);

  // URL -> holat: to'g'ridan-to'g'ri havola, sahifa yangilash yoki brauzer
  // orqaga/oldinga tugmasi bilan kelgan username bo'yicha suhbatni ochamiz.
  useEffect(() => {
    const prevRoute = prevRouteUsernameRef.current;
    prevRouteUsernameRef.current = routeUsername;
    if (!routeUsername) {
      // Panel endi layout'da (qayta mount bo'lmaydi) — /app/dostlar/x dan /app/dostlar'ga
      // (orqaga tugmasi yoki nav havolasi) o'tilsa, ochiq suhbatni yopamiz.
      if (prevRoute && activeConversation) closeConversation();
      return undefined;
    }
    if (activeConversation?.otherUser?.username === routeUsername) return;
    let cancelled = false;
    openConversationByUsername(routeUsername).then((res) => {
      if (!cancelled && res?.error) {
        alert(res.error);
        router.replace('/app/dostlar');
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUsername]);

  // Holat -> URL: ro'yxatdan bosish yoki username qidiruvi orqali suhbat
  // ochilganda/yopilganda URL'ni shunga moslaymiz.
  //
  // MUHIM (avvalgi xato manbai): ro'yxatdan ketma-ket ikkita (yoki undan ko'p)
  // suhbatga TEZ bosilsa, har bir bosish shu effektni qayta ishga tushirib,
  // o'zining `router.replace()` chaqiruvini yuborardi — ikkinchisi birinchisi
  // hali tugamasdan (Next.js RSC navigatsiyasi tarmoq orqali ketayotganda)
  // boshlanardi. Next.js App Router'da ikkita navigatsiya shunday bir-birining
  // ustiga chiqib qolsa, ba'zan yumshoq (client-side) o'tish o'rniga BUTUN
  // sahifani qayta yuklashga (hard/MPA reload) tushib qolar edi — aynan
  // "chat ochilganda sahifa yangilanadi" muammosi shundan edi. Shuning uchun
  // bu yerda darhol emas, holat bir necha o'n millisekund davomida "tinch"
  // turgandan keyingina (debounce) bitta marta yo'naltiramiz — tez-tez
  // almashtirishlar bitta, oxirgi navigatsiyaga birlashtiriladi.
  useEffect(() => {
    const uname = activeConversation?.otherUser?.username || null;
    const timer = setTimeout(() => {
      if (uname) {
        if (uname !== routeUsername) router.replace(`/app/dostlar/${uname}`);
      } else if (prevActiveUsernameRef.current && routeUsername) {
        router.replace('/app/dostlar');
      }
      prevActiveUsernameRef.current = uname;
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation]);

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
  // TZ-vocably-v2.md BUG-023 — `h-full` zanjiri o'rniga `flex-1 min-h-0`: ota
  // (dostlar/page.jsx) endi flex konteyner bo'lgani uchun bu div balandlikni
  // foiz orqali emas, flex-item sifatida oladi. Ichkaridagi ikkita ustun (ro'yxat
  // va suhbat) o'z balandligini shu qatorning "stretch" (standart) xatti-harakati
  // orqali oladi — shuning uchun ularda alohida h-full/height kerak emas, faqat
  // `min-h-0` (aks holda ichidagi uzun ro'yxat/xabarlar ustunni majburan cho'zib
  // yuboradi).
  return (
    <div className="flex flex-1 min-h-0">
      <div className={`${activeConversation ? 'hidden lg:flex' : 'flex'} flex-col min-h-0 w-full lg:w-auto`}>
        <ConversationList onSelect={selectConversation} selectedId={activeConversation?.id} />
      </div>
      <div className={`${activeConversation ? 'flex' : 'hidden lg:flex'} flex-1 min-w-0 min-h-0`}>
        <ConversationView onBack={closeConversation} />
      </div>
    </div>
  );
}

// Do'stlar bo'limi — faqat chatAccess=true bo'lganda mount qilinadi (AppShell
// chatAccess=false bo'lganda nav elementini umuman ko'rsatmaydi, bu yerdagi
// tekshiruv — himoyaning ikkinchi qatlami, to'g'ridan-to'g'ri URL kiritilsa ham ishlaydi).
export default function DoStlarPanel({ onActiveChange }) {
  const { chatUserId, chatAccess } = useApp();

  if (!chatAccess) {
    return <p className="text-sm text-muted text-center py-12">Bu bo'lim uchun ruxsatingiz yo'q.</p>;
  }

  return (
    <ChatProvider myUserId={chatUserId}>
      <DoStlarShell onActiveChange={onActiveChange} />
    </ChatProvider>
  );
}
