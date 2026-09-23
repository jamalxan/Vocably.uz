'use client';
import { Suspense } from 'react';
import ConversationViewer from '@/components/admin/ConversationViewer';

export default function AdminConversationsPage() {
  // `ConversationViewer` `useSearchParams()`ni o'qiydi (N-09: Reportlardan
  // "Suhbatni ochish" havolasidagi `?open=<id>`) — Next.js buni Suspense
  // ichida talab qiladi.
  return (
    <Suspense fallback={null}>
      <ConversationViewer />
    </Suspense>
  );
}
