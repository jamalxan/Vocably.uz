'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminContext = createContext(null);

// Admin panelning barcha sahifalari (statistika, foydalanuvchilar, suhbatlar, reportlar,
// audit log) shu bitta context'dan token oladi — har sahifa o'zining auth tekshiruvini
// qaytadan yozmaydi. Haqiqiy himoya baribir serverda (src/lib/chatAuth.js) — bu yerdagi
// tekshiruv faqat UI uchun.
export function AdminProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [status, setStatus] = useState('checking'); // checking | ok | denied

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/kirish');
      return;
    }
    fetch('/api/chat/me', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.role === 'admin') {
          setToken(t);
          setAdminName(d.username || d.name || 'Admin');
          setStatus('ok');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => setStatus('denied'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AdminContext.Provider value={{ token, adminName, status }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
