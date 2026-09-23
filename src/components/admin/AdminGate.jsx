'use client';
import Link from 'next/link';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminShell from './AdminShell';

export default function AdminGate({ children }) {
  const { status } = useAdmin();

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-bg">
        <Loader2 className="animate-spin text-accent" size={30} />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-bg gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-accent-soft border border-accent/30 flex items-center justify-center">
          <ShieldAlert size={26} className="text-accent" />
        </div>
        <p className="font-luxury text-2xl text-ink">Ruxsat berilmagan</p>
        <p className="text-sm text-muted">Bu sahifa uchun admin huquqi kerak.</p>
        <Link href="/app" className="text-accent text-sm font-medium hover:text-accent-hover hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
