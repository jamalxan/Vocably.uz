'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TeacherContext = createContext(null);

// TCH-01/02 — src/context/AdminContext.jsx bilan AYNAN bir xil naqsh (bitta
// GET /api/chat/me, rol tekshiruvi, checking/ok/denied). Haqiqiy himoya
// baribir serverda (requireTeacherUser, src/lib/chatAuth.js) — bu yerdagi
// tekshiruv faqat UI uchun.
export function TeacherProvider({ children }) {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('');
  const [status, setStatus] = useState('checking'); // checking | ok | denied

  useEffect(() => {
    fetch('/api/chat/me')
      .then((r) => {
        if (r.status === 401) {
          router.push('/kirish');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return; // yuqorida allaqachon /kirish'ga yo'naltirildi
        if (d.role === 'teacher') {
          setTeacherName(d.username || d.name || "O'qituvchi");
          setStatus('ok');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => setStatus('denied'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <TeacherContext.Provider value={{ teacherName, status }}>{children}</TeacherContext.Provider>;
}

export function useTeacher() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error('useTeacher must be used within TeacherProvider');
  return ctx;
}
