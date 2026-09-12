'use client';
import AppShell from '@/components/layout/AppShell';

// Oddiy ilova sahifalari (/app, /app/lugat/*, /app/ai, /app/dostlar/*,
// /app/profil, /app/reyting, /app/mashq) — sidebar, AI FAB, bildirishnomalar
// shu yerda. Imtihon sahifalari (`(exam)` guruhi) bu layoutga KIRMAYDI —
// VOCABLY-TZ.md §1.5.
export default function MainLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
