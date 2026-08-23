'use client';
import { useAdmin } from '@/context/AdminContext';
import ConversationViewer from '@/components/admin/ConversationViewer';

export default function AdminConversationsPage() {
  const { token } = useAdmin();
  return <ConversationViewer token={token} />;
}
