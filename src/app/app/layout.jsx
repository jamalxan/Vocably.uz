'use client';
import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';

// Himoyalangan zonaning ildizi. AppProvider shu yerda — Next.js layout barcha
// ichki sahifalar orasida navigatsiya paytida QAYTA MOUNT BO'LMAYDI, shuning
// uchun AppContext holati (kategoriya, chat sessiyalari va h.k.) barqaror qoladi.
//
// VOCABLY-TZ.md §1.5 auditi — bu yerda ILGARI `<AppShell>` (sidebar, AI FAB,
// bildirishnomalar) HAM o'ralar edi, shuning uchun imtihon sahifalari
// (/app/mock, /app/oqish, ...) ham AppShell ichida qolib ketar, natijada
// imtihon "fixed inset-0" qatlami ostida sidebar/AI/notifications TIRIK qolar,
// noto'g'ri fokus tuzog'i va ortiqcha tarmoq so'rovlariga sabab bo'lar edi.
// AppShell endi FAQAT `(main)/layout.jsx`da — bu yerda faqat yuklanish holati.
function Gate({ children }) {
  const { loadingApp } = useApp();
  if (loadingApp) {
    return (
      <div className="flex items-center justify-center h-dvh bg-bg" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-accent" size={28} aria-hidden="true" />
        <span className="sr-only">Yuklanmoqda…</span>
      </div>
    );
  }
  return children;
}

export default function AppRootLayout({ children }) {
  return (
    <AppProvider>
      <Gate>{children}</Gate>
    </AppProvider>
  );
}
