'use client';
import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

// Himoyalangan zonaning ildizi (ilgari src/app/dashboard/[[...segments]]/page.jsx
// ichida edi). AppProvider shu yerda — Next.js layout barcha ichki sahifalar
// (/app, /app/lugat/*, /app/ai, /app/dostlar/*, /app/profil) orasida navigatsiya
// paytida QAYTA MOUNT BO'LMAYDI, shuning uchun AppContext holati (kategoriya,
// chat sessiyalari va h.k.) ilgarigidek barqaror qoladi.
function Gate({ children }) {
  const { loadingApp } = useApp();
  if (loadingApp) {
    return (
      <div className="flex items-center justify-center h-dvh bg-bg">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }
  return <AppShell>{children}</AppShell>;
}

export default function AppRootLayout({ children }) {
  return (
    <AppProvider>
      <Gate>{children}</Gate>
    </AppProvider>
  );
}
