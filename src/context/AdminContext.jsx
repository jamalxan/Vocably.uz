'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminContext = createContext(null);

// Admin panelning barcha sahifalari (statistika, foydalanuvchilar, suhbatlar, reportlar,
// audit log) shu bitta context'dan holat oladi — har sahifa o'zining auth tekshiruvini
// qaytadan yozmaydi. Haqiqiy himoya baribir serverda (src/lib/chatAuth.js) — bu yerdagi
// tekshiruv faqat UI uchun.
//
// AUTH_MIGRATION_MAP.md — token endi localStorage'dan o'qilmaydi va hech qanday
// so'rovga qo'lda biriktirilmaydi. `/api/chat/me` httpOnly cookie orqali
// autentifikatsiya qiladi (server, o'zgarishsiz) — 401/rol mos kelmasa `denied`.
export function AdminProvider({ children }) {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [status, setStatus] = useState('checking'); // checking | ok | denied

  useEffect(() => {
    fetch('/api/chat/me')
      .then((r) => {
        // 401 — umuman login qilinmagan (cookie yo'q/muddati o'tgan): oldingi
        // xatti-harakat bilan bir xil, to'g'ridan-to'g'ri login sahifasiga.
        if (r.status === 401) {
          router.push('/kirish');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return; // yuqorida allaqachon /kirish'ga yo'naltirildi
        if (d.role === 'admin') {
          setAdminName(d.username || d.name || 'Admin');
          setStatus('ok');
        } else {
          // Login qilingan, lekin admin emas — "Ruxsat berilmagan" ekrani
          // (AdminGate.jsx), oldingi xatti-harakat bilan bir xil.
          setStatus('denied');
        }
      })
      .catch(() => setStatus('denied'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AdminContext.Provider value={{ adminName, status }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
