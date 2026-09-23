'use client';
import Link from 'next/link';
import { GraduationCap, LogOut } from 'lucide-react';
import { useTeacher } from '@/context/TeacherContext';

// AdminShell (src/components/admin/AdminShell.jsx) bilan bir xil Tailwind
// naqshlari (card/border/badge klasslari) qayta ishlatiladi, lekin ATAYLAB
// YENGILROQ: teacher paneli hozircha faqat 2 sahifa (ro'yxat + sinf detali),
// AdminShell'dagi to'liq chap-nav drawer bu yerda ortiqcha bo'lardi.
export default function TeacherShell({ children }) {
  const { teacherName } = useTeacher();

  return (
    <div className="min-h-dvh bg-bg text-ink font-body">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 sm:px-8 py-4 sm:py-5 bg-bg/90 backdrop-blur-md border-b border-border">
        <Link href="/teacher" className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shadow-glow flex-shrink-0">
            <GraduationCap size={20} className="text-on-accent" />
          </div>
          <div className="min-w-0">
            <p className="font-luxury text-xl leading-none text-ink tracking-wide">O'qituvchi paneli</p>
            <p className="text-xs text-muted truncate mt-0.5">@{teacherName}</p>
          </div>
        </Link>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-3 py-2.5 min-h-11 rounded-lg text-sm text-muted hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <LogOut size={15} /> Ilovaga qaytish
        </Link>
      </header>

      <main className="px-5 sm:px-8 py-7 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
