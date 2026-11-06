'use client';
import AppShell from '@/components/layout/AppShell';
import { RealtimeProvider } from '@/context/RealtimeContext';
import { CallProvider } from '@/context/CallContext';
import { GlobalMessageToast } from '@/components/chat-friends/NewMessageToast';
import CallOverlay from '@/components/call/CallOverlay';

// Oddiy ilova sahifalari (/app, /app/vocabulary/*, /app/ai, /app/friends/*,
// /app/profile, /app/leaderboard, /app/practice) — sidebar, AI FAB, bildirishnomalar
// shu yerda. Imtihon sahifalari (`(exam)` guruhi) bu layoutga KIRMAYDI —
// VOCABLY-TZ.md §1.5.
//
// docs/chat/PARITY_PLAN.md WP1 — realtime socket ham shu yerda (sahifalar orasida navigatsiyada
// uzilmaydi); imtihon sahifalarida socket yo'q (u yerda foydalanuvchi qo'ng'iroqlar uchun "oflayn").
export default function MainLayout({ children }) {
  return (
    <RealtimeProvider>
      <CallProvider>
        <AppShell>{children}</AppShell>
        <CallOverlay />
        <GlobalMessageToast />
      </CallProvider>
    </RealtimeProvider>
  );
}
