'use client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminShell from './AdminShell';

export default function AdminGate({ children }) {
  const { status } = useAdmin();

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-coffee-900">
        <Loader2 className="animate-spin text-racing-500" size={30} />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-coffee-900 gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-racing-900/40 border border-racing-700/50 flex items-center justify-center">
          <ShieldAlert size={26} className="text-racing-500" />
        </div>
        <p className="font-luxury text-2xl text-alabaster-100">Ruxsat berilmagan</p>
        <p className="text-sm text-alabaster-500">Bu sahifa uchun admin huquqi kerak.</p>
        <a href="/dashboard" className="text-racing-500 text-sm font-medium hover:text-racing-400 hover:underline">
          Bosh sahifaga qaytish
        </a>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
