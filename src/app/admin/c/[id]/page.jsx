'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import ConversationViewer from '@/components/admin/ConversationViewer';

// Bitta suhbatning doimiy havolasi: /admin/c/<conversationId> — ro'yxatdan
// ochiladi, nusxalanadi va Reportlardagi "Suhbatni ochish" ham shu yerga keladi.
export default function AdminConversationPage() {
  const { id } = useParams();
  return (
    <Suspense fallback={null}>
      <ConversationViewer conversationId={id} />
    </Suspense>
  );
}
